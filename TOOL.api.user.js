// ==UserScript==
// @name         CÔNG CỤ HỖ TRỢ V4 (UI REWRITE)
// @version      0.2.2
// @namespace    tanphan.toolv3.api
// @description  Hỗ trợ thao tác sàn TMĐT - Giao diện hiện đại V4
// @author       TânPhan
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @require      https://code.jquery.com/ui/1.13.2/jquery-ui.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.2/socket.io.min.js
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  // ==========================================
  // 1. CORE SETUP & IFRAME BLOCKER
  // ==========================================
  if (window.top !== window.self) {
    return; // Stopped execution in iframe
  }

  // ==========================================
  // 1.5 DATA & NETWORK
  // ==========================================
  class NetworkInterceptor {
    constructor() {
      this.shopId = null;
      this.headers = {};
      this.hookFetch();
    }

    hookFetch() {
      const originalFetch = unsafeWindow.fetch;
      unsafeWindow.fetch = async (...args) => {
        const [url, config] = args;
        const urlStr = url.toString();

        // 1. Auto-capture Shop ID from URL or query params
        if (!this.shopId) {
          const urlObj = new URL(urlStr, window.location.origin);
          const sid = urlObj.searchParams.get('shopid') || urlObj.searchParams.get('shop_id');
          if (sid) {
            this.shopId = sid;
            console.log("[Interceptor] Captured Shop ID from URL:", this.shopId);
          }
        }

        // 2. Scan Cookies for Shop ID or CSRF
        if (!this.shopId) {
          const sidMatch = document.cookie.match(/shopid=(\d+)/);
          if (sidMatch) this.shopId = sidMatch[1];
        }

        try {
          const response = await originalFetch(...args);
          const clone = response.clone();
          clone.json().then(data => {
            // Shopee specific response patterns
            if (data?.data?.shop_id) {
              this.shopId = data.data.shop_id;
            } else if (data?.shopid) {
              this.shopId = data.shopid;
            }
          }).catch(() => { });
          return response;
        } catch (e) {
          return originalFetch(...args);
        }
      };
    }

    getShopId() {
      // Priority: Manual config > Auto detected
      return GM_getValue('at4_manual_shopid') || this.shopId;
    }
  }

  class ProductService {
    constructor(interceptor) {
      this.interceptor = interceptor;
    }

    log(msg, type = 'info') {
      const $log = $('#at4Log');
      if ($log.length === 0) return;
      const time = new Date().toLocaleTimeString();
      const color = type === 'error' ? '#ef4444' : (type === 'success' ? '#22c55e' : '#22d3ee');
      $log.append(`<div style="color:${color}; margin-bottom:2px;">[${time}] ${msg}</div>`);
      $log.scrollTop($log[0].scrollHeight);
      console.log(`[TOOL V4] [${type.toUpperCase()}] ${msg}`);
    }

    async parseAndExecute(productIdsStr, variantDataStr) {
      const productIds = productIdsStr.split('\n').map(s => s.trim()).filter(Boolean);
      const variantData = variantDataStr.trim().split('\n').map(line => {
        const parts = line.split('\t');
        let name = parts[1]?.trim() || "";
        if (name.length > 20) name = name.substring(0, 20); // Truncate to 20 chars

        return {
          sku: parts[0]?.trim(),
          name: name,
          price: parts[2]?.trim(),
          stock: parts[3]?.trim()
        };
      }).filter(v => v.name || v.sku);

      if (productIds.length === 0 || variantData.length === 0) {
        alert("Vui lòng nhập ID sản phẩm và Dữ liệu phân loại!");
        return;
      }

      // Show log tab
      $('.at4-tab[data-tab="log"]').click();
      this.log(`🚀 Khởi tạo hàng chờ: ${productIds.length} sản phẩm.`, "info");

      // Save tasks to queue
      const tasks = productIds.map(id => ({ id, data: variantData }));
      GM_setValue('at4_variant_queue', tasks);
      GM_setValue('at4_automation_running', true);

      this.processNextTask();
    }

    processNextTask() {
      const queue = GM_getValue('at4_variant_queue', []);
      if (queue.length === 0) {
        GM_setValue('at4_automation_running', false);
        this.log("✅ Đã hoàn thành tất cả sản phẩm trong hàng chờ!", "success");
        return;
      }

      const task = queue[0];
      const id = this.extractItemId(task.id);
      this.log(`📦 Chuyển hướng tới sản phẩm: ${id}`, "info");
      window.location.href = `https://banhang.shopee.vn/portal/product/${id}`;
    }

    async checkPendingTasks() {
      const isRunning = GM_getValue('at4_automation_running', false);
      const queue = GM_getValue('at4_variant_queue', []);

      if (!isRunning || queue.length === 0) return;

      const task = queue[0];
      const id = this.extractItemId(task.id);
      const currentUrl = window.location.href;

      if (currentUrl.includes(`/portal/product/${id}`)) {
        this.log(`🤖 Đang thực hiện tự động cho ID: ${id}`, "info");
        try {
          await this.executeShopeeDomAutomation(task.data);

          // Task completed, remove from queue
          const newQueue = GM_getValue('at4_variant_queue', []);
          newQueue.shift();
          GM_setValue('at4_variant_queue', newQueue);
          this.log(`✔ Hoàn tất ID: ${id}`, "success");

          await delay(2000);
          this.processNextTask();
        } catch (e) {
          this.log(`❌ Lỗi tại ID ${id}: ${e.message}`, "error");
          GM_setValue('at4_automation_running', false);
        }
      }
    }

    async executeShopeeDomAutomation(variantData) {
      this.log("🔍 Đang đợi trang tải...", "info");
      await delay(3000); // Wait for React hydration

      this.log("🔍 Tìm phần 'Phân loại'...", "info");
      const section = await this.waitForSection('[tx:Phân loại]', 15000);

      this.log("⚡ Đang điền dữ liệu...", "info");

      for (const item of variantData) {
        let row = findElement(`.eds-table__row`).filter(function () {
          return $(this).text().includes(item.name);
        });

        if (row.length === 0) {
          this.log(`+ Thêm phân loại: ${item.name}`, "info");
          const addBtn = findElement('.shopee-button[tx:Thêm Phân Loại]');
          if (addBtn.length > 0) {
            simulateReactEvent(addBtn, 'click');
            await delay(500);
            const emptyInput = findElement('.eds-table__row:last .eds-input input');
            if (emptyInput.length > 0) {
              simulateReactInput(emptyInput, item.name);
              await delay(300);
            }
          }
        }

        row = findElement(`.eds-table__row`).filter(function () {
          return $(this).text().includes(item.name);
        });

        if (row.length > 0) {
          const priceInput = row.find('.eds-input.currency-input input');
          const stockInput = row.find('.eds-input[placeholder*="Kho"] input, .eds-input:eq(2) input');
          const skuInput = row.find('.eds-input[placeholder*="SKU"] input, .eds-input:eq(3) input');

          if (item.price) simulateReactInput(priceInput, item.price);
          if (item.stock) simulateReactInput(stockInput, item.stock);
          if (item.sku) simulateReactInput(skuInput, item.sku);

          row.css('background', 'rgba(34, 197, 94, 0.1)');
        }
        await delay(200);
      }

      this.log("💾 Đang bấm Cập nhật...", "info");
      const saveBtn = findElement('button[tx:Cập nhật]');
      if (saveBtn.length > 0) {
        simulateReactEvent(saveBtn, 'click');
        await delay(4000);
      } else {
        throw new Error("Không tìm thấy nút 'Cập nhật'.");
      }
    }

    async waitForSection(selector, timeout) {
      return new Promise((resolve, reject) => {
        const start = Date.now();
        const interval = setInterval(() => {
          const el = findElement(selector);
          if (el.length > 0) {
            clearInterval(interval);
            resolve(el);
          } else if (Date.now() - start > timeout) {
            clearInterval(interval);
            reject(new Error(`Timeout waiting for section: ${selector}`));
          }
        }, 1000);
      });
    }

    extractItemId(str) {
      if (!str) return null;
      const urlMatch = str.match(/\/product\/\d+\/(\d+)/);
      if (urlMatch) return urlMatch[1];
      const idMatch = str.match(/^\d+$/);
      return idMatch ? idMatch[0] : str.trim();
    }
  }

  // ==========================================
  // 2. THEME MANAGER
  // ==========================================
  class ThemeManager {
    constructor() {
      this.mode = 'auto'; // auto, light, dark, custom
      this.platform = this.detectPlatform();
    }

    detectPlatform() {
      const host = window.location.hostname;
      if (host.includes('shopee')) return 'shopee';
      if (host.includes('lazada')) return 'lazada';
      if (host.includes('tiktok')) return 'tiktok';
      if (host.includes('sapo')) return 'sapo';
      return 'default';
    }

    getColors() {
      // Define palettes
      const palettes = {
        shopee: { primary: '#ee4d2d', bg: '#fef6f5', text: '#333' },
        lazada: { primary: '#0f156d', bg: '#f0f2fd', text: '#333' },
        tiktok: { primary: '#000000', bg: '#ffffff', text: '#121212' },
        sapo: { primary: '#0088ff', bg: '#f0f8ff', text: '#333' },
        default: { primary: '#6366f1', bg: '#f8fafc', text: '#0f172a' },
        dark: { primary: '#818cf8', bg: '#1e293b', text: '#f1f5f9' }
      };

      if (this.mode === 'custom') return palettes.default; // TODO: Load user config
      if (this.mode === 'dark') return palettes.dark;

      return palettes[this.platform] || palettes.default;
    }

    apply() {
      const colors = this.getColors();
      const root = document.documentElement;
      root.style.setProperty('--at4-primary', colors.primary);
      root.style.setProperty('--at4-bg', colors.bg);
      root.style.setProperty('--at4-text', colors.text);
    }
  }

  // ==========================================
  // 2.5 UI COMPONENTS (COMPOS)
  // ==========================================
  class Compo {
    static button(label, id, style = "", icon = "") {
      return `
            <button id="${id}" style="width:100%; padding:12px; background:var(--at4-primary); color:white; border:none; border-radius:12px; font-weight:700; cursor:pointer; transition:0.2s; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2); ${style}" class="at4-compo-btn">
                ${icon ? `<span style="margin-right:8px;">${icon}</span>` : ''}${label}
            </button>`;
    }

    static input(placeholder, id, type = "text", style = "") {
      return `
            <div style="margin-bottom:15px; ${style}">
                <input type="${type}" id="${id}" style="width:100%; padding:12px; border-radius:10px; border:1px solid #e2e8f0; background:#f8fafc; font-size:13px; font-family:var(--at4-font); color:var(--at4-text); transition:0.2s;" placeholder="${placeholder}" class="at4-compo-input">
            </div>`;
    }

    static textarea(placeholder, id, rows = 4, style = "") {
      return `
            <div style="margin-bottom:15px; ${style}">
                <textarea id="${id}" rows="${rows}" style="width:100%; padding:12px; border-radius:12px; border:1px solid #e2e8f0; background:#f8fafc; font-size:12px; font-family:monospace; color:var(--at4-text); line-height:1.5; resize:vertical; transition:0.2s;" placeholder="${placeholder}" class="at4-compo-textarea"></textarea>
            </div>`;
    }

    static select(options, id, style = "") {
      const ops = options.map(o => `<option value="${o.value}">${o.label}</option>`).join('');
      return `
            <div style="margin-bottom:15px; ${style}">
                <select id="${id}" style="width:100%; padding:12px; border-radius:10px; border:1px solid #e2e8f0; background:#f8fafc; font-size:13px; font-family:var(--at4-font); color:var(--at4-text); cursor:pointer;" class="at4-compo-select">
                    ${ops}
                </select>
            </div>`;
    }

    static label(text) {
      return `<label style="display:block; font-size:11px; font-weight:700; color:#64748b; margin-bottom:6px; margin-left:5px;">${text}</label>`;
    }

    // Static helper for Tab key
    static handleTab(e) {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;
        const value = e.target.value;
        e.target.value = value.substring(0, start) + "\t" + value.substring(end);
        e.target.selectionStart = e.target.selectionEnd = start + 1;
      }
    }
  }

  // ==========================================
  // 2.6 SIMULATION & LOCATOR HELPERS
  // ==========================================
  function delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function simulateReactEvent(input, type, options = {}) {
    const el = input instanceof jQuery ? input[0] : input;
    if (!el) return;

    if (type === 'click' || type === 'mousedown' || type === 'mouseup') {
      const event = new MouseEvent(type, { bubbles: true, cancelable: true, ...options });
      el.dispatchEvent(event);
    } else {
      const event = new Event(type, { bubbles: true, cancelable: true, ...options });
      el.dispatchEvent(event);
    }
  }

  function simulateReactInput(input, text) {
    const el = input instanceof jQuery ? input[0] : input;
    if (!el) return;

    const lastValue = el.value;
    el.value = text;
    const event = new Event('input', { bubbles: true });
    const tracker = el._valueTracker;
    if (tracker) tracker.setValue(lastValue);
    el.dispatchEvent(event);
  }

  function simulateClearReactInput(input) {
    simulateReactInput(input, '');
  }

  function waitForElement(selector, callback, options = {}) {
    const { once = true, timeout = 10000 } = options;
    let found = false;

    const check = () => {
      const el = findElement(selector);
      if (el.length > 0 && !found) {
        found = true;
        callback(el);
        return true;
      }
      return false;
    };

    if (check()) return;

    const observer = new MutationObserver(() => {
      if (check() && once) observer.disconnect();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    if (timeout) {
      setTimeout(() => observer.disconnect(), timeout);
    }
    return observer;
  }

  function findElement(selectorString, context = document) {
    const $context = $(context);
    let finalSelector = selectorString;
    let textToFind = null;

    // Extract [tx:Text]
    const textMatch = finalSelector.match(/\[tx:([^\]]+)\]/i);
    if (textMatch) {
      textToFind = textMatch[1].trim();
      finalSelector = finalSelector.replace(textMatch[0], '');
    }

    let $results = $context.find(finalSelector || '*');

    if (textToFind) {
      $results = $results.filter(function () {
        return $(this).text().includes(textToFind);
      });
    }

    return $results;
  }

  // ==========================================
  // 2.6.5 DOM RECORDER
  // ==========================================
  class DOMRecorder {
    constructor(service) {
      this.service = service;
      this.active = false;
      this.$hoverBox = null;
      this.bindEvents();
    }

    toggle() {
      this.active = !this.active;

      if (this.active) {
        if (!this.$hoverBox) {
          this.$hoverBox = $('<div id="at4-hover-box"></div>').appendTo('body');
        }
        this.service.log("[Recorder] CHẾ ĐỘ GHI DOM: ĐÃ BẬT", "success");
        this.service.log("-> Có thể soi được cả các ô nhập bị VÔ HIỆU HÓA (Disabled).", "info");
        $('body').css('cursor', 'crosshair');
      } else {
        if (this.$hoverBox) this.$hoverBox.hide();
        this.service.log("[Recorder] CHẾ ĐỘ GHI DOM: ĐÃ TẮT", "info");
        $('body').css('cursor', 'default');
      }
    }

    bindEvents() {
      // Use window capture phase to be as aggressive as possible
      window.addEventListener('mousedown', (e) => {
        if (!this.active) return;

        e.preventDefault();
        e.stopPropagation();

        let el = e.target;

        // Deep Scan: If we hit a wrapper of a disabled element, try to find the actual element
        const deepEl = this.findImportantChild(el);
        if (deepEl) {
          this.service.log("[Deep Scan] Đã tìm thấy thành phần ẩn/disabled bên trong!", "success");
          el = deepEl;
        }

        this.recordMetadata(el);
      }, true);

      window.addEventListener('mouseover', (e) => {
        if (!this.active || !this.$hoverBox) return;

        const el = e.target;
        const rect = el.getBoundingClientRect();

        // Match viewport-relative coordinates (since box is position:fixed)
        this.$hoverBox.css({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        }).show();
      }, true);
    }

    findImportantChild(el) {
      // Look for common interactive elements that might be disabled or blocked
      const important = $(el).find('input, button, select, textarea').first();
      if (important.length > 0) return important[0];
      return null;
    }

    recordMetadata(el) {
      const metadata = {
        tagName: el.tagName,
        id: el.id,
        className: el.className,
        innerText: el.innerText?.trim().substring(0, 50),
        attributes: Array.from(el.attributes).map(a => `${a.name}="${a.value}"`),
        path: this.getDomPath(el)
      };

      this.service.log(`[DOM INFO] <${metadata.tagName.toLowerCase()}>`, "success");
      if (metadata.id) this.service.log(`   ID: #${metadata.id}`, "info");
      if (metadata.className) this.service.log(`   Class: .${metadata.className.split(/\s+/).filter(c => c).join('.')}`, "info");
      if (metadata.innerText) this.service.log(`   Text: "${metadata.innerText}"`, "info");

      const keyAttrs = metadata.attributes.filter(a => /name|type|placeholder|value|disabled|data-v-/.test(a));
      if (keyAttrs.length > 0) {
        this.service.log(`   Attrs: ${keyAttrs.join(', ')}`, "info");
      }

      this.service.log(`   Path: ${metadata.path}`, "info");
      console.log("[TOOL V4] DEEP INSPECT:", metadata, el);
    }

    getDomPath(el) {
      const stack = [];
      let current = el;
      while (current && current.parentNode != null && current.tagName !== 'HTML') {
        let sibCount = 0;
        let sibIndex = 0;
        const sibs = current.parentNode.childNodes;
        for (let i = 0; i < sibs.length; i++) {
          const sib = sibs[i];
          if (sib.nodeName == current.nodeName) {
            if (sib === current) sibIndex = sibCount;
            sibCount++;
          }
        }
        const nodeName = current.nodeName.toLowerCase();
        if (current.id && current.id !== '') {
          stack.unshift(`${nodeName}#${current.id}`);
          break;
        } else if (sibCount > 1) {
          stack.unshift(`${nodeName}:nth-of-type(${sibIndex + 1})`);
        } else {
          stack.unshift(nodeName);
        }
        current = current.parentNode;
      }
      return stack.join(' > ');
    }
  }

  // ==========================================
  // 2.7 FEATURE REGISTRY
  // ==========================================
  const FeatureRegistry = [
    {
      id: 'variant_manager',
      name: 'Thêm Phân Loại',
      icon: '🎨',
      color: '#ee4d2d',
      platforms: ['shopee', 'lazada', 'tiktok', 'sapo'],
      render: () => `
            <div style="background:#f8fafc; padding:20px; border-radius:24px; border:1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
                <div style="font-weight:800; color:#1e293b; margin-bottom:15px; font-size:15px;">Thêm Phân Loại Hàng Loạt</div>
                ${Compo.label("Danh sách ID Sản Phẩm (Mỗi dòng 1 ID)")}
                ${Compo.textarea("Nhập ID hoặc link sản phẩm...", "txtProductIds")}
                ${Compo.label("Dữ liệu phân loại (Copy từ Excel)")}
                <div style="font-size:11px; color:#64748b; margin-bottom:5px;">Thứ tự: SKU [Tab] Tên (max 20) [Tab] Giá [Tab] Số lượng</div>
                ${Compo.textarea("SKU\tTên Phân Loại\tGiá\tSố lượng", "txtVariantData", 6)}
                ${Compo.button("🚀 Bắt đầu thực hiện", "btnExecuteVariant")}
            </div>`
    },
    {
      id: 'price_sync',
      name: 'Đồng Bộ Giá',
      icon: '🔄',
      color: '#0f156d',
      platforms: ['shopee', 'lazada'],
      render: () => `<div style="padding:20px; text-align:center; color:#94a3b8;">Tính năng Đồng bộ giá đang phát triển...</div>`
    },
    {
      id: 'flash_sale',
      name: 'Flash Sale',
      icon: '⚡',
      color: '#f59e0b',
      platforms: ['shopee'],
      render: () => `<div style="padding:20px; text-align:center; color:#94a3b8;">Tính năng Flash Sale Shopee đang phát triển...</div>`
    }
  ];

  // ==========================================
  // 3. UI MANAGER (SidePanel + Dock)
  // ==========================================
  class UIManager {
    constructor() {
      this.themeManager = new ThemeManager();
      this.interceptor = new NetworkInterceptor();
      this.productService = new ProductService(this.interceptor);
      this.domRecorder = new DOMRecorder(this.productService);
      this.injectCSS();
    }

    injectCSS() {
      const css = `
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;800&display=swap');
                
                :root {
                    --at4-font: 'Outfit', sans-serif;
                    --at4-primary: #6366f1;
                    --at4-primary-light: #e0e7ff;
                    --at4-bg: #ffffff;
                    --at4-text: #0f172a;
                    --at4-text-sub: #64748b;
                    --at4-border: #e2e8f0;
                    --at4-glass: rgba(255, 255, 255, 0.6);
                }

                #at4-hover-box {
                    position: fixed;
                    pointer-events: none;
                    z-index: 1000000;
                    border: 2px solid var(--at4-primary);
                    background: rgba(99, 102, 241, 0.1);
                    border-radius: 4px;
                    transition: all 0.1s ease-out;
                    display: none;
                }

                /* --- TRIGGER ZONES --- */
                .at4-trigger-left, .at4-trigger-right, .at4-trigger-bottom {
                    position: fixed; z-index: 99998; transition: 0.3s;
                }
                .at4-trigger-left { top: 0; bottom: 0; left: 0; width: 15px; }
                .at4-trigger-right { top: 0; bottom: 0; right: 0; width: 15px; }
                .at4-trigger-bottom { bottom: 0; left: 20%; right: 20%; height: 20px; }

                /* --- ANIMATIONS --- */
                @keyframes at4-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
                @keyframes at4-slide-in-right { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes at4-slide-in-left { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }

                /* --- SIDE PANEL --- */
                .at4-panel {
                    position: fixed; top: 20px; bottom: 20px; width: 380px;
                    z-index: 99999;
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(30px) saturate(180%);
                    -webkit-backdrop-filter: blur(30px) saturate(180%);
                    border: 1px solid rgba(255,255,255,0.4);
                    border-radius: 32px;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15);
                    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
                    display: flex; flex-direction: column; overflow: hidden;
                    text-align: left; font-family: var(--at4-font);
                    opacity: 0; pointer-events: none;
                }
                .at4-panel.left { left: 20px; transform: translateX(-130%); }
                .at4-panel.left.active { transform: translateX(0); opacity: 1; pointer-events: auto; }
                .at4-panel.right { right: 20px; transform: translateX(130%); }
                .at4-panel.right.active { transform: translateX(0); opacity: 1; pointer-events: auto; }

                /* HEADER */
                .at4-header { padding: 30px 25px 15px; display: flex; justify-content: space-between; align-items: center; }
                .at4-logo { 
                    font-weight: 800; font-size: 24px; 
                    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                    letter-spacing: -0.5px;
                }

                /* THEME SWITCHER */
                .at4-theme-switch { display: flex; background: rgba(0,0,0,0.05); padding: 4px; border-radius: 99px; gap: 2px; }
                .at4-theme-btn {
                    width: 28px; height: 28px; border-radius: 50%; border: none; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; font-size: 14px;
                    transition: 0.2s; background: transparent; color: #94a3b8;
                }
                .at4-theme-btn:hover { color: #64748b; }
                .at4-theme-btn.active { background: white; color: var(--at4-primary); box-shadow: 0 2px 8px rgba(0,0,0,0.08); }

                /* TABS */
                .at4-tabs {
                    margin: 10px 25px; padding: 4px; background: rgba(0,0,0,0.03); border-radius: 14px;
                    display: flex; gap: 5px;
                }
                .at4-tab {
                    flex: 1; text-align: center; padding: 10px 0; font-size: 13px; font-weight: 600; color: #94a3b8;
                    cursor: pointer; border-radius: 10px; transition: 0.2s;
                }
                .at4-tab:hover { color: #64748b; }
                .at4-tab.active { background: white; color: var(--at4-primary); box-shadow: 0 2px 10px rgba(0,0,0,0.05); font-weight: 700; }

                /* CONTENT */
                .at4-content { flex: 1; overflow-y: auto; padding: 20px 25px 25px; overflow-x: hidden; }
                
                /* Swipe Effects */
                .at4-section { display: none; }
                .at4-section.active { display: block; animation: at4-slide-in-right 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); }

                /* APP GRID (New Style) */
                .at4-dashboard-title { font-size: 14px; font-weight: 700; color: #334155; margin-bottom: 15px; display: block; }
                .at4-app-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px 10px; }
                
                .at4-app-item {
                    display: flex; flex-direction: column; align-items: center; gap: 8px;
                    cursor: pointer; transition: 0.2s;
                }
                .at4-app-item:hover { transform: translateY(-5px); }
                .at4-app-item:hover .at4-app-icon { box-shadow: 0 10px 20px rgba(99, 102, 241, 0.25); transform: scale(1.05); }
                
                .at4-app-icon {
                    width: 64px; height: 64px; border-radius: 18px;
                    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                    border: 1px solid rgba(255,255,255,0.5);
                    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 28px; transition: 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .at4-app-name {
                    font-size: 12px; font-weight: 500; color: #475569; text-align: center;
                    line-height: 1.3; max-width: 80px;
                }

                /* --- DOCK (Totally Hidden) --- */
                .at4-dock-container {
                    position: fixed; bottom: 0; left: 50%; transform: translate(-50%, 100%); /* Hidden completely */
                    width: 500px; z-index: 99999;
                    background: rgba(255,255,255,0.4); /* Cleaner Glass */
                    backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
                    border: 1px solid rgba(255,255,255,0.2); border-radius: 32px 32px 0 0;
                    box-shadow: 0 -10px 40px rgba(0,0,0,0.1);
                    transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
                    padding: 20px 25px 25px; display: flex; flex-direction: column; align-items: center;
                }
                .at4-dock-container.active { transform: translate(-50%, 0); } /* Class added by trigger */

                .at4-dock-icons { display: flex; gap: 25px; margin-bottom: 25px; }
                .at4-dock-item {
                    width: 56px; height: 56px; border-radius: 20px;
                    background: rgba(255,255,255,0.8); border: 1px solid rgba(255,255,255,0.5);
                    display: flex; align-items: center; justify-content: center; font-size: 26px; 
                    cursor: pointer; color: #334155;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: 0.3s;
                }
                .at4-dock-item:hover { transform: translateY(-15px) scale(1.1); color: var(--at4-primary); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }

                .at4-player { width: 100%; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 15px; }
                .at4-room-status { font-size: 11px; font-weight:600; color: #64748b; margin-bottom:12px; text-align:center; }
                .at4-player-main { display: flex; align-items: center; gap: 20px; justify-content: center; }
                .at4-play-btn {
                    width: 48px; height: 48px; border-radius: 50%;
                    background: linear-gradient(135deg, #6366f1, #4f46e5); color: white;
                    display: flex; align-items: center; justify-content: center; font-size: 20px;
                    border: none; cursor: pointer; transition: 0.3s; box-shadow: 0 5px 20px rgba(99, 102, 241, 0.4);
                }
                .at4-play-btn:hover { transform: scale(1.1) rotate(90deg); } /* Fun interaction */
                .at4-ctrl-btn-sm { background: none; border: none; font-size: 24px; color: #64748b; cursor: pointer; transition:0.2s; }
                .at4-track-info { flex: 1; overflow: hidden; text-align: left; }
                .at4-track-name { font-size: 14px; font-weight: 700; color: #1e293b; }
                .at4-track-time { font-size: 11px; color: #64748b; margin-top: 2px;}

                .at4-hidden { display: none !important; }
            `;
      const style = document.createElement('style');
      style.innerHTML = css;
      document.head.appendChild(style);
    }

    render() {
      // Triggers
      $('body').append('<div class="at4-trigger-left"></div><div class="at4-trigger-right"></div><div class="at4-trigger-bottom"></div>');

      const panelHtml = `
            <div class="at4-panel left" id="at4Panel">
                <div class="at4-header">
                    <div class="at4-logo">TOOL V4</div>
                    <div class="at4-theme-switch">
                        <button class="at4-theme-btn active" data-mode="auto">A</button>
                        <button class="at4-theme-btn" data-mode="light">☀️</button>
                        <button class="at4-theme-btn" data-mode="dark">🌙</button>
                    </div>
                </div>
                <div class="at4-tabs">
                    <div class="at4-tab active" data-tab="main">Chức năng</div>
                    <div class="at4-tab" data-tab="online">Online</div>
                    <div class="at4-tab" data-tab="config">Cài đặt</div>
                    <div class="at4-tab" data-tab="log">Nhật ký</div>
                </div>
                <div class="at4-content">
                    <!-- Main Tab -->
                    <div class="at4-section active" id="tab-main">
                         <span class="at4-dashboard-title">✨ Trang chủ ${this.themeManager.platform.toUpperCase()}</span>
                         <div class="at4-app-grid" id="at4AppGrid">
                            <!-- Dynamically rendered -->
                         </div>

                         <!-- ACTION AREA -->
                         <div id="at4ActionArea" style="margin-top:20px; display:none; animation: at4-fade-in 0.3s;"></div>
                    </div>
                    
                    <!-- Online Tab -->
                    <div class="at4-section" id="tab-online">
                        <span class="at4-dashboard-title">☁️ Ứng dụng Cloud</span>
                        <div class="at4-app-grid">
                            <div class="at4-app-item">
                                 <div class="at4-app-icon" style="border:1px dashed #cbd5e1; background:#f8fafc">➕</div>
                                 <div class="at4-app-name">Thêm App</div>
                            </div>
                        </div>
                    </div>

                     <!-- Config Tab -->
                     <div class="at4-section" id="tab-config">
                          <span class="at4-dashboard-title">⚙️ Hệ thống</span>
                          <div style="background:white; border:1px solid #e2e8f0; border-radius:24px; padding:20px;">
                              ${Compo.label("License Key")}
                              ${Compo.input("Nhập khóa bản quyền...", "txtLicenseKey", "password")}
                              
                              ${Compo.label("Shop ID (Thủ công)")}
                              ${Compo.input("Dùng khi tool không tự bắt được...", "txtManualShopId", "text")}
 
                              ${Compo.label("Phiên bản server")}
                              ${Compo.select([{ label: 'Bản chính thức (Stable)', value: 'stable' }, { label: 'Bản thử nghiệm (Beta)', value: 'beta' }], "selServer")}
 
                              ${Compo.button("Lưu Cài Đặt", "btnSaveConfig")}
                          </div>
                     </div>

                    <!-- Log -->
                    <div class="at4-section" id="tab-log">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                            <span class="at4-dashboard-title" style="margin-bottom:0;">📜 Nhật ký hệ thống</span>
                            ${Compo.button("🎯 Soi DOM", "btnToggleRecorder", "width:auto; padding:5px 15px; font-size:11px;")}
                        </div>
                        <div id="at4Log" style="height:350px; overflow-y:auto; background:#0f172a; color:#22d3ee; padding:15px; border-radius:18px; font-family:monospace; font-size:11px; line-height:1.5; box-shadow: inset 0 2px 10px rgba(0,0,0,0.2);">
                            <div>[System] V4 Engine Ready.</div>
                        </div>
                    </div>
                </div>
            </div>`;
      $('body').append(panelHtml);

      const dockHtml = `
            <div class="at4-dock-container">
                <div class="at4-dock-icons">
                    <div class="at4-dock-item" title="Chat">💬</div>
                    <div class="at4-dock-item" title="AI Assitant">🤖</div>
                    <div class="at4-dock-item" title="Support">❓</div>
                </div>
                <div class="at4-player">
                    <div class="at4-room-status"><span>Offline Room</span></div>
                    <div class="at4-player-main">
                        <button class="at4-ctrl-btn-sm">⏮️</button>
                        <button class="at4-play-btn">▶</button>
                        <button class="at4-ctrl-btn-sm">⏭️</button>
                        <div class="at4-track-info">
                            <div class="at4-track-name">Chưa phát nhạc</div>
                            <div class="at4-track-time">--:--</div>
                        </div>
                    </div>
                </div>
            </div>`;
      $('body').append(dockHtml);

      this.bindEvents();
      this.renderAppGrid();
      this.themeManager.apply();
    }

    renderAppGrid() {
      const platform = this.themeManager.platform;
      const filtered = FeatureRegistry.filter(f => f.platforms.includes(platform));

      const html = filtered.map(f => `
            <div class="at4-app-item" data-app-id="${f.id}">
                <div class="at4-app-icon" style="color:${f.color}">${f.icon}</div>
                <div class="at4-app-name">${f.name}</div>
            </div>
        `).join('');

      $('#at4AppGrid').html(html);
    }

    bindEvents() {
      let hideTimeout;

      // Side Triggers
      $('.at4-trigger-left').on('mouseenter', () => { clearTimeout(hideTimeout); $('#at4Panel').removeClass('right').addClass('left active'); });
      $('.at4-trigger-right').on('mouseenter', () => { clearTimeout(hideTimeout); $('#at4Panel').removeClass('left').addClass('right active'); });

      // Bottom Trigger (Dock)
      $('.at4-trigger-bottom').on('mouseenter', () => { $('.at4-dock-container').addClass('active'); });
      $('.at4-dock-container').on('mouseleave', () => { setTimeout(() => $('.at4-dock-container').removeClass('active'), 300); });

      // Keep Panel Open
      $('#at4Panel').on('mouseenter', () => { clearTimeout(hideTimeout); });
      $('.at4-trigger-left, .at4-trigger-right, #at4Panel').on('mouseleave', () => {
        hideTimeout = setTimeout(() => { $('#at4Panel').removeClass('active'); }, 500);
      });

      // Theme Switcher
      $('.at4-theme-btn').click((e) => {
        const mode = $(e.currentTarget).data('mode');
        $('.at4-theme-btn').removeClass('active'); $(e.currentTarget).addClass('active');
        this.themeManager.mode = mode; this.themeManager.apply();
      });

      // Tabs with Swipe Animation
      $('.at4-tab').click((e) => {
        const tab = $(e.currentTarget).data('tab');
        const previousTab = $('.at4-tab.active').data('tab');

        if (tab === previousTab) return;

        $('.at4-tab').removeClass('active'); $(e.currentTarget).addClass('active');

        // Determine swipe direction (simple logic based on DOM order: main < online < config)
        const order = { 'main': 1, 'online': 2, 'config': 3 };
        const direction = order[tab] > order[previousTab] ? 'right' : 'left';
        const animClass = direction === 'right' ? 'at4-slide-in-right' : 'at4-slide-in-left';

        $('.at4-section').hide().removeClass('active').css('animation', '');
        $(`#tab-${tab}`).show().addClass('active').css('animation', `${animClass} 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)`);
      });

      $('#btnShowLog').click(() => { $('.at4-section').removeClass('active'); $('#tab-log').removeClass('at4-hidden').addClass('active'); });

      // App Logic
      $(document).on('click', '.at4-app-item', (e) => {
        const appId = $(e.currentTarget).data('app-id');
        const feature = FeatureRegistry.find(f => f.id === appId);
        if (feature) {
          $('#at4ActionArea').html(feature.render()).slideDown();
        }
      });

      $(document).on('click', '#btnExecuteVariant', () => {
        const ids = $('#txtProductIds').val();
        const data = $('#txtVariantData').val();
        this.productService.parseAndExecute(ids, data);
      });

      $(document).on('click', '#btnSaveConfig', () => {
        const license = $('#txtLicenseKey').val();
        const shopid = $('#txtManualShopId').val();
        GM_setValue('at4_license', license);
        if (shopid) GM_setValue('at4_manual_shopid', shopid);
        this.productService.log("Đã lưu cài đặt!", "success");
      });

      $(document).on('click', '#btnToggleRecorder', () => {
        this.domRecorder.toggle();
      });

      // Load Config values
      $('#txtLicenseKey').val(GM_getValue('at4_license', ''));
      $('#txtManualShopId').val(GM_getValue('at4_manual_shopid', ''));

      // Handle Tab key in Textareas
      $(document).on('keydown', '.at4-compo-textarea', Compo.handleTab);

      // Focus effects for Compos
      $(document).on('focus', '.at4-compo-input, .at4-compo-textarea', (e) => {
        $(e.target).css({ 'border-color': 'var(--at4-primary)', 'box-shadow': '0 0 0 4px rgba(99, 102, 241, 0.1)', 'background': 'white' });
      }).on('blur', '.at4-compo-input, .at4-compo-textarea', (e) => {
        $(e.target).css({ 'border-color': '#e2e8f0', 'box-shadow': 'none', 'background': '#f8fafc' });
      });
    } // Close bindEvents
  } // Close UIManager class

  const ui = new UIManager();
  ui.render();
  // Trigger pending automation tasks on page load
  ui.productService.checkPendingTasks();
  console.log("TOOL V4 LOADED (RESET)");
})();

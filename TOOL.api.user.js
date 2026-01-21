// ==UserScript==
// @name         CÔNG CỤ HỖ TRỢ V4 (API MODE)
// @version      0.1.0
// @namespace    tanphan.toolv3.api
// @icon         https://www.google.com/s2/favicons?sz=64&domain=shopee.vn
// @description  Hỗ trợ thao tác sàn TMĐT sử dụng API nội bộ (Shopee, Lazada, TikTok)
// @license      MIT
// @author       TânPhan
// @copyright    2025, TanPhan (nhattanphan2014@gmail.com)
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @updateURL    https://openuserjs.org/meta/pntan/CÔNG_CỤ_HỖ_TRỢ_V4_API.meta.js
// @downloadURL  https://openuserjs.org/install/pntan/CÔNG_CỤ_HỖ_TRỢ_V4_API.user.js
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @require      https://code.jquery.com/ui/1.13.2/jquery-ui.min.js
// @require      https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4
// @require      https://cdn.jsdelivr.net/npm/sweetalert2@11.7.12/dist/sweetalert2.all.min.js
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  const VERSION = '0.1.0';

  /**
   * Smart DOM Locator Utility (Playwright-inspired)
   * Helps find elements by visible text, labels, etc. resilient to class changes.
   */
  class SmartLocator {
    static getByText(text, container = document, options = {}) {
      const { exact = false, tags = '*' } = options;
      const elements = Array.from(container.querySelectorAll(tags));

      return elements.find(el => {
        // Ignore hidden elements
        if (el.offsetParent === null) return false;

        const content = el.innerText?.trim() || el.textContent?.trim();
        if (!content) return false;

        // Check text match
        if (exact) return content === text;
        return content.toLowerCase().includes(text.toLowerCase());
      });
    }

    static getInputByLabel(labelText, container = document) {
      // 1. Find label by text
      const labels = Array.from(container.querySelectorAll('label'));
      const targetLabel = labels.find(l => l.innerText?.toLowerCase().includes(labelText.toLowerCase()));

      if (targetLabel) {
        // Case A: <label for="id">
        const forId = targetLabel.getAttribute('for');
        if (forId) return container.getElementById(forId);

        // Case B: <label><input></label>
        const nestedInput = targetLabel.querySelector('input, select, textarea');
        if (nestedInput) return nestedInput;

        // Case C: Label is near Input (common in flex/grid forms)
        // Heuristic: Input usually follows label or is in the same parent wrapper
        let parent = targetLabel.parentElement;
        let input = parent.querySelector('input, select, textarea');
        if (input) return input;
      }
      return null;
    }

    static getByPlaceholder(text, container = document) {
      return Array.from(container.querySelectorAll('input, textarea'))
        .find(el => el.placeholder?.toLowerCase().includes(text.toLowerCase()));
    }

    static async waitFor(conditionFn, timeout = 10000) {
      return new Promise((resolve, reject) => {
        const startTime = Date.now();

        const check = () => {
          const result = conditionFn();
          if (result) {
            resolve(result);
          } else if (Date.now() - startTime > timeout) {
            reject(new Error("Timeout waiting for element"));
          } else {
            requestAnimationFrame(check); // Better than setInterval
          }
        };
        check();
      });
    }

    static async clickByText(text) {
      try {
        const el = await this.waitFor(() => this.getByText(text));
        if (el) {
          el.click();
          console.log(`[SmartLocator] Clicked "${text}"`);
          return true;
        }
      } catch (e) {
        console.warn(`[SmartLocator] Failed to click "${text}":`, e);
        return false;
      }
    }
  }

  /**
   * Core Network Interceptor
   * Captures fetch and XMLHttpRequest to analyze traffic and steal tokens/data.
   */
  class NetworkInterceptor {
    constructor() {
      this.originalFetch = window.fetch;
      this.originalXHR = window.XMLHttpRequest;
      this.capturedRequests = [];
      this.listeners = [];
    }

    init() {
      this.hookFetch();
      this.hookXHR();
      console.log("%c[ANTIGRAVITY] Network Interceptor Activated", "color: #00ff00; font-weight: bold;");
    }

    addListener(callback) {
      this.listeners.push(callback);
    }

    notifyListeners(data) {
      this.listeners.forEach(cb => cb(data));
    }

    hookFetch() {
      const self = this;
      window.fetch = async function (...args) {
        const [resource, config] = args;
        // Capture Request
        const requestInfo = {
          type: 'fetch',
          url: resource instanceof Request ? resource.url : resource,
          method: config?.method || 'GET',
          body: config?.body,
          timestamp: Date.now()
        };

        try {
          const response = await self.originalFetch.apply(this, args);

          // Clone response to read body without consuming it
          const clone = response.clone();
          clone.text().then(text => {
            // Attempt to parse JSON
            let jsonData = null;
            try { jsonData = JSON.parse(text); } catch (e) { }

            const logData = {
              ...requestInfo,
              status: response.status,
              response: jsonData || text
            };

            self.processLog(logData);
          });

          return response;
        } catch (error) {
          console.error("[ANTIGRAVITY] Fetch Error:", error);
          throw error;
        }
      };
    }

    hookXHR() {
      const self = this;
      const XHR = window.XMLHttpRequest;
      const open = XHR.prototype.open;
      const send = XHR.prototype.send;

      XHR.prototype.open = function (method, url, ...rest) {
        this._requestInfo = {
          type: 'xhr',
          method,
          url,
          timestamp: Date.now()
        };
        return open.apply(this, [method, url, ...rest]);
      };

      XHR.prototype.send = function (body) {
        this._requestInfo.body = body;

        this.addEventListener('load', function () {
          let responseData = this.responseText;
          try { responseData = JSON.parse(this.responseText); } catch (e) { }

          const logData = {
            ...this._requestInfo,
            status: this.status,
            response: responseData
          };

          self.processLog(logData);
        });

        return send.apply(this, [body]);
      };
    }

    processLog(data) {
      // Filter relevant requests
      if (this.isRelevant(data.url)) {
        this.capturedRequests.push(data);
        if (this.capturedRequests.length > 50) this.capturedRequests.shift(); // Keep last 50
        this.notifyListeners(data);

        // --- AUTO DISCOVERY LOGIC HERE ---
        this.detectShopeeProducts(data);
      }
    }

    detectShopeeProducts(data) {
      // Shopee Product List API usually looks like: /api/v4/product/get_list or search_product_list
      if ((data.url.includes('/api/v4/product/get_list') || data.url.includes('search_product_list')) && data.method === 'GET') {
        try {
          const json = typeof data.response === 'string' ? JSON.parse(data.response) : data.response;
          if (json && (json.data?.list || json.list)) {
            // Handle different possible structures
            const list = json.data?.list || json.list;
            const products = list.map(p => ({
              id: p.id || p.item_id,
              name: p.name,
              stock: p.stock,
              price: p.price
            }));
            console.log("%c[ANTIGRAVITY] Found Shopee Products:", "color: #00ff00", products);

            // Notify UI (Simple custom event)
            window.dispatchEvent(new CustomEvent('at-product-data', { detail: products }));
          }
        } catch (e) {
          console.error("Failed to parse Shopee product list", e);
        }
      }
    }
    isRelevant(url) {
      // Filter out junk (analytics, ads, static assets)
      const ignored = ['.png', '.jpg', '.css', '.js', 'google-analytics', 'facebook.com'];
      if (ignored.some(x => url.includes(x))) return false;

      // Interest in internal APIs
      const interested = ['/api/', '/v1/', '/v2/', '/v3/', '/v4/', 'seller-center'];
      return interested.some(x => url.includes(x));
    }
  }

  /**
   * Platform Manager
   * Handles specific logic for Shopee, TikTok, Lazada
   */
  class PlatformManager {
    constructor() {
      this.domain = window.location.hostname;
    }

    getType() {
      if (this.domain.includes("shopee")) return "shopee";
      if (this.domain.includes("tiktok")) return "tiktok";
      if (this.domain.includes("lazada")) return "lazada";
      return "unknown";
    }

    static getTheme(type) {
      switch (type) {
        case 'shopee': return { primary: '#ee4d2d', accent: '#ff7350' };
        case 'lazada': return { primary: '#0f146d', accent: '#f5008f' };
        case 'tiktok': return { primary: '#fe2c55', accent: '#25F4EE' };
        default: return { primary: '#3b82f6', accent: '#60a5fa' };
      }
    }
  }

  /**
   * Shopee Adapter
   * Handles platform-specific logic for Shopee APIs
   */
  class ShopeeAdapter {
    static buildUpdatePayload(originalProduct, newVariants, groupName) {
      // deep clone to avoid mutating original
      const payload = JSON.parse(JSON.stringify(originalProduct));

      // 1. Construct Tier Variation (The "Group" definition)
      // Shopee supports up to 2 tiers. 
      // If product has no tiers, we create Tier 1.
      // If product has 1 tier, we might be adding options to it OR adding Tier 2 (complex, let's stick to simple adding options to Tier 1 for now if match)

      let tierVariation = payload.tier_variation || [];

      // Check if we are adding to an existing tier or creating a new one
      let targetTierIndex = -1;

      // Simple case: Create new 1-tier if none exists
      if (tierVariation.length === 0) {
        tierVariation.push({
          name: groupName,
          options: newVariants.map(v => v.name),
          images: [], // Images logic to be added later
        });
        targetTierIndex = 0;
      } else {
        // Existing tiers. Find if group matches
        const existingIndex = tierVariation.findIndex(t => t.name.toLowerCase() === groupName.toLowerCase());
        if (existingIndex > -1) {
          // Add options to existing tier
          targetTierIndex = existingIndex;
          const currentOptions = tierVariation[existingIndex].options;
          newVariants.forEach(v => {
            if (!currentOptions.includes(v.name)) {
              currentOptions.push(v.name);
            }
          });
        } else {
          // New Tier? Shopee only allows 2.
          if (tierVariation.length >= 2) throw new Error("Sản phẩm đã có đủ 2 nhóm phân loại. Không thể thêm nhóm thứ 3.");

          tierVariation.push({
            name: groupName,
            options: newVariants.map(v => v.name),
            images: []
          });
          targetTierIndex = tierVariation.length - 1;
        }
      }

      payload.tier_variation = tierVariation;

      // 2. Construct Model List (The actual variants with Price/Stock)
      // We need to regenerate the model list based on the combinations of tiers
      const oldModels = payload.model_info_list || [];
      const newModelList = [];

      // Helper to generate combinations
      // If Tier 1 has [A, B] and Tier 2 has [X, Y], models are [A,X], [A,Y], [B,X], [B,Y]

      const tiers = payload.tier_variation;

      if (tiers.length === 1) {
        // 1 Tier
        tiers[0].options.forEach((opt, idx) => {
          // Find existing model if any
          const existing = oldModels.find(m => m.tier_index[0] === idx);

          // If matches one of our NEW variants, use new data
          const isNewVariant = newVariants.find(v => v.name === opt);

          if (isNewVariant) {
            newModelList.push({
              id: existing ? existing.id : 0, // 0 for new
              tier_index: [idx],
              price: isNewVariant.price,
              stock_setting_list: [{ location_id: 'VNZ', sellable_stock: isNewVariant.stock }], // Simplified stock
              sku: isNewVariant.sku,
              name: opt
            });
          } else if (existing) {
            // Keep existing
            newModelList.push(existing);
          } else {
            // Option exists in Tier but no model? Should not happen usually, but create default
            newModelList.push({
              id: 0,
              tier_index: [idx],
              price: payload.price || 0,
              stock_setting_list: [{ location_id: 'VNZ', sellable_stock: 0 }],
              name: opt
            });
          }
        });
      } else if (tiers.length === 2) {
        // 2 Tiers - Complex logic (simplified for now: assume we are adding to Tier 1 and keeping Tier 2 constant or empty)
        // TODO: Implement full 2-tier matrix logic
        console.warn("2-Tier logic is experimental");

        tiers[0].options.forEach((opt1, idx1) => {
          tiers[1].options.forEach((opt2, idx2) => {
            const tier_index = [idx1, idx2];
            // Find existing
            const existing = oldModels.find(m => m.tier_index[0] === idx1 && m.tier_index[1] === idx2);

            if (existing) {
              newModelList.push(existing);
            } else {
              newModelList.push({
                id: 0,
                tier_index: tier_index,
                price: payload.price || 0,
                stock_setting_list: [{ location_id: 'VNZ', sellable_stock: 0 }],
                name: `${opt1}, ${opt2}`
              });
            }
          });
        });
      }

      payload.model_info_list = newModelList;
      return payload;
    }
  }

  /**
   * UI Manager
   * Renders the floating interface
   */
  class UIManager {
    constructor(interceptor) {
      this.interceptor = interceptor;
      this.platform = new PlatformManager();
      this.theme = PlatformManager.getTheme(this.platform.getType());
      this.products = [];
    }

    injectCSS() {
      const css = `
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');
                :root {
                    --at-primary: ${this.theme.primary};
                    --at-accent: ${this.theme.accent};
                    --at-bg: rgba(255, 255, 255, 0.98);
                    --at-text: #1e293b;
                    --at-border: #e2e8f0;
                }
                .at-container {
                    position: fixed; bottom: 20px; right: 20px; z-index: 2147483647 !important;
                    font-family: 'Outfit', sans-serif;
                }
                .at-toggle {
                    width: 50px; height: 50px; background: var(--at-primary); border-radius: 50%;
                    display: flex; align-items: center; justify-content: center; color: white;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.2); cursor: pointer; transition: 0.3s;
                }
                .at-toggle:hover { transform: scale(1.1); }
                
                .at-panel {
                    position: fixed; top: 50%; left: 50%; width: 900px; height: 700px; z-index: 2147483647 !important;
                    transform: translate(-50%, -50%) scale(0.9); opacity: 0; pointer-events: none;
                    background: var(--at-bg); backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.5); border-radius: 24px;
                    box-shadow: 0 50px 100px rgba(0,0,0,0.2);
                    display: flex; flex-direction: column; overflow: hidden;
                    transition: 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .at-panel.open { transform: translate(-50%, -50%) scale(1); opacity: 1; pointer-events: auto; }

                /* HEADER */
                .at-header {
                    padding: 20px 30px; display: flex; justify-content: space-between; align-items: center;
                    border-bottom: 1px solid var(--at-border);
                    background: linear-gradient(to right, rgba(255,255,255,0.8), rgba(255,255,255,0.5));
                }
                .at-brand { font-size: 20px; font-weight: 800; color: var(--at-primary); letter-spacing: -0.5px; }

                /* BODY */
                .at-body { flex: 1; display: flex; overflow: hidden; }
                
                /* SIDEBAR */
                .at-sidebar {
                    width: 240px; background: #f8fafc; border-right: 1px solid var(--at-border);
                    padding: 20px; display: flex; flex-direction: column; gap: 8px;
                }
                .at-menu-item {
                    padding: 12px 16px; border-radius: 12px; font-weight: 600; font-size: 14px;
                    color: #64748b; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 10px;
                }
                .at-menu-item:hover, .at-menu-item.active { background: white; color: var(--at-primary); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

                /* CONTENT */
                .at-content { flex: 1; padding: 0; overflow-y: auto; background: white; white-space: normal;}
                .at-view { display: none; padding: 30px; animation: fadeIn 0.3s ease; }
                .at-view.active { display: block; }
                
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                /* COMPONENTS */
                .at-btn {
                    padding: 10px 20px; background: var(--at-primary); color: white;
                    border: none; border-radius: 10px; font-weight: 700; cursor: pointer;
                    transition: 0.2s; font-size: 13px;
                }
                .at-btn:hover { filter: brightness(1.1); transform: translateY(-2px); }
                .at-btn-ghost { background: transparent; color: #64748b; box-shadow: none; border: 1px solid var(--at-border); }
                .at-btn-ghost:hover { background: #f1f5f9; border-color: #cbd5e1; }

                .at-table { width: 100%; border-collapse: collapse; font-size: 13px; }
                .at-table th { text-align: left; padding: 12px; color: #64748b; font-weight: 600; border-bottom: 2px solid #f1f5f9; position: sticky; top:0; background: white; z-index:10; }
                .at-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; color: #334155; }
                .at-table tr:hover { background: #f8fafc; }
                
                .at-empty { text-align: center; padding: 50px; color: #94a3b8; font-style: italic; }
            
                /* FUNCTION LIBRARY GRID */
                .at-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
                .at-card {
                    padding: 20px; border: 1px solid var(--at-border); border-radius: 16px; 
                    cursor: pointer; transition: 0.2s; background: white;
                }
                .at-card:hover { border-color: var(--at-primary); transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                .at-card-icon { font-size: 24px; margin-bottom: 10px; }
                .at-card-title { font-weight: 700; color: #1e293b; margin-bottom: 5px; }
                .at-card-desc { font-size: 12px; color: #64748b; line-height: 1.5; }

                /* VARIANT MANAGER STYLES */
                .at-form-group { margin-bottom: 15px; }
                .at-label { font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 5px; display: block; }
                .at-input { width: 100%; padding: 10px; border: 1px solid var(--at-border); border-radius: 8px; font-family: inherit; font-size:13px; }
                .at-input:focus { outline: 2px solid var(--at-primary); border-color: transparent; }
                .at-row { display: flex; gap: 10px; align-items: center; margin-bottom: 8px; }
            `;
      const style = document.createElement('style');
      style.innerHTML = css;
      document.head.appendChild(style);
    }

    buildUI() {
      this.injectCSS();
      const html = `
                <div class="at-container">
                    <div class="at-toggle" id="atToggle">⚡</div>
                </div>
                
                <div class="at-panel" id="atPanel">
                    <div class="at-header">
                        <div class="at-brand">CÔNG CỤ HỖ TRỢ <span style="font-weight:400; font-size:14px; opacity:0.7">API</span></div>
                        <div style="font-size:12px; font-weight:600; color:#64748b;" id="atStatus">Sẵn sàng</div>
                    </div>
                    
                    <div class="at-body">
                        <div class="at-sidebar">
                            <div class="at-menu-item active" data-view="library">📚 Thư Viện Chức Năng</div>
                            <div class="at-menu-item" data-view="products">📦 Quản Lý Sản Phẩm</div>
                            <div class="at-menu-item" data-view="settings">⚙️ Cấu Hình API</div>
                        </div>
                        
                        <div class="at-content">
                            <!-- VIEW: LIBRARY -->
                            <div class="at-view active" id="view-library">
                                <h3 style="margin:0 0 20px; font-size:24px;">Chức năng khả dụng</h3>
                                <div class="at-grid">
                                    <div class="at-card" data-func="variant_manager">
                                        <div class="at-card-icon">🎨</div>
                                        <div class="at-card-title">Quản Lý Phân Loại</div>
                                        <div class="at-card-desc">Thêm, xóa, sửa phân loại hàng loạt cho danh sách sản phẩm.</div>
                                    </div>
                                    <div class="at-card" onclick="alert('Tính năng đang phát triển!')">
                                        <div class="at-card-icon">🔄</div>
                                        <div class="at-card-title">Đồng Bộ Tồn Kho</div>
                                        <div class="at-card-desc">Cập nhật số lượng tồn kho nhanh chóng từ file Excel.</div>
                                    </div>
                                    <div class="at-card" onclick="alert('Tính năng đang phát triển!')">
                                        <div class="at-card-icon">⚡</div>
                                        <div class="at-card-title">Flash Sale Tự Động</div>
                                        <div class="at-card-desc">Tạo và tham gia chương trình Flash Sale hàng loạt.</div>
                                    </div>
                                </div>
                            </div>

                            <!-- VIEW: PRODUCTS -->
                            <div class="at-view" id="view-products">
                                <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
                                    <h3 style="margin:0; font-size:18px;">Danh sách sản phẩm</h3>
                                    <div style="display:flex; gap:10px;">
                                        <button class="at-btn at-btn-ghost">Làm mới</button>
                                        <button class="at-btn" id="btnExportExcel">Xuất Excel</button>
                                    </div>
                                </div>
                                <div style="overflow:auto; height: 500px;">
                                    <table class="at-table">
                                        <thead>
                                            <tr>
                                                <th width="40"><input type="checkbox"></th>
                                                <th width="80">Hình ảnh</th>
                                                <th>Tên sản phẩm</th>
                                                <th width="100">Giá</th>
                                                <th width="80">Kho</th>
                                                <th width="80">ID</th>
                                            </tr>
                                        </thead>
                                        <tbody id="atProductList">
                                            <tr><td colspan="6" class="at-empty">Chưa có dữ liệu. Vui lòng vào trang quản lý sản phẩm để quét.</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            <!-- VIEW: FUNCTION CONTAINER -->
                            <div class="at-view" id="view-function-detail">
                                <div style="margin-bottom:20px;">
                                    <button class="at-btn at-btn-ghost" id="btnBackToLibrary">← Quay lại</button>
                                </div>
                                <div id="atFunctionContent">
                                    <!-- Dynamic Content Loaded Here -->
                                </div>
                            </div>

                            <!-- VIEW: SETTINGS -->
                            <div class="at-view" id="view-settings">
                                <h3 style="margin:0 0 20px; font-size:18px;">Debug Network</h3>
                                <div id="atNetworkLog" style="height:400px; overflow-y:auto; border:1px solid #e2e8f0; border-radius:8px; padding:10px; font-family:monospace; font-size:11px;">
                                    <div style="color:#94a3b8">Waiting for requests...</div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                
                <!-- TEMPLATES: VARIANT MANAGER -->
                <template id="tpl-variant-manager">
                     <h3 style="margin:0 0 20px; font-size:18px;">Quản Lý Phân Loại</h3>
                     
                     <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px dashed var(--at-border);">
                         <h4 style="margin:0 0 10px;">Bước 1: Học cấu trúc API (Schema)</h4>
                         <p style="font-size:13px; color:#64748b; margin-bottom: 15px;">
                            Sàn TMĐT không cập nhật từng phân loại lẻ tẻ, mà sẽ gửi toàn bộ dữ liệu sản phẩm lên server. 
                            <br>Hãy bấm nút bên dưới, sau đó <b>vào trang chỉnh sửa sản phẩm cũ, thêm/sửa 1 phân loại rồi bấm LƯU</b>. Tool sẽ bắt gói tin đó.
                         </p>
                         <div style="display:flex; gap:10px; align-items: center;">
                             <button class="at-btn" id="btnCaptureSchema" style="background:#f59e0b">🔴 Bắt đầu bắt gói tin</button>
                             <div id="captureStatus" style="font-weight:bold; color:#64748b; font-size: 12px; display:none;">
                                Đang lắng nghe... Hãy thao tác Lưu sản phẩm trên web.
                             </div>
                         </div>
                         <textarea id="atApiSchema" class="at-input" rows="5" placeholder="Schema JSON sẽ hiện ở đây sau khi bắt được..." style="margin-top:10px; font-family:monospace; font-size:11px; display:none; background:#eee; color:#333;" readonly></textarea>
                     </div>

                     <div class="at-form-group">
                         <h4 style="margin:0 0 10px;">Bước 2: Nhập dữ liệu phân loại mới</h4>
                         <label class="at-label">Tên nhóm phân loại (Ví dụ: Màu sắc)</label>
                         <input type="text" class="at-input" id="varName" placeholder="Màu sắc">
                     </div>
                     
                     <div class="at-form-group">
                         <label class="at-label">Danh sách phân loại (SKU | Tên | Giá | Kho)</label>
                         <textarea class="at-input" id="varList" rows="8" placeholder="SKU001 | Trắng | 100000 | 50&#10;SKU002 | Đen | 100000 | 50"></textarea>
                         <div style="font-size:11px; color:#64748b; margin-top:5px;">Mẹo: Nhấn TAB để tạo khoảng cách nhanh.</div>
                     </div>
                     
                     <button class="at-btn" id="btnApplyVerify">Áp dụng cho sản phẩm đã chọn</button>
                </template>
            `;
      $('body').append(html);

      // Bind Events
      this.bindEvents();
      this.setupGlobalHandlers();

      // Re-bind Network Log to new UI
      this.interceptor.addListener((data) => {
        this.updateNetworkLog(data);
      });

      // Listen for Products
      window.addEventListener('at-product-data', (e) => {
        this.updateProductList(e.detail);
        // Notify User
        const btnToggle = $('#atToggle');
        btnToggle.addClass('animate-bounce');
        $('#atStatus').text(`Đã quét ${e.detail.length} sản phẩm`).css('color', 'var(--at-primary)');
      });
    }

    setupGlobalHandlers() {
      // 1. Navigation Helpers (Use jQuery delegation instead of window globals)
      $(document).on('click', '#btnBackToLibrary', () => {
        $('.at-menu-item').removeClass('active');
        $('.at-menu-item[data-view="library"]').addClass('active');
        $('.at-view').removeClass('active');
        $('#view-library').addClass('active');
      });

      $(document).on('click', '.at-card[data-func]', (e) => {
        const funcId = $(e.currentTarget).data('func');
        if (funcId === 'variant_manager') {
          // Render template
          const tpl = document.getElementById('tpl-variant-manager').content.cloneNode(true);
          $('#atFunctionContent').empty().append(tpl);

          // Bind specific events for this function
          this.bindVariantManagerEvents();

          // Switch View
          $('.at-view').removeClass('active');
          $('#view-function-detail').addClass('active');
        }
      });

      // 2. Tab Key Handler for Textareas
      $(document).on('keydown', 'textarea.at-input', function (e) {
        if (e.key === 'Tab') {
          e.preventDefault();
          const start = this.selectionStart;
          const end = this.selectionEnd;

          // Insert tab character
          this.value = this.value.substring(0, start) + "\t" + this.value.substring(end);

          // Move cursor
          this.selectionStart = this.selectionEnd = start + 1;
        }
      });
    }

    bindEvents() {
      // Toggle Main Panel
      $('#atToggle').click(() => {
        $('#atPanel').toggleClass('open');
        $('#atToggle').removeClass('animate-bounce');
      });

      // Menu Navigation
      $('.at-menu-item').click(function () {
        $('.at-menu-item').removeClass('active');
        $(this).addClass('active');

        const viewId = $(this).data('view');
        $('.at-view').removeClass('active');
        $(`#view-${viewId}`).addClass('active');
      });

      // Export Excel (Copy to clipboard for now)
      $('#btnExportExcel').click(() => {
        if (this.products.length === 0) return alert("Chưa có dữ liệu!");

        const header = "ID\tTên\tGiá\tKho\n";
        const rows = this.products.map(p => `${p.id}\t${p.name}\t${p.price}\t${p.stock}`).join('\n');
        navigator.clipboard.writeText(header + rows).then(() => {
          alert('Đã copy dữ liệu vào Clipboard! Hãy dán (Ctrl+V) vào Excel.');
        });
      });
    }

    bindVariantManagerEvents() {
      // 1. Capture Schema Logic
      $(document).on('click', '#btnCaptureSchema', () => {
        $('#captureStatus').show().text('Đang lắng nghe... Hãy thao tác LƯU sản phẩm trên web.');
        $('#atApiSchema').hide();

        // One-time listener for the next significant POST/PUT request
        const captureListener = (data) => {
          if (data.method === 'POST' || data.method === 'PUT') {
            // Filter out likely irrelevant tracking/logging requests if needed
            // For now, accept the first POST/PUT that has a body
            if (data.body) {
              try {
                const schema = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;

                // Check if valid JSON object
                if (schema && typeof schema === 'object') {
                  console.log("[Schema Capture] Captured:", schema);

                  // Stop listening
                  const index = this.interceptor.listeners.indexOf(captureListener);
                  if (index > -1) this.interceptor.listeners.splice(index, 1);

                  // Update UI
                  $('#captureStatus').text('Đã bắt được gói tin!').css('color', 'green');
                  $('#atApiSchema').val(JSON.stringify(schema, null, 2)).show();
                  alert("Đã bắt được cấu trúc cập nhật sản phẩm! Bạn có thể kiểm tra trong ô bên dưới.");
                }
              } catch (e) {
                // Ignore non-JSON bodies
              }
            }
          }
        };
        this.interceptor.addListener(captureListener);
      });

      // 2. Apply Logic
      $(document).on('click', '#btnApplyVerify', () => {
        const varName = $('#varName').val().trim();
        const rawInput = $('#varList').val();
        const schemaText = $('#atApiSchema').val();

        if (!schemaText) return alert("Chưa có cấu trúc API (Bước 1). Vui lòng bắt gói tin cập nhật sản phẩm trước.");
        if (!varName) return alert("Vui lòng nhập Tên nhóm phân loại (VD: Màu sắc)");
        if (!rawInput) return alert("Vui lòng nhập danh sách phân loại");

        let schema;
        try {
          schema = JSON.parse(schemaText);
        } catch (e) {
          return alert("Cấu trúc API không hợp lệ (JSON Error).");
        }

        const variants = DataParser.parseVariantInput(rawInput);
        if (variants.length === 0) return alert("Không đọc được dữ liệu phân loại nào!");

        // Get selected products
        const selectedIds = [];
        $('#atProductList input[type="checkbox"]:checked').each(function () {
          selectedIds.push($(this).val());
        });

        if (selectedIds.length === 0) return alert("Vui lòng tích chọn ít nhất 1 sản phẩm ở tab 'Quản Lý Sản Phẩm'!");

        this.executeAddVariants(selectedIds, varName, variants, schema);
      });
    }

    async executeAddVariants(productIds, groupName, variants, schema) {
      console.log("EXECUTE ADD VARIANTS", { productIds, groupName, variants, schema });
      alert(`Đã nhận:
        - ${productIds.length} sản phẩm
        - Nhóm: ${groupName}
        - ${variants.length} phân loại mới
        - Schema mẫu đã có.
        
        Bước tiếp theo (Logic):
        1. Lấy thông tin chi tiết từng sản phẩm (GET).
        2. Merge variants mới vào cấu trúc Schema mẫu.
        3. Gửi request UPDATE (POST).`);
    }

    updateNetworkLog(data) {
      const logContainer = $('#atNetworkLog');
      const color = data.method === 'GET' ? 'blue' : 'green';
      const el = $(`
                 <div style="padding:4px 0; border-bottom:1px solid #f1f5f9;">
                     <span style="color:${color}; font-weight:bold; margin-right:5px;">${data.method}</span>
                     <span>${data.url.split('?')[0].split('/').pop()}</span>
                     <span style="float:right; color:#94a3b8">${data.status}</span>
                 </div>
             `);
      if (logContainer.text().includes('Waiting')) logContainer.empty();
      logContainer.prepend(el);
    }

    updateProductList(products) {
      this.products = products; // Save to local state
      const tbody = $('#atProductList');
      tbody.empty();

      products.forEach(p => {
        const imgUrl = p.image || p.cover_image || 'https://via.placeholder.com/40'; // Fallback
        const row = `
                    <tr>
                        <td><input type="checkbox" value="${p.id}"></td>
                        <td><img src="${imgUrl}" style="width:40px; height:40px; border-radius:4px; object-fit:cover;"></td>
                        <td>
                            <div style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:300px;">${p.name}</div>
                            <div style="font-size:10px; color:#94a3b8;">SKU: ${p.sku || 'N/A'}</div>
                        </td>
                        <td style="font-weight:700;">${p.price}</td>
                        <td>${p.stock}</td>
                        <td style="font-family:monospace; color:#64748b;">${p.id}</td>
                    </tr>
                `;
        tbody.append(row);
      });
    }
  }

  // Main Execution
  $(document).ready(() => {
    const interceptor = new NetworkInterceptor();
    interceptor.init();

    const ui = new UIManager(interceptor);
    ui.buildUI();

    console.log("ANTIGRAVITY LOADED");
  });

})();

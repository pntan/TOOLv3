// ==UserScript==
// @name         CÔNG CỤ HỖ TRỢ V4 (ULTIMATE)
// @version      0.3.0
// @namespace    tanphan.toolv4
// @description  Hỗ trợ thao tác sàn TMĐT - Premium UI & Automated Logic (Class-Based)
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
  "use strict";
  if (window.top !== window.self) return;

  class ProgramConfig {
    constructor() {
      this._name = "Công Cụ Hỗ Trợ";
      this._version = "v4.0.0";
      this._theme = "default";
      this._host = window.location;
      this._platform = this.host.toString().includes("shopee") ? "shopee"
        : this.host.toString().includes("tiktok") ? "tiktok"
          : this.host.toString().includes("lazada") ? "lazada"
            : "unknow";
    }

    set theme(theme) {
      if (!["default", "light", "dark", "custom"].includes(theme)) {
        return;
      }

      this._theme = theme;
    }

    get name() { return this._name; }

    get version() { return this._version; }

    get theme() { return this._theme; }

    get host() { return this._host; }

    get platform() { return this._platform; }
  }

  class Logs {
    constructor() {
      this.element = $(".tp-v4-container #console");
    }
  }

  class TestFunction {
    constructor() {
      this._id = "TESTFUNCTION";
      this._name = "Chức Năng Thử Nghiệm";
      this._platform = ["shopee", "tiktok", "lazada"];
      this._type = "offline"
      this.Component = new Component();
    }

    renderConfig() {
      return `${this.Component.Input("text", "Thử nghiệp, nhập gì cũng được", null, null, null, null, { "key": "input_value" })}`;
    }

    get id() { return this._id; }

    get platform() { return this._platform; }

    get name() { return this._name; }

    get type() { return this._type };

    run(params) {
      console.log("CHỨC NĂNG THỬ NGHIỆM");
      console.log(params);
    }
  }

  class ThemPhanLoai {
    constructor() {
      this._id = "ThemPhanLoai";
      this._name = "Thêm Phân Loại";
      this._platform = ["shopee"];
      this._type = "offline";
      this.Component = new Component();
      this.ProgramConfig = new ProgramConfig();
      this.current_platform = this.ProgramConfig.platform;
    }

    get id() { return this._id; }

    get platform() { return this._platform; }

    get name() { return this._name; }

    get type() { return this._type };

    renderConfig() {
      return `
        ${this.Component.TextArea("SKU | Tên | Giá | Số Lượng", "", null, null, null, { "key": "data" })}
      `
    }

    format_data(data) {
      data = data.split("\n");
      var data_obj = [];
      $.each(data, (i, v) => {
        v = v.split("\t");
        var obj = {
          sku: v[0] ? v[0] : "",
          name: v[1] ? v[1] : "",
          price: v[2] ? v[2] : "0",
          quantity: v[3] ? v[3] : "0"
        }

        data_obj.push(obj);
      })

      return data_obj;
    }

    shopee(data) {
    }

    run(params) {
      var data = this.format_data(params.data);

      if (this.current_platform == "shopee") this.shopee(data);
    }
  }

  class DevTools {
    constructor() {
      this.activeTab = 'console';
      this.isInspecting = false;
      this.highlightBox = null;
    }

    render() {
      return `
            <div class="tp-dev-container" style="display:flex; flex-direction:column; height:100%;">
                <div class="tp-dev-tabs" style="display:flex; border-bottom:1px solid rgba(0,0,0,0.1); padding:5px; gap: 5px;">
                    <div class="tp-dev-tab active" data-tab="console" style="padding:6px 12px; cursor:pointer; font-weight:bold; border-radius: 6px; background: rgba(0,0,0,0.05);">Console</div>
                    <div class="tp-dev-tab" data-tab="elements" style="padding:6px 12px; cursor:pointer; border-radius: 6px;">Elements</div>
                    <div class="tp-dev-tab" data-tab="network" style="padding:6px 12px; cursor:pointer; border-radius: 6px;">Network</div>
                </div>
                <div class="tp-dev-content" style="flex:1; overflow:hidden; position:relative;">
                    
                    <!-- CONSOLE PANEL -->
                    <div class="tp-dev-panel active" id="dev-console" style="height:100%; overflow-y:auto; font-family:monospace; font-size:12px; padding:5px;"></div>
                    
                    <!-- ELEMENTS PANEL -->
                    <div class="tp-dev-panel" id="dev-elements" style="height:100%; display:none; padding:10px;">
                        <button id="btn-inspect-toggle" class="tp-v4-btn" style="width:100%; margin-bottom:10px;">🔍 Select Element (Off)</button>
                        <div id="inspector-details" style="white-space:pre-wrap; font-family:monospace; font-size:12px; background:rgba(0,0,0,0.03); padding:10px; border-radius:8px; height: calc(100% - 60px); overflow-y: auto;">
                            <div style="text-align:center; color:#999; margin-top:50px;">Use "Select Element" to inspect items.</div>
                        </div>
                    </div>
                    
                    <!-- NETWORK PANEL (Split View) -->
                    <div class="tp-dev-panel" id="dev-network" style="height:100%; display:none; flex-direction:row; overflow: hidden;">
                        <div style="width: 40%; border-right:1px solid rgba(0,0,0,0.1); display:flex; flex-direction:column; height: 100%;">
                           <div style="flex:1; display:flex; flex-direction:column; overflow:hidden;">
                               <table style="width:100%; font-size:13px; border-collapse:collapse; table-layout:fixed; display:flex; flex-direction:column; height:100%;">
                                    <thead style="background:rgba(0,0,0,0.05); text-align:left; display:block; flex-shrink:0;">
                                        <tr style="display:flex;">
                                          <th style="padding:8px; width:50px;">M</th>
                                          <th style="padding:8px; flex:1;">Name</th>
                                          <th style="padding:8px; width:50px;">Stt</th>
                                        </tr>
                                    </thead>
                                    <tbody id="network-list" style="display:block; overflow-y:auto; flex:1; width:100%;"></tbody>
                               </table>
                           </div>
                        </div>
                        <div id="network-details" style="flex:1; padding:12px; overflow-y:auto; font-size:13px; font-family:monospace; word-break:break-all; height:100%;">
                            <div style="text-align:center; color:#999; margin-top:50px; font-size:14px;">Select a request to view details.</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    init() {
      // Inject into the .screen-dev container
      const $screen = $(".tp-v4-main-screen-content.tp-screen-active").length
        ? $(".screen-dev")
        : $(".screen-dev"); // Just target the class

      // Since screen-dev might not be active/rendered yet, we just inject content
      // But we need to make sure the element exists. In UI.layout, it is defined.
      // We will assume UI calls this after rendering layout.
      $(".screen-dev").html(this.render());

      this.bindEvents();
      this.hookConsole();
      this.hookNetwork();
    }

    bindEvents() {
      const self = this;

      // Tab Switching
      $(document).on("click", ".tp-dev-tab", function () {
        $(".tp-dev-tab").removeClass("active").css({ "font-weight": "normal", "background": "transparent" });
        $(this).addClass("active").css({ "font-weight": "bold", "background": "rgba(0,0,0,0.05)" });

        const tab = $(this).data("tab");
        $(".tp-dev-panel").hide().removeClass("active");
        const $target = $(`#dev-${tab}`);
        // Reset display style based on ID (network needs flex)
        if (tab === 'network') {
          $target.css("display", "flex");
        } else {
          $target.show();
        }
        $target.addClass("active");
      });

      // Inspector Copy Actions
      $(document).on("click", ".tp-btn-copy-selector", function () {
        const text = $(this).data("val");
        navigator.clipboard.writeText(text).then(() => alert("Copied Selector!"));
      });
      $(document).on("click", ".tp-btn-copy-html", function () {
        const text = $(this).data("val");
        navigator.clipboard.writeText(decodeURIComponent(text)).then(() => alert("Copied HTML!"));
      });

      // Network Copy Actions
      $(document).on("click", ".tp-btn-copy-body", function () {
        // Retrieve data from the details panel stash or closure isn't easy here. 
        // Storing data in the button itself is safer for static click handlers
        const text = $(this).data("val");
        navigator.clipboard.writeText(decodeURIComponent(text)).then(() => alert("Copied Body!"));
      });

      // Inspector Toggle
      $(document).on("click", "#btn-inspect-toggle", function () {
        self.toggleInspector();
      });

      // Global Inspector Events
      $(document).on("mousemove", (e) => {
        if (!self.isInspecting) return;
        self.updateHighlight(e.target);
      }).on("click", (e) => {
        if (!self.isInspecting) return;
        // Ignore clicks within the tool itself
        if ($(e.target).closest(".tp-v4-container").length) return;
        if ($(e.target).closest("#tp-inspector-box").length) return; // Ignore box itself

        e.preventDefault();
        e.stopPropagation();
        self.lockSelection(e.target);
      }).on("keydown", (e) => {
        if (self.isInspecting && e.key === "Escape") self.toggleInspector(false);
      });
    }

    toggleInspector(forceState) {
      this.isInspecting = forceState !== undefined ? forceState : !this.isInspecting;
      const $btn = $("#btn-inspect-toggle");

      if (this.isInspecting) {
        $btn.text("🔍 Select Element (ON)").css({ "background": "#E17055", "color": "white" });
        $("body").css("cursor", "crosshair");
      } else {
        $btn.text("🔍 Select Element (Off)").css({ "background": "", "color": "" });
        $("body").css("cursor", "");
        if (this.highlightBox) {
          this.highlightBox.remove();
          this.highlightBox = null;
        }
      }
    }

    updateHighlight(el) {
      if ($(el).closest(".tp-v4-container").length) return;

      if (!this.highlightBox) {
        this.highlightBox = $("<div id='tp-inspector-box' style='position:absolute; pointer-events:none; border:2px solid #E17055; background:rgba(225, 112, 85, 0.2); z-index:2147483647; transition: all 0.1s;'></div>").appendTo("body");
      }

      const rect = el.getBoundingClientRect();
      this.highlightBox.css({
        top: window.scrollY + rect.top,
        left: window.scrollX + rect.left,
        width: rect.width,
        height: rect.height
      });
    }

    getUniqueSelector(el) {
      if (el.id) return "#" + el.id;

      let path = [];
      while (el.nodeType === Node.ELEMENT_NODE) {
        let selector = el.nodeName.toLowerCase();
        if (el.id) {
          selector += '#' + el.id;
          path.unshift(selector);
          break;
        } else {
          let sib = el, nth = 1;
          while (sib = sib.previousElementSibling) {
            if (sib.nodeName.toLowerCase() == selector) nth++;
          }
          if (nth != 1) selector += ":nth-of-type(" + nth + ")";
        }
        path.unshift(selector);
        el = el.parentNode;
        if (path.length > 5) break; // Limit depth
      }
      return path.join(" > ");
    }

    lockSelection(el) {
      this.toggleInspector(false);

      let htmlPreview = "";
      try { htmlPreview = el.outerHTML; } catch (e) { }
      const selector = this.getUniqueSelector(el);
      const rect = el.getBoundingClientRect();

      // Compute colors for tags
      const tagColor = "#8e44ad"; // Purple
      const idColor = "#2980b9";  // Blue
      const classColor = "#d35400"; // Orange

      const infoUI = `
             <div style="font-family: 'Consolas', 'Menlo', monospace; font-size: 13px; color: #2c3e50;">
                
                <!-- HEADER: Tag Identity -->
                <div style="padding-bottom:12px; border-bottom:1px solid rgba(0,0,0,0.1); margin-bottom:12px;">
                   <div>
                       <span style="color:${tagColor}; font-weight:bold; font-size:16px;">${el.tagName.toLowerCase()}</span>
                       ${el.id ? `<span style="color:${idColor}; margin-left:4px;">#${el.id}</span>` : ''}
                       ${el.className && typeof el.className === 'string' ? `<span style="color:${classColor}; margin-left:4px;">.${el.className.split(' ').join('.')}</span>` : ''}
                   </div>
                   <div style="font-size:11px; color:#7f8c8d; margin-top:4px;">
                       ${rect.width.toFixed(2)} × ${rect.height.toFixed(2)} px
                   </div>
                </div>

                <!-- ACTIONS ROW -->
                <div style="display:flex; gap:10px; margin-bottom:15px;">
                   <button class="tp-btn-copy-html" data-val="${encodeURIComponent(htmlPreview)}" 
                           style="flex:1; padding:8px; border:1px solid #bdc3c7; background:#fff; border-radius:6px; cursor:pointer; font-weight:600; font-size:12px; color:#2c3e50; transition:0.2s;">
                       Copy Outer HTML
                   </button>
                   <button class="tp-btn-copy-selector" data-val="${selector}" 
                           style="flex:1; padding:8px; border:1px solid #bdc3c7; background:#fff; border-radius:6px; cursor:pointer; font-weight:600; font-size:12px; color:#2c3e50; transition:0.2s;">
                       Copy Selector
                   </button>
                </div>

                <!-- SELECTOR PREVIEW -->
                <div style="margin-bottom:15px;">
                   <div style="font-size:10px; font-weight:bold; color:#95a5a6; margin-bottom:4px; letter-spacing:0.5px;">UNIQUE SELECTOR</div>
                   <div style="background:#f4f6f7; padding:8px; border-radius:4px; border:1px solid #ecf0f1; color:#34495e; word-break:break-all; font-size:12px;">
                       ${selector}
                   </div>
                </div>

                <!-- ATTRIBUTES TABLE -->
                <div>
                    <div style="font-size:10px; font-weight:bold; color:#95a5a6; margin-bottom:6px; letter-spacing:0.5px;">ATTRIBUTES</div>
                    <div style="background:#fff; border:1px solid #eee; border-radius:6px; overflow:hidden;">
                        ${Array.from(el.attributes).map((attr, index) => `
                            <div style="display:flex; border-bottom:1px solid #f5f6fa; background:${index % 2 === 0 ? '#fff' : '#fcfcfc'};">
                                <div style="width:100px; padding:6px 10px; color:#c0392b; font-weight:600; border-right:1px solid #f5f6fa; flex-shrink:0;">${attr.name}</div>
                                <div style="flex:1; padding:6px 10px; color:#2980b9; word-break:break-all;">${attr.value || '""'}</div>
                            </div>
                        `).join("")}
                        ${el.attributes.length === 0 ? '<div style="padding:10px; color:#bdc3c7; font-style:italic;">No attributes</div>' : ''}
                    </div>
                </div>

             </div>
        `;

      $("#inspector-details").html(infoUI);
    }

    hookConsole() {
      const methods = ["log", "warn", "error", "info"];
      const self = this;

      methods.forEach(method => {
        const original = console[method];
        console[method] = function (...args) {
          original.apply(console, args);
          self.logToUI(method, args);
        };
      });

      // Capture global errors
      window.addEventListener('error', (event) => {
        self.logToUI('error', [`Uncaught Error: ${event.message}`, `at ${event.filename}:${event.lineno}`]);
      });
    }

    logToUI(type, args) {
      const colors = { log: "#2d3436", warn: "#e17055", error: "#d63031", info: "#0984e3" };
      const icon = { log: "⚪", warn: "⚠️", error: "⛔", info: "ℹ️" };

      // Safe stringify
      const msg = args.map(a => {
        if (typeof a === 'object') {
          try { return JSON.stringify(a); } catch (e) { return "[Circular/Object]"; }
        }
        return String(a);
      }).join(" ");

      const time = new Date().toLocaleTimeString('en-US', { hour12: false });

      const html = `
          <div style="border-bottom:1px solid rgba(0,0,0,0.05); padding:4px; color:${colors[type] || '#000'}; font-family: Consolas, monospace;">
            <span style="color:#b2bec3; font-size:10px; margin-right:5px;">${time}</span>
            <span style="margin-right:5px;">${icon[type]}</span>
            <span>${msg}</span>
          </div>
        `;

      const $panel = $("#dev-console");
      if ($panel.length) {
        $panel.append(html);
        $panel.scrollTop($panel[0].scrollHeight);
      }
    }

    hookNetwork() {
      const self = this;

      // 1. Monkey-patch XMLHttpRequest
      const origOpen = XMLHttpRequest.prototype.open;
      const origSend = XMLHttpRequest.prototype.send;

      XMLHttpRequest.prototype.open = function (method, url) {
        this._devData = { method, url, startTime: Date.now() };
        origOpen.apply(this, arguments);
      };

      XMLHttpRequest.prototype.send = function (body) {
        if (this._devData) {
          this._devData.body = body;
          const id = Date.now() + Math.random().toString(36).substring(7);

          self.addNetworkRow(id, this._devData);

          this.addEventListener("load", function () {
            self.updateNetworkRow(id, this.status, this.responseText);
          });

          this.addEventListener("error", function () {
            self.updateNetworkRow(id, "ERR", null);
          });
        }
        origSend.apply(this, arguments);
      };

      // 2. Monkey-patch Fetch
      const origFetch = window.fetch;
      window.fetch = async function (...args) {
        const startTime = Date.now();
        let url = args[0];
        let method = "GET";

        if (typeof url === 'object' && url instanceof Request) {
          method = url.method;
          url = url.url;
        } else if (args[1] && args[1].method) {
          method = args[1].method;
        }

        const id = Date.now() + Math.random().toString(36).substring(7);
        self.addNetworkRow(id, { method, url, startTime, body: args[1]?.body });

        try {
          const response = await origFetch(...args);
          const clone = response.clone();

          clone.text().then(text => {
            self.updateNetworkRow(id, response.status, text);
          }).catch(() => {
            self.updateNetworkRow(id, response.status, "[Binary/Stream]");
          });

          return response;
        } catch (err) {
          self.updateNetworkRow(id, "ERR", err.message);
          throw err;
        }
      };
    }

    addNetworkRow(id, data) {
      if (!$("#network-list").length) return; // UI not ready

      const name = data.url.includes("?") ? data.url.split("?")[0].split("/").pop() : data.url.split("/").pop();
      const shortName = name || data.url.substring(0, 30);

      const row = `
            <tr id="req-${id}" style="border-bottom:1px solid rgba(0,0,0,0.05); cursor:pointer; display:flex;">
                <td style="padding:8px; width:50px; font-weight:bold; color: #636e72;">${data.method}</td>
                <td style="padding:8px; flex:1; max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${data.url}">${shortName}</td>
                <td style="padding:8px; width:50px; color:orange;" class="req-status">⏳</td>
            </tr>
         `;
      $("#network-list").prepend(row);

      // Store object in DOM for later access
      $(`#req-${id}`).data("details", data); // Capture initial data

      // Click handler for Details Panel
      $(document).on("click", `#req-${id}`, function () {
        $("#network-list tr").css("background", "transparent");
        $(this).css("background", "rgba(0,0,0,0.03)");

        const d = $(this).data("details");
        const detailStats = `
                <div style="margin-bottom:12px; padding-bottom:10px; border-bottom:1px solid #eee;">
                    <div style="font-size:14px; font-weight:bold; color:var(--tp-primary); word-break:break-all;">${d.url}</div>
                    <div style="margin-top:8px; font-size:12px; color:#666;">
                        <span style="background:#eee; padding:4px 8px; border-radius:4px;">${d.method}</span>
                        <span style="margin-left:10px;">Status: <b>${d.status || 'Pending'}</b></span>
                        <span style="margin-left:10px;">Time: <b>${d.duration ? d.duration + 'ms' : '...'}</b></span>
                    </div>
                </div>
                
                <div style="margin-bottom:15px;">
                    <button class="tp-v4-btn" style="padding:6px 12px; font-size:12px;" onclick="navigator.clipboard.writeText('${d.url}')">Copy URL</button>
                </div>

                <details open style="margin-bottom:10px;">
                    <summary style="font-weight:bold; cursor:pointer; font-size:14px;">
                        Request Body 
                        <button class="tp-btn-copy-body" data-val="${encodeURIComponent(d.body || '')}" style="font-size:10px; margin-left:10px; cursor:pointer;">Copy</button>
                    </summary>
                    <div style="background:#fff; padding:8px; border:1px solid #eee; margin-top:5px; max-height:150px; overflow:auto;">
                        ${d.body || '(empty)'}
                    </div>
                </details>

                <details open>
                    <summary style="font-weight:bold; cursor:pointer; font-size:14px;">
                        Response 
                        <button class="tp-btn-copy-body" data-val="${encodeURIComponent(d.response || '')}" style="font-size:10px; margin-left:10px; cursor:pointer;">Copy</button>
                    </summary>
                    <div style="background:#fff; padding:8px; border:1px solid #eee; margin-top:5px; max-height:400px; overflow:auto;">
                        ${(d.response || '(empty/pending)').replace(/</g, "&lt;").replace(/>/g, "&gt;")}
                    </div>
                </details>
             `;
        $("#network-details").html(detailStats);
      });
    }

    updateNetworkRow(id, status, response) {
      const $row = $(`#req-${id}`);
      if ($row.length) {
        // Retrieve stored object
        const storedData = $row.data("details");
        if (storedData) {
          storedData.status = status;
          storedData.response = typeof response === 'string' ? response.substring(0, 100000) : response;
          storedData.duration = Date.now() - storedData.startTime;

          const color = status >= 400 || status === "ERR" ? "#d63031" : "#00b894";
          $row.find(".req-status").text(status).css("color", color);

          // Save back
          $row.data("details", storedData);
        }
      }
    }
  }

  class UploadImgBB {
    constructor() {
      this._id = "UploadImgBB";
      this._name = "Upload ImgBB";
      this._platform = ["shopee", "tiktok", "lazada", "unknow"];
      this._type = "offline";
      this.Component = new Component();
    }

    get id() { return this._id; }
    get platform() { return this._platform; }
    get name() { return this._name; }
    get type() { return this._type; }

    renderConfig() {
      return `
        ${this.Component.Input("text", "Nhập API Key ImgBB (để trống dùng mặc định)", "", "w-100", "", "margin-bottom: 10px;", { key: "api_key" })}
        ${this.Component.FileInput("Chọn hình ảnh (Cho phép nhiều hình)", "", "file_input", "margin-bottom: 10px;", { key: "files" })}
        ${this.Component.TextArea("Kết quả (Link | Tên file)", "", "", "result_area", "height: 150px; white-space: pre;", { key: "result" })}
        <p style="font-size: 11px; color: #666; margin-top: 5px;">* Thứ tự hình ảnh có thể không giống lúc chọn do upload bất đồng bộ.</p>
      `;
    }

    run(params) {
      const files = params.files;
      const apiKey = params.api_key || "50162f76ecadab419e7e399404da4c9e"; // Public Key example
      const $resultArea = $("#result_area");

      if (!files || files.length === 0) {
        alert("Vui lòng chọn ít nhất 1 hình ảnh!");
        return;
      }

      $resultArea.val(`Đang chuẩn bị upload ${files.length} hình...`);
      let results = [];
      let completed = 0;

      const checkDone = () => {
        completed++;
        $resultArea.val(`Đã xong ${completed}/${files.length}...`);

        if (completed === files.length) {
          $resultArea.val(results.join("\n"));
        }
      };

      Array.from(files).forEach(file => {
        this.upload(file, apiKey, (url) => {
          results.push(`${url}\t${file.name}`);
          checkDone();
        }, (err) => {
          results.push(`ERROR (${file.name})\t${err}`);
          checkDone();
        });
      });
    }

    upload(file, apiKey, onSuccess, onError) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const base64Data = e.target.result.split(',')[1];
        const formData = new FormData();
        formData.append("image", base64Data);

        GM_xmlhttpRequest({
          method: "POST",
          url: `https://api.imgbb.com/1/upload?key=${apiKey}`,
          data: formData,
          onload: function (response) {
            try {
              const json = JSON.parse(response.responseText);
              if (json && json.success) {
                onSuccess(json.data.url);
              } else {
                onError(json.error ? json.error.message : "API Error");
              }
            } catch (e) {
              onError("Parse Error");
            }
          },
          onerror: function (err) {
            onError("Network Error");
          }
        });
      };
      reader.onerror = function () {
        onError("File Read Error");
      }
      reader.readAsDataURL(file);
    }
  }

  class Feature {
    constructor() {
      this.ProgramConfig = new ProgramConfig();
      this.Logs = new Logs();
      this.TestFunction = new TestFunction();
      this.ThemPhanLoai = new ThemPhanLoai();
      this.UploadImgBB = new UploadImgBB();
    }

    /* Hàm lọc chức năng theo Platform hiện tại */
    getAvailableFeatures() {
      const currentPlatform = this.ProgramConfig.platform;
      let list = [];

      // Lấy tất cả thuộc tính của class Feature
      Object.keys(this).forEach((key) => {
        const func = this[key];

        // Kiểm tra nếu object đó có thuộc tính platforms và hỗ trợ platform hiện tại
        if (func.platform && func.platform.includes(currentPlatform)) {
          list.push(func);
        }
      });
      return list;
    }
  }

  class Component {

    // 1. HÀM PHỤ TRỢ (HELPER)
    // Giúp code gọn hơn, không phải viết lại logic map data ở mỗi hàm
    _parseData(datas) {
      if (!datas || Object.keys(datas).length === 0) return "";

      return Object.entries(datas).map(([key, value]) => `data-${key}="${value}" `).join(" ");
    }

    // 2. CÁC COMPONENT CƠ BẢN

    // Button (Đã sửa lỗi vị trí style)
    Button(text = "Nút Nhấn", className = "", id = "", style = "", datas = {}) {
      const dataAttrs = this._parseData(datas);

      return `
        <button class="tp-v4-btn ${className}" id="${id}" style="${style}" ${dataAttrs}>
          ${text}
        </button>
      `;
    }

    Text(text = "Văn Bản", className = "", id = "", style = "", datas = {}) {
      const dataAttrs = this._parseData(datas);

      return `
        <p class="${className}" id="${id}" style="${style}" ${dataAttrs}>
          ${text}
        </p>
      `;
    }

    Label(text = "Nhãn", className = "", id = "", forHtml = "", style = "", datas = {}) {
      const dataAttrs = this._parseData(datas);

      return `
        <label for="${forHtml}" class="${className}" id="${id}" style="${style}" ${dataAttrs}>
          ${text}
        </label>
      `;
    }

    // 3. CÁC COMPONENT MỚI THÊM VÀO

    // Input (Dùng cho text, password, email, number...)
    Input(type = "text", placeholder = "", value = "", className = "", id = "", style = "", datas = {}) {
      const dataAttrs = this._parseData(datas);

      return `<input type="${type}" placeholder="${placeholder}" value="${value}" class="tp-v4-value-input ${className}" id="${id}" style="${style}" ${dataAttrs} />`;
    }

    // TextArea (Nhập văn bản nhiều dòng)
    TextArea(placeholder = "", value = "", className = "", id = "", style = "", datas = {}) {
      const dataAttrs = this._parseData(datas);

      return `
        <textarea placeholder="${placeholder}" class="tp-v4-value-input ${className}" id="${id}" style="${style}" ${dataAttrs}>${value}</textarea>
      `;
    }

    // Checkbox (Có tùy chọn checked)
    Checkbox(checked = false, className = "", id = "", style = "", datas = {}) {
      const dataAttrs = this._parseData(datas);
      const isChecked = checked ? "checked" : "";

      return `<input type="checkbox" ${isChecked} class="tp-v4-value-input ${className}" id="${id}" style="${style}" ${dataAttrs} />`;
    }

    // File Input (Multiple)
    FileInput(placeholder = "Chọn tệp", className = "", id = "", style = "", datas = {}) {
      const dataAttrs = this._parseData(datas);
      return `
        <div style="${style}">
            <label style="font-size:12px; font-weight:700; color:#666; margin-bottom:4px; display:block;">${placeholder}</label>
            <input type="file" multiple class="tp-v4-value-input ${className}" id="${id}" style="padding: 8px;" ${dataAttrs} />
        </div>
      `;
    }

    // Image (Hình ảnh)
    Image(src = "", alt = "", className = "", id = "", style = "", datas = {}) {
      const dataAttrs = this._parseData(datas);

      return `<img src="${src}" alt="${alt}" class="${className}" id="${id}" style="${style}" ${dataAttrs} />`;
    }

    // Link (Thẻ a)
    Link(text = "Link", href = "#", target = "_self", className = "", id = "", style = "", datas = {}) {
      const dataAttrs = this._parseData(datas);

      return `
        <a href="${href}" target="${target}" class="${className}" id="${id}" style="${style}" ${dataAttrs}>
          ${text}
        </a>
      `;
    }

    /**
   * 1. SELECT BOX (Dropdown)
   * @param {Array} options - Mảng các object: [{value: "1", text: "Lựa chọn A", selected: true}, ...]
   */
    Select(options = [], className = "", id = "", style = "", datas = {}) {
      const dataAttrs = this._parseData(datas);

      // Tạo danh sách các thẻ <option>
      const optionsHtml = options.map((opt) => {
        const isSelected = opt.selected ? "selected" : "";
        const isDisabled = opt.disabled ? "disabled" : "";

        return `
            <option value="${opt.value}" ${isSelected} ${isDisabled}>
              ${opt.text}
            </option>
          `;
      }).join("");

      return `
        <select class="tp-v4-value-input ${className}" id="${id}" style="border: none; border-radius: 100px ${style}" ${dataAttrs}>
          ${optionsHtml}
        </select>
      `;
    }

    // Container (Div) - QUAN TRỌNG: Dùng để bọc các component khác
    // content ở đây có thể là chuỗi HTML từ các hàm Button, Text... bên trên
    Div(content = "", className = "", id = "", style = "", datas = {}) {
      const dataAttrs = this._parseData(datas);

      return `
        <div class="${className}" id="${id}" style="${style}" ${dataAttrs}>
          ${content}
        </div>
      `;
    }

    // Hàm tạo Card để "quy hoạch" các khối cài đặt
    Card(title, content, className = "") {
      return `
        <div class="tp-v4-card ${className}"> <div class="tp-v4-card-header" >
          ${title}
          </div> <div class="tp-v4-card-body">
            ${content}
          </div>
        </div>
      `;
    }
  }

  class UI {
    constructor() {
      this.Feature = new Feature();
      this.Component = new Component();
      this.Config = new ProgramConfig();
      this.DevTools = new DevTools(); // Initializes DevTools Suite
      this._panel_side = "left";
      this.init();
    }

    get panel_side() {
      return this._panel_side;
    }

    set panel_side(side) {
      this._panel_side = side;
      $(".tp-v4-main").attr("data-side", side);
    }

    init() {
      $("head").append(this.style());
      $("body").append(this.layout());
      this.bindEvent();
      this.DevTools.init(); // Initialize DevTools UI and Hooks
    }

    layout() {
      const mainLayout = `
        <div class="tp-v4-container tp-v4-main">
          <div class="tp-v4-main-header">
            <div class="tp-v4-main-header-left">
              <span>${this.Config.name}</span>
              <span>${this.Config.version}</span>
            </div>
            <div class="tp-v4-main-header-right"></div>
          </div>
          <div class="tp-v4-main-tab">
            <div class="tp-v4-tab-indicator"></div>
            <div class="tp-v4-main-tab-box active" data-tab="online">
              <p>Online</p>
            </div>
            <div class="tp-v4-main-tab-box" data-tab="offline">
              <p>Offline</p>
            </div>
            <div class="tp-v4-main-tab-box" data-tab="setting">
              <p>Cài Đặt</p>
            </div>
            <div class="tp-v4-main-tab-box" data-tab="dev">
              <p>DEV</p>
            </div>
          </div>
          <div class="tp-v4-main-tab-sreen">
            <div class="tp-v4-screen-wrapper">
              <div class="tp-v4-main-screen-content screen-online"></div>
              
              <div class="tp-v4-main-screen-content screen-offline">
                <div class="tp-v4-screen-list">
                  <div class="tp-v4-main-list-feature">
                    ${this.renderFeatureCard()}
                  </div>
                </div>
                <div class="tp-v4-main-layout-feature">
                  <div class="tp-v4-detail-header"> <button class="tp-btn-back">← Quay lại</button>
                    <h3 class="tp-detail-title">Tên chức năng</h3>
                  </div>
                  <div class="tp-v4-detail-content"> </div>
                  <div class="tp-v4-detail-footer"> <button class="tp-btn-execute">BẮT ĐẦU CHẠY</button> </div>
                </div>
              </div>

              <div class="tp-v4-main-screen-content screen-setting"></div>
              <div class="tp-v4-main-screen-content screen-dev">
                <!-- DevTools Content (Injected by DevTools.init) -->
              </div>
            </div>
          </div>
        </div>
      `;

      const dockLayout = ` 
        <div class="tp-v4-container tp-v4-dock">
          <div class="tp-v4-dock-feature">
            ${Array.from({ length: 10 }).map((_, i) => `
              <div class="tp-v4-dock-feature-box" style="--i: ${i}">
                <p>Chức năng ${i + 1}</p>
              </div>
            `).join('')}
          </div>
          <div class="tp-v4-dock-player">
            <div class="tp-player-dashboard">
              <!-- Row 1: Info -->
              <div class="tp-player-info">
                <div class="tp-song-detail"> <b>Lofi Study Radio</b> <span>ChilledCow</span> </div>
              </div>
              <!-- Row 2: Controls -->
              <div class="tp-player-controls"> 
                <span>⏮</span> 
                <span class="tp-play-btn">▶️</span> 
                <span>⏭</span> 
                <span class="tp-playlist-btn" title="Danh sách phát" style="margin-left:10px; font-size:16px;">🖥️</span> 
              </div>
              <!-- Row 3: Timebar -->
              <div class="tp-player-time">
                <span>02:45</span>
                <div class="tp-player-seekbar">
                  <div class="tp-player-progress"></div>
                </div>
                <span>04:00</span>
              </div>
            </div>
          </div>
        </div>

        <!-- PLAYLIST MODAL -->
        <div class="tp-v4-container tp-playlist-modal">
           <div class="tp-playlist-header">
             <div class="tp-playlist-tab active" data-tab="list-offline">Offline Music</div>
             <div class="tp-playlist-tab" data-tab="list-online">Online Room</div>
             <div class="tp-playlist-close" style="width:30px; text-align:center; cursor:pointer;">✕</div>
           </div>
           
           <div class="tp-playlist-content">
             <!-- OFFLINE TAB -->
             <div class="tp-playlist-screen active" id="list-offline">
               <div style="margin-bottom: 10px; display: flex; gap: 5px;">
                 <input type="text" class="tp-v4-value-input" style="padding: 8px 12px;" placeholder="Nhập tên bài hát hoặc URL...">
                 <button class="tp-v4-btn" style="padding: 8px 12px; min-width: 40px;">+</button>
               </div>
               <div class="tp-playlist-item active"> <span>1. Lofi Study Session</span> <span>04:00</span> </div>
               <div class="tp-playlist-item"> <span>2. Midnight City Night</span> <span>03:20</span> </div>
               <div class="tp-playlist-item"> <span>3. Coffee Shop Ambience</span> <span>05:15</span> </div>
               <div class="tp-playlist-item"> <span>4. Rainy Night in Tokyo</span> <span>04:45</span> </div>
             </div>
             
             <!-- ONLINE TAB -->
             <div class="tp-playlist-screen" id="list-online">
               <div class="tp-v4-func-card" style="padding: 12px;">
                  <div class="tp-v4-func-info"><span>🎵 Phòng Lofi Chill</span><br><small>3 người đang nghe</small></div>
                  <button class="tp-v4-btn" style="padding: 5px 10px; font-size: 11px;">Tham gia</button>
               </div>
               <button class="tp-btn-execute" style="margin-top: 10px; padding: 10px;">Tạo phòng mới</button>
             </div>
           </div>
        </div>
      `;

      return mainLayout + dockLayout;
    }

    style() {
      const mainStyle = ` 
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

          :root {
            /* Neon Glass Palette */
            --tp-primary: #6c5ce7;
            --tp-primary-grad: linear-gradient(135deg, #6c5ce7, #a29bfe);
            --tp-secondary: #00cec9;
            --tp-accent: #fd79a8;
            
            --tp-bg-glass: rgba(255, 255, 255, 0.7);
            --tp-bg-glass-heavy: rgba(255, 255, 255, 0.85);
            --tp-bg-card: rgba(255, 255, 255, 0.6);
            
            --tp-text: #2d3436;
            --tp-text-mute: #636e72;

            --tp-border: rgba(255, 255, 255, 0.4);
            --tp-shadow-lg: 0 15px 35px rgba(108, 92, 231, 0.15);
            --tp-shadow-md: 0 8px 20px rgba(0, 0, 0, 0.05);
            --tp-shadow-neon: 0 0 15px rgba(108, 92, 231, 0.4);

            /* REFINED RADIUS (User Feedback: Not too round) */
            --tp-radius-xl: 32px;  /* Panel corners - keep round */
            --tp-radius-lg: 20px;  /* Cards */
            --tp-radius-md: 12px;  /* Inner elements */
            --tp-radius-sm: 8px;   /* Small items */
            --tp-radius-btn: 16px; /* Buttons/Inputs - Moderate roundness */
            --tp-radius-pill: 9999px;

            --tp-anim-float: float 6s ease-in-out infinite;
            --tp-anim-pulse: pulse-glow 3s infinite;
          }

          [data-mode="dark"] {
            --tp-bg-glass: rgba(30, 30, 30, 0.8);
            --tp-bg-glass-heavy: rgba(45, 45, 45, 0.9);
            --tp-bg-card: rgba(60, 60, 60, 0.5);
            --tp-text: #dfe6e9;
            --tp-text-mute: #b2bec3;
            --tp-border: rgba(255, 255, 255, 0.1);
          }

          .tp-v4-container {
            position: fixed;
            z-index: 999999999;
            user-select: none;
            font-family: 'Outfit', 'Segoe UI', sans-serif;
            color: var(--tp-text);
            box-sizing: border-box;
          }
          
          .tp-v4-container * {
            box-sizing: border-box;
          }

          /* --- MAIN PANEL --- */
          .tp-v4-main {
            position: fixed;
            z-index: 999999;
            width: clamp(450px, 40vw, 90vw);
            height: 90vh;
            top: 7.5vh;
            padding: 24px;
            background: var(--tp-bg-glass);
            backdrop-filter: blur(25px) saturate(180%);
            -webkit-backdrop-filter: blur(25px) saturate(180%);
            border: 1px solid var(--tp-border);
            border-radius: var(--tp-radius-xl);
            display: flex;
            flex-direction: column;
            gap: 20px;
            box-shadow: var(--tp-shadow-lg);
            transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
            perspective: 2000px;
          }

          .tp-v4-main, .tp-v4-main[data-side="left"] { left: -100%; }
          .tp-v4-main[data-side="right"] { right: -100%; }
          .tp-v4-main.active, .tp-v4-main[data-side="left"].active { left: 24px; }
          .tp-v4-main[data-side="right"].active { right: 24px; }

          /* --- HEADER --- */
          .tp-v4-main-header {
            background: var(--tp-bg-glass-heavy);
            padding: 14px 24px;
            border-radius: var(--tp-radius-btn); /* Less round */
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 1px solid var(--tp-border);
            box-shadow: var(--tp-shadow-md);
            animation: var(--tp-anim-float);
          }

          .tp-v4-main-header-left span:first-child {
            font-size: 18px; 
            font-weight: 800;
            background: var(--tp-primary-grad);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: -0.5px;
          }

          /* --- TABS --- */
          .tp-v4-main-tab {
            display: flex;
            background: rgba(0, 0, 0, 0.03);
            padding: 6px;
            border-radius: var(--tp-radius-lg); /* Adjusted radius */
            gap: 6px;
            position: relative;
          }

          .tp-v4-main-tab-box {
            flex: 1; padding: 10px 0; text-align: center; cursor: pointer;
            border-radius: var(--tp-radius-md);
            font-size: 14px; font-weight: 700; color: var(--tp-text-mute);
            transition: all 0.3s ease; position: relative; z-index: 2;
          }

          .tp-v4-main-tab-box.active {
            color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.2);
          }
          
          .tp-v4-tab-indicator {
            position: absolute; top: 6px; bottom: 6px; left: 6px;
            width: calc(25% - 9px);
            background: var(--tp-primary-grad);
            border-radius: var(--tp-radius-md);
            transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
            box-shadow: 0 4px 12px rgba(108, 92, 231, 0.4);
            z-index: 1;
          }

          /* --- SCREEN WRAPPER --- */
          .tp-v4-main-tab-sreen {
            flex: 1; position: relative;
            transform-style: preserve-3d; perspective: 2000px;
          }

          .tp-v4-screen-wrapper {
             width: 100%; height: 100%; position: relative;
             transform-style: preserve-3d;
             transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
          }

          .tp-v4-main-screen-content {
            position: absolute; width: 100%; height: 100%;
            backface-visibility: hidden; -webkit-backface-visibility: hidden;
            background: transparent;
            border-radius: var(--tp-radius-md);
            overflow: hidden; display: flex; flex-direction: column;
          }

          /* --- OFFLINE SCREEN --- */
          .screen-offline { position: relative; overflow: hidden; }

          .tp-v4-screen-list, .tp-v4-main-layout-feature {
            position: absolute; top: 0; left: 0;
            width: 100%; height: 100%;
            transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.5s;
            padding: 2px;
          }
          
          .tp-v4-main-layout-feature {
            transform: translateX(110%) scale(0.95); opacity: 0;
            background: var(--tp-bg-card);
            border-radius: var(--tp-radius-lg);
            box-shadow: var(--tp-shadow-md);
            padding: 20px; display: flex; flex-direction: column;
          }

          .screen-offline.show-detail .tp-v4-screen-list {
            transform: translateX(-50%) scale(0.9); opacity: 0;
          }
          .screen-offline.show-detail .tp-v4-main-layout-feature {
            transform: translateX(0) scale(1); opacity: 1;
          }

          /* --- FEATURE CARDS --- */
          .tp-v4-func-card {
            padding: 18px;
            background: var(--tp-bg-card);
            border-radius: var(--tp-radius-lg);
            margin-bottom: 12px;
            display: flex; justify-content: space-between; align-items: center;
            border: 1px solid var(--tp-border);
            box-shadow: var(--tp-shadow-md);
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.3, 1.5, 0.5, 1);
            position: relative; overflow: hidden;
          }
          .tp-v4-func-card:hover {
            transform: translateY(-4px) scale(1.02);
            box-shadow: 0 10px 25px rgba(108, 92, 231, 0.2);
            border-color: var(--tp-primary);
          }
          /* Shine */
          .tp-v4-func-card::before {
            content: ''; position: absolute; top: 0; left: -100%;
            width: 50%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            transform: skewX(-25deg); transition: 0.5s;
          }
          .tp-v4-func-card:hover::before { left: 150%; transition: 0.7s; }

          .tp-v4-func-info span { font-weight: 700; font-size: 15px; color: var(--tp-text); }
          .tp-v4-func-arrow {
            width: 32px; height: 32px; background: var(--tp-primary-grad); color: white;
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            font-size: 14px; box-shadow: 0 4px 10px rgba(108, 92, 231, 0.3);
          }

          /* --- INPUTS & BUTTONS (REFINED) --- */
          .tp-v4-value-input {
            width: 100%; padding: 12px 16px;
            border-radius: var(--tp-radius-btn); /* 16px - Not pill */
            border: 2px solid transparent;
            background: #fdfdfd;
            box-shadow: inset 0 2px 5px rgba(0,0,0,0.03);
            outline: none; transition: 0.3s;
            font-size: 14px; color: var(--tp-text);
          }
          .tp-v4-value-input:focus {
             background: #fff; border-color: var(--tp-primary);
             box-shadow: 0 0 0 4px rgba(108, 92, 231, 0.15);
          }

          .tp-btn-back {
            background: rgba(0,0,0,0.05); border: none; color: var(--tp-text-mute);
            padding: 8px 16px; border-radius: var(--tp-radius-btn);
            font-size: 13px; font-weight: 700; cursor: pointer; transition: 0.3s;
          }
          .tp-btn-back:hover {
            background: #fff; color: var(--tp-text); box-shadow: var(--tp-shadow-md);
          }

          .tp-btn-execute {
            width: 100%; padding: 15px;
            background: var(--tp-primary-grad); color: white;
            border: none; border-radius: var(--tp-radius-btn); /* 16px */
            font-weight: 800; font-size: 16px; letter-spacing: 0.5px;
            cursor: pointer; box-shadow: var(--tp-shadow-lg);
            margin-top: auto; transition: 0.3s;
          }
          .tp-btn-execute:hover {
            transform: translateY(-2px); box-shadow: 0 20px 40px rgba(108, 92, 231, 0.4);
          }
          
          .tp-v4-detail-content {
             flex: 1; overflow-y: auto; padding: 10px 5px; margin-bottom: 10px;
          }
          
          /* --- DOCK (RESTORED & STYLED) --- */
          .tp-v4-dock {
            position: fixed; bottom: -120px; left: 50%; transform: translateX(-50%);
            display: flex; align-items: center; gap: 20px;
            padding: 12px 24px;
            background: var(--tp-bg-glass-heavy);
            backdrop-filter: blur(25px);
            border-radius: var(--tp-radius-xl); /* 32px - Less extreme than 100px */
            box-shadow: var(--tp-shadow-lg);
            z-index: 9999999;
            transition: bottom 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border: 1px solid var(--tp-border);
          }
          .tp-v4-dock.show { bottom: 30px; }

          .tp-v4-dock-feature {
            display: flex; gap: 10px; padding-right: 20px; margin-right: 20px;
            border-right: 1px solid rgba(0,0,0,0.1);
            max-width: 450px; overflow-x: auto;
          }
          /* Custom scrollbar for dock */
          .tp-v4-dock-feature::-webkit-scrollbar { height: 4px; }
          .tp-v4-dock-feature::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }

          .tp-playlist-item {
             font-size: 13px; padding: 10px 14px; border-radius: 12px;
             cursor: pointer; display: flex; justify-content: space-between; align-items: center;
             margin-bottom: 8px; color: var(--tp-text); transition: all 0.3s;
             background: rgba(255,255,255,0.4); border: 1px solid transparent;
          }
          .tp-playlist-item:hover {
             background: #fff; transform: scale(1.02);
             box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-color: var(--tp-primary);
          }
          .tp-playlist-item.active {
             background: linear-gradient(135deg, rgba(108, 92, 231, 0.1), rgba(108, 92, 231, 0.05));
             color: var(--tp-primary); font-weight: 700; border: 1px solid var(--tp-primary);
          }
          .tp-playlist-item span:first-child {
             max-width: 180px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
          }
          .tp-playlist-item span:last-child {
             font-size: 11px; opacity: 0.7;
          }
          .tp-v4-dock-feature-box {
            flex-shrink: 0; min-width: 90px; height: 48px;
            background: rgba(255,255,255,0.5);
            border-radius: var(--tp-radius-md); /* 12px */
            display: flex; align-items: center; justify-content: center;
            transition: all 0.3s; cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          }
          .tp-v4-dock-feature-box p {
            margin: 0; font-size: 13px; font-weight: 600;
            max-width: 80px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
          }
          .tp-v4-dock-feature-box:hover {
            background: var(--tp-primary); color: #fff;
            transform: translateY(-5px); box-shadow: 0 5px 15px rgba(108, 92, 231, 0.3);
          }

          /* --- PLAYER DASHBOARD (3 ROWS) --- */
          .tp-v4-dock-player {
            display: flex; align-items: center; gap: 20px;
            min-width: 320px; /* Reduced width since playlist is gone */
          }
          .tp-player-dashboard { 
             flex: 1; display: flex; flex-direction: column; 
             align-items: center; justify-content: center; gap: 6px; 
          }
          
          /* Row 1: Info (Centered & Long) */
          .tp-player-info { 
             width: 100%; display: flex; flex-direction: column; align-items: center; text-align: center;
          }
          .tp-song-detail { margin-bottom: 2px; }
          .tp-song-detail b { font-size: 14px; color: var(--tp-text); display: block; white-space: nowrap; }
          .tp-song-detail span { font-size: 11px; color: var(--tp-text-mute); }

          /* Row 2: Controls (Center) */
          .tp-player-controls { 
             display: flex; align-items: center; gap: 20px; margin: 4px 0;
          }
          .tp-player-controls span {
             cursor: pointer; font-size: 18px; color: var(--tp-text-mute); transition: 0.2s;
          }
          .tp-player-controls span:hover { color: var(--tp-primary); transform: scale(1.1); }
          
          .tp-play-btn { 
            width: 36px; height: 36px; background: var(--tp-primary-grad); 
            border-radius: 50%; display: flex !important; align-items: center; justify-content: center;
            color: #fff !important; font-size: 14px !important; box-shadow: 0 4px 12px rgba(108, 92, 231, 0.4);
          }
          .tp-play-btn:hover { transform: scale(1.1) !important; box-shadow: 0 6px 16px rgba(108, 92, 231, 0.5); }

          /* Row 3: Timebar */
          .tp-player-time { width: 100%; display: flex; align-items: center; gap: 8px; }
          .tp-player-time span { font-size: 10px; color: var(--tp-text-mute); font-weight: 600; min-width: 30px; }
          
          .tp-player-seekbar {
            flex: 1; height: 4px; background: rgba(0,0,0,0.05);
            border-radius: 99px; overflow: hidden; cursor: pointer; position: relative;
          }
          .tp-player-progress {
            width: 40%; height: 100%; background: var(--tp-primary); border-radius: 99px;
          }

          /* --- PLAYLIST MODAL (New Screen) --- */
          .tp-playlist-modal {
            position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%) translateY(20px);
            width: 320px; height: 400px;
            background: var(--tp-bg-glass-heavy);
            backdrop-filter: blur(25px);
            border-radius: var(--tp-radius-lg);
            border: 1px solid var(--tp-border);
            box-shadow: 0 20px 60px rgba(0,0,0,0.2);
            z-index: 9999998; /* Below Dock? Or Above? Let's say Above Dock z-index is 9999999, so this is below */
            display: flex; flex-direction: column;
            opacity: 0; pointer-events: none;
            transition: all 0.4s cubic-bezier(0.3, 1.5, 0.5, 1);
          }
          
          .tp-playlist-modal.active {
            opacity: 1; pointer-events: auto; transform: translateX(-50%) translateY(0);
          }

          .tp-playlist-header {
             display: flex; padding: 15px; border-bottom: 1px solid var(--tp-border);
             gap: 10px;
          }
          .tp-playlist-tab {
             flex: 1; text-align: center; padding: 8px; font-size: 13px; font-weight: 700;
             color: var(--tp-text-mute); background: rgba(0,0,0,0.05); border-radius: var(--tp-radius-sm);
             cursor: pointer; transition: 0.3s;
          }
          .tp-playlist-tab.active {
             background: var(--tp-primary); color: #fff; box-shadow: 0 4px 10px rgba(108, 92, 231, 0.3);
          }
          
          .tp-playlist-content { flex: 1; overflow: hidden; position: relative; }
          .tp-playlist-screen { 
             position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
             padding: 15px; overflow-y: auto; display: none; 
          }
          .tp-playlist-screen.active { display: block; animation: fadeIn 0.3s; }
          
          @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }


          /* --- GENERIC COMPONENTS --- */
          .tp-v4-btn {
             padding: 10px 20px;
             border-radius: var(--tp-radius-pill);
             border: none;
             background: var(--tp-bg-card);
             box-shadow: var(--tp-shadow-md);
             color: var(--tp-primary);
             font-weight: 700;
             cursor: pointer;
             transition: 0.3s;
          }
          .tp-v4-btn:hover {
             background: #fff;
             transform: translateY(-2px);
             box-shadow: var(--tp-shadow-lg);
             color: var(--tp-accent);
          }

          .tp-v4-card {
             background: var(--tp-bg-card);
             border-radius: var(--tp-radius-lg);
             margin-bottom: 15px;
             overflow: hidden;
             box-shadow: var(--tp-shadow-md);
             border: 1px solid var(--tp-border);
          }
          .tp-v4-card-header {
             padding: 12px 20px;
             background: rgba(255,255,255,0.3);
             font-weight: 700;
             border-bottom: 1px solid var(--tp-border);
             color: var(--tp-primary);
          }
          .tp-v4-card-body {
             padding: 15px 20px;
          }

          /* --- ANIMATIONS --- */
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
          
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 0 0 rgba(108, 92, 231, 0.4); }
            70% { box-shadow: 0 0 0 15px rgba(108, 92, 231, 0); }
          }
          
          @keyframes slideInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        </style>
      `;

      return mainStyle; // Dock style is merged or we can keep it simple
    }

    bindEvent() {
      this.MAX_EDGE = 15;
      const self = this;
      const $panel = $(".tp-v4-main");
      const $dock = $(".tp-v4-dock");

      // Biến lưu trữ bộ đếm thời gian
      this.hideTimeout = null;

      // 0. INIT STATE (Set initial Tab Indicator position)
      setTimeout(() => {
        const $activeTab = $(".tp-v4-main-tab-box.active");
        if ($activeTab.length) {
          const left = $activeTab.position().left;
          const width = $activeTab.outerWidth();
          $(".tp-v4-tab-indicator").css({ left: left + "px", width: width + "px" });
        }
      }, 500); // Wait for render

      // Thêm tab cho textarea
      $(document).on("keydown", ".tp-v4-container textarea", function (e) {
        if (e.keyCode == 9) {
          e.preventDefault();
          var start = this.selectionStart;
          var end = this.selectionEnd;
          $(this).val($(this).val().substring(0, start) + '\t' + $(this).val().substring(end));
          this.selectionStart = this.selectionEnd = start + 1;
        }
      })

      $(window).on("mousemove", (e) => {
        const ww = $(window).width(), wh = $(window).height();
        const mx = e.clientX, my = e.clientY;
        const isNearEdge = mx <= this.MAX_EDGE || ww - mx <= this.MAX_EDGE || wh - my <= this.MAX_EDGE;

        if (isNearEdge) {
          clearTimeout(this.hideTimeout);
          if (mx <= this.MAX_EDGE) {
            this.panel_side = "left";
            $panel.addClass("active");
          } else if (ww - mx <= this.MAX_EDGE) {
            this.panel_side = "right";
            $panel.addClass("active");
          }
          if (wh - my <= this.MAX_EDGE) {
            $dock.addClass("show");
          }
        } else {
          // Check hovering on Panel, Dock OR Playlist Modal
          const $playlist = $(".tp-playlist-modal");
          const isHovering = $panel.is(":hover") || $dock.is(":hover") || $playlist.is(":hover");

          if (!isHovering) {
            if (!this.hideTimeout) {
              this.hideTimeout = setTimeout(() => {
                $panel.removeClass("active");
                $dock.removeClass("show");
                $playlist.removeClass("active");
                this.hideTimeout = null;
              }, 500);
            }
          } else {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
          }
        }
      });

      // Keep visible when entering any UI element
      $panel.add($dock).add(".tp-playlist-modal").on("mouseenter", () => {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      });

      $(`.tp-v4-dock-feature`).on("wheel", function (e) {
        e.preventDefault();
        this.scrollLeft += e.originalEvent.deltaY;
      });

      // 1. LOGIC CLICK VÀO CHỨC NĂNG -> SLIDE SANG MAN HÌNH DETAIL
      $(document).on("click", ".tp-v4-func-card", function () {
        const funcId = $(this).data("func-id");
        const features = self.Feature.getAvailableFeatures();
        const funcObj = features.find(f => f.id === funcId);

        if (!funcObj) return;

        // Populate Detail Data
        $panel.find(".tp-detail-title").text(funcObj.name);
        $panel.find(".tp-v4-detail-content").html(funcObj.renderConfig ? funcObj.renderConfig() : "<p>Không có cấu hình bổ sung.</p>");
        $panel.find(".tp-btn-execute").attr("data-current-func", funcId);

        // TRIGGER SLIDE ANIMATION
        $panel.find(".screen-offline").addClass("show-detail");
      });

      // 2. LOGIC CLICK BACK -> SLIDE VỀ DANH SÁCH
      $(document).on("click", ".tp-btn-back", function () {
        $panel.find(".screen-offline").removeClass("show-detail");
      });

      // 3. LOGIC EXECUTE BUTTON (Giữ nguyên logic cũ)
      $(document).on("click", ".tp-v4-main .tp-btn-execute", function () {
        const funcId = $(this).attr("data-current-func");
        const features = self.Feature.getAvailableFeatures();
        const funcObj = features.find(f => f.id === funcId);

        if (!funcObj) return;

        const params = {};
        let count = 0;

        $panel.find(".tp-v4-value-input").each(function () {
          const key = $(this).data("key") || $(this).attr("name") || $(this).attr("id") || `param_${count++}`;
          let value;
          if ($(this).attr("type") === "checkbox") {
            value = $(this).is(":checked");
          } else if ($(this).attr("type") === "file") {
            value = this.files;
          } else {
            value = $(this).val();
          }
          params[key] = value;
        });

        funcObj.run(params);
      });

      // 4. LOGIC ĐỔI TAB VỚI HIỆU ỨNG 3D FLIP
      $(".tp-v4-main-tab-box").on("click", function () {
        const tabName = $(this).data("tab");
        const $this = $(this);

        if ($this.hasClass("active")) return;

        // A. MOVE INDICATOR
        const left = $this.position().left;
        const width = $this.outerWidth();
        $(".tp-v4-tab-indicator").css({ left: left + "px", width: width + "px" });

        // Update active class
        $(".tp-v4-main-tab-box").removeClass("active");
        $this.addClass("active");

        // B. 3D FLIP EFFECT
        const $wrapper = $(".tp-v4-screen-wrapper");

        // 1. Rotate 90deg (Exit)
        $wrapper.css("transform", "rotateY(90deg)");
        $wrapper.css("opacity", "0.5");

        setTimeout(() => {
          // 2. Change Content (While invisible)
          // Reset Detail View if in Offline tab
          $panel.find(".screen-offline").removeClass("show-detail");

          // Render new list if needed
          const newCardsHtml = self.renderFeatureCard(tabName);
          $(".tp-v4-main-list-feature").html(newCardsHtml);

          // Show/Hide Screens
          $(".tp-v4-main-screen-content").hide().removeClass("tp-screen-active");
          $(`.screen-${tabName}`).show().addClass("tp-screen-active");

          // 3. Rotate back to 0deg (Enter)
          $wrapper.css("transform", "rotateY(0deg)");
          $wrapper.css("opacity", "1");

        }, 250); // Wait for half rotation
      });

      // 5. LOGIC PLAYLIST MODAL
      $(document).on("click", ".tp-playlist-btn", function () {
        $(".tp-playlist-modal").toggleClass("active");
      });

      $(document).on("click", ".tp-playlist-close", function () {
        $(".tp-playlist-modal").removeClass("active");
      });

      $(document).on("click", ".tp-playlist-tab", function () {
        const tabId = $(this).data("tab");

        // Visual Update
        $(".tp-playlist-tab").removeClass("active");
        $(this).addClass("active");

        // Content Update
        $(".tp-playlist-screen").removeClass("active").hide();
        $(`#${tabId}`).show().addClass("active");
      });
    }

    renderFeatureCard(tabName = 'online') {
      // Giả sử mỗi chức năng trong class Feature có thuộc tính .type (online, offline, dev...)
      const allFeatures = this.Feature.getAvailableFeatures();
      const filtered = allFeatures.filter(f => f.type === tabName || tabName === 'all');

      if (filtered.length === 0) return `<div style="padding:20px; text-align:center; opacity:0.5;" >Trống (${tabName})</div>`;

      return filtered.map((f) => `
        <div class="tp-v4-func-card" data-func-id="${f.id}">
          <div class="tp-v4-func-info">
            <span>${f.name}</span>
          </div>
          <div class="tp-v4-func-arrow" ></div>
        </div> `).join("");
    }
  }

  class TOOLV4 {
    constructor() {
      this.UI = new UI();
      this.init();
    }

    init() {
      console.log("CÔNG CỤ V4 ĐÃ ĐƯỢC KHỞI TẠO");
    }
  }

  new TOOLV4();
})();
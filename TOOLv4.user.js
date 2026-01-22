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
    }

    set theme(theme) {
      if (!["default", "light", "dark", "custom"].includes(theme)) {
        return;
      }
      this._theme = theme;
    }

    get name() {
      return this._name;
    }
    get version() {
      return this._version;
    }
    get theme() {
      return this._theme;
    }
  }

  class Component {
    // 1. HÀM PHỤ TRỢ (HELPER)
    // Giúp code gọn hơn, không phải viết lại logic map data ở mỗi hàm
    _parseData(datas) {
      if (!datas || Object.keys(datas).length === 0) return "";
      return Object.entries(datas)
        .map(([key, value]) => `data-${key}="${value}"`)
        .join(" ");
    }

    // 2. CÁC COMPONENT CƠ BẢN

    // Button (Đã sửa lỗi vị trí style)
    Button(text = "Nút Nhấn", className = "", id = "", style = "", datas = {}) {
      const dataAttrs = this._parseData(datas);
      return `
					<button class="${className}" id="${id}" style="${style}" ${dataAttrs}>
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

    Label(
      text = "Nhãn",
      className = "",
      id = "",
      forHtml = "",
      style = "",
      datas = {},
    ) {
      const dataAttrs = this._parseData(datas);
      return `
					<label for="${forHtml}" class="${className}" id="${id}" style="${style}" ${dataAttrs}>
						${text}
					</label>
				`;
    }

    // 3. CÁC COMPONENT MỚI THÊM VÀO

    // Input (Dùng cho text, password, email, number...)
    Input(
      type = "text",
      placeholder = "",
      value = "",
      className = "",
      id = "",
      style = "",
      datas = {},
    ) {
      const dataAttrs = this._parseData(datas);
      return `
					<input type="${type}" placeholder="${placeholder}" value="${value}" class="${className}" id="${id}" style="${style}" ${dataAttrs} />
				`;
    }

    // TextArea (Nhập văn bản nhiều dòng)
    TextArea(
      placeholder = "",
      value = "",
      rows = 3,
      className = "",
      id = "",
      style = "",
      datas = {},
    ) {
      const dataAttrs = this._parseData(datas);
      return `
					<textarea rows="${rows}" placeholder="${placeholder}" class="${className}" id="${id}" style="${style}" ${dataAttrs}>${value}</textarea>
				`;
    }

    // Checkbox (Có tùy chọn checked)
    Checkbox(checked = false, className = "", id = "", style = "", datas = {}) {
      const dataAttrs = this._parseData(datas);
      const isChecked = checked ? "checked" : "";
      return `
					<input type="checkbox" ${isChecked} class="${className}" id="${id}" style="${style}" ${dataAttrs} />
				`;
    }

    // Image (Hình ảnh)
    Image(src = "", alt = "", className = "", id = "", style = "", datas = {}) {
      const dataAttrs = this._parseData(datas);
      return `
					<img src="${src}" alt="${alt}" class="${className}" id="${id}" style="${style}" ${dataAttrs} />
				`;
    }

    // Link (Thẻ a)
    Link(
      text = "Link",
      href = "#",
      target = "_self",
      className = "",
      id = "",
      style = "",
      datas = {},
    ) {
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
      const optionsHtml = options
        .map((opt) => {
          const isSelected = opt.selected ? "selected" : "";
          const isDisabled = opt.disabled ? "disabled" : "";
          return `<option value="${opt.value}" ${isSelected} ${isDisabled}>${opt.text}</option>`;
        })
        .join("");

      return `
				<select class="${className}" id="${id}" style="${style}" ${dataAttrs}>
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
				<div class="tp-v4-card ${className}">
					<div class="tp-v4-card-header">${title}</div>
					<div class="tp-v4-card-body">${content}</div>
				</div>
			`;
		}
  }

  class UI {
    constructor() {
      this.Component = new Component();
      this.Config = new ProgramConfig();
      this.init();
    }

    init() {
			$("head").append(this.style());
      $("body").append(this.layout());
    }

    layout() {
      return `
				<!-- ┌───────────────────────────────────────────┐ -->
				<!-- │ _____ _____ _____ _____ _____ _____ _____ │ -->
				<!-- │|   __|  |  |  _  |  _  |     | __  |_   _|│ -->
				<!-- │|__   |  |  |   __|   __|  |  |    -| | |  │ -->
				<!-- │|_____|_____|__|  |__|  |_____|__|__| |_|  │ -->
				<!-- │                                           │ -->
				<!-- │                                           │ -->
				<!-- │ _____ _____ _____ __           ___        │ -->
				<!-- │|_   _|     |     |  |      _ _| | |       │ -->
				<!-- │  | | |  |  |  |  |  |__   | | |_  |       │ -->
				<!-- │  |_| |_____|_____|_____|   \_/  |_|       │ -->
				<!-- │                                           │ -->
				<!-- │                                           │ -->
				<!-- │ _____         _____ _                     │ -->
				<!-- │|_   _|___ ___|  _  | |_ ___ ___           │ -->
				<!-- │  | | | .'|   |   __|   | .'|   |          │ -->
				<!-- │  |_| |__,|_|_|__|  |_|_|__,|_|_|          │ -->
				<!-- └───────────────────────────────────────────┘ -->
        <div class="tp-v4-container tp-v4-main" data-platform="default" data-mode="light" style="position: fixed; left: 20px; top: 20px; z-index: 999999; width: 450px; border-radius: var(--tp-radius); padding: 0;">
            
            <div class="tp-v4-main-header" style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid var(--tp-border);">
                <div class="tp-v4-main-header-left">
                    <b style="color: var(--tp-primary); font-size: 1.1rem;">${this.Config.name}</b>
                    <small style="opacity: 0.6; margin-left: 5px;">${this.Config.version}</small>
                </div>
                <div class="tp-v4-main-header-right">
                    <div class="tp-v4-switcher">
											<div class="tp-v4-modes">
												<button class="tp-v4-mode-btn active" data-mode="light" title="Chế độ sáng">☀️</button>
												<button class="tp-v4-mode-btn" data-mode="dark" title="Chế độ tối">🌙</button>
												<button class="tp-v4-mode-btn" data-mode="custom" title="Tùy chỉnh">🎨</button>
											</div>
											<select class="tp-v4-platform-select" id="tp-v4-platform-change">
												<option value="default">Mặc định</option>
												<option value="shopee">Shopee</option>
												<option value="tiktok">TikTok</option>
												<option value="lazada">Lazada</option>
												<option value="sapo">Sapo</option>
											</select>
									</div>
                </div>
            </div>

            <div class="tp-v4-main-tab" style="display: flex; gap: 5px; padding: 10px; background: var(--tp-border);">
                <div class="tp-v4-main-tab-box active" data-tab="setting"><p>Cài Đặt</p></div>
                <div class="tp-v4-main-tab-box" data-tab="main"><p>Chức Năng</p></div>
                <div class="tp-v4-main-tab-box" data-tab="online"><p>Online</p></div>
                <div class="tp-v4-main-tab-box" data-tab="debug"><p>DEBUG</p></div>
            </div>

            <div class="tp-v4-main-content" style="padding: 20px; max-height: 500px; overflow-y: auto;">
                
                <div class="tp-v4-main-tab-content" id="tab-setting">
                    ${this.Component.Card(
                      "Bản Quyền",
                      `
                        <div style="display:flex; gap:10px;">
                            ${this.Component.Input("text", "Nhập mã kích hoạt...", "", "tp-input-full", "", "flex:1; padding:8px; border-radius:8px; border:1px solid var(--tp-border)")}
                            ${this.Component.Button("Lưu", "tp-btn-primary", "", "background: var(--tp-primary); color:#fff; border:none; padding:8px 15px; border-radius:8px; cursor:pointer")}
                        </div>
                    `,
                    )}
                    ${this.Component.Card(
                      "Cấu hình Giao diện",
                      `
                        <p>Tùy chỉnh màu sắc cá nhân hóa (Chế độ Custom)</p>
                        <input type="color" id="custom-color-picker" style="width:100%; height:30px; border:none; border-radius:4px; margin-top:10px;">
                    `,
                    )}
                </div>

                <div class="tp-v4-main-tab-content" id="tab-main" style="display:none">
                    <div class="function-list-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div class="func-item-card" style="padding:15px; border:1px solid var(--tp-border); border-radius:12px; text-align:center; cursor:pointer">
                            <span style="font-size:1.5rem">📦</span>
                            <p style="margin-top:5px; font-weight:500">Quản lý kho</p>
                        </div>
                        <div class="func-item-card" style="padding:15px; border:1px solid var(--tp-border); border-radius:12px; text-align:center; cursor:pointer">
                            <span style="font-size:1.5rem">⚡</span>
                            <p style="margin-top:5px; font-weight:500">Auto Buff</p>
                        </div>
                    </div>
                </div>

                <div class="tp-v4-main-tab-content" id="tab-debug" style="display:none">
                    <div class="debug-console" style="background:#000; color:#0f0; padding:10px; font-family:monospace; font-size:11px; border-radius:8px; min-height:150px;">
                        <div>> System Ready...</div>
                        <div style="color: yellow;">> Waiting for socket...</div>
                    </div>
                    ${this.Component.Button("Soi phần tử", "btn-debug", "", "margin-top:10px; width:100%; padding:10px; border-radius:8px; border:1px solid var(--tp-primary); background:none; color:var(--tp-primary); cursor:pointer")}
                </div>
            </div>
        </div>

        <div class="tp-v4-container tp-v4-dock">
             <div class="tp-v4-feature" style="display:flex; gap:10px; border-right: 1px solid #ccc; padding-right:15px; margin-right:15px;">
                <div class="tp-v4-feature-box" title="Chat AI" style="cursor:pointer">💬</div>
                <div class="tp-v4-feature-box" title="Công cụ nhanh" style="cursor:pointer">🛠️</div>
             </div>
             <div class="tp-v4-player" style="display:flex; align-items:center; gap:10px; font-size:13px;">
                <div class="player-visual" style="width:30px; height:30px; background:var(--tp-primary); border-radius:50%; animation: pulse 2s infinite;"></div>
                <div class="player-info">
                    <div style="font-weight:bold; white-space:nowrap;">Lofi Music v4</div>
                    <div style="font-size:10px; opacity:0.7">Chế độ: Online Room</div>
                </div>
                <div class="player-ctrl" style="display:flex; gap:5px; margin-left:10px;">
                    <span>⏮</span> <span>▶</span> <span>⏭</span>
                </div>
             </div>
        </div>

        <div class="tp-v4-toast-container" style="position:fixed; top:20px; right:20px; z-index:1000000;"></div>
    	`;
    }

    style() {
      return `
				<style>
					:root {
						/* Màu mặc định */
						--tp-primary: #0088ff;
						--tp-bg: #ffffff;
						--tp-text: #333;
						--tp-border: #eee;
						--tp-radius: 16px;
						--tp-shadow: 0 10px 30px rgba(0,0,0,0.1);
					}

					/* Biến thể sàn */
					[data-platform="shopee"] { --tp-primary: #ee4d2d; }
					[data-platform="tiktok"] { --tp-primary: #000; --tp-accent: #ff0050; }
					[data-platform="lazada"] { --tp-primary: #10142c; }
					[data-platform="sapo"] { --tp-primary: #0088ff; }

					/* Dark Mode */
					[data-mode="dark"] {
							--tp-bg: #1e1e1e;
							--tp-text: #efefef;
							--tp-border: #333;
							--tp-shadow: 0 10px 30px rgba(0,0,0,0.5);
					}

					.tp-v4-main {
							font-family: 'Inter', system-ui, -apple-system, sans-serif;
							color: var(--tp-text);
							background: var(--tp-bg) !important;
							border: 1px solid var(--tp-border);
							box-shadow: var(--tp-shadow);
							transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
							overflow: hidden;
					}

					/* Hiệu ứng Tab */
					.tp-v4-main-tab-box {
							padding: 10px 20px;
							cursor: pointer;
							border-radius: 8px;
							transition: 0.2s;
							font-weight: 500;
					}
					.tp-v4-main-tab-box:hover { background: var(--tp-border); }
					.tp-v4-main-tab-box.active {
							background: var(--tp-primary);
							color: white;
					}

					/* Card quy hoạch */
					.tp-v4-card {
							border: 1px solid var(--tp-border);
							border-radius: 12px;
							margin-bottom: 15px;
							background: rgba(255,255,255,0.02);
					}
					.tp-v4-card-header {
							padding: 10px 15px;
							border-bottom: 1px solid var(--tp-border);
							font-weight: bold;
							color: var(--tp-primary);
					}
					.tp-v4-card-body { padding: 15px; }

					/* Player Dock */
					.tp-v4-dock {
							position: fixed;
							bottom: 20px;
							right: 20px;
							background: rgba(255, 255, 255, 0.8);
							backdrop-filter: blur(10px);
							border-radius: 50px;
							padding: 10px 20px;
							display: flex;
							align-items: center;
							gap: 15px;
							box-shadow: var(--tp-shadow);
					}
				</style>
			`;
    }

		bindEvent() {
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

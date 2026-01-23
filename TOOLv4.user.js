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
      this._panel_side = "left";
			this.init();
		}
    
    get panel_side() { return this._panel_side; }
    set panel_side(side) { 
      this._panel_side = side;
      $(".tp-v4-main").attr("data-side", side);
    }

		init() {
			$("head").append(this.style());
			$("body").append(this.layout());
      this.bindEvent();
		}

		layout() {
      const isLeft = this.panel_side == "left";
			return `
        <div class="tp-v4-container tp-v4-main" data-side="left" data-platform="default" data-mode="light" 
            style="position: fixed; ${isLeft ? "left" : "right"}: 20px; top: 20px; bottom: 20px; width: 380px; max-width: 90vw; border-radius: var(--tp-radius);">
            
            <div class="tp-v4-main-header" style="padding: 20px; border-bottom: 1px solid var(--tp-border);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h2 style="margin:0; font-size: 1.2rem; color: var(--tp-primary);">${this.Config.name}</h2>
                        <small style="opacity: 0.5;">Phiên bản hệ thống: ${this.Config.version}</small>
                    </div>
                    <div class="tp-v4-switcher" style="display:flex; flex-direction: column; gap: 8px; align-items: flex-end;">
                        <div class="tp-v4-modes" style="background: rgba(0,0,0,0.05); padding: 4px; border-radius: 20px;">
                            <button class="tp-v4-mode-btn active" data-mode="light">☀️</button>
                            <button class="tp-v4-mode-btn" data-mode="dark">🌙</button>
                        </div>
                        <select class="tp-v4-platform-select" id="tp-v4-platform-change" style="background: none; border: 1px solid var(--tp-border); border-radius: 5px; color: var(--tp-text); font-size: 11px;">
                            <option value="default">Mặc định</option>
                            <option value="shopee">Shopee</option>
                            <option value="tiktok">TikTok</option>
                            <option value="lazada">Lazada</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="tp-v4-main-tab" style="display: flex; padding: 10px; gap: 5px;">
                <div class="tp-v4-main-tab-box active" data-tab="setting">Cài Đặt</div>
                <div class="tp-v4-main-tab-box" data-tab="main">Chức Năng</div>
                <div class="tp-v4-main-tab-box" data-tab="debug">DEBUG</div>
            </div>

            <div class="tp-v4-main-content" style="flex: 1; overflow-y: auto; padding: 15px;">
                <div class="tab-pane" id="pane-setting">
                    ${this.Component.Card(
											"Bản Quyền",
											this.Component.Div(`
                        <label style="font-size:11px; opacity:0.7">License Key</label>
                        <div style="display:flex; gap:8px; margin-top:5px;">
                            ${this.Component.Input("text", "XXXX-XXXX-XXXX", "", "tp-input-full", "", "flex:1; background: rgba(0,0,0,0.05); border: 1px solid var(--tp-border); color: var(--tp-text); padding: 8px; border-radius: 8px;")}
                            ${this.Component.Button("Active", "", "", "background: var(--tp-primary); color: #fff; border:none; border-radius:8px; padding:0 15px; cursor:pointer;")}
                        </div>
                    `),
										)}
                </div>
                
                <div class="tab-pane" id="pane-main" style="display:none">
                    <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
                        <div class="func-card" style="padding:20px; background: rgba(var(--tp-primary-rgb), 0.1); border-radius:15px; border-left: 4px solid var(--tp-primary); cursor:pointer">
                            <h4 style="margin:0">📦 Quản lý kho sản phẩm</h4>
                            <p style="margin:5px 0 0; font-size:12px; opacity:0.7">Đồng bộ tồn kho nhanh chóng</p>
                        </div>
                    </div>
                </div>

                <div class="tab-pane" id="pane-debug" style="display:none">
                    <div class="debug-terminal" style="background: rgba(0,0,0,0.8); color: #00ff00; padding: 15px; font-family: monospace; font-size: 12px; border-radius: 10px; min-height: 200px;">
                        <div style="color: #aaa;">[${new Date().toLocaleTimeString()}] System Initialize...</div>
                        <div>> Ready for commands.</div>
                    </div>
                </div>
            </div>

            <div class="tp-v4-dock" style="padding: 15px; border-top: 1px solid var(--tp-border); display: flex; align-items: center; gap: 12px;">
                <div class="player-disc" style="width:40px; height:40px; background: linear-gradient(45deg, var(--tp-primary), #ccc); border-radius: 50%; display:grid; place-items:center; animation: rotate 3s linear infinite;">💿</div>
                <div style="flex:1 overflow:hidden">
                    <div style="font-weight:600; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Chill Lofi Radio 2024</div>
                    <div style="font-size:10px; opacity:0.5;">02:45 / 04:00</div>
                </div>
            </div>
        </div>
      `;
		}

		style() {
			return `
        <style>
            :root {
                --tp-primary: #0088ff;
                --tp-primary-rgb: 0, 136, 255;
                --tp-bg-rgba: rgba(255, 255, 255, 0.7);
                --tp-text: #1d1d1f;
                --tp-border: rgba(200, 200, 200, 0.3);
                --tp-radius: 20px;
                --tp-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
            }

            /* Biến thể sàn */
            [data-platform="shopee"] { --tp-primary: #ee4d2d; --tp-primary-rgb: 238, 77, 45; }
            [data-platform="tiktok"] { --tp-primary: #fe2c55; --tp-primary-rgb: 254, 44, 85; }
            [data-platform="lazada"] { --tp-primary: #10142c; --tp-primary-rgb: 16, 20, 44; }
            [data-platform="sapo"] { --tp-primary: #0088ff; --tp-primary-rgb: 0, 136, 255; }

            /* Dark Mode Glass */
            [data-mode="dark"] {
                --tp-bg-rgba: rgba(30, 30, 30, 0.75);
                --tp-text: #f5f5f7;
                --tp-border: rgba(80, 80, 80, 0.4);
            }

            .tp-v4-main {
                font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                color: var(--tp-text);
                background: var(--tp-bg-rgba) !important;
                backdrop-filter: blur(12px) saturate(180%) !important;
                -webkit-backdrop-filter: blur(12px) saturate(180%) !important;
                border: 1px solid var(--tp-border) !important;
                box-shadow: var(--tp-shadow) !important;
                transition: all 0.3s ease;
                display: flex;
                flex-direction: column;
                /* Luôn nằm trên cùng tuyệt đối */
                z-index: 2147483647 !important; 
            }

            .tp-v4-main[data-side="left"] { left: -400px; right: auto; }
            .tp-v4-main[data-side="right"] { right: -400px; left: auto; }

            .tp-v4-main.is-active[data-side="left"] { transform: translateX(415px); }
            .tp-v4-main.is-active[data-side="right"] { transform: translateX(-415px); }

            /* Hiệu ứng Tab mượt mà */
            .tp-v4-main-tab-box {
                flex: 1;
                text-align: center;
                padding: 12px 5px;
                cursor: pointer;
                border-radius: 12px;
                transition: 0.3s;
                font-size: 13px;
                font-weight: 600;
                opacity: 0.6;
            }
            .tp-v4-main-tab-box.active {
                background: rgba(var(--tp-primary-rgb), 0.2);
                color: var(--tp-primary);
                opacity: 1;
            }

            .tp-v4-card {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid var(--tp-border);
                border-radius: 15px;
                margin-bottom: 15px;
                overflow: hidden;
            }

            /* Switcher & Buttons */
            .tp-v4-mode-btn {
                background: none; border: none; cursor: pointer; padding: 5px; 
                border-radius: 50%; transition: 0.2s;
            }
            .tp-v4-mode-btn.active { background: rgba(var(--tp-primary-rgb), 0.2); }
            
            /* Custom Scrollbar */
            .tp-v4-main-content::-webkit-scrollbar { width: 4px; }
            .tp-v4-main-content::-webkit-scrollbar-thumb { background: var(--tp-primary); border-radius: 10px; }
        </style>
      `;
		}

		bindEvent() {
      this.max_edge = 10;
      $("body").on("mousemove", function(e){
        this.panel_side = e.offsetX <= this.max_edge ? "left" : e.screenX - e.clientX >= this.max_edge ? "right" : "left";
        console.log(e.screenX - e.offsetX);
        console.log(this.panel_side);
      })
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

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
			return `
					<input type="${type}" placeholder="${placeholder}" value="${value}" class="${className}" id="${id}" style="${style}" ${dataAttrs} />
				`;
		}

		// TextArea (Nhập văn bản nhiều dòng)
		TextArea(placeholder = "", value = "", rows = 3, className = "", id = "", style = "", datas = {}) {
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
			const optionsHtml = options.map(opt => {
				const isSelected = opt.selected ? "selected" : "";
				const isDisabled = opt.disabled ? "disabled" : "";
				return `<option value="${opt.value}" ${isSelected} ${isDisabled}>${opt.text}</option>`;
			}).join("");

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
	}

	class UI {
		constructor() {
			this.Component = new Component();
			this.Config = new ProgramConfig();
			this.init();
		}

		init() {
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
				<div class="tp-v4-content tp-v4-main" style="
					position: fixed; 
					left: 0; 
					top: 0; 
					z-index: 999999999; 
					width: fit-content; 
					height: fit-content; 
					border-radius: 50px";
				>
					<div class="tp-v4-panel-header">
						<div class="tp-v4-panel-header-left">
							<span id="tp-v4-toolname">${this.Config.name}</span>
							<span id="tp-v4-toolversion">${this.Config.version}</span>
						</div>
						<div class="tp-v4-panel-header-right">

						</div>
					</div>
				</div>
			`;
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

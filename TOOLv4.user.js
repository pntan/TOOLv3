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
			this._platform = this.host.toString().includes("shopee")
				? "shopee"
				: this.host.toString().includes("tiktok")
					? "tiktok"
					: this.host.toString().includes("lazada")
						? "lazada"
						: "unknow";
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

		get host() {
			return this._host;
		}

		get platform() {
			return this._platform;
		}
	}

	class Logs {
		constructor() {
			this.element = $(".tp-v4-container #console");
		}
	}

	class TestFunction {
		constructor() {
			this._name = "Chức Năng Thử Nghiệm";
			this._platform = ["shopee", "tiktok", "lazada"];
			this.Component = new Component();
		}

		renderConfig() {
			return `
        ${this.Component.Input("text", "Thử nghiệp, nhập gì cũng được")}
      `;
		}

		get platform() {
			return this._platform;
		}

		get name() {
			return this._name;
		}

		run(params) {
			console.log("CHỨC NĂNG THỬ NGHIỆM");
			console.log(params);
		}
	}

	class Feature {
		constructor() {
			this.ProgramConfig = new ProgramConfig();
			this.Logs = new Logs();
			this.TestFunction = new TestFunction();
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
				<select class="${className}" id="${id}" style="border: none; border-radius: 100px ${style}" ${dataAttrs}>
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
			this.Feature = new Feature();
			this.Component = new Component();
			this.Config = new ProgramConfig();
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
            <div class="tp-v4-main-screen-content screen-online">
              <div class="tp-v4-main-list-feature">
                ${this.renderFeatureCard()}
              </div>
              <div class="tp-v4-main-layout-feature"></div>
            </div>
          </div>
        </div>
      `;

			const dockLayout = `
        <div class="tp-v4-container tp-v4-dock show">
          <div class="tp-v4-dock-feature">
            <div class="tp-v4-dock-feature-box">
              <p>Chức năng 1</p>
            </div>
            <div class="tp-v4-dock-feature-box">
              <p>Chức năng 2</p>
            </div>
            <div class="tp-v4-dock-feature-box">
              <p>Chức năng 3</p>
            </div>
            <div class="tp-v4-dock-feature-box">
              <p>Chức năng 4</p>
            </div>
            <div class="tp-v4-dock-feature-box">
              <p>Chức năng 5</p>
            </div>
            <div class="tp-v4-dock-feature-box">
              <p>Chức năng 6</p>
            </div>
            <div class="tp-v4-dock-feature-box">
              <p>Chức năng 7</p>
            </div>
            <div class="tp-v4-dock-feature-box">
              <p>Chức năng 8</p>
            </div>
            <div class="tp-v4-dock-feature-box">
              <p>Chức năng 9</p>
            </div>
            <div class="tp-v4-dock-feature-box">
              <p>Chức năng 10</p>
            </div>
          </div>
          <div class="tp-v4-dock-player">
            <div class="tp-player-dashboard">
              <div class="tp-player-info">
                <div class="tp-song-thumb"></div>
                <div class="tp-song-detail">
                  <b>Lofi Study Radio</b>
                  <span>ChilledCow • 02:45 / 04:00</span>
                </div>
                <div class="tp-player-controls">
                  <span>⏮</span>
                  <span class="tp-play-btn">▶️</span>
                  <span>⏭</span>
                  <span style="font-size: 12px; opacity: 0.5;">🔊</span>
                </div>
              </div>
              <div class="tp-player-seekbar">
                <div class="tp-player-progress"></div>
              </div>
            </div>

            <div class="tp-player-playlist">
              <div class="tp-playlist-item active">
                <span>1. Lofi Study Session</span>
                <span>04:00</span>
              </div>
              <div class="tp-playlist-item">
                <span>2. Midnight City Night</span>
                <span>03:20</span>
              </div>
              <div class="tp-playlist-item">
                <span>3. Coffee Shop Ambience</span>
                <span>05:15</span>
              </div>
              <div class="tp-playlist-item">
                <span>4. Rainy Night in Tokyo</span>
                <span>04:45</span>
              </div>
            </div>
          </div>
        </div>
      `;

			return mainLayout + dockLayout;
		}

		style() {
			const mainStyle = `
        <style>
          :root {
            --tp-primary: #0088ff80;
            --tp-bg-main: #e0e0e080;
            --tp-bg-white: #ffffff80;
            --tp-bg-card: #f8f9fa80;
            --tp-border: #dddddd;
            --tp-radius-lg: 20px;
            --tp-radius-md: 15px;
            --tp-radius-sm: 10px;
          }

          .tp-v4-container {
            position: fixed;
            z-index: 999999999;
            user-select: none;
          }

          .tp-v4-container * {
            transition: 0.5s;
          }

          /* Container chính */
          .tp-v4-main {
            position: fixed;
            z-index: 999999;
            width: auto;
            max-width: 40vw;
            height: 90%;
            top: 5%;
            padding: 1vw;
            background: var(--tp-bg-main);
            backdrop-filter: blur(10px);
            border-radius: var(--tp-radius-md);
            display: flex;
            flex-direction: column;
            gap: 1vh;
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          }

          .tp-v4-main, .tp-v4-main[data-side="left"]{
            left: -100%;
            right: auto;            
            padding-left: 2vw;
          }

          .tp-v4-main[data-side="right"]{
            right: -100;
            left: auto;
            padding-right: 2vw;
          }

          .tp-v4-main.active, .tp-v4-main[data-side="left"].active{
            left: 0;
            right: auto;            
            padding-left: 2vw;
          }

          .tp-v4-main[data-side="right"].active{
            right: 0;
            left: auto;
            padding-right: 2vw;
          }

          /* Header */
          .tp-v4-main-header {
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
            gap: 1vw;
            background: var(--tp-bg-white);
            padding: 1vw;
            border-radius: 100px;
          }

          .tp-v4-main-header-left {
            display: flex;
            flex-direction: column;
          }

          .tp-v4-main-header-left span:first-child {
            font-weight: 700;
          }

          .tp-v4-main-header-left span:last-child {
            font-size: 0.75rem;
            opacity: 0.6;
          }

          /* Tab System */
          .tp-v4-main-tab {
            width: 90%;
            display: flex;
            align-items: center;
            border-radius: var(--tp-radius-sm);
            margin: 0 auto;
            overflow: hidden;
            gap: 1vw;
          }

          .tp-v4-main-tab-box {
            flex: 1;
            text-align: center;
            cursor: pointer;
            transition: 0.2s;
            border-radius: 10px;
            font-weight: 700;
          }

          .tp-v4-main-tab-box p {
            margin: 0;
            transition: 0.3s;
            pointer-events: none;
            padding: 1vh 1vw;
          }

          .tp-v4-main-tab-box:hover {
            background: rgba(0, 0, 0, 0.05);
          }

          .tp-v4-main-tab-box:hover p {
            transform: scale(1.1);
            color: var(--tp-primary);
          }

          .tp-v4-main-tab-box.active {
            background: var(--tp-primary);
            color: white;
          }

          /* Screen Content */
          .tp-v4-main-tab-sreen {
            flex: 1;
            background: var(--tp-bg-white);
            border-radius: var(--tp-radius-lg);
            overflow-y: auto;
            padding: 1vw;
          }

          /* Function Cards */
          .tp-v4-func-card {
            padding: 15px;
            background: var(--tp-bg-card);
            border-radius: var(--tp-radius-sm);
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 1px solid var(--tp-border);
            transition: 0.2s;
          }

          .tp-v4-func-card:hover {
            border-color: var(--tp-primary);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          }

          /* Nút bấm */
          .tp-run-btn {
            background: var(--tp-primary);
            color: #fff;
            border: none;
            padding: 8px 18px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: 0.2s;
          }

          .tp-run-btn:hover {
            filter: brightness(1.1);
            transform: translateY(-1px);
          }

          .tp-run-btn:active {
            transform: translateY(0) scale(0.95);
          }
        </style>
      `;

			const dockStyle = `
        <style>
          /* Container chính của Dock */
          .tp-v4-dock {
            position: fixed;
            bottom: -100px;
            /* Ẩn mặc định */
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 10px 20px;
            background: rgba(255, 255, 255, 0.6);
            backdrop-filter: blur(15px) saturate(180%);
            -webkit-backdrop-filter: blur(15px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 100px;
            /* Bo tròn dạng viên thuốc */
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            z-index: 9999999;
            transition: bottom 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }

          /* Khi Dock hiển thị */
          .tp-v4-dock.show {
            bottom: 25px;
          }

          /* Vùng chức năng */
          .tp-v4-dock-feature {
            display: flex;
            gap: 10px;
            padding-right: 15px;
            border-right: 1px solid rgba(0,0,0,0.1);
            max-width: 400px; /* Giới hạn chiều ngang vùng chức năng */
            overflow-x: auto;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
            scroll-snap-type: x mandatory;
          }
          
          .tp-v4-dock-feature::-webkit-scrollbar {
            display: none;
          }

          .tp-v4-dock-feature-box {
            flex-shrink: 0; /* KHÔNG cho phép bóp méo hình tròn */
            min-width: 100px; /* Chiều rộng tối thiểu để chứa chữ */
            height: 38px;
            padding: 0 15px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 12px; /* Chuyển từ tròn sang bo góc chữ nhật */
            display: flex;
            align-items: center;
            justify-content: center;
            scroll-snap-align: start;
            transition: 0.3s;
          }

          .tp-v4-dock-feature-box p {
            margin: 0;
            font-size: 12px;
            font-weight: 600;
            white-space: nowrap; /* Buộc chữ trên 1 hàng */
            overflow: hidden;
            text-overflow: ellipsis; /* Hiện dấu ... nếu quá dài   */
            max-width: 120px;
          }

          .tp-v4-dock-feature-box:hover {
            background: var(--tp-primary);
            color: white !important;
          }

          .tp-v4-dock-feature:active { cursor: grabbing; }

          .tp-v4-dock-feature-box:hover p {
            color: #fff;
          }

          /* --- PLAYER LAYOUT --- */
          .tp-v4-dock-player {
              display: flex;
              align-items: center;
              gap: 20px;
              padding-left: 15px;
              min-width: 500px; /* Tăng độ rộng để chứa 2 phần */
          }

          /* PHẦN 1: DASHBOARD (Trình điều khiển) */
          .tp-player-dashboard {
              flex: 1.2;
              display: flex;
              flex-direction: column;
              gap: 5px;
          }

          .tp-player-info {
              display: flex;
              align-items: center;
              gap: 10px;
          }

          .tp-song-thumb {
              width: 35px; height: 35px;
              border-radius: 8px;
              background: #ddd;
              animation: rotate 5s linear infinite;
              animation-play-state: paused;
          }
          .tp-song-thumb.playing { animation-play-state: running; }

          .tp-song-detail b { font-size: 13px; display: block; color: var(--tp-text); }
          .tp-song-detail span { font-size: 10px; opacity: 0.6; }

          .tp-player-controls {
              display: flex;
              align-items: center;
              gap: 15px;
              font-size: 16px;
          }
          .tp-player-controls span { cursor: pointer; transition: 0.2s; }
          .tp-player-controls span:hover { color: var(--tp-primary); transform: scale(1.2); }

          /* Thanh thời gian & Âm lượng */
          .tp-player-seekbar {
              width: 100%; height: 4px;
              background: rgba(0,0,0,0.1);
              border-radius: 10px;
              position: relative;
              cursor: pointer;
          }
          .tp-player-progress {
              width: 40%; height: 100%;
              background: var(--tp-primary);
              border-radius: 10px;
          }

          /* PHẦN 2: PLAYLIST (Danh sách chờ) */
          .tp-player-playlist {
              flex: 0.8;
              height: 50px;
              overflow-y: auto;
              border-left: 1px solid rgba(0,0,0,0.1);
              padding-left: 15px;
          }
          .tp-playlist-item {
              font-size: 11px;
              padding: 4px 8px;
              border-radius: 6px;
              cursor: pointer;
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
          }
          .tp-playlist-item:hover { background: rgba(0,0,0,0.05); }
          .tp-playlist-item.active { color: var(--tp-primary); font-weight: bold; }

          /* Scrollbar mini cho playlist */
          .tp-player-playlist::-webkit-scrollbar { width: 3px; }
          .tp-player-playlist::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }

          @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

          /* Chế độ tối cho Dock */
          [data-mode="dark"] .tp-v4-dock {
            background: rgba(30, 30, 30, 0.7);
            border-color: rgba(255, 255, 255, 0.1);
          }

          [data-mode="dark"] .tp-v4-dock-feature-box {
            background: rgba(255, 255, 255, 0.1);
          }

          [data-mode="dark"] .tp-v4-dock-feature-box p {
            color: #eee;
          }
        </style>
      `;

			return mainStyle + dockStyle;
		}

		bindEvent() {
			this.MAX_EDGE = 15;
			const self = this;
			const $panel = $(".tp-v4-main");
			const $dock = $(".tp-v4-dock");

			// Biến lưu trữ bộ đếm thời gian
			this.hideTimeout = null;

			$(window).on("mousemove", (e) => {
				const ww = $(window).width(),
					wh = $(window).height();
				const mx = e.clientX,
					my = e.clientY;

				// KIỂM TRA CÓ ĐANG Ở BIÊN KHÔNG
				const isNearEdge =
					mx <= this.MAX_EDGE ||
					ww - mx <= this.MAX_EDGE ||
					wh - my <= this.MAX_EDGE;

				if (isNearEdge) {
					// Nếu chạm biên, hủy ngay lệnh ẩn đang chờ (nếu có) và hiện giao diện
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
					// Nếu KHÔNG ở biên, kiểm tra xem có đang hover trên giao diện không
					// Nếu không hover, đợi 500ms rồi mới ẩn
					if (!$panel.is(":hover") && !$dock.is(":hover")) {
						if (!this.hideTimeout) {
							this.hideTimeout = setTimeout(() => {
								$panel.removeClass("active");
								$dock.removeClass("show");
								this.hideTimeout = null;
							}, 500); // 0.5 giây trễ
						}
					} else {
						// Nếu chuột đang nằm trên Panel/Dock, hủy lệnh ẩn
						clearTimeout(this.hideTimeout);
						this.hideTimeout = null;
					}
				}
			});

			// Khi di chuột vào trực tiếp Panel/Dock, cũng phải xóa Timeout
			$panel.add($dock).on("mouseenter", () => {
				clearTimeout(this.hideTimeout);
				this.hideTimeout = null;
			});

			$(`.tp-v4-dock-feature`).on("wheel", function (e) {
				e.preventDefault();
				// Cuộn mượt bằng cách cộng dồn tọa độ
				this.scrollLeft += e.originalEvent.deltaY;
			});

			// 1. Sự kiện khi nhấn "Kích hoạt" (hiện UI chi tiết hoặc chạy luôn)
			$(document).on("click", ".tp-run-btn", function () {
				const funcId = $(this).data("func-id");
				const $card = $(this).closest(".tp-v4-func-card");
				const $customUi = $card.find(".tp-func-custom-ui");

				// Tìm object chức năng tương ứng
				const features = self.Feature.getAvailableFeatures();
				const funcObj = features.find((f) => f.id === funcId);

				if (!funcObj) return;

				// Nếu chức năng có UI riêng và đang đóng -> Mở ra để nhập liệu
				if ($customUi.length > 0 && $customUi.is(":hidden")) {
					$(".tp-func-custom-ui").slideUp(); // Đóng các cái khác
					$customUi.slideDown();
					$(this).text("Xác nhận Chạy");
				} else {
					// Thu thập dữ liệu từ các input trong UI riêng đó
					let params = {};
					if ($customUi.length > 0) {
						params = {
							keyword: $customUi.find(".tp-input-keyword").val(),
							limit: $customUi.find(".tp-input-limit").val(),
						};
					}

					// Gọi hàm run của chức năng đó
					funcObj.run(params);

					// Reset trạng thái nút
					$customUi.slideUp();
					$(this).text("Kích hoạt");
				}
			});
		}

		renderFeatureCard() {
			const features = this.Feature.getAvailableFeatures();
			if (features.length === 0)
				return "<p>Không có chức năng cho sàn này.</p>";

			return features
				.map(
					(f) => `
          <div class="tp-v4-func-card" data-func-id="${f.id}">
              <div class="tp-v4-func-info">
                  <span class="tp-func-name">${f.name}</span>
                  <div class="tp-func-custom-ui" style="display:none; margin-top:10px; padding:10px; background:#eee; border-radius:8px;">
                      ${f.renderConfig ? f.renderConfig() : ""}
                  </div>
              </div>
              <button class="tp-run-btn" data-func-id="${f.id}">Kích hoạt</button>
          </div>
      `,
				)
				.join("");
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

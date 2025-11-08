// ==UserScript==
// @name         CÔNG CỤ HỖ TRỢ V4
// @version      0.0.1
// @namespace    tanphan.toolv3
// @icon         https://www.google.com/s2/favicons?sz=64&domain=http://anonymouse.org/
// @description  Một số công cụ hỗ trợ công việc
// @license      MIT
// @author       TânPhan
// @copyright    2025, TanPhan (nhattanphan2014@gmail.com)
// @match        *://*/*
// @grant        none
// @updateURL    https://openuserjs.org/meta/pntan/TOOL.user.js
// @updateURL    https://cdn.jsdelivr.net/gh/pntan/TOOLv3@0.0.1/TOOL.js
// @downloadURL  https://cdn.jsdelivr.net/gh/pntan/TOOLv3@0.0.1/TOOL.js
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// ==/UserScript==

(function() {
	'use strict';

	const VERSION = '0.0.1';
	const HTML_UI = `<div class="tp-container tp-main"><div class="header"><div class="time">00:00:00</div><div class="theme-switcher"><button class="btn-theme light-mode active"data-theme="light">☀️</button> <button class="btn-theme dark-mode"data-theme="dark">🌙</button></div></div><div class="list-screen"><div class="box-screen setting"><p>⚙️</p></div><div class="box-screen main"><p>🏡</p></div><div class="box-screen online"><p>🖥️</p></div></div><div class="content-screen"><div class="screen screen-setting"><p>Setting Screen</p></div><div class="screen screen-main active"><div class="list-function"><div class="box-function"><p>Function 1</p></div><div class="box-function"><p>Function 2</p></div><div class="box-function"><p>Function 3</p></div><div class="box-function"><p>Function 4</p></div><div class="box-function"><p>Function 5</p></div><div class="box-function"><p>Function 6</p></div><div class="box-function"><p>Function 7</p></div></div><div class="layout-function"><div class="box gia_duoi"><p>GIÁ ĐUÔI</p></div></div></div><div class="screen screen-online"><p>Online Screen</p></div></div><style>.tp-container{padding:0;margin:0;border:none;box-sizing:border-box}.tp-container *{padding:0;margin:0;border:0;box-sizing:border-box;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-weight:700;user-select:none}.tp-container.tp-main{position:fixed;top:0;left:0;background:rgba(223,223,223,.5);backdrop-filter:blur(10px);padding:2vh 2vw;width:auto;height:100%;color:#fff;aspect-ratio:9/16;z-index:999999999}.tp-container.tp-main .header{display:flex;justify-content:space-between;align-items:center;width:100%;height:3vh;color:#000;overflow:hidden}.tp-container.tp-main .header .time{font-size:1.5vh;letter-spacing:1rcap}.tp-container.tp-main .header .theme-switcher{position:relative;width:auto;height:100%;aspect-ratio:1/1}.tp-container.tp-main .header .theme-switcher .btn-theme{position:absolute;height:100%;border-radius:50%;font-size:2vh;cursor:pointer;background:0 0;transition:.5s}.tp-container.tp-main .header .theme-switcher .btn-theme.active{top:0!important;left:0}.tp-container.tp-main .header .theme-switcher .btn-theme.light-mode{top:-100%;left:0}.tp-container.tp-main .header .theme-switcher .btn-theme.dark-mode{top:100%;left:0}.tp-container.tp-main .list-screen{margin-top:2vh;display:flex;flex-direction:row;justify-content:flex-start;align-items:center;width:100%;height:4vh;overflow-y:auto}.tp-container.tp-main .list-screen .box-screen{width:100%;height:4vh;background:rgba(0,0,0,.1);backdrop-filter:blur(5px);display:flex;justify-content:center;align-items:center;font-size:2vh;color:#000;cursor:pointer}.tp-container.tp-main .list-screen .box-screen.active{background:rgba(0,0,0,.3);backdrop-filter:blur(10px)}.tp-container.tp-main .list-screen .box-screen:hover p{transform:scale(1.3);transition:.3s}.tp-container.tp-main .list-screen .box-screen:first-child{border-top-left-radius:20px;border-bottom-left-radius:20px}.tp-container.tp-main .list-screen .box-screen:last-child{border-top-right-radius:20px;border-bottom-right-radius:20px}.tp-container.tp-main .content-screen{margin-top:2vh;width:100%;height:calc(100% - 15vh);background:rgba(0,0,0,.1);backdrop-filter:blur(5px);border-radius:20px;overflow:hidden;position:relative}.tp-container.tp-main .content-screen .screen{width:100%;height:100%;color:#000;pointer-events:none;transition:.5s;position:absolute;padding:2vh 2vw}.tp-container.tp-main .content-screen .screen.screen-setting{top:0;left:-100%}.tp-container.tp-main .content-screen .screen.screen-main{top:100%;left:0;position:relative;width:100%}.tp-container.tp-main .content-screen .screen.screen-main .list-function{width:100%;height:100%;overflow:hidden;overflow-y:scroll;display:flex;flex-direction:row;flex-wrap:wrap;justify-content:flex-start;align-items:flex-start;align-content:flex-start;gap:2vw}.tp-container.tp-main .content-screen .screen.screen-main .list-function .box-function{width:auto;height:4vh;line-height:auto;background:#fff;display:flex;flex-direction:row;justify-content:center;align-items:center;border-radius:10px;padding:2vh 2vw;word-break:keep-all}.tp-container.tp-main .content-screen .screen.screen-main .layout-function{position:absolute;top:2vh;left:2vw;width:100%;height:0;transition:.5s;overflow:hidden}.tp-container.tp-main .content-screen .screen.screen-main .layout-function.active{height:100%}.tp-container.tp-main .content-screen .screen.screen-main .layout-function .box{width:0;height:0;opacity:0;transition:.5s}.tp-container.tp-main .content-screen .screen.screen-main .layout-function .box.show{width:100%;height:auto;opacity:1}.tp-container.tp-main .content-screen .screen.screen-online{top:0;left:100%}.tp-container.tp-main .content-screen .screen.active{top:0;left:0}</style></div>`;
			
	/**
	* @func getUrlServer
	* @description 'Lấy dữ liệu từ file GITHUB'
	* @param owner = "pntan" 'params0'
	* @param repo = "TOOLv3" 'params1'
	* @param path = "version" 'params2'
	* @param branch = "main" 'params3'
	*/
	async function getUrlServer(owner = "pntan", repo = "TOOLv3", path = "version", branch = "main") {
		try {
		// Lấy file từ GitHub API
		var res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?_=${Date.now()}`, {
			headers: {
			Authorization: `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`,
			}
		});
		var json = await res.json();
		console.log(json);
		var content = atob(json.content); // Giải mã base64
		var url = content.trim();

		return url;
		} catch (e) {
		console.error("Không thể lấy URL từ GitHub:", e.message);
		}
	}

/**
	* @func boxAlert
	* @description 'Ghi console log với định dạng đẹp'
	* @param content 'params0'
	* @param type = "log" 'params1'
	*/
	function boxAlert(content, type = "log") {
		switch (type) {
			case "log":
				console.log(`%cTanPhan: %c${content}`, "color: crimson; font-size: 2rem", "color: orange; font-size: 1.5rem");
				break;
			case "error":
				console.error(`%cTanPhan: %c${content}`, "color: crimson; font-size: 2rem", "color: orange; font-size: 1.5rem")
				break;
			case "warn":
				console.warn(`%cTanPhan: %c${content}`, "color: crimson; font-size: 2rem", "color: orange; font-size: 1.5rem");
				break;
		}
	}

 /**
  * @func boxToast
  * @description 'Hiển thị thông báo toast'
  * @param message 'params0'
  * @param type = "info" 'params1'
  * @param duration = 3000 'params2'
  */
	function boxToast(message, type = "info", duration = 3000) {
		var toast = $(`<div class="toast ${type}">${message}</div>`);
		$("#toast-container").append(toast);

		setTimeout(() => toast.addClass("show"), 10);

		let hideTimeout;

		var startAutoHide = () => {
			hideTimeout = setTimeout(() => {
				toast.removeClass("show");
				setTimeout(() => toast.remove(), 300);
			}, duration);
		};

		var stopAutoHide = () => {
			clearTimeout(hideTimeout);
		};

		toast.on("mouseenter", stopAutoHide);
		toast.on("mouseleave", () => {
			stopAutoHide(); // clear lại nếu người dùng hover nhiều lần
			startAutoHide(); // reset lại thời gian
		});

		startAutoHide(); // bắt đầu đếm thời gian
	}

	// Hàm theo dõi phần tử
	function waitForElement(root, selector, callback, options = {}) {
		var {
			once = true,
				timeout = null,
				waitForLastChange = false,
				delay = 300
		} = options;

		var rootNode = (window.jQuery && root instanceof window.jQuery) ? root[0] :
			(Array.isArray(root) && root[0] instanceof Node) ? root[0] :
			root;

		if (!(rootNode instanceof Node)) {
			console.error("❌ waitForElement: root không phải DOM node hợp lệ:", rootNode);
			return null; // TRẢ VỀ NULL NẾU ROOT KHÔNG HỢP LỆ
		}

		let observer = null;
		let timeoutId = null;
		let delayTimer = null;
		let lastMatchedElement = null;
		let foundAndTriggered = false; // Biến cờ để đảm bảo callback chỉ chạy một lần nếu once là true

		function runCallback(el) {
			if (foundAndTriggered && once) { // Nếu đã chạy và là once, thoát
				return;
			}
			foundAndTriggered = true; // Đánh dấu đã chạy

			callback(el);
			if (once) {
				if (observer) {
					observer.disconnect();
					observer = null; // Gán lại null sau khi disconnect
				}
				if (timeoutId) clearTimeout(timeoutId);
				if (delayTimer) clearTimeout(delayTimer);
			}
		}

		// Kiểm tra ban đầu, nhưng không sử dụng cho logic SPA (once: false)
		var initial = rootNode.querySelector(selector);
		if (initial && !waitForLastChange && once) {
			runCallback(initial);
			return null; // Nếu tìm thấy ngay và once là true, không cần observer
		}

		observer = new MutationObserver(() => {
			// Chỉ tiếp tục nếu chưa tìm thấy và kích hoạt và không phải là once HOẶC là once nhưng chưa kích hoạt
			if (foundAndTriggered && once) {
				return;
			}

			var found = rootNode.querySelector(selector);
			if (found) {
				lastMatchedElement = found;

				if (waitForLastChange) {
					clearTimeout(delayTimer);
					delayTimer = setTimeout(() => runCallback(lastMatchedElement), delay);
				} else {
					runCallback(found);
				}
			}
		});

		observer.observe(rootNode, {
			childList: true,
			subtree: true
		});

		if (timeout) {
			timeoutId = setTimeout(() => {
				if (!foundAndTriggered) { // Chỉ xử lý timeout nếu callback chưa được gọi
					if (observer) {
						observer.disconnect();
						observer = null;
					}
					if (waitForLastChange && lastMatchedElement) {
						runCallback(lastMatchedElement);
					} else {
						// Nếu timeout mà không tìm thấy gì (hoặc không có nội dung đủ)
						// và không có lastMatchedElement, có thể gọi callback với null
						callback(null); // Báo hiệu timeout cho bên ngoài
					}
				}
			}, timeout);
		}

		return observer; // Trả về observer để có thể disconnect từ bên ngoài
	}

	/**
	* @func delay
	* @description 'Tăng thời gian chờ'
	* @param ms 5000 (5s)'params0'
	*/
	function delay(ms = 5000) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	/**
	* @func check_version
	* @description 'Kiểm tra phiên bản hiện tại với phiên bản trên server'
	*/
	var check_version = () => {
		boxAlert(`Đang kiểm tra phiên bản...`, "log");
		getUrlServer().then(latest_version => {
			if(!latest_version) {
				boxAlert("Không thể lấy phiên bản từ server!", "error");
				return;
			}
			if (latest_version != VERSION) 
				boxAlert(`Phiên bản mới đã có: ${latest_version}. Vui lòng cập nhật!`, "warn");
			else
				boxAlert(`Phiên bản hiện tại: ${VERSION}`, "log");
		});
	}

	check_version();	

/**
 * @func getConfig
 * @description 'Lấy cấu hình'
 * @param config_name 'params0'
 */
	var getConfig = (config_name) => {
		var config_value = localStorage.getItem(`TP_CONFIG_${config_name}`);
		if(config_value === null || config_value === undefined) return null;
		return JSON.parse(config_value);
	}

/**
 * @func setConfig
 * @description 'Ghi cấu hình'
 * @param config_name 'params0'
 * @param config_value 'params1'
 */
	var setConfig = (config_name, config_value) => {
		localStorage.setItem(`TP_CONFIG_${config_name}`, JSON.stringify(config_value));
	}

	/**
	* @func INIT_CONFIG
	* @description 'Khởi tạo cấu hình chương trình'
	*/
	function INIT_CONFIG(){
		boxAlert("Đang khởi tạo cấu hình...", "log");

  /**
   * @func theme_mode
   * @description 'Áp dụng cấu hình theme'
   */
		var theme_mode = () => {
			if(!getConfig("theme_mode"))
				setConfig("theme_mode", "light");

			var theme_mode = getConfig("theme_mode");

			$(".tp-container.tp-main .header .theme-switcher .btn-theme").removeClass("active");
			$(`.tp-container.tp-main .header .theme-switcher .${theme_mode}-mode`).addClass("active");

			return theme_mode;
		}

		theme_mode();

  /**
   * @func screen_display
   * @description 'Áp dụng màn hình hiển thị'
   */
		var screen_display = () => {
			if(!getConfig("screen_display"))
				setConfig("screen_display","main")

			var screen_display = getConfig("screen_display");

			$(".tp-container.tp-main .list-screen .box-screen").removeClass("active");
			$(`.tp-container.tp-main .list-screen .box-screen.${screen_display}`).addClass("active");

			$(".tp-container.tp-main .content-screen .screen").removeClass("active");
			$(`.tp-container.tp-main .content-screen .screen.screen-${screen_display}`).addClass("active");

			return screen_display;
		}

		screen_display();

		return true
	}

	/**
	* @func INIT_UI
	* @description 'Khởi tạo giao diện chương trình'
	*/
	function INIT_UI(){
		boxAlert("Đang khởi tạo giao diện...", "log");
		// Khởi tạo giao diện
		var root_div = ["body"].find(id => document.querySelector(id) != null);
		
		if(!root_div) {
			boxAlert("Không tìm thấy phần tử gốc để chèn giao diện!", "error");
			return null;
		}

		// lấy nonce từ tag có sẵn trong trang
		function getNonce(){
			let nonce = $('script[nonce]').attr('nonce');

			if (!nonce)
				nonce = $('meta[http-equiv="Content-Security-Policy"]').attr('content')?.match(/nonce-([\w\d]+)/)?.[1] || '';

			return nonce || '';
		}

		// Áp dụng nonce
		function applyNonce() {
			var nonce = getNonce();
			if (!nonce) return console.warn('Không tìm thấy nonce');

			// Style inline
			$('style:not([nonce])').attr('nonce', nonce);

			// Iframe
			$('iframe:not([nonce])').attr('nonce', nonce);

			// Script do tool tạo
			$('script:not([nonce]):not([src])').attr('nonce', nonce);
		}
		applyNonce();

		$(root_div).append(`${HTML_UI}`);

		return true;
	}

	/**
	* @func INIT
	* @description 'Khởi tạo chương trình'
	*/
	function INIT(){
		// Khởi tạo giao diện
		var init_ui = INIT_UI();

		
		// Khởi tạo cấu hình
		var init_config = INIT_CONFIG();

		if(init_config && init_ui){
			INIT_FUNCTION();
		}
	}

	delay(5000).then(() => {
		INIT();
	});

	var INIT_FUNCTION = async () => {
		// Toggle theme
		$(".tp-container.tp-main .header .btn-theme").on("click", function(){
			var theme = $(this).data("theme");

			var toggleTheme = theme == "light" ? "dark" : "light";

			$(this).removeClass("active");
			$(this).parent().find(`.btn-theme.${toggleTheme}-mode`).addClass("active");

			setConfig("theme_mode", toggleTheme);
		})
	}
})();

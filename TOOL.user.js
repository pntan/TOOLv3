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
	// Code của bạn
	const VERSION = '0.0.1';
			
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

	// Chờ
 /**
  * @func delay
  * @description 'Tăng thời gian chờ'
  * @param ms 5000 (5s)'params0'
  */
	function delay(ms = 5000) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	// Kiểm tra phiên bản
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
  * @func INIT_CONFIG
  * @description 'Khởi tạo cấu hình chương trình'
  */
	function INIT_CONFIG(){
		// Khởi tạo cấu hình
	}

 /**
  * @func INIT_UI
  * @description 'Khởi tạo giao diện chương trình'
  */
	function INIT_UI(){
		// Khởi tạo giao diện
		var root_div = ["#root", "#app", "body"].find(id => document.querySelector(id) != null);
		
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

		$(root_div).append(`
			<div class="tp-container tp-main"><div class="header"><div class="time">00:00:00</div><div class="theme-switcher"><button class="btn-theme light-mode">☀️</button> <button class="btn-theme dark-mode">🌙</button></div></div></div><style>.tp-container{padding:0;margin:0;border:none;box-sizing:border-box}.tp-container *{padding:0;margin:0;border:0;box-sizing:border-box;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-weight:700;user-select:none}.tp-container.tp-main{position:fixed;top:0;left:0;background:rgba(223,223,223,.8);backdrop-filter:blur(10px);padding:2vh 2vw;width:auto;height:100vh;color:#fff;aspect-ratio:4/16}.tp-container.tp-main .header{display:flex;justify-content:space-around;align-items:center;width:100%;height:3vh;color:#000;overflow:hidden}.tp-container.tp-main .header .time{font-size:1.5vh;letter-spacing:1rcap}.tp-container.tp-main .header .theme-switcher{position:relative;width:auto;height:100%;aspect-ratio:1/1}.tp-container.tp-main .header .theme-switcher .btn-theme{position:absolute;height:100%;border-radius:50%;font-size:2vh;cursor:pointer;background:0 0;transition:.5s}.tp-container.tp-main .header .theme-switcher .btn-theme.active{top:0!important;left:0}.tp-container.tp-main .header .theme-switcher .btn-theme.light-mode{top:-100%;left:0}.tp-container.tp-main .header .theme-switcher .btn-theme.dark-mode{top:100%;left:0}</style>
		`);
	}

 /**
  * @func INIT
  * @description 'Khởi tạo chương trình'
  */
	function INIT(){
		// Khởi tạo cấu hình
		INIT_CONFIG();

		// Khởi tạo giao diện
		var init_ui = INIT_UI();

	}

	INIT();

})();

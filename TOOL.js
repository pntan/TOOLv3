// ==UserScript==
// @name         CÔNG CỤ HỖ TRỢ V4
// @version      0.0.1
// @namespace    tanphan.toolv3
// @icon         https://www.google.com/s2/favicons?sz=64&domain=http://anonymouse.org/
// @description  Một số công cụ hỗ trợ công việc
// @author       Phan Nhật Tân
// @match        *://*/*
// @grant        none
// @updateURL    https://cdn.jsdelivr.net/gh/pntan/TOOLv3@0.0.1/TOOL.js
// @downloadURL  https://cdn.jsdelivr.net/gh/pntan/TOOLv3@0.0.1/TOOL.js
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

	// Kiểm tra phiên bản
 /**
  * @func check_version
  * @description 'Kiểm tra phiên bản hiện tại với phiên bản trên server'
  */
	var check_version = () => {
		boxAlert(`Đang kiểm tra phiên bản...`, "log");
		getUrlServer().then(latest_version => {
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
	}

 /**
  * @func INIT
  * @description 'Khởi tạo chương trình'
  */
	function INIT(){
		// Khởi tạo cấu hình
		INIT_CONFIG();

		// Khởi tạo giao diện
		INIT_UI();

	}

})();
// ==UserScript==
// @name         CÔNG CỤ HỖ TRỢ V3
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

	// Ghi console log
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

	function INIT_CONFIG(){
		// Khởi tạo cấu hình
	}

})();

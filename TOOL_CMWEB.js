// ==UserScript==
// @name         CÔNG CỤ HỖ TRỢ CHO WEB CHUANMUA
// @version      0.0.1
// @namespace    tanphan.TOOL.CM_WEB
// @icon         https://www.google.com/s2/favicons?sz=64&domain=http://anonymouse.org/
// @description  Công Cụ Hỗ Trợ Cho WEB Chuẩn Mua
// @license      MIT
// @author       TânPhan
// @copyright    2025, TanPhan (nhattanphan2014@gmail.com)
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @updateURL    https://openuserjs.org/meta/pntan/CÔNG_CỤ_HỖ_TRỢ_V4.meta.js
// @downloadURL  https://openuserjs.org/install/pntan/CÔNG_CỤ_HỖ_TRỢ_V4.user.js
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @require      https://code.jquery.com/ui/1.13.2/jquery-ui.min.js
// @require      https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4
// @require      https://cdn.jsdelivr.net/npm/sweetalert2@11.7.12/dist/sweetalert2.all.min.js
// @require      https://cdn.socket.io/4.8.1/socket.io.min.js
// @require      https://unpkg.com/preact@latest/dist/preact.min.js
// @require      https://unpkg.com/preact@latest/hooks/dist/hooks.umd.js
// @require      https://unpkg.com/htm@latest/dist/htm.umd.js
// ==/UserScript==

(async function(e){
	/**
	 * @func delay
	 * @description 'Tăng thời gian chờ'
	 */
	function delay(ms = 5000) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	/**
	 * @func boxAlert
	 * @description 'Ghi console log với định dạng đẹp'
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
			case "success":
				console.log(`%cTanPhan: %c${content}`, "color: green; font-size: 2rem", "color: lightgreen; font-size: 1.5rem");
				break;
			case "info":
				console.log(`%cTanPhan: %c${content}`, "color: blue; font-size: 2rem", "color: skyblue; font-size: 1.5rem");
				break;
		}
	}

	/**
	 * @func boxToast
	 * @description 'Hiển thị thông báo toast'
	 */
	function boxToast(message, type = "info", duration = 3000) {
		var toast = $(`<div class="toast ${type}">${message}</div>`);
		$(".tp-container.tp-toast").append(toast);

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
			stopAutoHide();
			startAutoHide();
		});

		startAutoHide();
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

	function awaitForElement(root, selector, options = {}) {
		return new Promise((resolve, reject) => {
			const timeout = options.timeout || 0;

			let actualObserver = null;
			let promiseTimeoutId = null;

			const customCallback = (el) => {
				if (promiseTimeoutId) clearTimeout(promiseTimeoutId);
				resolve(el);
			};

			actualObserver = waitForElement(root, selector, customCallback, {
				...options,
				once: true
			});

			if (!actualObserver) {
				reject(new Error("waitForElement failed to initialize, root may be invalid."));
				return;
			}

			if (timeout > 0) {
				promiseTimeoutId = setTimeout(() => {
					if (actualObserver) actualObserver.disconnect();
					reject(new Error(`Timeout waiting for element: ${selector}`));
				}, timeout);
			}
		});
	}

	// Giả lập kéo thả tệp vào một phần tử (element)
	function simulateFileDrop(targetElement, files = [], options = {}) {
		var el = targetElement[0] || targetElement; // Đảm bảo el là DOM element

		if (!el) {
			console.warn("simulateFileDrop: Target element not found.");
			return;
		}

		var dataTransfer = new DataTransfer();
		files.forEach(file => {
			// Thay vì kiểm tra instanceof File, kiểm tra instanceof Blob
			// vì File kế thừa từ Blob và Blob ít bị ảnh hưởng bởi ngữ cảnh hơn trong trường hợp này.
			// Hoặc chỉ cần kiểm tra sự tồn tại của các thuộc tính cần thiết của một File/Blob.
			if (file && (file instanceof Blob || (typeof file.name === 'string' && typeof file.size === 'number' && typeof file.type === 'string'))) {
				dataTransfer.items.add(file);
			} else {
				console.warn("simulateFileDrop: Invalid file object provided. Must be an instance of File.", file);
				// Log chi tiết hơn để debug
				console.log("Details of invalid file:", file);
				if (file) {
					console.log("File constructor name:", file.constructor ? file.constructor.name : "N/A");
					try {
						console.log("Is file instanceof window.File?", file instanceof window.File);
						// Có thể thêm kiểm tra instanceof Blob của cửa sổ chính
						console.log("Is file instanceof window.Blob?", file instanceof window.Blob);
					} catch (e) {
						console.log("Error checking instanceof in window context:", e);
					}
				}
			}
		});

		if (dataTransfer.items.length === 0) {
			console.warn("simulateFileDrop: No valid files were added to DataTransfer.", files);
			return; // Không có file nào hợp lệ để kéo thả
		}

		const dragEvents = ['dragenter', 'dragover', 'drop'];

		dragEvents.forEach(eventType => {
			var event;
			if (eventType === 'dragenter' || eventType === 'dragover') {
				event = new DragEvent(eventType, {
					bubbles: true,
					cancelable: true,
					dataTransfer: dataTransfer,
					...options
				});
				event.preventDefault();
			} else if (eventType === 'drop') {
				event = new DragEvent(eventType, {
					bubbles: true,
					cancelable: true,
					dataTransfer: dataTransfer,
					...options
				});
				event.preventDefault();
			} else {
				event = new DragEvent(eventType, {
					bubbles: true,
					cancelable: true,
					...options
				});
			}
			el.dispatchEvent(event);
			console.log(`Dispatched ${eventType} event on`, el);
		});
	}

	// Hàm giả lập thao tác người dùng (đã sửa đổi)
	function simulateReactEvent(input, type, options = {}) {
		var el = input[0];

		if (!el) {
			console.warn(`simulateReactEvent: Element not found for eventType ${type}.`);
			return;
		}

		// Hàm con để xử lý sự kiện bàn phím
		function pressKey(keyName) {
			var keyMap = {
				enter: {
					key: 'Enter',
					code: 'Enter'
				},
				tab: {
					key: 'Tab',
					code: 'Tab'
				},
				escape: {
					key: 'Escape',
					code: 'Escape'
				},
				arrowup: {
					key: 'ArrowUp',
					code: 'ArrowUp'
				},
				arrowdown: {
					key: 'ArrowDown',
					code: 'ArrowDown'
				},
				arrowleft: {
					key: 'ArrowLeft',
					code: 'ArrowLeft'
				},
				arrowright: {
					key: 'ArrowRight',
					code: 'ArrowRight'
				}
			};

			var keyData = keyMap[keyName.toLowerCase()] || {
				key: keyName,
				code: keyName
			};

				['keydown', 'keypress', 'keyup'].forEach(eventType => {
				var event = new KeyboardEvent(eventType, {
					key: keyData.key,
					code: keyData.code,
					bubbles: true,
					cancelable: true,
					...options // Thêm các tùy chọn khác nếu có (Ctrl, Shift, v.v.)
				});
				el.dispatchEvent(event);
			});
		}

		// --- Xử lý loại sự kiện ---
		var event;
		var knownKeys = ['enter', 'tab', 'escape', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];

		if (knownKeys.includes(type.toLowerCase())) {
			pressKey(type);
		}
		// Nếu là sự kiện bàn phím tự do
		else if (['keydown', 'keypress', 'keyup'].includes(type)) {
			event = new KeyboardEvent(type, {
				key: options.key || '',
				code: options.code || '',
				bubbles: true,
				cancelable: true,
				...options // Các tùy chọn khác như altKey, ctrlKey, shiftKey, metaKey
			});
			el.dispatchEvent(event);
		}
		// Nếu là sự kiện chuột (MouseEvent)
		else if (['click', 'mousedown', 'mouseup', 'dblclick', 'contextmenu', 'mousemove', 'mouseover', 'mouseout'].includes(type.toLowerCase())) {
			event = new MouseEvent(type, {
				bubbles: true,
				cancelable: true,
				// view: window,
				button: options.button !== undefined ? options.button : 0, // 0 cho chuột trái (mặc định)
				buttons: options.buttons !== undefined ? options.buttons : (type === 'mousedown' ? 1 : 0), // 1 cho nút trái đang nhấn
				clientX: options.clientX || 0,
				clientY: options.clientY || 0,
				screenX: options.screenX || 0,
				screenY: options.screenY || 0,
				altKey: options.altKey || false,
				ctrlKey: options.ctrlKey || false,
				shiftKey: options.shiftKey || false,
				metaKey: options.metaKey || false,
				...options // Các tùy chọn khác như relatedTarget
			});
			el.dispatchEvent(event);
		}
		// Các loại sự kiện khác (input, change, blur, focus, submit,...)
		else {
			event = new Event(type, {
				bubbles: true,
				cancelable: true,
				...options
			});
			el.dispatchEvent(event);
		}

		console.log(`Dispatched ${type} event on`, el);
	}

	// Giả lập input file
	function simulateReactInputFile(input) {
		var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'files')?.set;

		try {
			if (nativeInputValueSetter) {
				nativeInputValueSetter.call(input, input.files);
			}

			// Trigger lại các sự kiện input và change để React có thể nhận diện sự thay đổi
			var inputEvent = new Event('input', {
				bubbles: true
			});
			var changeEvent = new Event('change', {
				bubbles: true
			});

			input.dispatchEvent(inputEvent);
			input.dispatchEvent(changeEvent);
		} catch (e) {}
	}

	// Giả lập xóa nội dung
	function simulateClearing(inputElement, delay = 50, callback) {
		let text = inputElement.val();
		let index = text.length;

		function deleteNext() {
			if (index > 0) {
				inputElement.val(text.slice(0, --index)); // Xóa ký tự cuối cùng
				inputElement.trigger($.Event("keydown", {
					key: "Backspace",
					keyCode: 8
				}));
				setTimeout(deleteNext, delay);
			} else if (callback) {
				callback(); // Gọi callback sau khi xóa xong
			}
		}

		deleteNext();
	}

	// Giả lập gõ nội dung
	function simulateTyping(inputElement, text, event = "input", delay = 100, callback = null) {
		let index = 0;

		function typeNext() {
			if (index < text.length) {
				let char = text[index];
				inputElement.val(inputElement.val() + char);
				inputElement.trigger($.Event(event, {
					key: char,
					keyCode: char.charCodeAt(0),
					bubbles: true
				}));
				inputElement.trigger($.Event(event, {
					key: char,
					keyCode: char.charCodeAt(0),
					bubbles: true
				}));
				index++;
				setTimeout(typeNext, delay);
			} else {
				// Giả lập xóa khoảng trắng cuối cùng
				inputElement.trigger($.Event(event, {
					key: "Backspace",
					keyCode: 8,
					bubbles: true
				}));
				inputElement.trigger(event);
				inputElement.select();

				if (window.getSelection) {
					window.getSelection().removeAllRanges();
				} else if (document.selection) {
					document.selection.empty();
				}

				if ("createEvent" in document) {
					var evt = document.createEvent("HTMLEvents");
					evt.initEvent(event, false, true);
					$(inputElement).get(0).dispatchEvent(evt);
				} else {
					$(inputElement).get(0).fireEvent(`on${event}`);
				}

				if (typeof callback === "function") {
					callback();
				}
			}
		}

		typeNext();
	}

	// Giả lập dán nội dung
	function simulatePaste(inputElement, pastedText, event = "input", callback = null) {
		// Đặt giá trị như người dùng dán
		var el = inputElement[0];

		// Gán trực tiếp thông qua setter gốc (để React nhận biết)
		var nativeSetter = Object.getOwnPropertyDescriptor(el.__proto__, 'value')?.set;
		nativeSetter ? nativeSetter.call(el, pastedText) : inputElement.val(pastedText);

		// Tạo clipboardData giả để gửi sự kiện paste
		var pasteEvent = new ClipboardEvent('paste', {
			bubbles: true,
			cancelable: true,
			clipboardData: new DataTransfer()
		});

		pasteEvent.clipboardData.setData('text/plain', pastedText);

		// Gửi sự kiện paste
		el.dispatchEvent(pasteEvent);

		// Gửi sự kiện input để đảm bảo state được cập nhật
		el.dispatchEvent(new InputEvent(event, {
			bubbles: true
		}));

		// Gửi sự kiện change nếu cần (để framework bắt được)
		el.dispatchEvent(new Event('change', {
			bubbles: true
		}));

		// Gọi callback nếu có
		if (typeof callback === "function") {
			callback();
		}
	}

	// Giả lập input file
	function simulateReactInput(input, text, delay) {
		delay = delay || 100;
		var el = input[0];
		input.focus();

		var i = 0;

		function setNativeValue(element, value) {
			var lastValue = element.value;
			element.value = value;

			// Gọi setter gốc nếu bị React override
			var event = new Event('input', {
				bubbles: true
			});
			var tracker = element._valueTracker;
			if (tracker) tracker.setValue(lastValue);
			element.dispatchEvent(event);
		}

		function typeChar() {
			if (i < text.length) {
				var newVal = input.val() + text[i];
				setNativeValue(el, newVal);
				i++;
				typeChar();
			}
		}

		typeChar();
	}

	// Giả lập làm trống input
	function simulateClearReactInput(input) {
		var el = input[0];

		function setNativeValue(element, value) {
			var lastValue = element.value;
			element.value = value;

			var event = new Event('input', {
				bubbles: true
			});
			var tracker = element._valueTracker;
			if (tracker) tracker.setValue(lastValue);
			element.dispatchEvent(event);
		}

		input.focus();
		setNativeValue(el, '');
	}

	var SOCKETIO;
	var SERVER_CONNECTED = false;
	waitForElement($("body"), "#app", (e) => {
		INIT(parent_element = $(e));
	});

	// Kết nối với máy chủ
	async function CONNECT_SERVER(){
		async function getNgrokURL() {
			var time = Date.now();
			const url = `https://pntan.github.io/chuanmuangrok.json?timestamp=${time}`;

			try {
				const response = await fetch(url, {
					cache: "no-store"
				});
				if (!response.ok) throw new Error('Network response was not ok');
				const data = await response.json();
				return data.url;
			} catch (error) {
				console.error('Lỗi khi fetch URL từ GitHub:', error);
				return null;
			}
		}

		function initSocket(url) {
			if (SOCKETIO) {
				SOCKETIO.off();
				SOCKETIO.close();
				SOCKETIO = null;
			}

			boxAlert(`ĐANG THỬ KẾT NỐI ĐẾN: ${url}`, 'log');

			SOCKETIO = io(url, {
				reconnectionAttempts: 3,
				timeout: 5000,
				transports: ["websocket", "polling"],
				extraHeaders: {
					"ngrok-skip-browser-warning": "69420"
				},
			});

			SOCKETIO.on("connect", () => {
				SERVER_CONNECTED = true;
			})

			return;

			// --- CÁC SỰ KIỆN LẮNG NGHE ---

			SOCKETIO.on('connect', () => {
				boxAlert(`KẾT NỐI SOCKET THÀNH CÔNG!`, 'success');
				boxToast('Kết nối Server thành công!', 'success', 3000);

				// Reset trạng thái
				connectionFailedOnce = false;
				clearTimeout(retryTimer);
				retryTimer = null;

				// Cập nhật UI
				$(".server-status .status-text").text("Đã kết nối").removeClass("red").addClass("green");
				$(".server-status .url-text").text(url);

				// Lưu URL nếu là URL mới
				if (!isFromCache) {
					setConfig('server_url', url);
				}

				// DÒNG QUAN TRỌNG: TÁI KÍCH HOẠT TẤT CẢ TÍNH NĂNG
				registerAppEvents();
			});

			SOCKETIO.on('connect_error', async (error) => {
				boxAlert(`LỖI KẾT NỐI (${isFromCache ? 'Cache' : 'Mới'}): ${error.message}`, 'warn');

				// FIX: Chỉ hiện Toast Error 1 lần
				if (!toastDisplayedForAttempt) {
					boxToast(`Lỗi kết nối Server! Đang tìm Link mới...`, 'error', 5000);
					toastDisplayedForAttempt = true;
				}

				// Ngắt kết nối hiện tại để xử lý
				SOCKETIO.off();
				SOCKETIO.close();

				if (isFromCache) {
					// KỊCH BẢN 1: URL Cache bị lỗi -> Tìm URL mới ngay lập tức
					handleCacheFailure();
				} else {
					// KỊCH BẢN 2: URL MỚI (lấy từ GitHub) bị lỗi -> Bắt đầu vòng lặp chờ 90s
					if (!connectionFailedOnce) {
						connectionFailedOnce = true;
					}
					startDelayedRetry();
				}
			});

			SOCKETIO.on('disconnect', (reason) => {
				if (reason !== "io client disconnect") {
					boxAlert(`SOCKET MẤT KẾT NỐI: ${reason}`, 'warn');
					$(".server-status .status-text").text("Mất Kết Nối").removeClass("green").addClass("red");
				}
			});
		}

		var url_server = await getNgrokURL();
		clearTimeout(retry_connect);
		var retry_connect;
		if(url_server == null){
			retry_connect = setTimeout(() => {
				CONNECT_SERVER();
			}, 1000 * 60);
			return false;
		}else{
			clearTimeout(retry_connect);
			initSocket(url_server);
		}
	}

	async function check_auto_job(){
		var localtion = document.location.search;
		if(localtion.length == 0) return false;

		localtion = localtion.replace("?", "");
		localtion = localtion.split("&");

		var key = [], value = [];

		$.each(localtion, (i, v) => {
			v = v.split("=");
			key.push(v[0]);
			value.push(v[1]);
		})

		if(key.includes("tp_ticket")){
			return ({
				type: true,
				ticket: value[key.indexOf("tp_ticket")],	
			})
		}else
			return null;
	}

	async function auto_job(ticket){
		if(!SOCKETIO) return;

		SOCKETIO.emit("auto:check_ticket", ticket);
		
		SOCKETIO.on("auto:start_job", (data) => {
			console.log(data);
		})
	}

	// Khởi tạo chương trình
	async function INIT(parent_element = $("body")){
		boxAlert("KHỞI TẠO CHƯƠNG TRÌNH");
		CONNECT_SERVER();
		const HTML_LAYOUT = `
			<style>
			<div class="tp-container w-fit h-[85vh] fixed bg-[#fafafa] top-1/2 left-0 -translate-y-1/2 z-[999999] p-[2vw] rounded-xl text-xl">
				<div class="side-bar flex flex-row">
					<div class="side-bar-box online-tab">📡 ONLINE</div>
					<div class="side-bar-box main-tab">🏠 MAIN</div>
					<div class="side-bar-box setting-tab">⚙️ SETTING</div>
				</div>
			</div>
		`;

		await delay(1000);
		parent_element.append(HTML_LAYOUT);

		var has_auto = await check_auto_job();
		if(auto_job != null)
			auto_job(has_auto.ticket);
		
	}
})()
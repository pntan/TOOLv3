  // ==UserScript==
  // @name         CÔNG CỤ HỖ TRỢ V4
  // @version      0.0.4
  // @namespace    tanphan.toolv3
  // @icon         https://www.google.com/s2/favicons?sz=64&domain=http://anonymouse.org/
  // @description  Một số công cụ hỗ trợ công việc
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

  // ==/UserScript==
  (function() {
    'use strict';

    const VERSION = '0.0.1';
    const X_LIMIT = 3;

    var socket = null;
    var CURRENT_CHAT_MODE = 'ai'; // 'ai' hoặc 'global'
    const AI_CONTEXT_HISTORY_LIMIT = 10; // Giới hạn 8 tin nhắn gần nhất để gửi lên Server
    let aiContextHistory = []; // Lưu trữ lịch sử chat cho AI: [{role: 'user', text: '...'}, ...]

    let connectionFailedOnce = false; // Đánh dấu thất bại đầu tiên trong chuỗi
    let retryTimer = null;           // Timer cho vòng lặp chậm
    const RETRY_DELAY = 90000;       // 1.5 phút (90 giây)
    let heartbeatInterval = null;    // Biến giữ ID của setInterval cho Heartbeat

    // --- ĐÃ CẬP NHẬT: Thêm nút action-btn vào gia_duoi_layout ---
    const HTML_UI = `<style>:root{--tp-font:'Segoe UI',system-ui,-apple-system,sans-serif;--tp-radius-xl:24px;--tp-radius-md:16px;--tp-radius-sm:12px;--tp-primary:#3b82f6;--tp-primary-rgb:59,130,246;--tp-secondary:#64748b;--tp-accent:#60a5fa;--tp-glass-bg:rgba(255, 255, 255, 0.75);--tp-glass-border:rgba(255, 255, 255, 0.6);--tp-glass-highlight:rgba(255, 255, 255, 0.4);--tp-glass-shadow:0 8px 32px 0 rgba(31, 38, 135, 0.15);--tp-blur:blur(16px) saturate(180%);--tp-text-main:#1e293b;--tp-text-sub:#475569;--tp-text-inv:#ffffff;--tp-ease:cubic-bezier(0.34, 1.56, 0.64, 1);--tp-ease-smooth:cubic-bezier(0.4, 0, 0.2, 1);--tp-chat-user-bg:var(--tp-primary);--tp-chat-ai-bg:rgba(255, 255, 255, 0.8);--tp-chat-border:rgba(255, 255, 255, 0.5)}.shopee-theme{--tp-primary:#ee4d2d;--tp-primary-rgb:238,77,45;--tp-accent:#ff7350;--tp-glass-shadow:0 8px 32px 0 rgba(238, 77, 45, 0.15)}.lazada-theme{--tp-primary:#0f146d;--tp-primary-rgb:15,20,109;--tp-accent:#f5008f;--tp-glass-shadow:0 8px 32px 0 rgba(15, 20, 109, 0.2)}.tiktok-theme{--tp-primary:#000000;--tp-primary-rgb:0,0,0;--tp-accent:#25F4EE;--tp-secondary:#FE2C55;--tp-glass-shadow:0 8px 32px 0 rgba(0, 0, 0, 0.2)}.dark-mode-active,.tp-container .btn-theme.dark-mode.active~.content-screen{--tp-glass-bg:rgba(17, 25, 40, 0.85);--tp-glass-border:rgba(255, 255, 255, 0.1);--tp-text-main:#f1f5f9;--tp-text-sub:#94a3b8;--tp-glass-shadow:0 8px 32px 0 rgba(0, 0, 0, 0.5)}.tp-container{font-family:var(--tp-font);box-sizing:border-box;color:var(--tp-text-main)}.tp-container *{box-sizing:border-box;outline:0;user-select:none;-webkit-font-smoothing:antialiased}.tp-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:10px 16px;border:none;border-radius:var(--tp-radius-md);font-weight:600;font-size:14px;cursor:pointer;transition:all .2s var(--tp-ease);background:rgba(255,255,255,.5);color:var(--tp-text-main);box-shadow:0 2px 5px rgba(0,0,0,.05)}.tp-btn:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,.1);background:#fff}.tp-btn:active{transform:scale(.96)}.tp-btn.primary{background:var(--tp-primary);color:#fff}.tp-btn.primary:hover{background:var(--tp-accent);box-shadow:0 4px 15px rgba(var(--tp-primary-rgb),.4)}.tp-btn.danger{background:#ef4444;color:#fff}.tp-btn.ghost{background:0 0;box-shadow:none}.tp-btn.ghost:hover{background:rgba(0,0,0,.05)}.tp-btn.icon-only{padding:8px;width:36px;height:36px;border-radius:50%}.tp-input,.tp-select{padding:10px 14px;border-radius:var(--tp-radius-sm);border:1px solid rgba(255,255,255,.4);background:rgba(255,255,255,.6);color:var(--tp-text-main);font-size:14px;outline:0;width:100%;transition:.3s}.tp-input:focus,.tp-select:focus{background:#fff;border-color:var(--tp-primary)}.tp-tag{display:inline-block;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;background:rgba(0,0,0,.1);color:var(--tp-text-sub)}.tp-tag.blue{background:rgba(59,130,246,.15);color:#2563eb}.tp-tag.red{background:rgba(239,68,68,.15);color:#dc2626}.tp-checkbox{display:inline-flex;align-items:center;cursor:pointer;margin-right:15px;position:relative}.tp-checkbox input{display:none}.tp-checkbox .checkmark{width:20px;height:20px;background:rgba(255,255,255,.4);border:1px solid rgba(255,255,255,.5);border-radius:6px;margin-right:10px;transition:all .3s;display:flex;align-items:center;justify-content:center}.tp-checkbox input:checked~.checkmark{background:var(--tp-primary);border-color:var(--tp-primary)}.tp-checkbox .checkmark:after{content:'✔';font-size:12px;color:#fff;transform:scale(0);transition:.2s}.tp-checkbox input:checked~.checkmark:after{transform:scale(1)}.tp-checkbox .label-text{font-size:14px;font-weight:600}.tp-container.tp-main{position:fixed;top:2.5vh;bottom:2.5vh;left:0;width:clamp(360px,35vw,550px);background:var(--tp-glass-bg);backdrop-filter:var(--tp-blur);-webkit-backdrop-filter:var(--tp-blur);border:1px solid var(--tp-glass-border);box-shadow:var(--tp-glass-shadow);border-radius:0 var(--tp-radius-xl) var(--tp-radius-xl) 0;z-index:999999999;display:flex;flex-direction:column;padding:24px;transform:translateX(-120%);transition:transform .6s var(--tp-ease),opacity .4s ease;opacity:0;pointer-events:none}.tp-container.tp-main.active,.tp-container.tp-main:hover{transform:translateX(0);opacity:1;pointer-events:auto}.tp-container .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-shrink:0}.tp-container .header .time{font-size:1.1rem;font-weight:800;background:linear-gradient(135deg,var(--tp-primary),var(--tp-accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent}.tp-container .theme-switcher{background:rgba(0,0,0,.05);border-radius:30px;padding:3px;display:flex;position:relative;width:64px;height:32px}.tp-container .btn-theme{width:26px;height:26px;border-radius:50%;border:none;background:0 0;cursor:pointer;position:absolute;top:3px;transition:.4s;display:flex;align-items:center;justify-content:center;opacity:.5}.tp-container .btn-theme.active{background:#fff;opacity:1;transform:scale(1.1);box-shadow:0 2px 8px rgba(0,0,0,.15)}.tp-container .btn-theme.light-mode{left:4px}.tp-container .btn-theme.dark-mode{right:4px}.tp-container .list-screen{display:flex;gap:8px;margin-bottom:20px;padding:4px;background:rgba(255,255,255,.3);border-radius:var(--tp-radius-md)}.tp-container .box-screen{flex:1;text-align:center;padding:8px 0;border-radius:var(--tp-radius-sm);cursor:pointer;transition:all .3s;font-size:1.2rem;color:var(--tp-text-sub)}.tp-container .box-screen:hover{background:rgba(255,255,255,.5);transform:translateY(-2px)}.tp-container .box-screen.active{background:#fff;color:var(--tp-primary);box-shadow:0 4px 12px rgba(0,0,0,.05);transform:translateY(0) scale(1.05)}.tp-container .content-screen{flex:1;position:relative;overflow:hidden;background:rgba(255,255,255,.4);border-radius:var(--tp-radius-md);border:1px solid rgba(255,255,255,.3)}.tp-container .screen{position:absolute;width:100%;height:100%;padding:15px;overflow-y:auto;transition:transform .5s var(--tp-ease-smooth),opacity .4s;opacity:0;pointer-events:none;display:flex;flex-direction:column}.tp-container .screen.active{transform:translateX(0);opacity:1;pointer-events:auto}.tp-container .screen:not(.active){transform:translateX(50px)}.tp-container .list-function{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:12px;width:100%;align-content:start}.tp-container .list-function:not(.active){display:none}.tp-container .box-function{background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.5);border-radius:var(--tp-radius-sm);padding:15px 10px;text-align:center;cursor:pointer;min-height:90px;display:flex;align-items:center;justify-content:center;flex-direction:column;transition:all .3s;box-shadow:0 4px 6px rgba(0,0,0,.02)}.tp-container .box-function:hover{background:#fff;transform:translateY(-5px);border-color:var(--tp-primary);color:var(--tp-primary)}.tp-container .layout-function{position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(255,255,255,.85);backdrop-filter:blur(10px);z-index:20;transform:translateX(100%);transition:.4s var(--tp-ease-smooth);display:flex;flex-direction:column;padding:20px}.tp-container .layout-function.active{transform:translateX(0)}.tp-container .back{align-self:flex-start;margin-bottom:20px;padding:8px 16px;border-radius:20px;background:rgba(0,0,0,.05);cursor:pointer;font-weight:600;color:var(--tp-text-sub);transition:.2s;display:flex;align-items:center;gap:6px}.tp-container .back:hover{background:var(--tp-primary);color:#fff;padding-right:20px}.tp-container .box{display:none;animation:slideUp .4s;height:100%;overflow-y:auto}.tp-container .box.show{display:block;height:fit-content}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.tp-container.tp-toast{top:20px;left:50%;transform:translateX(-50%);width:auto;max-width:90vw;z-index:9999999999;position:fixed;pointer-events:none}.tp-container.tp-toast .toast{background:rgba(255,255,255,.95);backdrop-filter:blur(12px);padding:12px 24px;border-radius:50px;margin-bottom:10px;box-shadow:0 10px 30px rgba(0,0,0,.15);border:1px solid rgba(255,255,255,.5);color:var(--tp-text-main);font-weight:600;display:flex;align-items:center;gap:10px;transform:translateY(-20px) scale(.9);opacity:0;transition:.4s;pointer-events:auto}.tp-container.tp-toast .toast.show{transform:translateY(0) scale(1);opacity:1}.tp-container.tp-toast .toast:before{content:'';width:10px;height:10px;border-radius:50%;display:block}.tp-container.tp-toast .toast.success:before{background:#10b981;box-shadow:0 0 10px #10b981}.tp-container.tp-toast .toast.error:before{background:#ef4444;box-shadow:0 0 10px #ef4444}.tp-container.tp-toast .toast.info:before{background:var(--tp-primary);box-shadow:0 0 10px var(--tp-primary)}.tp-container.tp-chat-panel{position:fixed;top:2.5vh;bottom:2.5vh;left:calc(clamp(360px,35vw,550px) + 20px);width:380px;background:var(--tp-glass-bg);backdrop-filter:var(--tp-blur);-webkit-backdrop-filter:var(--tp-blur);border:1px solid var(--tp-glass-border);box-shadow:var(--tp-glass-shadow);border-radius:var(--tp-radius-xl);z-index:999999998;display:flex;flex-direction:column;transform:translateX(-50px);opacity:0;pointer-events:none;transition:all .5s var(--tp-ease)}.tp-container.tp-main.active~.tp-container.tp-chat-panel.active{transform:translateX(0);opacity:1;pointer-events:auto}.tp-chat-header{padding:15px 20px;border-bottom:1px solid rgba(255,255,255,.3);display:flex;justify-content:space-between;align-items:center;flex-shrink:0}.tp-chat-mode-switch{background:rgba(0,0,0,.05);border-radius:8px;padding:3px;display:flex;gap:4px;border:1px solid rgba(255,255,255,.2)}.tp-mode-btn{flex:1;border:none;background:0 0;padding:6px 12px;font-size:12px;font-weight:700;color:var(--tp-text-sub);border-radius:6px;cursor:pointer;transition:.3s}.tp-mode-btn.active{background:#fff;color:var(--tp-primary);box-shadow:0 2px 6px rgba(0,0,0,.1)}.tp-chat-body{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:15px;scroll-behavior:smooth}.tp-msg{max-width:85%;padding:10px 14px;border-radius:12px;font-size:14px;line-height:1.5;position:relative;word-wrap:break-word;animation:msgPop .3s var(--tp-ease);box-shadow:0 2px 5px rgba(0,0,0,.05)}@keyframes msgPop{from{opacity:0;transform:translateY(10px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}.tp-msg.user{align-self:flex-end;background:var(--tp-chat-user-bg);color:#fff;border-bottom-right-radius:2px}.tp-msg.ai{align-self:flex-start;background:var(--tp-chat-ai-bg);color:var(--tp-text-main);border:1px solid var(--tp-chat-border);border-bottom-left-radius:2px}.tp-msg.other{align-self:flex-start;background:#f1f5f9;color:var(--tp-text-main);border:1px solid rgba(0,0,0,.05);border-bottom-left-radius:2px}.tp-msg.system{align-self:center;font-size:12px;background:rgba(0,0,0,.05);color:var(--tp-text-sub);border-radius:20px;padding:4px 12px;border:none;box-shadow:none}.tp-msg-sender{font-size:10px;font-weight:700;color:var(--tp-text-sub);margin-bottom:2px;display:block}.tp-chat-img{max-width:100%;border-radius:8px;margin-top:4px;border:1px solid rgba(0,0,0,.1);cursor:pointer}.tp-file-attachment{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.5);padding:6px 10px;border-radius:6px;margin-top:4px;font-size:12px;text-decoration:none;color:var(--tp-primary);font-weight:600}.tp-file-attachment:hover{background:#fff}.tp-chat-footer{padding:15px;border-top:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.2);flex-shrink:0;display:flex;flex-direction:column;gap:10px}.tp-chat-input-area{display:flex;gap:8px;align-items:flex-end;background:rgba(255,255,255,.6);border-radius:var(--tp-radius-md);padding:8px;border:1px solid rgba(255,255,255,.4);transition:.3s}.tp-chat-input-area:focus-within{background:#fff;border-color:var(--tp-primary);box-shadow:0 4px 12px rgba(var(--tp-primary-rgb),.15)}.tp-chat-textarea{flex:1;border:none;background:0 0;padding:8px;font-family:var(--tp-font);font-size:14px;resize:none;max-height:100px;min-height:24px;outline:0;color:var(--tp-text-main)}.tp-upload-progress{height:2px;background:var(--tp-primary);width:0%;transition:width .3s;position:absolute;bottom:0;left:0}.typing-dots{display:inline-flex;gap:4px}.typing-dots span{width:6px;height:6px;background:var(--tp-text-sub);border-radius:50%;animation:dotBounce 1.4s infinite ease-in-out both}.typing-dots span:nth-child(1){animation-delay:-.32s}.typing-dots span:nth-child(2){animation-delay:-.16s}@keyframes dotBounce{0%,100%,80%{transform:scale(0)}40%{transform:scale(1)}}</style><div class="tp-container tp-toast"></div><div class="tp-container tp-main"id="tpMainPanel"><div class="header"><div class="time">00:00:00</div><button class="tp-btn icon-only ghost"id="toggleChatBtn"title="Chat"style="font-size:18px">💬</button><div class="checkout"><button class="tp-btn primary"style="padding:6px 12px;font-size:12px">CHECK OUT</button></div><div class="theme-switcher"><button class="btn-theme light-mode active"data-theme="light">☀️</button> <button class="btn-theme dark-mode"data-theme="dark">🌙</button></div></div><div class="list-screen"><div class="box-screen setting"data-screen="setting">⚙️</div><div class="box-screen main"data-screen="main">🏠</div><div class="box-screen online"data-screen="online">📡</div></div><div class="content-screen"><div class="screen screen-setting"><div class="box custom-name show"><p>Tên Hiển Thị</p><input class="input-custom-name tp-input"placeholder="Nhập tên gọi..."></div></div><div class="screen screen-main active"><div class="list-function active"></div><div class="layout-function"><div class="back">Quay lại Menu</div><div class="box flash_sale"id="flash_sale_layout"><h3 style="margin-bottom:20px;text-align:center;color:var(--tp-primary)">Flash Sale</h3><div class="program_id"style="margin-bottom:15px"><label>Link Chương Trình</label> <input class="product_url tp-input"placeholder="Paste link/ID..."><div class="platform flex flex-row"style="margin-top:10px;display:flex;gap:10px"><button class="tp-btn ghost shopee active"style="flex:1">SHOPEE</button> <button class="tp-btn ghost tiktok"style="flex:1">TIKTOK</button></div></div><div class="input_prompt"><div class="prompt_value shopee_prompt active"><input type="number"class="value-count tp-input"placeholder="Số lượng khung"> <textarea class="value-flashsale tp-input"placeholder="Tên SP & Số lượng..."></textarea></div></div><button class="excuse-button action-btn tp-btn primary"style="width:100%;margin-top:15px"data-action="flash_sale">Kích Hoạt 🚀</button></div><div class="box doi_hinh_phan_loai show"id="doi_hinh_phan_loai_layout"><h3 style="margin-bottom:20px;text-align:center;color:var(--tp-primary)">Đổi Hình</h3><div class="product_info"><label>Danh sách ID</label> <textarea class="product_url tp-input"placeholder="Mỗi dòng 1 ID..."></textarea></div><div class="dynamic-upload-container"></div><button class="excuse-button action-btn tp-btn primary"style="width:100%;margin-top:15px"data-action="doi_hinh_phan_loai">Bắt Đầu ⚡</button></div></div></div><div class="screen screen-online"><div class="server-status"style="text-align:center;margin-bottom:20px"><p>Trạng Thái: <span class="status-text tp-tag red">Offline</span></p><p style="font-size:11px;color:var(--tp-text-sub);margin-top:5px">URL: <span class="url-text">...</span></p></div><div class="box auto-save-check-in show"><label class="tp-checkbox"><input type="checkbox"class="input-auto-save-check-in"> <span class="checkmark"></span> <span class="label-text">Tự Động Check-in</span></label></div></div></div></div><div class="tp-container tp-chat-panel"id="tpChatPanel"><div class="tp-chat-header"><div class="tp-chat-mode-switch"><button class="tp-mode-btn active"data-mode="ai">🤖 AI</button> <button class="tp-mode-btn"data-mode="global">🌏 Global</button></div><div style="display:flex;gap:5px"><button class="tp-btn icon-only ghost"id="clearChat"title="Clear">🗑️</button></div></div><div class="tp-chat-body"id="tpChatBody"><div class="tp-msg system">Xin chào! Tôi có thể giúp gì?</div></div><div class="tp-chat-footer"><input type="file"id="chatFileInput"style="display:none"multiple="multiple"><div class="tp-upload-progress"id="chatUploadProgress"></div><div class="tp-chat-input-area"><button class="tp-btn ghost icon-only"id="btnChatAttach"title="Gửi File"style="width:30px;height:30px;padding:0">📎</button> <textarea class="tp-chat-textarea"id="tpChatInput"placeholder="Nhập tin nhắn..."rows="1"></textarea> <button class="tp-btn primary icon-only"id="tpChatSend"style="width:32px;height:32px;padding:0">➤</button></div></div></div>`;

    // Khởi tạo biến toàn cục
    var INFO_PAGE = null;
    // --- KHU VỰC ĐỊNH NGHĨA CÁC HÀM CHỨC NĂNG --- (Đã chuyển lên trên func_list)
    // var funcTest = () => {
    //     boxAlert("Hàm thử nghiệm ĐÃ CHẠY", "success");
    // }

    var doi_hinh_phan_loai = () => {
      boxAlert("ĐỔI HÌNH PHÂN LOẠI");

      var multi_process = false;

      var id_sanpham = $(".tp-container.tp-main .layout-function #doi_hinh_phan_loai_layout .product_info .product_url").val().trim();

      if (id_sanpham.length > 0) {
        multi_process = true;
        //Xử lý đa ID
      }

      var data_files = [];

      var box_file = $(".tp-container.tp-main .layout-function #doi_hinh_phan_loai_layout .input_prompt .dynamic-upload-container .file-list .file-item").files;
      $.each(box_file, (i, v) => {
        data_files.push(box_file[i]);
      });
    }

    var lay_ma_sanpham = () => {
      boxAlert("Lấy Mã Sản Phẩm");
      var page = getPageDomain();
      page == "shopee" ? shopee() : page == "tiktok" ? tiktok() : page == "lazada" ? lazada() : "";

      async function shopee() {
        var mode = $(".product-list-section.product-and-pagination-wrap-v2").hasClass("grid-mode") ? "grid" : "list";

        var productID = [];


        if (mode == "grid") {
          var box = $(".product-grid-view .product-item");
          var indexBox = 0;

          function nextBox() {
            if (indexBox >= box.length) {
              boxToast("Đã sao chép tất cả mã của sản phẩm đã chọn", "success");
              return;
            }

            var checkBox = box.eq(indexBox).find(".product-checkbox input");
            if (checkBox.prop("checked")) {
              productID.push(checkBox.attr("name"));
            }

            indexBox++;
            nextBox();
          }
          nextBox();
        } else if (mode == "list") {
          var parent_box = $("table.eds-table__body tbody tr")
          var indexParentBox = 0;

          function nextParentBox() {
            if (indexParentBox > parent_box.length) {
              boxToast("Đã sao chép tất cả mã của sản phẩm đã chọn", "success");
              return;
            }
            var id = parent_box.eq(indexParentBox).find(".product-variation-item .item-id").text();

            id = id.replace("ID Sản phẩm:", "");

            productID.push(id);

            indexParentBox++;
            nextParentBox();
          }

          nextParentBox();
        }

        navigator.clipboard.writeText(productID.join("\n"));
      }

    }

    /**
     * @func flash_sale
     * @description 'Làm chương trình khuyến mãi'
     */
    var flash_sale = (run = false) => {
      boxAlert("FLASH SALE");

      // Kiểm tra nếu là cấu hình hoặc chạy

      if (!run) {
        var platform = "none",
          id = "none",
          data = "none",
          length = "none";
        platform = $(".tp-container.tp-main .layout-function #flash_sale_layout .platform label.active").text().toLowerCase() || "none";
        id = $(".tp-container.tp-main .layout-function #flash_sale_layout .current_id span").text() || "none";
        data = platform == "shopee" ? $(".tp-container.tp-main .layout-function #flash_sale_layout .input_prompt .shopee_prompt textarea").val() || "none" : platform == "tiktok" ? $(".tp-container.tp-main .layout-function #flash_sale_layout .input_prompt .tiktok_prompt textarea").val() || "none" : "none";
        length = platform == "shopee" ? $(".tp-container.tp-main .layout-function #flash_sale_layout .input_prompt .shopee_prompt input").val() || "none" : platform == "tiktok" ? data.split("\n").length || "none" : "none";

        // if(platform == "none" || id == "none" || data == "none" || length == "none"){
        //   boxToast("Có giá trị không hợp lệ", "error");
        //   return;
        // }

        data = data.split("\n");

        var obj_program = {};

        if (platform == "shopee") {
          obj_program = {
            platform: platform,
            id: id,
            data: data,
            length: length,
            index: 0,
          }
        } else if (platform == "tiktok") {
          obj_program = {
            platform: platform,
            id: id,
            data: data,
            length: length,
            index: 0,
          }
        }

        setConfig("continue_function", "flashsale");
        setConfig("status_running", "false");
        setConfig("data_flashsale", JSON.stringify(obj_program));

        var url = platform == "shopee" ? `https://banhang.shopee.vn/portal/marketing/shop-flash-sale/create?from=${id}` : platform == "tiktok" ? `https://seller-vn.tiktok.com/promotion/marketing-tools/flash-sale/create?duplicateId=${id}&back=1` : "";

        if (location.href.toString().includes(url))
          flash_sale(true);
        else
          window.open(`${url}`, "_blank");
      } else {
        // Nếu như đang không chạy
        if (getConfig("status_running") == "false") {
          // setConfig("status_running", "true");
          flash_sale.shopee = () => {
            var data_flashsale = JSON.parse(getConfig("data_flashsale"));

            // Kiểm tra ID chương trình flash sale, nếu không đúng
            if (data_flashsale.id != location.href.toString().split("/")[location.href.toString().split("/").length - 1].replace("create?from=", "")) {
              boxToast("Đây không phải chương trình flash sale bạn đã cung cấp", "error");
              swal.fire({
                icon: 'error',
                title: 'Sai Chương Trình Flash Sale',
                text: 'Đây không phải chương trình flash sale bạn đã cung cấp',
                showCancelButton: true,
                showDenyButton: true,
                confirmButtonText: "Bỏ Qua Lần Này",
                denyButtonText: "Chuyển Hướng Tới Chương Trình",
                cancelButtonText: "Hủy Thao Tác",
              }).then((result) => {
                if (result.isConfirmed) {
                  // var config = JSON.parse(getConfig("data_flashsale"));
                  // console.log(config);
                  // config.id = location.href.toString().split("/")[location.href.toString().split("/").length - 1];
                  // console.log(config);

                  // setConfig("data_flashsale", config);

                  boxToast("Chương trình sẽ bỏ qua lần chạy này", "info")
                } else if (result.isDenied) {
                  var config = JSON.parse(getConfig("data_flashsale"));

                  var id = config.id;
                  var platform = config.platform;

                  var url = platform == "shopee" ? `https://banhang.shopee.vn/portal/marketing/shop-flash-sale/create?from=${id}` : platform == "tiktok" ? `https://seller-vn.tiktok.com/promotion/marketing-tools/flash-sale/create?duplicateId=${id}&back=1` : "";

                  window.open(`${url}`, "_blank");
                } else {
                  flash_sale.clearing();
                }
              });
              return;
            }
            // Nếu ID chương trình đã đúng
            else {
              var data_flashsale = JSON.parse(getConfig("data_flashsale"));
              if (data_flashsale.length > 0) {
                console.log(data_flashsale);

                var data = data_flashsale.data;

                var list_name = [],
                  list_quantity = [];
                $.each(data, (i, v) => {
                  var detail = v.split("\t");

                  list_name.push(detail[0].trim());
                  list_quantity.push(detail[1].trim());
                });

                waitForElement($("body"), ".products-container-content .table-card .inner-row", async function(e) {
                  await delay(1000)
                  var box = $(".products-container-content .table-card .inner-row");

                  var selected_day = false;

                  var indexBox = 0;
                  async function nextBox() {
                    if (indexBox >= box.length) {
                      // Chọn ngày và bật khi chọn các sản phẩm hoàn tất
                      simulateReactEvent($(".basic-info-wrapper .info-item").eq(0).find(".info-item-content button"), "click");

                      await delay(2000);

                      var select_day = $(".eds-modal__content.eds-modal__content--normal");
                      select_day = select_day.eq(select_day.length - 1);

                      var picker_day = select_day.find(".eds-modal__body .main")
                      var left_day = picker_day.find(".left"),
                        right_day = picker_day.find(".right");

                      var left_header = left_day.find(".eds-picker-header");
                      var prev_year = left_header.find("i").eq(0);
                      var prev_month = left_header.find("i").eq(1);
                      var next_year = left_header.find("i").eq(2);
                      var next_month = left_header.find("i").eq(3);

                      var picker_date_row = left_day.find(".eds-date-table__rows .eds-date-table__row");

                      var indexRow = 0;
                      async function nextRow() {
                        if (indexRow >= picker_date_row.length || selected_day) {
                          return;
                        }
                        var picker_date_cell = picker_date_row.eq(indexRow).find(".eds-date-table__cell");

                        var indexCell = 0;
                        async function nextCell() {
                          if (indexCell >= picker_date_cell.length || selected_day) {
                            indexRow++;
                            nextRow();
                            return;
                          }

                          var check_date = picker_date_cell.eq(indexCell).find(".date-text").text();
                          var now_date = new Date().getDate();

                          if (check_date < now_date) {
                            indexCell++;
                            nextCell();
                            return;
                          }

                          if (picker_date_cell.eq(indexCell).hasClass("month-end").length > 0) {
                            simulateReactEvent(next_month, "click");
                            indexRow = 0;
                            nextRow();
                          }

                          if (picker_date_cell.eq(indexCell).find(".timeslots.valid").length > 0 && !selected_day) {
                            simulateReactEvent(picker_date_cell.eq(indexCell), "click");
                            selected_day = true;
                          }

                          if (selected_day) {
                            waitForElement(right_day, ".eds-table__body-container .eds-table__body .eds-table__row", async function(e) {
                              simulateReactEvent(right_day.find(".eds-table__body-container .eds-table__body .eds-table__row").eq(0).find("input"), "click");
                              await delay(200);
                              console.log(select_day.find(".eds-modal__footer .footer-action .confirm-btn"));
                              simulateReactEvent(select_day.find(".eds-modal__footer .footer-action .confirm-btn"), "click");
                              await delay(200);
                              $.each($(".panel-actions .action-button"), async (i, v) => {
                                console.log($(v).text().toLowerCase());
                                if ($(v).text().toLowerCase().replace("vui lòng lựa chọn khung giờ", "").trim() == "bật") {
                                  console.log(v);
                                  simulateReactEvent($(v).find("button"), "click");
                                  return;
                                }
                              });

                              var data_flashsale = JSON.parse(getConfig("data_flashsale"));
                              data_flashsale.length -= 1;

                              setConfig("data_flashsale", JSON.stringify(data_flashsale));

                              await delay(2000);
                              window.location.reload();
                              // simulateReactEvent($(".shopee-fixed-bottom-card.bottom-card .confirm-btn buton"), "click");
                            });
                          }

                          indexCell++;
                          nextCell();
                        }

                        nextCell();

                        indexRow++;
                        nextRow();
                      }

                      nextRow();
                      return;
                    }

                    var checked = box.eq(indexBox).find(".item-selector input.eds-checkbox__input")
                    var name = box.eq(indexBox).find(".variation .ellipsis-content").text();
                    var giaGoc = box.eq(indexBox).find(".original-price").text();
                    var soLuongKM = box.eq(indexBox).find(".campaign-stock .form-item input");
                    var tonKho = box.eq(indexBox).find(".current-stock").text();

                    if (list_name.includes(name) && tonKho > list_quantity[list_name.indexOf(name)]) {
                      checked.trigger("click");
                      checked.val("true");
                      await delay(100);
                      simulateClearReactInput(soLuongKM);
                      simulateReactInput(soLuongKM, list_quantity[list_name.indexOf(name)]);
                    }

                    await delay(10);

                    indexBox++;
                    nextBox();
                  }

                  nextBox();
                }, {
                  once: true
                })
              } else {
                boxToast("Đã hoàn tất tất cả sản phẩm cần chạy", "success");
                flash_sale.clearing();
              }

            }

            // flash_sale.clearing();
          }

          flash_sale.tiktok = () => {
            console.log("TIKTOK");

            flash_sale.clearing();
          }

          flash_sale.lazada = () => {
            console.log("LAZADA");
            flash_sale.clearing();
          }

          flash_sale.clearing = () => {
            var config = ["continue_function", "status_running", "data_flashsale"];
            $.each(config, (i, v) => {
              localStorage.removeItem(`TP_CONFIG_${config[i]}`);
            });
          }

          var page = getPageDomain();

          page == "shopee" ? flash_sale.shopee() : page == "tiktok" ? flash_sale.tiktok() : page == "lazada" ? flash_sale.lazada() : "";

        }
      }
    }

    /**
     * @func gia_duoi
     * @description 'Sửa giá khuyễn mãi bằng giá đuôi'
     */
    var gia_duoi = () => {
      boxAlert("SỬA GIÁ THEO GIÁ ĐUÔI", "info");

      var page = getPageDomain();

      page == "shopee" ? shopee() : page == "tiktok" ? tiktok() : page == "lazada" ? lazada() : "";

      function lamGia(gia) {
        var giaDuoi = tachGia(gia).giaDuoi;

        if (parseInt(giaDuoi) == 0) {
          giaDuoi = Math.round(parseInt(flatPrice(gia)) - 1000);
          boxToast(`Giá đuôi đã được điều chỉnh = ${giaDuoi} do không tìm thấy giá đuôi`);
        } else if (parseInt(giaDuoi) < parseInt(flatPrice(gia)) / 2) {
          giaDuoi = Math.round((parseInt(flatPrice(gia)) / 2) - 1000);
          boxToast(`Giá đuôi đã được điều chỉnh = ${giaDuoi} do giảm quá 50%`, "warning");
        }

        return giaDuoi;
      }

      async function shopee() {
        var box = $(".discount-items .discount-item-component");
        if (box.length == 1) {
          boxAlert("Không tìm thấy sản phẩm");
          boxToast("Không tìm thấy sản phẩm", "error");
          return;
        }

        var indexBox = 0;

        async function nextBox() {
          if (indexBox > box.length) {
            boxAlert("Đã hoàn tất cập nhật giá");
            boxToast("Đã hoàn tất cập nhật giá");
            return;
          }

          if (!box.eq(indexBox).find(".eds-checkbox.discount-item-selector input").prop("checked")) {
            indexBox++;
            nextBox();
            return;
          }

          var varianty = box.eq(indexBox).find(".discount-edit-item-model-component");

          var indexVarianty = 0;

          async function nextVarianty() {
            if (indexVarianty > varianty.length) {
              return;
            }

            var variant_name = varianty.eq(indexVarianty).find(".item-content.item-variation");
            console.log(variant_name.text());
            var variant_current_price = varianty.eq(indexVarianty).find(".item-content.item-price");
            var variant_discount_price = varianty.eq(indexVarianty).find(".eds-input.currency-input input");
            var variant_discount_percent = varianty.eq(indexVarianty).find(".eds-input.discount-input input");

            var variant_switch = varianty.eq(indexVarianty).find(".item-content.item-enable-disable");

            if (variant_switch.find(".eds-switch--disabled").length == 0) {
              if (variant_switch.find(".eds-switch--close").length > 0) {
                simulateReactEvent(variant_switch.find(".eds-switch--close"), "click");
              }
            } else {
              indexVarianty++;
              nextVarianty();
              return;
            }

            await delay(500);

            var gia = lamGia(variant_current_price.text());

            variant_discount_price.val(gia);
            simulateReactEvent(variant_discount_price, "input");

            varianty.eq(indexVarianty).addClass("tp-success-bg");

            indexVarianty++;
            await nextVarianty();
          }
          await nextVarianty();
          indexBox++;
          await nextBox();
        }
        await nextBox();
      }

      async function tiktok() {

        async function processProductsByLastFlag() {
          let scrolledWithoutNewProducts = false;
          let consecutiveSkippedProducts = 0; // Biến đếm số sản phẩm liên tiếp đã có giá khuyến mãi
          const MAX_CONSECUTIVE_SKIPS = 5; // Ngưỡng: 5 sản phẩm liên tiếp đã có giá

          let productProcesscount = 0

          while (true) {
            productProcesscount++;
            var allProductRows = $(".theme-arco-table-content-inner .theme-arco-table-body").find("div div > div");
            let nextProductToProcess = null;

            let lastFlaggedRow = allProductRows.filter(".tp-flag").last();
            let startIndex = 0;

            if (lastFlaggedRow.length > 0) {
              startIndex = allProductRows.index(lastFlaggedRow) + 1;
            }

            for (let i = startIndex; i < allProductRows.length; i++) {
              let currentRow = $(allProductRows).eq(i);

              if (!currentRow.is(".theme-arco-table-tr, .theme-arco-table-row-custom-expand, .styled")) {
                // Nếu là hàng không hợp lệ, không tính vào số lượng skipped liên tiếp
                // nhưng vẫn cần chuyển sang hàng tiếp theo để tìm sản phẩm
                continue;
              }

              // Nếu hàng đã có tp-flag (trường hợp DOM thay đổi)
              if (currentRow.hasClass("tp-flag")) {
                // Nếu hàng này đã được đánh dấu, chúng ta vẫn xem xét nó là "skipped" theo một nghĩa nào đó
                // Tuy nhiên, để chính xác theo yêu cầu "có giá khuyến mãi", chúng ta sẽ xử lý riêng
                continue;
              }

              // Đây là hàng hợp lệ và chưa được xử lý (chưa có tp-flag)
              nextProductToProcess = currentRow;
              break;
            }

            if (nextProductToProcess) {
              // Đã tìm thấy một sản phẩm chưa xử lý (chưa có tp-flag)
              scrolledWithoutNewProducts = false;
              consecutiveSkippedProducts = 0; // Reset đếm khi tìm thấy sản phẩm cần xử lý

              nextProductToProcess.addClass("tp-flag");

              console.log(nextProductToProcess);

              var nameElement = nextProductToProcess.find(".theme-arco-table-td").eq(1).find("span");
              var productName = nameElement.text().trim();

              var activeStatus = nextProductToProcess.find(".theme-arco-table-td").eq(nextProductToProcess.find(".theme-arco-table-td").length - 1).find("button[role='switch']");

              // Kiểm tra và kích hoạt khuyến mãi để thao tác
              if (!activeStatus.attr("aria-checked"))
                simulateReactEvent(activeStatus, "click");


              var currentPrice = nextProductToProcess.find(".theme-arco-table-td").eq(2).find("span p");
              var promotionPrice = nextProductToProcess.find(".theme-arco-table-td").eq(3).find("input");

              if (promotionPrice.length > 0) {
                if (promotionPrice.val().length > 0) {
                  consecutiveSkippedProducts++; // Tăng đếm khi sản phẩm đã có giá
                  // await delay(50); 
                } else { // Chưa có giá khuyến mãi, tiến hành nhập
                  var gia = lamGia(flatPrice(currentPrice.text()));

                  console.log(gia);

                  promotionPrice.get(0).scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                  });

                  if (parseInt(gia) == 0) {
                    consecutiveSkippedProducts = 0; // Reset đếm khi bỏ qua vì giá 0

                    // Tắt khuyến mãi cho phân loại không có giá đuôi
                    simulateReactEvent(activeStatus, "click");
                    // await delay(50);
                  } else {
                    // Tương tác UI và chờ đợi
                    simulateReactEvent(promotionPrice, "focus");
                    // await delay(300);
                    // await delay(500);

                    // simulateReactInput(promotionPrice, gia, 50);

                    simulateReactInput(promotionPrice, gia);
                    simulateReactEvent(promotionPrice, "blur");

                    var formattedGia = gia.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    consecutiveSkippedProducts = 0; // Reset đếm khi sản phẩm được xử lý
                  }
                }
              } else {
                consecutiveSkippedProducts = 0; // Reset đếm khi không có ô nhập
              }

              // Kiểm tra điều kiện dừng nếu đã có N sản phẩm liên tiếp bị bỏ qua vì đã có giá
              if (consecutiveSkippedProducts >= MAX_CONSECUTIVE_SKIPS) {
                boxToast(`Đã hoàn tất cập nhật giá! ${MAX_CONSECUTIVE_SKIPS} sản phẩm liên tiếp đã có giá sẵn.`, "success");
                break; // Thoát vòng lặp chính
              }

              await delay(150);

            } else {
              // Không tìm thấy sản phẩm chưa xử lý nào trên DOM hiện tại (tất cả đã được gắn cờ hoặc không hợp lệ)
              // Đây là lúc ta xác định tất cả các hàng hợp lệ đang hiển thị đều đã được xử lý.
              // Reset consecutiveSkippedProducts ở đây vì chúng ta đang cuộn xuống, không phải bỏ qua liên tiếp
              consecutiveSkippedProducts = 0;

              window.scrollTo(0, document.body.scrollHeight);
              await delay(3000);

              var reloadedProductRows = $(".theme-arco-table-content-inner .theme-arco-table-body").find("div div > div");

              let newUnprocessedFoundAfterScroll = false;
              for (let i = 0; i < reloadedProductRows.length; i++) {
                let row = $(reloadedProductRows).eq(i);
                if (row.is(".theme-arco-table-tr, .theme-arco-table-row-custom-expand, .styled") && !row.hasClass("tp-flag")) {
                  newUnprocessedFoundAfterScroll = true;
                  break;
                }
              }

              if (!newUnprocessedFoundAfterScroll) {
                if (scrolledWithoutNewProducts) {
                  boxToast("Đã hoàn tất cập nhật giá cho tất cả sản phẩm có thể tìm thấy!", "success");
                  break;
                } else {
                  scrolledWithoutNewProducts = true;
                }
              } else {
                scrolledWithoutNewProducts = false;
              }
            }
          }

        }

        processProductsByLastFlag();
      }

      async function lazada() {
        boxAlert(`Cập nhật giá đuôi`)
        var row = $(".next-table-row");
        var price = [];

        var indexRow = 0;
        async function nextRow() {
          if (indexRow >= row.length) {
            boxToast(`Đã cập nhật giá đuôi`, "success");
            return;
          }

          var gia = row.eq(indexRow).find("input").val();
          var giaKM = lamGia(flatPrice(gia));

          var name = row.eq(indexRow).find("td:nth-child(1) button span").text();

          if (row.eq(indexRow).find("td.special_price").has("button.next-btn").length == 0) {
            var currentPrice = parseInt($(".special-price .number-text-scope").attr("title"));
            if (currentPrice != giaKM) {
              var price = $(".special-price .number-text-scope");

              console.log(price);

              simulateReactEvent(price, "mouseover");

              await delay(500);

              simulateReactEvent($(".next-overlay-wrapper .next-balloon-content button:nth-child(1) i"), "click");
            }
          } else {
            row.eq(indexRow).find("td.special_price button.next-btn").click();
          }

          await delay(200);

          var balloon = $(".next-overlay-wrapper .next-balloon-content").last();

          console.log(balloon);

          var inputPrice = balloon.eq(0).find(".money-number-picker input");
          var buttonClick = balloon.eq(0).find(".action-wrapper button:nth-child(1)");

          simulateClearReactInput(inputPrice);

          inputPrice.select();

          inputPrice.attr("value", giaKM);

          inputPrice.val(giaKM);

          inputPrice.blur();

          await delay(200);

          buttonClick.click();

          await delay(500);

          indexRow++;
          nextRow();
        }
        nextRow();
      }
    }
    // -------------------------------------------------------------------------

    // Định nghĩa các chức năng
    const func_list = [
      // {
      //   name: "Thử Nghiệm",
      //   func: funcTest,
      //   func_name: "funcTest",
      //   layout_name: "",
      //   platform: ["*"]
      // },
      {
        name: "Sửa Giá Theo Giá Đuôi",
        func: gia_duoi,
        func_name: "gia_duoi",
        layout_name: "",
        platform: ["shopee", "tiktok", "lazada"]
      },
      // {
      //   name: "Chương Trình Flash Sale",
      //   func: flash_sale,
      //   func_name: "flash_sale",
      //   layout_name: "flash_sale",
      //   platform: ["shopee", "tiktok"]
      // },
      {
        name: "Lấy Mã Sản Phẩm",
        func: lay_ma_sanpham,
        func_name: "lay_ma_sanpham",
        layout_name: "",
        platform: ["shopee"]
      },
      {
        name: "Đổi Hình Phân Loại Nhanh",
        func: doi_hinh_phan_loai,
        func_name: "doi_hinh_phan_loai",
        layout_name: "doi_hinh_phan_loai",
        platform: ["shopee"]
      }
    ];

    /**
     * @func excuseFunction
     * @description 'Tìm và thực thi hàm dựa trên func_name'
     */
    function excuseFunction(name) {
      var func = func_list.find(el => el.func_name === name);
      if (func && func.func)
        func.func();
      else {
        boxAlert(`Không tìm thấy hàm thực thi cho: ${name}`, "error");
        return;
      }
    }

    function getPageDomain() {
      return (INFO_PAGE.url.host.split(".")[INFO_PAGE.url.host.split(".").length - 2]);
    }

    function flatPrice(price) {
      return ((price.replace(/[,.₫]/g, '')).trim());
    }

    /**
     * @function findElement
     * @description Tìm kiếm phần tử DOM hỗ trợ kết hợp CSS chuẩn, tiền tố tùy chỉnh và Computed Style (cs).
     * @param {string} selectorString - Chuỗi tìm kiếm kết hợp (ví dụ: '.product[cs:color:purple][tx:Xem chi tiết]').
     * @param {object} context - Phạm vi tìm kiếm (mặc định là document).
     * @returns {object} jQuery object chứa các phần tử được tìm thấy.
     */
    function findElement(selectorString, context = document) {
      const $context = $(context);
      let finalSelector = selectorString;
      let textToFind = null;
      let styleFilters = []; // Mảng chứa các bộ lọc CSS Style

      // --- BƯỚC 1: Xử lý tiền tố tùy chỉnh (tx, cs) và loại bỏ chúng khỏi chuỗi selector CSS ---

      // 1a. Xử lý tiền tố Text (tx)
      const textMatch = finalSelector.match(/\[tx:([^\]]+)\]/i);
      if (textMatch) {
        textToFind = textMatch[1].trim();
        finalSelector = finalSelector.replace(textMatch[0], '');
        console.log(`[findElement] Trích xuất Text (tx): "${textToFind}".`);
      }

      // 1b. Xử lý tiền tố Computed Style (cs:property:value)
      // Pattern: [cs:prop:value] hoặc [cs:prop:value1:value2] (cho giá trị có dấu :)
      const styleMatches = finalSelector.match(/\[cs:([^\]]+)\]/ig);
      if (styleMatches) {
        styleMatches.forEach(match => {
          // Tách 'prop:value' từ [cs:prop:value]
          const content = match.slice(4, -1);
          const parts = content.split(':');

          if (parts.length >= 2) {
            const property = parts[0].trim();
            // Nối các phần tử còn lại thành giá trị, phòng trường hợp giá trị chứa dấu ':'
            const value = parts.slice(1).join(':').trim();
            styleFilters.push({
              property: property,
              value: value
            });
          }
          finalSelector = finalSelector.replace(match, '');
        });
        console.log(`[findElement] Trích xuất ${styleFilters.length} bộ lọc Style (cs).`);
      }

      // --- BƯỚC 2: Chuyển đổi các tiền tố thuộc tính DOM thành cú pháp CSS Selector ---

      // a) Input Type (tp:submit) -> [type="submit"]
      let tempSelector = finalSelector.replace(/\[tp:([^\]]+)\]/ig, (match, value) => `[type="${value.trim()}"]`);

      // b) Role (rl:button) -> [role="button"] (Accessibility)
      tempSelector = tempSelector.replace(/\[rl:([^\]]+)\]/ig, (match, value) => `[role="${value.trim()}"]`);

      // c) Aria-Label (lb:Giỏ Hàng) -> [aria-label="Giỏ Hàng"] (Accessibility)
      finalSelector = tempSelector.replace(/\[lb:([^\]]+)\]/ig, (match, value) => `[aria-label="${value.trim()}"]`);

      // --- BƯỚC 3: Thực hiện tìm kiếm bằng CSS Selector chuẩn ---
      console.log(`[findElement] CSS Selector cuối cùng được sử dụng: ${finalSelector}`);
      let $results = $context.find(finalSelector);

      // --- BƯỚC 4: Áp dụng bộ lọc Computed Style (cs) ---
      if (styleFilters.length > 0) {
        console.log(`[findElement] Áp dụng bộ lọc Computed Style.`);
        $results = $results.filter(function() {
          const $this = $(this);
          // Kiểm tra từng bộ lọc Style
          return styleFilters.every(filter => {
            // Sử dụng .css() của jQuery để lấy giá trị Computed Style
            const computedValue = $this.css(filter.property);

            // Lưu ý: Màu sắc thường được trả về dưới dạng RGB (ví dụ: rgb(128, 0, 128) thay vì 'purple')
            // Chúng ta cần so sánh giá trị computed với giá trị mong muốn.
            return computedValue && computedValue.toLowerCase() === filter.value.toLowerCase();
          });
        });
      }

      // --- BƯỚC 5: Áp dụng bộ lọc Text (tx) ---
      if (textToFind) {
        console.log(`[findElement] Áp dụng bộ lọc Text (tx).`);
        $results = $results.filter(function() {
          // Đảm bảo phần tử chứa text
          return $(this).text().includes(textToFind);
        });
      }

      console.log(`[findElement] Tìm thấy ${$results.length} phần tử.`);
      return $results;
    }

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

    // =========================================================================
    // KHU VỰC QUẢN LÝ CẤU HÌNH
    // =========================================================================

    /**
     * @func getConfig
     * @description 'Lấy cấu hình'
     */
    var getConfig = (config_name) => {
      var config_value = localStorage.getItem(`TP_CONFIG_${config_name}`);
      if (config_value === null) return null;

      try {
        return JSON.parse(config_value);
      } catch (e) {
        console.error(`Lỗi parse cấu hình ${config_name}`, e);
        return null;
      }
    }

    /**
     * @func setConfig
     * @description 'Ghi cấu hình'
     */
    var setConfig = (config_name, config_value) => {
      localStorage.setItem(`TP_CONFIG_${config_name}`, JSON.stringify(config_value));
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

    /**
     * @func gopGia
     * @description 'Gộp giá đầu và giá đuôi để được giá mới'
     * @param giaDau 'params0'
     * @param giaDuoi 'params1'
     * @return {
     *  giaDau: giaDau.toString(),
     *  giaDuoi: giaDuoi.toString(),
     *  gia: result.toString()
     * };
     */
    function gopGia(giaDau, giaDuoi) {
      // Chuẩn hóa đầu vào
      if (giaDau == null || giaDuoi == null) return null;
      var sD = String(Math.abs(Math.trunc(giaDau)));
      var sA = String(Math.abs(Math.trunc(giaDuoi)));
      var L = sD.length;

      // 1) Lấy prefix ban đầu (floor(len/2)), tối thiểu 2 chữ số
      let prefixLen = Math.floor(L / 2);
      if (prefixLen < 2) prefixLen = Math.min(2, L); // không vượt quá L
      let prefixStr = sD.slice(0, prefixLen);
      var rightOfPrefix = sD.slice(prefixLen); // phần còn lại của giaDau

      // 2) Nếu phần còn lại có chữ số khác 0 thì +1 cho prefix
      var hasNonZeroInRight = /[1-9]/.test(rightOfPrefix);
      let prefixNum = prefixStr ? parseInt(prefixStr, 10) : 0;
      if (hasNonZeroInRight) prefixNum = prefixNum + 1;

      // 3) Lấy suffix = giaDuoi bỏ trailing zeros
      let suffix = sA.replace(/000$/, '');
      if (suffix === '') suffix = '0';

      // 4) Lặp điều chỉnh cho tới khi vừa (có guard để tránh vòng vô hạn)
      let guard = 0;
      while ((prefixNum.toString().length + suffix.length) > L && guard < 200) {
        guard++;
        var totalLen = prefixNum.toString().length + suffix.length;
        var over = totalLen - L;

        // Thử cắt prefix nếu có thể (phải giữ >= 2 chữ số)
        var prefixCurStr = prefixNum.toString();
        if (prefixCurStr.length - over >= 2) {
          // Bỏ over chữ số cuối của prefix, rồi +1 (làm tròn như bạn yêu cầu)
          var newPref = prefixCurStr.slice(0, -over);
          prefixNum = (parseInt(newPref, 10) || 0) + 1;
          continue; // kiểm tra lại
        }

        // Nếu không cắt được prefix (đã còn 2 chữ số) -> cắt suffix từ phải qua trái
        // Cho tới khi vừa hoặc suffix chỉ còn 1 chữ số
        while ((prefixNum.toString().length + suffix.length) > L && suffix.length > 1) {
          suffix = suffix.slice(0, -1);
        }
        // Sau khi cắt xong, làm tròn suffix lên +1
        suffix = String((parseInt(suffix, 10) || 0) + 1);

        // Sau khi tăng suffix có thể làm phát sinh overflow (tăng độ dài suffix)
        // -> vòng while bên ngoài sẽ kiểm tra lại và tiếp tục điều chỉnh nếu cần
      }

      if (guard >= 200) {
        // Không thể điều chỉnh trong giới hạn hợp lý
        throw new Error('Không thể gộp theo quy tắc (vòng lặp vượt guard)');
      }

      // 5) Ghép lại: prefix padEnd tới độ dài ban đầu và cộng suffix
      var prefixPad = prefixNum.toString().padEnd(L, '0'); // ví dụ '173' -> '173000'
      var result = parseInt(prefixPad, 10) + parseInt(suffix, 10);

      return {
        giaDau: giaDau.toString(),
        giaDuoi: giaDuoi.toString(),
        gia: result.toString()
      };
    }

    // Tách giá trị thành giá đầu và giá đuôi theo cơ chế gộp
    /**
     * @func tachGia
     * @description 'Tách giá đầu và giá đuôi để được giá mới'
     * @param price 'params0'
     * @return {
     *  gia: gia.toString(),
     *  giaDau: gia_dau_tam.toString(),
     *  giaDuoi: gia_duoi_tam.toString()
     * }
     */
    function tachGia(price) {
      // 1. Chuẩn hóa input
      var gia = price.toString().replace(/[,.]/g, "").trim();

      // 2. Xác định điểm chia ban đầu
      var flag = Math.ceil(gia.length / 2);

      function kiemTraGia(flag) {
        if (flag < 2) {
          // prefix tối thiểu 2 số
          return {
            gia: gia,
            giaDau: parseInt(gia.slice(0, 2).padEnd(gia.length, "0")),
            giaDuoi: parseInt(gia.slice(2).padEnd(gia.length, "0"))
          };
        }

        var gia_dau_tam = parseInt(gia.slice(0, flag).padEnd(gia.length, "0"));
        var gia_duoi_tam = parseInt(gia.slice(flag).padEnd(gia.length, "0"));

        if (gia_dau_tam < gia_duoi_tam) {
          return kiemTraGia(flag - 1);
        } else {
          return {
            gia: gia.toString(),
            giaDau: gia_dau_tam.toString(),
            giaDuoi: gia_duoi_tam.toString()
          };
        }
      }

      return kiemTraGia(flag);
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

    async function getInfoPage() {
      boxAlert(`ĐANG LẤY THÔNG TIN`);
      const info = {};

      info.url = {
        href: window.location.href,
        host: window.location.host,
      };

      info.url.params = {};
      const urlParams = new URLSearchParams(window.location.search);
      for (const [key, value] of urlParams.entries()) {
        info.url.params[key] = value;
      }

      console.log("Thông tin trang hiện tại:", info);
      return info;
    }

    // Biến socket đã được khai báo ở đầu file (var socket = null;) nên nó là toàn cục trong phạm vi UserScript này.
    // Bạn có thể gọi socket.emit() ở bất kỳ hàm nào khác (nhớ kiểm tra if(socket) trước khi dùng).

    /**
     * @func connectServer
     * @description Lấy URL Ngrok từ Cache/GitHub và thiết lập Socket.IO.
     */
    async function connectServer() {

      // Hàm con: Lấy URL mới nhất từ GitHub
      async function getNgrokURL() {
        var time = Date.now();
        const url = `https://pntan.github.io/ngrokServer.json?timestamp=${time}`;

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

      // Hàm con: Vòng lặp thử lại sau delay (1.5 phút)
      function startDelayedRetry() {
        if (retryTimer) return;

        boxAlert(`Mất kết nối. Hệ thống sẽ thử lấy URL mới sau ${RETRY_DELAY / 1000} giây...`, 'info');
        $(".server-status .status-text").text("Đợi thử lại...");
        $(".server-status .url-text").text("");

        retryTimer = setTimeout(async () => {
          retryTimer = null;
          boxAlert("Đang thử kết nối lại...", "info");
          $(".server-status .status-text").text("Đang cập nhật Server...");

          // Lấy URL mới từ GitHub
          const newURL = await getNgrokURL();

          if (newURL) {
            // Thử kết nối với URL mới, đánh dấu là lấy từ GitHub (isFromCache = false)
            initSocket(newURL, false);
          } else {
            // Vẫn không lấy được URL -> Lặp lại vòng lặp delay
            boxAlert("Không lấy được URL mới từ GitHub. Tiếp tục chờ...", "error");
            startDelayedRetry();
          }
        }, RETRY_DELAY);
      }

      /**
       * @func handleCacheFailure
       * @description Logic xử lý thất bại lần đầu tiên (từ Cache)
       */
      async function handleCacheFailure() {
        boxAlert("URL trong Cache có vẻ đã chết. Đang tìm kiếm URL mới ngay lập tức...", "info");
        $(".server-status .status-text").text("Đang tìm kiếm Server...");

        const newURL = await getNgrokURL();

        if (newURL) {
          // Thử kết nối ngay lập tức với URL mới, đánh dấu isFromCache = false
          initSocket(newURL, false);
        } else {
          // GitHub cũng không có link -> Chuyển sang chế độ chờ 90s
          boxAlert("Không lấy được URL mới từ GitHub. Chuyển sang chế độ chờ.", "error");
          // Bắt đầu vòng lặp chờ
          if (!connectionFailedOnce) connectionFailedOnce = true;
          startDelayedRetry();
        }
      }


      // Hàm con: Khởi tạo kết nối Socket
      function initSocket(url, isFromCache) {
        if (socket) {
          socket.off();
          socket.close();
          socket = null;
        }

        boxAlert(`ĐANG THỬ KẾT NỐI ĐẾN: ${url}`, 'log');

        socket = io(url, {
          reconnectionAttempts: 3,
          timeout: 5000,
          transports: ["websocket", "polling"],
          extraHeaders: {
            "ngrok-skip-browser-warning": "69420"
          },
        });

        let toastDisplayedForAttempt = false;

        // --- CÁC SỰ KIỆN LẮNG NGHE ---

        socket.on('connect', () => {
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

        socket.on('connect_error', async (error) => {
          boxAlert(`LỖI KẾT NỐI (${isFromCache ? 'Cache' : 'Mới'}): ${error.message}`, 'warn');

          // FIX: Chỉ hiện Toast Error 1 lần
          if (!toastDisplayedForAttempt) {
            boxToast(`Lỗi kết nối Server! Đang tìm Link mới...`, 'error', 5000);
            toastDisplayedForAttempt = true;
          }

          // Ngắt kết nối hiện tại để xử lý
          socket.off();
          socket.close();

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

        socket.on('disconnect', (reason) => {
          if (reason !== "io client disconnect") {
            boxAlert(`SOCKET MẤT KẾT NỐI: ${reason}`, 'warn');
            $(".server-status .status-text").text("Mất Kết Nối").removeClass("green").addClass("red");
          }
        });
      }

      // --- BẮT ĐẦU LOGIC CHÍNH ---
      if (retryTimer) return;

      const cachedURL = getConfig("server_url");

      if (cachedURL) {
        initSocket(cachedURL, true); // Thử Cache (Kịch bản 1)
      } else {
        const newURL = await getNgrokURL(); // Lấy từ GitHub (Lần đầu chạy)
        if (newURL) {
          initSocket(newURL, false);
        } else {
          // Không có Cache và GitHub cũng không có -> Chuyển sang chế độ chờ
          boxAlert("Không tìm thấy Server. Bắt đầu vòng lặp tìm kiếm.", "error");
          startDelayedRetry();
        }
      }
    }


    // =========================================================================
    // HÀM KHỞI TẠO VÀ LỌC CHỨC NĂNG
    // =========================================================================

    /**
     * @func createFunction
     * @description 'Tạo danh sách chức năng dựa trên nền tảng'
     */
    function createFunction() {
      // Tính toán tên nền tảng hiện tại chỉ MỘT LẦN
      const hostParts = INFO_PAGE.url.host.split(".");
      // Lấy phần tử thứ 2 từ cuối (ví dụ: 'shopee' từ 'www.shopee.vn')
      const currentPlatform = hostParts[hostParts.length - 2];

      boxAlert(`Nền tảng hiện tại: ${currentPlatform}`, "log");

      $(".tp-container.tp-main .content-screen .screen.screen-main .list-function").empty();

      func_list.forEach(el => {
        // Logic lọc tối ưu: (Phải là "*") HOẶC (Phải khớp với nền tảng hiện tại)
        const shouldDisplay = el.platform.includes("*") || el.platform.includes(currentPlatform);

        if (shouldDisplay) {
          console.log("Hiển thị:", el.name);
          // Đảm bảo data-layout được truyền ngay cả khi rỗng
          const layoutAttr = el.layout_name ? `data-layout="${el.layout_name}"` : `data-layout=""`;
          $(".tp-container.tp-main .content-screen .screen.screen-main .list-function").append(`
            <div class="box-function" data-func="${el.func_name}" ${layoutAttr}>
                <p>${el.name}</p>
            </div>
        `);
        }
      });
    }


    /**
     * @func INIT_CONFIG
     * @description 'Khởi tạo cấu hình chương trình'
     */
    function INIT_CONFIG() {
      boxAlert("Đang khởi tạo cấu hình...", "log");

      var theme_mode = () => {
        if (!getConfig("theme_mode"))
          setConfig("theme_mode", "light");

        var current_theme = getConfig("theme_mode");

        $(".tp-container.tp-main .header .theme-switcher .btn-theme").removeClass("active");
        $(`.tp-container.tp-main .header .theme-switcher .${current_theme}-mode`).addClass("active");
        return current_theme;
      }

      var screen_display = () => {
        if (!getConfig("screen_display"))
          setConfig("screen_display", "main")

        var current_screen = getConfig("screen_display");

        $(".tp-container.tp-main .list-screen .box-screen").removeClass("active");
        $(`.tp-container.tp-main .list-screen .box-screen.${current_screen}`).addClass("active");

        $(".tp-container.tp-main .content-screen .screen").removeClass("active");
        $(`.tp-container.tp-main .content-screen .screen.screen-${current_screen}`).addClass("active");
        return current_screen;
      }

      var theme_color = () => {
        var host = INFO_PAGE.url.host;
        host = host.split(".")[host.split(".").length - 2];

        $(".tp-container.tp-main").addClass(`${host}-theme`);
      }

      var custom_name = () => {
        var name = getConfig("custom_name");
        if (name && name.length > 0) {
          $(".tp-container.tp-main .screen.screen-setting input.input-custom-name").val(name);
        } else {
          var randomString = `User${Math.random().toString(36).substring(2, 8)}`;
          setConfig("custom_name", randomString);

          $(".tp-container.tp-main .screen.screen-setting input.input-custom-name").val(randomString);
        }
      }

      var auto_save_check_in = () => {
        var auto_save = getConfig("auto_save_check_in");
        if (auto_save === null)
          setConfig("auto_save_check_in", false);

        auto_save = getConfig("auto_save_check_in");
        $(".tp-container.tp-main .screen.screen-online .box.auto-save-check-in .tp-checkbox input.input-auto-save-check-in").prop("checked", auto_save);
      }

      theme_mode();
      screen_display();
      theme_color();
      custom_name();
      auto_save_check_in();
      return true;
    }

    /**
     * @func INIT_UI
     * @description 'Khởi tạo giao diện chương trình (Chỉ chèn DOM)'
     */
    function INIT_UI() {
      boxAlert("Đang khởi tạo giao diện...", "log");

      var root_div = ["body"].find(id => document.querySelector(id) != null);

      if (!root_div) {
        boxAlert("Không tìm thấy phần tử gốc để chèn giao diện!", "error");
        return null;
      }

      $(root_div).append(`${HTML_UI}`);

      return true;
    }

    /**
     * @func INIT
     * @description 'Khởi tạo chương trình'
     */
    async function INIT() {
      await connectServer();
      // 1. Lấy thông tin trang
      INFO_PAGE = await getInfoPage();

      // 2. Khởi tạo giao diện
      var init_ui = INIT_UI();

      // 3. Khởi tạo cấu hình
      var init_config = INIT_CONFIG();

      // 4. Tạo chức năng (Sau khi INFO_PAGE đã có giá trị)
      if (init_ui) {
        createFunction(); // GỌI HÀM SAU KHI INFO_PAGE CÓ GIÁ TRỊ
      }

      if (init_config && init_ui) {
        boxAlert("KHỞI TẠO TƯƠNG TÁC");
        INIT_FUNCTION();
      }
    }

    /**
     * @func startHeartbeat
     * @description Kích hoạt hoặc TÁI KÍCH HOẠT vòng lặp ping 10s an toàn.
     */
    function startHeartbeat() {
        // QUAN TRỌNG: Xóa interval cũ trước khi tạo mới để tránh chạy song song
        if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
        }

        const sendPing = () => {
            const name = getConfig("custom_name");
            if (!name || name === "Unknown") return;

            if (socket && socket.connected) {
              const now = new Date();
              const todayDate = now.toISOString().split('T')[0];
              const currentTime = now.toLocaleTimeString('en-GB', {
                  hour: '2-digit', minute: '2-digit', second: '2-digit'
              });
                
                socket.emit('client_ping', {
                    name: name,
                    date: todayDate,
                    time: currentTime
                });
            }
        };

        // Bắt đầu vòng lặp Heartbeat (10 giây)
        heartbeatInterval = setInterval(sendPing, 10000); 
        sendPing(); // Gửi ngay lần đầu
        
        console.log("✅ Heartbeat system started.");
    }

    /**
     * @func registerChatEvents
     * @description Tái đăng ký tất cả các sự kiện Socket.IO liên quan đến Chat.
     * QUAN TRỌNG: Phải gỡ listener cũ trước khi tạo listener mới.
     */
    function registerChatEvents() {
      if (!socket || !socket.connected) {
        console.warn("Socket chưa kết nối, không thể đăng ký sự kiện Chat.");
        return;
      }

      // --- BƯỚC 1: GỠ BỎ TẤT CẢ CÁC LISTENER CHAT CŨ ---
      // Sử dụng socket.off() với tên sự kiện để gỡ bỏ chính xác
      socket.off('chat-response');
      socket.off('receive-global-chat');
      socket.off('global-chat-history');

      console.log("🛠️ Tái đăng ký Socket Listeners Chat.");


      // --- BƯỚC 2: ĐĂNG KÝ LISTENER AI CHAT (chat-response) ---
      socket.on('chat-response', (data) => {
        if (CURRENT_CHAT_MODE !== 'ai') return;
        removeTyping(); // Tắt typing indicator (giả định hàm này đã có)

        if (data && data.reply) {

          let contentToDisplay = data.reply;
          let isHtml = false;

          if (data.imageUrl) {
            // Nếu có URL ảnh (tạo bởi Gemini/Imagen), thêm thẻ <img> vào nội dung
            contentToDisplay += `
                <div style="margin-top: 10px; border-top: 1px solid rgba(0,0,0,0.1); padding-top: 10px;">
                    <img src="${data.imageUrl}" class="tp-chat-img" onclick="window.open('${data.imageUrl}')" style="max-width: 100%; border-radius: 8px; cursor: pointer;">
                    <p style="font-size: 11px; margin-top: 5px; color: var(--tp-text-sub);">Click để xem ảnh gốc.</p>
                </div>`;
            isHtml = true;
          }

          // Hiển thị nội dung
          appendMessage(contentToDisplay, 'ai', null, isHtml);

          // Xử lý action (ví dụ: mở giao diện Flash Sale)
          if (data.action) {
            console.log("AI trigger action:", data.action);
            // Thêm nút xác nhận nếu không phải action tạo ảnh
            if (data.action !== 'generate_image') {
              const actionBtn = $(`<button class="tp-btn primary" style="margin-top:5px; width:100%">Thực hiện: ${data.action}</button>`);
              // Giả định hàm excuseFunction đã tồn tại để chạy logic nghiệp vụ
              actionBtn.click(() => excuseFunction(data.action));
              $("#tpChatBody").append(actionBtn);
            }
          }
        } else {
          appendMessage("Lỗi xử lý từ phía Server.", "system");
        }
      });


      // --- BƯỚC 3: ĐĂNG KÝ LISTENER GLOBAL CHAT (Nhận tin nhắn mới) ---
      socket.on('receive-global-chat', (data) => {
        if (CURRENT_CHAT_MODE !== 'global') return;

        const myName = getConfig("custom_name");
        const isMe = data.sender === myName;

        let contentDisplay = data.message;

        // Xử lý nội dung file/ảnh
        if (data.type === 'image') contentDisplay = `<img src="${data.url}" class="tp-chat-img" onclick="window.open('${data.url}')">`;
        else if (data.type === 'file') contentDisplay = `<a href="${data.url}" target="_blank" class="tp-file-attachment">📄 ${data.message} ⬇️</a>`;

        if (isMe) appendMessage(contentDisplay, 'user', null, true);
        else appendMessage(contentDisplay, 'other', data.sender, true);
      });


      // --- BƯỚC 4: ĐĂNG KÝ LISTENER LỊCH SỬ CHAT (Khi mới vào Global Chat) ---
      socket.on('global-chat-history', (history) => {
        if (CURRENT_CHAT_MODE !== 'global') return;
        $("#tpChatBody").empty(); // Xóa tin nhắn cũ trên UI

        history.forEach(data => {
          const myName = getConfig("custom_name");
          const isMe = data.sender === myName;

          let contentDisplay = data.message;
          // Xử lý nội dung file/ảnh
          if (data.type === 'image') contentDisplay = `<img src="${data.url}" class="tp-chat-img" onclick="window.open('${data.url}')">`;
          else if (data.type === 'file') contentDisplay = `<a href="${data.url}" target="_blank" class="tp-file-attachment">📄 ${data.message}</a>`;

          if (isMe) appendMessage(contentDisplay, 'user', null, true);
          else appendMessage(contentDisplay, 'other', data.sender, true);
        });
      });
    }

    /**
     * @func registerAppEvents
     * @description TÁI KÍCH HOẠT TẤT CẢ TÍNH NĂNG CỦA ỨNG DỤNG sau khi CONNECT/RECONNECT
     */
    function registerAppEvents() {
        if (!socket || !socket.connected) return;

        // 1. Kích hoạt Heartbeat/Chấm công tự động
        if(getConfig("auto_save_check_in")) {
            startHeartbeat();
        }
        
        // 2. Tái đăng ký Chat Events (Cần gọi hàm này nếu bạn có logic chat phức tạp)
        // HÀM NÀY PHẢI TỰ GỠ CÁC LISTENER CŨ TRƯỚC KHI TẠO MỚI.
        if (typeof registerChatEvents === 'function') {
            registerChatEvents(); 
        } else {
            console.warn("Hàm registerChatEvents chưa được định nghĩa. Tính năng Chat có thể không hoạt động.");
        }
    }

    // 3. Hàm hiển thị tin nhắn (Render)
    function appendMessage(content, type, senderName = null, isHtml = false) {
      const chatBody = $("#tpChatBody");
      let msgHtml = '';

      // Biến content gốc. Nếu có HTML (ví dụ: thẻ <img>), ta sẽ loại bỏ nó khi lưu vào history.
      const safeContent = content;

      if (type === 'system') {
        const systemContent = $('<div>').text(content).html();
        msgHtml = `<div class="tp-msg system">${systemContent}</div>`;
      } else if (type === 'other') {
        // Tin nhắn từ người dùng khác (không phải User hiện tại hoặc AI)
        msgHtml = `
                    <div class="tp-msg other">
                        <span class="tp-msg-sender">${senderName}</span>
                        <div class="tp-msg-content">${safeContent}</div> 
                    </div>`;
      } else {
        // Tin nhắn từ User hiện tại hoặc AI
        msgHtml = `
                    <div class="tp-msg ${type}">
                        <div class="tp-msg-content">${safeContent}</div> 
                    </div>`;

        // --- LOGIC LƯU CONTEXT MỚI ---
        let role = (type === 'user') ? 'user' : 'model'; // Gemini dùng role 'model'

        // Trích xuất nội dung text thuần (loại bỏ HTML như thẻ <img>)
        // Nếu isHtml = true, ta dùng jQuery để strip tags. Ngược lại, dùng content gốc.
        const textOnlyContent = isHtml ? $('<div>').html(content).text().trim() : content;

        if (textOnlyContent) {
          aiContextHistory.push({
            role: role,
            text: textOnlyContent
          });

          // Giới hạn tổng dung lượng lịch sử (để tránh rò rỉ bộ nhớ)
          if (aiContextHistory.length > AI_FULL_HISTORY_MAX_SIZE) {
            aiContextHistory = aiContextHistory.slice(aiContextHistory.length - AI_FULL_HISTORY_MAX_SIZE);
          }
        }

      }

      chatBody.append(msgHtml);
      chatBody.scrollTop(chatBody[0].scrollHeight);
    }

    function showTyping() {
      const chatBody = $("#tpChatBody");
      const typingDiv = $(`<div class="tp-msg ai typing" id="aiTyping"><div class="typing-dots"><span></span><span></span><span></span></div></div>`);
      chatBody.append(typingDiv);
      chatBody.scrollTop(chatBody[0].scrollHeight);
    }

    function removeTyping() {
      $("#aiTyping").remove();
    }

    // 4. Xử lý Gửi tin nhắn
    async function handleSendMessage() {
      const input = $("#tpChatInput");
      const text = input.val().trim();
      if (!text) return;

      input.val('').css('height', 'auto'); // Reset

      if (CURRENT_CHAT_MODE === 'ai') {
        // --- AI MODE ---
        appendMessage(text, 'user');
        showTyping();

        if (socket && socket.connected) {
          socket.emit('chat-request', {
            message: text,
            user: getConfig("custom_name"),
            context: await getInfoPage()
          });
        } else {
          removeTyping();
          appendMessage("Lỗi kết nối Server", "system");
        }
      } else {
        // --- GLOBAL MODE ---
        if (socket && socket.connected) {
          socket.emit('send-global-chat', {
            sender: getConfig("custom_name"),
            message: text,
            type: 'text'
          });
        } else {
          boxToast("Mất kết nối Server Chat!", "error");
        }
      }
    }

    /**
     * @func INIT_FUNCTION
     * @description 'Khởi tạo tương tác'
     */
    var INIT_FUNCTION = async () => {
      // Toggle theme (Giữ nguyên)
      $(".tp-container.tp-main .header .btn-theme").on("click", function() {
        var theme = $(this).data("theme");
        var toggleTheme = theme == "light" ? "dark" : "light";

        $(".tp-container.tp-main .header .btn-theme").removeClass("active");
        $(this).parent().find(`.btn-theme.${toggleTheme}-mode`).addClass("active");

        setConfig("theme_mode", toggleTheme);
      })

      // Chọn màn hình hiển thị (Giữ nguyên)
      $(".tp-container.tp-main .list-screen .box-screen").on("click", function() {
        var screen = $(this).data("screen");

        $(".tp-container.tp-main .list-screen .box-screen").removeClass("active");
        $(this).addClass("active");

        $(".tp-container.tp-main .content-screen .screen").removeClass("active");
        $(`.tp-container.tp-main .content-screen .screen.screen-${screen}`).addClass("active");

        setConfig("screen_display", screen);
      })

      // Chọn chức năng (box-function)
      $(".tp-container.tp-main .content-screen .screen.screen-main .list-function").on("click", ".box-function", function(e) {
        var funcName = $(this).attr("data-func");
        var layoutName = $(this).attr("data-layout");
        var hasLayout = layoutName && layoutName.length > 0;

        if (hasLayout) {
          $(".tp-container.tp-main .content-screen .screen.screen-main .list-function").removeClass("active");
          $(".tp-container.tp-main .content-screen .screen.screen-main .layout-function").addClass("active");

          // Hiển thị layout cụ thể
          $(`.tp-container.tp-main .content-screen .screen.screen-main .layout-function .box#${layoutName}_layout`).addClass("show");
        } else {
          excuseFunction(funcName);
        }
      });

      // --- ĐÃ BỔ SUNG: Xử lý sự kiện click trên nút action-btn trong layout ---
      $(".tp-container.tp-main .content-screen .screen.screen-main .layout-function").on("click", ".action-btn", function(e) {
        var actionName = $(this).attr("data-action");
        boxAlert(`Thực thi: ${actionName}`, "log");

        // Gọi hàm thực thi
        excuseFunction(actionName);
      });
      // -----------------------------------------------------------------------


      // Trở lại màn hình chọn chức năng (Giữ nguyên)
      $(".tp-container.tp-main .content-screen .screen.screen-main .layout-function .back").on("click", function() {
        // Ẩn tất cả layout box
        $(".tp-container.tp-main .content-screen .screen.screen-main .layout-function .box").removeClass("show");
        // Ẩn layout container
        $(".tp-container.tp-main .content-screen .screen.screen-main .layout-function").removeClass("active");

        // Hiển thị lại danh sách chức năng
        $(".tp-container.tp-main .content-screen .screen.screen-main .list-function").addClass("active");
      })

      // Trỏ sang trang hướng dẫn
      $(".tp-container.tp-main .help").on("click", function() {
        window.open("https://github.com/pntan/TOOLv3/blob/main/README.md#h%C6%B0%E1%BB%9Bng-d%E1%BA%ABn-s%E1%BB%AD-d%E1%BB%A5ng", "_blank");
      })

      // Xử lý nút Check-out
      console.log($(".tp-container.tp-main .header .checkout"));
      $(".tp-container.tp-main .header .checkout").on("click", function() {
        const name = getConfig("custom_name");
        if (!name || name === "Unknown") {
          boxToast("Vui lòng nhập tên trước khi Check-out", "error");
          return;
        }

        const now = new Date();
        const todayDate = now.toISOString().split('T')[0];
        const currentTime = now.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

        // Gửi lệnh lên Server
        if (socket && socket.connected) {
          boxAlert("Đang gửi yêu cầu Check-out...", "info");
          socket.emit('save_check_out', {
            name: name,
            date: todayDate,
            time: currentTime
          });
        } else {
          boxToast("Mất kết nối Server, không thể Check-out!", "error");
        }
      })

      let closeTimer = null;
      let isMouseOverPanels = false;
      const sidebarPanels = $("#tpMainPanel, #tpChatPanel");

      // 1. Theo dõi trạng thái chuột TRÊN PANEL (Để giữ menu mở khi đang dùng)
      sidebarPanels.on("mouseenter", function() {
        isMouseOverPanels = true;
        clearTimeout(closeTimer);
        closeTimer = null;
      });

      sidebarPanels.on("mouseleave", function() {
        isMouseOverPanels = false;
        attemptClose(); // Chuột ra khỏi panel -> Thử đóng
      });

      // 2. Theo dõi tọa độ chuột TOÀN CỤC (Để mở menu từ mép)
      $("body").on("mousemove", function(e) {
        const x = e.clientX;
        const isSidebarOpen = $("#tpMainPanel, #tpChatPanel").hasClass("tp-sidebar-open");

        // VÙNG KÍCH HOẠT: 15px tính từ mép trái
        if (x <= 1) {
          clearTimeout(closeTimer); // Hủy lệnh đóng nếu có
          closeTimer = null;

          if (!isSidebarOpen) {
            $("#tpMainPanel").addClass("active tp-sidebar-open");
            $("#tpChatPanel").addClass("active tp-sidebar-open");
          }
        }
        // NẾU RA KHỎI VÙNG 15px
        else if (isSidebarOpen) {
          // Nếu Sidebar đang mở, mà chuột không ở mép (x > 15)
          // VÀ chuột cũng KHÔNG nằm trên Panel (isMouseOverPanels = false)
          // => Thì chuẩn bị đóng
          if (!isMouseOverPanels) {
            attemptClose();
          }
        }
      });

      // Hàm đóng (có delay để tránh nhấp nháy khi di chuột nhanh)
      function attemptClose() {
        if (!closeTimer) {
          closeTimer = setTimeout(() => {
            $("#tpMainPanel").removeClass("active tp-sidebar-open");
            $("#tpChatPanel").removeClass("active tp-sidebar-open");
            closeTimer = null;
          }, 300); // 300ms delay: Đủ thời gian để lỡ tay di ra ngoài rồi quay lại
        }
      }

      /**
       * @func check_in
       * @description Kiểm tra và lưu lại thời gian của lần đầu kích hoạt trong ngày.
       * @param {function} callback - Hàm callback nhận kết quả: ({isNewDay: boolean, launchTime: string})
       */
      function check_in(callback) {
        const LAST_CHECK_IN_KEY = 'TP_GLOBAL_LAST_CHECK_IN_TIME';
        const LAST_CHECK_IN_DATE_KEY = 'TP_GLOBAL_LAST_CHECK_IN_DATE';

        const now = new Date();
        const todayDate = now.toISOString().split('T')[0];

        const savedDate = GM_getValue(LAST_CHECK_IN_DATE_KEY, null);
        const savedTime = GM_getValue(LAST_CHECK_IN_KEY, null);

        let result = {};

        // 1. KIỂM TRA NGÀY MỚI
        if (savedDate !== todayDate) {

          // --- NGÀY MỚI ---
          const newLaunchTime = now.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });

          GM_setValue(LAST_CHECK_IN_DATE_KEY, todayDate);
          GM_setValue(LAST_CHECK_IN_KEY, newLaunchTime);

          boxAlert(`NGÀY MỚI! Lần đầu kích hoạt được ghi lại: ${newLaunchTime}`, "success");

          result = {
            isNewDay: true,
            launchTime: newLaunchTime
          };

        } else {

          // --- ĐÃ KÍCH HOẠT TRONG NGÀY ---
          boxAlert(`Hôm nay đã được kích hoạt. Lần đầu: ${savedTime}`, "log");

          result = {
            isNewDay: false,
            launchTime: savedTime
          };
        }

        // GỌI CALLBACK VỚI KẾT QUẢ CUỐI CÙNG
        if (typeof callback === 'function') {
          callback(result);
        }
      }

      function auto_save_check_in() {
        var date = GM_getValue('TP_GLOBAL_LAST_CHECK_IN_DATE', null);
        var time = GM_getValue('TP_GLOBAL_LAST_CHECK_IN_TIME', null);
        var name = getConfig("custom_name") || "Unknown";

        if (getConfig("auto_save_check_in") && date && time) {
          if (date && time) {
            socket.emit('save_check_in', {
              name: name,
              date: date,
              time: time,
            });

            startHeartbeat();

            socket.on("check_in_saved", (data) => {
              if (data.status == "success") {
                boxAlert(`Đã tự động lưu giờ check in: ${date} ${time}`, "success");
              } else {
                boxAlert(`Lỗi khi lưu giờ check in: ${data.message}`, "error");
              }
            });
          }
        }
      }

      check_in((result) => {
        $(".tp-container.tp-main .header").prepend(`
            <span class="check-in">(CHECK IN: ${result.launchTime})</span>
          `)

        auto_save_check_in();
      })

      // Kiểm tra có lưu giờ check in không
      $(".tp-container.tp-main .screen.screen-online .box.auto-save-check-in .tp-checkbox input.input-auto-save-check-in").on("change", function() {
        setConfig("auto_save_check_in", $(this).is(":checked"));
        auto_save_check_in();
      })

      // Chạy đồng hồ (Giữ nguyên)
      async function runTime() {
        var now = new Date();
        var hours = now.getHours().toString().padStart(2, '0');
        var minutes = now.getMinutes().toString().padStart(2, '0');
        var seconds = now.getSeconds().toString().padStart(2, '0');

        $(".tp-container.tp-main .header .time").text(`${hours}:${minutes}:${seconds}`);
        await delay(1000);
        runTime();
      }

      runTime();

      // Lưu tên tùy chỉnh
      $(".tp-container.tp-main .screen.screen-setting input.input-custom-name").on("input", function() {
        var name = $(this).val().trim();
        setConfig("custom_name", name);
      });

      // Chọn loại sàn làm flash sale
      $(".tp-container.tp-main #flash_sale_layout .platform .shopee").on("click", function() {
        $(this).parent().find(".active").removeClass("active");
        $(this).addClass("active").trigger("togglePlatform", "shopee");
      })

      $(".tp-container.tp-main #flash_sale_layout .platform .tiktok").on("click", function() {
        console.log($(this).parent().find(".active"))
        $(this).parent().find(".active").removeClass("active");
        $(this).addClass("active").trigger("togglePlatform", "tiktok");
      })

      $(".tp-container.tp-main #flash_sale_layout .program_id .product_url").on("input", function() {
        var url = $(this).val();
        url = url.replace("https://", "");

        var host = url.split("/")[0];

        if (host.split(".").includes("shopee")) {
          $(".tp-container.tp-main #flash_sale_layout .platform .shopee").addClass("active");
          $(".tp-container.tp-main #flash_sale_layout .platform .tiktok").removeClass("active").trigger("togglePlatform", "shopee");
        } else if (host.split(".").includes("tiktok")) {
          $(".tp-container.tp-main #flash_sale_layout .platform .tiktok").addClass("active");
          $(".tp-container.tp-main #flash_sale_layout .platform .shopee").removeClass("active").trigger("togglePlatform", "tiktok");
        } else {
          $(".tp-container.tp-main #flash_sale_layout .platform .shopee").removeClass("active");
          $(".tp-container.tp-main #flash_sale_layout .platform .tiktok").removeClass("active").trigger("togglePlatform", "none");
        }

        var id = url.split("/")[url.split("/").length - 1];

        if (id.search("=") >= 0) {
          id = id.split("=")[1];
        }

        $(".tp-container.tp-main #flash_sale_layout .program_id .current_id").remove();
        $(".tp-container.tp-main #flash_sale_layout .program_id").prepend(`
          <span class="current_id">ID Chương Trình <span style="color: var(--text-color)">${id}</span>
        `)
      })

      $(".tp-container.tp-main #flash_sale_layout .platform label").on("togglePlatform", function(e, v) {
        if (v == "shopee") {
          $(".tp-container.tp-main #flash_sale_layout .input_prompt .prompt_value.shopee_prompt").addClass("active");
          $(".tp-container.tp-main #flash_sale_layout .input_prompt .prompt_value.tiktok_prompt").removeClass("active");
        } else if (v == "tiktok") {
          $(".tp-container.tp-main #flash_sale_layout .input_prompt .prompt_value.shopee_prompt").removeClass("active");
          $(".tp-container.tp-main #flash_sale_layout .input_prompt .prompt_value.tiktok_prompt").addClass("active");
        } else {
          $(".tp-container.tp-main #flash_sale_layout .input_prompt .prompt_value.shopee_prompt").removeClass("active");
          $(".tp-container.tp-main #flash_sale_layout .input_prompt .prompt_value.tiktok_prompt").removeClass("active");
        }
      })

      // Tìm cấu hình hàm đang chạy hàng loạt
      function check_current_function() {
        var config = getConfig("continue_function");

        if (config == null)
          return;

        switch (config) {
          case "flashsale":
            flash_sale(true);
            break;
        }
      }

      check_current_function();

      // Phần cấu hình Tải tệp (ĐÃ CẬP NHẬT CSS & JS HIỆU ỨNG)
      function setupFileUploader() {
        const uploaderContainer = document.querySelector('#doi_hinh_phan_loai_layout .dynamic-upload-container');
        if (!uploaderContainer) {
          console.error("Không tìm thấy container tải tệp");
          return;
        }

        uploaderContainer.innerHTML = ''; // Xóa nội dung cũ

        // 1. Tạo input file ẩn
        const fileInput = document.createElement('input');
        fileInput.setAttribute('type', 'file');
        fileInput.setAttribute('id', 'fileInput');
        fileInput.setAttribute('multiple', '');
        uploaderContainer.appendChild(fileInput);

        // 2. Tạo UI Công tắc (HTML đã tối ưu cho CSS selector)
        const switcher = document.createElement('div');
        switcher.className = 'upload-mode-switcher';
        // Lưu ý: Tôi thêm class "mode-label" để dễ query
        switcher.innerHTML = `
              <label for="modeSwitch" id="labelFile" class="mode-label">Tệp (Ảnh)</label>
              <input type="checkbox" id="modeSwitch" style="display: none"> 
              <label for="modeSwitch" id="labelFolder" class="mode-label">Thư mục</label>
          `;
        uploaderContainer.appendChild(switcher);

        const modeSwitch = document.getElementById('modeSwitch');
        const labelFile = document.getElementById('labelFile');
        const labelFolder = document.getElementById('labelFolder');

        // 3. Tạo Drop Zone
        const dropZone = document.createElement('div');
        dropZone.setAttribute('id', 'dropZone');
        dropZone.className = 'drop-zone';
        uploaderContainer.appendChild(dropZone);

        // 4. Danh sách tệp
        let displayElement = document.getElementById('file-display-list');
        if (!displayElement) {
          displayElement = document.createElement('div');
          displayElement.setAttribute('id', 'file-display-list');
          displayElement.className = 'file-list';
          uploaderContainer.appendChild(displayElement);
        }

        // --- HÀM XỬ LÝ CHẾ ĐỘ ---
        function setMode(isFolderMode) {
          // Reset input attributes
          fileInput.removeAttribute('webkitdirectory');
          fileInput.removeAttribute('directory');
          fileInput.removeAttribute('accept');

          // Cập nhật giao diện (Thêm/Xóa class thay vì style inline)
          if (isFolderMode) {
            // Chế độ Thư mục
            fileInput.setAttribute('webkitdirectory', 'webkitdirectory');
            fileInput.setAttribute('directory', 'directory');

            // Icon & Text cho Dropzone (Dùng FontAwesome hoặc Emoji nếu không có FA)
            dropZone.innerHTML = `
                      <i class="fa-solid fa-folder-open" style="font-style: normal">📂</i>
                      <p>Kéo thả <b>Thư mục</b> vào đây</p>
                      <p style="font-size: 0.85em; opacity: 0.7; margin-top: 5px;">(hoặc click để chọn)</p>
                  `;

            labelFolder.classList.add('active-mode');
            labelFile.classList.remove('active-mode');
          } else {
            // Chế độ Tệp
            fileInput.setAttribute('accept', 'image/*');

            dropZone.innerHTML = `
                      <i class="fa-solid fa-cloud-arrow-up" style="font-style: normal">☁️</i>
                      <p>Kéo thả <b>Ảnh</b> vào đây</p>
                      <p style="font-size: 0.85em; opacity: 0.7; margin-top: 5px;">(hoặc click để chọn)</p>
                  `;

            labelFile.classList.add('active-mode');
            labelFolder.classList.remove('active-mode');
          }

          // Xóa danh sách tệp cũ
          displayElement.innerHTML = '';
          if (displayElement._objectUrls) {
            displayElement._objectUrls.forEach(url => URL.revokeObjectURL(url));
          }
          displayElement._objectUrls = [];
        }

        // Khởi tạo mặc định
        setMode(false);

        // --- HÀM XỬ LÝ FILE ---
        function processFiles(files) {
          if (files.length > 0) {
            // Clear cũ
            displayElement.innerHTML = '';
            if (displayElement._objectUrls) {
              displayElement._objectUrls.forEach(url => URL.revokeObjectURL(url));
            }
            displayElement._objectUrls = [];

            Array.from(files).forEach(file => {
              const fileItem = document.createElement('div');
              fileItem.className = 'file-item';

              const thumbnail = document.createElement('div');
              thumbnail.className = 'file-thumbnail';

              const filenameToDisplay = modeSwitch.checked ? file.webkitRelativePath : file.name;

              // Tạo thumbnail nếu là ảnh
              if (file.type.startsWith('image/')) {
                const thumbnailUrl = URL.createObjectURL(file);
                thumbnail.style.backgroundImage = `url('${thumbnailUrl}')`;
                displayElement._objectUrls.push(thumbnailUrl);
              } else {
                // Icon mặc định cho file không phải ảnh
                thumbnail.style.display = 'flex';
                thumbnail.style.alignItems = 'center';
                thumbnail.style.justifyContent = 'center';
                thumbnail.innerHTML = '📄';
              }

              const fileInfo = document.createElement('div');
              fileInfo.className = 'file-info';

              const fileName = document.createElement('span');
              fileName.className = 'file-name';
              fileName.textContent = filenameToDisplay || file.name;

              const fileSize = document.createElement('span');
              fileSize.className = 'file-size';
              // Format size đẹp hơn
              let sizeText = '';
              if (file.size < 1024 * 1024) sizeText = `${(file.size / 1024).toFixed(1)} KB`;
              else sizeText = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

              fileSize.textContent = sizeText;

              fileInfo.appendChild(fileName);
              fileInfo.appendChild(fileSize);

              fileItem.appendChild(thumbnail);
              fileItem.appendChild(fileInfo);

              displayElement.appendChild(fileItem);
            });
          }
        }

        // 5. Sự kiện Input change
        fileInput.addEventListener('change', (e) => {
          processFiles(e.target.files);
        }, false);

        // 6. Sự kiện Switcher change
        modeSwitch.addEventListener('change', (e) => {
          setMode(e.target.checked);
        });

        // 7. Sự kiện Click Dropzone
        dropZone.addEventListener('click', () => {
          fileInput.click();
        }, false);

        // 8. Sự kiện Drag & Drop
          ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
          dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
          }, false);
        });

          ['dragenter', 'dragover'].forEach(eventName => {
          dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('highlight');
          }, false);
        });

          ['dragleave', 'drop'].forEach(eventName => {
          dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('highlight');
          }, false);
        });

        dropZone.addEventListener('drop', (e) => {
          const files = e.dataTransfer.files;
          const isDirectoryDrop = Array.from(files).some(file => file.webkitRelativePath);

          if (!modeSwitch.checked && isDirectoryDrop) {
            // Thay boxToast bằng alert hoặc hàm thông báo của bạn
            if (typeof boxToast === 'function')
              boxToast("Vui lòng chuyển sang 'Chế độ Thư mục' để kéo thả thư mục.", "warning");
            else
              alert("Vui lòng chuyển sang 'Chế độ Thư mục'!");

            dropZone.classList.remove('highlight');
            return;
          }

          processFiles(files);
        }, false);
      }
      setupFileUploader();

      /**
       * @func initSegmentSwitch
       * @description Kích hoạt hiệu ứng trượt cho tất cả .tp-segment-switch
       * Hỗ trợ số lượng options không giới hạn (2, 3, 10...)
       */
      function initSegmentSwitch() {
        // Tìm tất cả các switch trong giao diện
        const switches = document.querySelectorAll('.tp-segment-switch');

        switches.forEach(sw => {
          const inputs = sw.querySelectorAll('input[type="radio"]');
          const labels = sw.querySelectorAll('label');
          const glider = sw.querySelector('.glider');

          if (!glider || inputs.length === 0) return;

          // Hàm cập nhật vị trí
          const updateGlider = (checkedInput) => {
            // Tìm index của input đang checked
            let index = Array.from(inputs).indexOf(checkedInput);
            if (index === -1) index = 0; // Default fallback

            // Tính toán width: 100% chia cho số lượng options
            const percentage = 100 / inputs.length;

            // Cập nhật CSS cho glider
            glider.style.width = `calc(${percentage}% - 8px)`; // Trừ padding container (4px * 2)
            glider.style.transform = `translateX(${index * 100}%) translateX(${index * 8}px)`; // Offset padding
            // *Lưu ý: Cách tính trên là tương đối. Cách chính xác nhất dùng offsetLeft:

            // Cách tính chính xác tuyệt đối theo Pixel (Tốt hơn)
            const targetLabel = labels[index];
            if (targetLabel) {
              glider.style.width = `${targetLabel.offsetWidth}px`;
              glider.style.transform = `translateX(${targetLabel.offsetLeft - 4}px)`; // -4 là padding left của container
            }

            // Cập nhật class active cho label chữ màu trắng
            labels.forEach(l => l.classList.remove('active'));
            if (labels[index]) labels[index].classList.add('active');
          };

          // 1. Gán sự kiện click
          inputs.forEach(input => {
            input.addEventListener('change', (e) => {
              updateGlider(e.target);
            });
          });

          // 2. Khởi tạo lần đầu (tìm cái đang checked)
          const currentChecked = sw.querySelector('input:checked') || inputs[0];
          // Cần delay nhỏ để DOM render xong width
          setTimeout(() => updateGlider(currentChecked), 50);
        });
      }

      // =========================================================================
      // [NEW] LOGIC CHAT SYSTEM (AI + GLOBAL + UPLOAD)
      // =========================================================================

      // 1. UI Handlers: Bật tắt Panel
      $("#toggleChatBtn").on("click", function() {
        $("#tpChatPanel").toggleClass("active");
        $(this).toggleClass("active");
      });
      $("#closeChat").on("click", function() {
        $("#tpChatPanel").removeClass("active");
        $("#toggleChatBtn").removeClass("active");
      });
      // Auto resize textarea
      $("#tpChatInput").on("input", function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        if (this.value === '') this.style.height = 'auto';
      });

      // 2. Chuyển đổi chế độ (AI <-> Global)
      $(".tp-mode-btn").on("click", function() {
        const mode = $(this).data("mode");
        $(".tp-mode-btn").removeClass("active");
        $(this).addClass("active");

        CURRENT_CHAT_MODE = mode;
        $("#tpChatBody").empty(); // Xóa màn hình

        if (mode === 'ai') {
          appendMessage("🤖 Chế độ AI Assistant. Hỏi tôi bất cứ điều gì!", "system");
        } else {
          appendMessage("🌏 Chế độ Chat Nội Bộ. Đang kết nối...", "system");
          if (socket && socket.connected) {
            socket.emit('join-global-chat'); // Lấy lịch sử cũ
          }
        }
      });

      $("#tpChatSend").on("click", handleSendMessage);
      $("#tpChatInput").on("keydown", function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
        }
      });
      $("#clearChat").on("click", () => $("#tpChatBody").html('<div class="tp-msg system">Đã xóa lịch sử.</div>'));

      // 5. Xử lý Upload File (Global Chat)
      $("#btnChatAttach").click(() => {
        if (CURRENT_CHAT_MODE !== 'global') {
          boxToast("Chuyển sang chế độ Global để gửi file!", "warning");
          return;
        }
        $("#chatFileInput").click();
      });

      $("#chatFileInput").change(function() {
        const files = this.files;
        if (files.length === 0) return;

        const formData = new FormData();
        Array.from(files).forEach(file => formData.append('files', file));

        $("#chatUploadProgress").css("width", "50%"); // Fake loading

        // Lấy URL upload HTTP (dựa trên URL socket)
        let apiUrl = socket.io.uri + "/upload";

        $.ajax({
          url: apiUrl,
          type: 'POST',
          data: formData,
          contentType: false,
          processData: false,
          success: function(response) {
            $("#chatUploadProgress").css("width", "100%");
            setTimeout(() => $("#chatUploadProgress").css("width", "0%"), 500);

            if (response.fileNames && response.fileNames.length > 0) {
              response.fileNames.forEach((fileName) => {
                const fullUrl = socket.io.uri + "/uploads/" + fileName;
                const isImage = fileName.match(/\.(jpeg|jpg|gif|png)$/i) != null;

                if (socket && socket.connected) {
                  socket.emit('send-global-chat', {
                    sender: getConfig("custom_name"),
                    message: fileName,
                    type: isImage ? 'image' : 'file',
                    url: fullUrl
                  });
                }
              });
            }
          },
          error: function(err) {
            $("#chatUploadProgress").css("width", "0%");
            boxToast("Upload thất bại", "error");
          }
        });
        $(this).val('');
      });
    }

    // Bắt đầu
    INIT();
    boxToast("ĐÃ KHỞI TẠO CHƯƠNG TRÌNH", "success");
    boxAlert("ĐÃ KHỞI TẠO CHƯƠNG TRÌNH");
  })();
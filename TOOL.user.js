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
    const API_GOOGLE = "AIzaSyCAOYF7rlgN3icGwvsEvq85loGuG2P3yW8";

    // --- ĐÃ CẬP NHẬT: Thêm nút action-btn vào gia_duoi_layout ---
    const HTML_UI = `<style>:root{--tp-font:'Segoe UI',system-ui,-apple-system,sans-serif;--tp-radius-xl:24px;--tp-radius-md:16px;--tp-radius-sm:12px;--tp-primary:#3b82f6;--tp-primary-rgb:59,130,246;--tp-secondary:#64748b;--tp-accent:#60a5fa;--tp-glass-bg:rgba(255, 255, 255, 0.75);--tp-glass-border:rgba(255, 255, 255, 0.6);--tp-glass-highlight:rgba(255, 255, 255, 0.4);--tp-glass-shadow:0 8px 32px 0 rgba(31, 38, 135, 0.15);--tp-blur:blur(16px) saturate(180%);--tp-text-main:#1e293b;--tp-text-sub:#475569;--tp-text-inv:#ffffff;--tp-ease:cubic-bezier(0.34, 1.56, 0.64, 1);--tp-ease-smooth:cubic-bezier(0.4, 0, 0.2, 1)}.shopee-theme{--tp-primary:#ee4d2d;--tp-primary-rgb:238,77,45;--tp-accent:#ff7350;--tp-glass-shadow:0 8px 32px 0 rgba(238, 77, 45, 0.15)}.lazada-theme{--tp-primary:#0f146d;--tp-primary-rgb:15,20,109;--tp-accent:#f5008f;--tp-glass-shadow:0 8px 32px 0 rgba(15, 20, 109, 0.2)}.tiktok-theme{--tp-primary:#000000;--tp-primary-rgb:0,0,0;--tp-accent:#25F4EE;--tp-secondary:#FE2C55;--tp-glass-shadow:0 8px 32px 0 rgba(0, 0, 0, 0.2)}.dark-mode-active,.tp-container .btn-theme.dark-mode.active~.content-screen{--tp-glass-bg:rgba(17, 25, 40, 0.85);--tp-glass-border:rgba(255, 255, 255, 0.1);--tp-text-main:#f1f5f9;--tp-text-sub:#94a3b8;--tp-glass-shadow:0 8px 32px 0 rgba(0, 0, 0, 0.5)}.tp-container{font-family:var(--tp-font);box-sizing:border-box;color:var(--tp-text-main)}.tp-container *{box-sizing:border-box;outline:0;user-select:none;-webkit-font-smoothing:antialiased}.tp-container.tp-main{position:fixed;top:2.5vh;bottom:2.5vh;left:0;width:clamp(360px,35vw,550px);background:var(--tp-glass-bg);backdrop-filter:var(--tp-blur);-webkit-backdrop-filter:var(--tp-blur);border:1px solid var(--tp-glass-border);box-shadow:var(--tp-glass-shadow);border-radius:0 var(--tp-radius-xl) var(--tp-radius-xl) 0;z-index:999999999;display:flex;flex-direction:column;padding:24px;transform:translateX(-120%);transition:transform .6s var(--tp-ease),opacity .4s ease;opacity:0;pointer-events:none}.tp-container.tp-main.active,.tp-container.tp-main:hover{transform:translateX(0);opacity:1;pointer-events:auto}.tp-container .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-shrink:0}.tp-container .header .time{font-size:1.1rem;font-weight:800;background:linear-gradient(135deg,var(--tp-primary),var(--tp-accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 2px 4px rgba(var(--tp-primary-rgb), .2))}.tp-container .theme-switcher{background:rgba(0,0,0,.05);border-radius:30px;padding:3px;display:flex;position:relative;width:64px;height:32px;box-shadow:inset 0 2px 4px rgba(0,0,0,.05)}.tp-container .btn-theme{width:26px;height:26px;border-radius:50%;border:none;background:0 0;cursor:pointer;font-size:14px;position:absolute;top:3px;transition:.4s var(--tp-ease);display:flex;align-items:center;justify-content:center;opacity:.5}.tp-container .btn-theme.active{background:#fff;opacity:1;transform:scale(1.1);box-shadow:0 2px 8px rgba(0,0,0,.15)}.tp-container .btn-theme.light-mode{left:4px}.tp-container .btn-theme.dark-mode{right:4px}.tp-container .btn-theme.light-mode.active{left:4px}.tp-container .btn-theme.dark-mode.active{right:4px}.tp-container .list-screen{display:flex;gap:8px;margin-bottom:20px;padding:4px;background:rgba(255,255,255,.3);border-radius:var(--tp-radius-md)}.tp-container .box-screen{flex:1;text-align:center;padding:8px 0;border-radius:var(--tp-radius-sm);cursor:pointer;transition:all .3s var(--tp-ease);font-size:1.2rem;color:var(--tp-text-sub)}.tp-container .box-screen:hover{background:rgba(255,255,255,.5);transform:translateY(-2px)}.tp-container .box-screen.active{background:#fff;color:var(--tp-primary);box-shadow:0 4px 12px rgba(0,0,0,.05);transform:translateY(0) scale(1.05)}.tp-container .content-screen{flex:1;position:relative;overflow:hidden;background:rgba(255,255,255,.4);border-radius:var(--tp-radius-md);border:1px solid rgba(255,255,255,.3)}.tp-container .screen{position:absolute;width:100%;height:100%;padding:15px;overflow-y:auto;transition:transform .5s var(--tp-ease-smooth),opacity .4s;opacity:0;pointer-events:none;display:flex;flex-direction:column}.tp-container .screen.active{transform:translateX(0);opacity:1;pointer-events:auto}.tp-container .screen:not(.active){transform:translateX(50px)}.tp-container .list-function{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:12px;width:100%;align-content:start}.tp-container .list-function:not(.active){display:none}.tp-container .box-function{background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.5);border-radius:var(--tp-radius-sm);padding:15px 10px;text-align:center;cursor:pointer;min-height:90px;display:flex;align-items:center;justify-content:center;flex-direction:column;transition:all .3s var(--tp-ease);box-shadow:0 4px 6px rgba(0,0,0,.02)}.tp-container .box-function:hover{background:#fff;transform:translateY(-5px);border-color:var(--tp-primary);color:var(--tp-primary);box-shadow:0 10px 20px rgba(var(--tp-primary-rgb),.15)}.tp-container .layout-function{position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(255,255,255,.85);backdrop-filter:blur(10px);z-index:20;transform:translateX(100%);transition:.4s var(--tp-ease-smooth);display:flex;flex-direction:column;padding:20px}.tp-container .layout-function.active{transform:translateX(0)}.tp-container .back{align-self:flex-start;margin-bottom:20px;padding:8px 16px;border-radius:20px;background:rgba(0,0,0,.05);cursor:pointer;font-weight:600;color:var(--tp-text-sub);transition:.2s;display:flex;align-items:center;gap:6px}.tp-container .back:before{content:'❮';font-size:.8em}.tp-container .back:hover{background:var(--tp-primary);color:#fff;padding-right:20px}.tp-container .box{display:none;animation:slideUp .4s var(--tp-ease);height:100%;overflow-y:auto}.tp-container .box.show{display:block}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.tp-container input,.tp-container textarea{width:100%;padding:12px 16px;margin-bottom:12px;border:2px solid transparent;border-radius:var(--tp-radius-sm);background:rgba(255,255,255,.7);box-shadow:inset 0 2px 4px rgba(0,0,0,.03);font-size:14px;transition:.3s;color:var(--tp-text-main)}.tp-container input:focus,.tp-container textarea:focus{background:#fff;border-color:var(--tp-primary);box-shadow:0 0 0 4px rgba(var(--tp-primary-rgb),.1)}.tp-container .platform{background:rgba(0,0,0,.04);border-radius:var(--tp-radius-md);padding:4px;position:relative;display:flex;margin-bottom:20px!important}.tp-container .platform label{flex:1;text-align:center;padding:10px;z-index:2;cursor:pointer;transition:.3s;color:var(--tp-text-sub);font-weight:700}.tp-container .platform label.active{color:#fff}.tp-container .highlight_choice{position:absolute;top:4px;left:4px;bottom:4px;width:calc(50% - 4px);background:var(--tp-primary);border-radius:var(--tp-radius-sm);transition:transform .4s var(--tp-ease);box-shadow:0 2px 10px rgba(var(--tp-primary-rgb),.3)}.tp-container .platform .shopee.active~.highlight_choice{transform:translateX(0)}.tp-container .platform .tiktok.active~.highlight_choice{transform:translateX(100%);margin-left:0}.tp-container button.action-btn{width:100%;padding:14px;margin-top:15px;border:none;background:linear-gradient(135deg,var(--tp-primary),var(--tp-accent));color:#fff;font-weight:700;font-size:15px;letter-spacing:.5px;border-radius:var(--tp-radius-md);cursor:pointer;box-shadow:0 6px 20px rgba(var(--tp-primary-rgb),.3);transition:all .3s var(--tp-ease);position:relative;overflow:hidden}.tp-container button.action-btn:hover{transform:translateY(-2px) scale(1.02);box-shadow:0 10px 25px rgba(var(--tp-primary-rgb),.4)}.tp-container button.action-btn:active{transform:scale(.98)}.tp-container button.action-btn:after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent);transition:.5s}.tp-container button.action-btn:hover:after{left:100%}.tp-container .dynamic-upload-container{margin-top:15px}.tp-container .upload-mode-switcher{display:flex;background:rgba(0,0,0,.05);border-radius:12px;padding:4px;position:relative;margin-bottom:15px;border:1px solid rgba(255,255,255,.2)}.tp-container .upload-mode-switcher label{flex:1;text-align:center;padding:8px 10px;font-size:13px;cursor:pointer;z-index:2;transition:color .3s var(--tp-ease);color:var(--tp-text-sub);font-weight:600;border-radius:8px}.tp-container .upload-mode-switcher:before{content:'';position:absolute;top:4px;bottom:4px;left:4px;width:calc(50% - 4px);background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.08);transition:transform .3s var(--tp-ease);z-index:1}.tp-container .upload-mode-switcher:has(#modeSwitch:checked):before{transform:translateX(100%)}.tp-container .upload-mode-switcher label.active-mode{color:var(--tp-primary)}.tp-container .drop-zone{border:2px dashed rgba(148,163,184,.4);background:rgba(255,255,255,.3);border-radius:var(--tp-radius-md);padding:40px 20px;text-align:center;transition:all .3s var(--tp-ease);cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:10px;position:relative;overflow:hidden}.tp-container .drop-zone.highlight,.tp-container .drop-zone:hover{border-color:var(--tp-primary);background:rgba(var(--tp-primary-rgb),.08);transform:translateY(-2px);box-shadow:0 8px 20px rgba(var(--tp-primary-rgb),.15)}.tp-container .drop-zone i{font-size:40px;color:var(--tp-secondary);transition:.3s;margin-bottom:5px}.tp-container .drop-zone:hover i{color:var(--tp-primary);transform:scale(1.1)}.tp-container .drop-zone p{margin:0;font-size:14px;color:var(--tp-text-main);font-weight:600}.tp-container .file-list{margin-top:15px;max-height:250px;overflow-y:auto;padding-right:5px;display:flex;flex-direction:column;gap:8px}.tp-container .file-item{display:flex;align-items:center;padding:10px;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.4);border-radius:var(--tp-radius-sm);transition:.2s var(--tp-ease);animation:fadeInItem .3s ease forwards}@keyframes fadeInItem{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.tp-container .file-item:hover{background:#fff;border-color:var(--tp-primary);transform:translateX(4px);box-shadow:0 4px 12px rgba(0,0,0,.05)}.tp-container .file-thumbnail{width:44px;height:44px;border-radius:8px;margin-right:12px;background-color:#f1f5f9;background-size:cover;background-position:center;flex-shrink:0;border:1px solid rgba(0,0,0,.05)}.tp-container .file-info{display:flex;flex-direction:column;overflow:hidden}.tp-container .file-name{font-size:13px;font-weight:600;color:var(--tp-text-main);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tp-container .file-size{font-size:11px;color:var(--tp-text-sub);margin-top:2px}.tp-container.tp-toast{top:20px;left:50%;transform:translateX(-50%);width:auto;max-width:90vw;z-index:9999999999}.tp-container.tp-toast .toast{background:rgba(255,255,255,.95);backdrop-filter:blur(12px);padding:12px 24px;border-radius:50px;margin-bottom:10px;box-shadow:0 10px 30px rgba(0,0,0,.15);border:1px solid rgba(255,255,255,.5);color:var(--tp-text-main);font-weight:600;display:flex;align-items:center;gap:10px;transform:translateY(-20px) scale(.9);opacity:0;transition:.4s var(--tp-ease)}.tp-container.tp-toast .toast.show{transform:translateY(0) scale(1);opacity:1}.tp-container.tp-toast .toast:before{content:'';width:10px;height:10px;border-radius:50%;display:block}.tp-container.tp-toast .toast.success:before{background:#10b981;box-shadow:0 0 10px #10b981}.tp-container.tp-toast .toast.error:before{background:#ef4444;box-shadow:0 0 10px #ef4444}.tp-container.tp-toast .toast.warning:before{background:#f59e0b;box-shadow:0 0 10px #f59e0b}.tp-container.tp-toast .toast.info:before{background:var(--tp-primary);box-shadow:0 0 10px var(--tp-primary)}</style><div class="tp-container tp-toast"></div><div class="tp-container tp-main"><div class="header"><div class="time">00:00:00</div><div class="help">Hướng Dẫn</div><div class="theme-switcher"><button class="btn-theme light-mode active"data-theme="light">☀️</button> <button class="btn-theme dark-mode"data-theme="dark">🌙</button></div></div><div class="list-screen"><div class="box-screen setting"data-screen="setting">⚙️</div><div class="box-screen main"data-screen="main">🏠</div><div class="box-screen online"data-screen="online">📡</div></div><div class="content-screen"><div class="screen screen-setting"><div class="box custom-name show"><p>Tên Gọi Của Bạn</p><input class="input-custom-name"placeholder="Nhập tên gọi..."></div></div><div class="screen screen-main active"><div class="list-function active"></div><div class="layout-function"><div class="back">Quay lại Menu</div><div class="box flash_sale"id="flash_sale_layout"><h3 style="margin-bottom:20px;text-align:center;color:var(--tp-primary)">Thiết Lập Flash Sale</h3><div class="program_id"style="margin-bottom:15px"><label style="font-size:.9em;color:var(--tp-text-sub);display:block;margin-bottom:5px">Link Chương Trình</label> <input class="product_url"placeholder="Paste link hoặc ID vào đây..."><div class="platform flex flex-row"><label class="shopee"for="shopee">SHOPEE</label> <label class="tiktok"for="tiktok">TIKTOK</label><div class="highlight_choice"></div></div></div><div class="input_prompt"><div class="prompt_value shopee_prompt flex flex-column"><input type="number"class="value-count"placeholder="Số lượng khung (VD: 5)"> <textarea class="value-flashsale"placeholder="Nhập tên sản phẩm & số lượng..."></textarea></div><div class="prompt_value tiktok_prompt"><textarea placeholder="Nhập thời gian chạy..."class="value-time"></textarea></div></div><button class="excuse-button action-btn"data-action="flash_sale">Kích Hoạt Flash Sale 🚀</button></div><div class="box doi_hinh_phan_loai show"id="doi_hinh_phan_loai_layout"><h3 style="margin-bottom:20px;text-align:center;color:var(--tp-primary)">Đổi Hình Phân Loại</h3><div class="product_info"><label style="font-size:.9em;color:var(--tp-text-sub);display:block;margin-bottom:5px">Danh sách ID Sản Phẩm</label> <textarea type="text"class="product_url"placeholder="Mỗi dòng 1 ID sản phẩm..."></textarea></div><div class="input_prompt"><div class="dynamic-upload-container"></div></div><button class="excuse-button action-btn"data-action="doi_hinh_phan_loai">Bắt Đầu Xử Lý ⚡</button></div></div></div><div class="screen screen-online"><h3 style="margin-bottom:15px;color:var(--tp-accent)">Kết Nối Server</h3><p style="color:var(--tp-text-sub)">Trạng thái Socket.IO...</p></div></div></div>`;

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

    async function connectServer() {
      var ngrokURL = null;
      async function getNgrokURL() {
        // Đường dẫn "Raw" của file trên GitHub hoặc đường dẫn GitHub Pages
        // Nếu dùng GitHub Pages: https://pntan.github.io/ngrok-url.json
        // Nếu dùng Raw GitHub: https://raw.githubusercontent.com/pntan/pntan.github.io/main/ngrok-url.json

        const url = 'https://pntan.github.io/ngrokServer'; // Khuyên dùng link này nếu đã bật GitHub Pages
        // const url = 'https://raw.githubusercontent.com/pntan/pntan.github.io/main/ngrok-url.json'; // Link này update tức thì hơn (không bị cache của CDN GitHub Pages)

        try {
          const response = await fetch(url, {
            cache: "no-store"
          }); // no-store để tránh cache cũ
          if (!response.ok) throw new Error('Network response was not ok');

          const data = await response.json();
          return data.url;
        } catch (error) {
          console.error('Lỗi khi fetch URL:', error);
          return null;
        }
      }

      async function connectSocket(url) {
        return new Promise((resolve, reject) => {
          socket = io(url, {
            reconnectionAttempts: 5,
            timeout: 5000,
            transports: ["websocket", "polling"],
            extraHeaders: {
              "ngrok-skip-browser-warning": "69420" // Giá trị bất kỳ
            },
          });

          console.log(socket);

          socket.on('connect', () => {
            boxAlert(`KẾT NỐI SOCKET THÀNH CÔNG!`, 'success');
            boxToast('Kết nối Socket thành công!', 'success', 5000);
            resolve(true);
          });

          socket.on('connect_error', (error) => {
            boxAlert(`LỖI KẾT NỐI SOCKET: ${error.message}`, 'error');
            boxToast(`Lỗi kết nối Socket: ${error.message}`, 'error', 7000);
            reject(error);
          });

          socket.on('disconnect', (reason) => {
            boxAlert(`SOCKET BỊ NGẮT KẾT NỐI: ${reason}`, 'warn');
            boxToast(`Socket bị ngắt kết nối: ${reason}`, 'warn', 7000);
          });

          socket.on('reconnect_attempt', (attempt) => {
            boxAlert(`ĐANG THỬ KẾT NỐI LẠI SOCKET (Lần ${attempt})...`, 'log');
            boxToast(`Đang thử kết nối lại Socket (Lần ${attempt})...`, 'info', 5000);
          });

          socket.on('reconnect_failed', () => {
            boxAlert(`KHÔNG THỂ KẾT NỐI LẠI SOCKET!`, 'error');
            boxToast(`Không thể kết nối lại Socket!`, 'error', 7000);
          });
        });
      }

      boxAlert(`ĐANG KẾT NỐI SERVER...`, 'log');
      ngrokURL = getConfig("server_url") || await getNgrokURL();

      if (ngrokURL) {
        boxAlert(`KẾT NỐI SERVER THÀNH CÔNG: ${ngrokURL}`, 'success');
        setConfig('server_url', ngrokURL);
        connectSocket(ngrokURL);
      } else {
        boxAlert(`KHÔNG THỂ KẾT NỐI SERVER!`, 'error');
        localStorage.removeItem('TP_CONFIG_server_url');
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
        }else{
          var randomString = `User${Math.random().toString(36).substring(2, 8)}`;
          setConfig("custom_name", randomString);
          $(".tp-container.tp-main .screen.screen-setting input.input-custom-name").val(randomString);
        }
      }

      theme_mode();
      screen_display();
      theme_color();
      custom_name();
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
        connectServer();
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

      // Theo dõi chuột (sử dụng class thay vì css trực tiếp)
      $("body").on("mousemove", function(e) {
        var x = e.clientX;
        var bodyWidth = $("body").width();

        if (x <= X_LIMIT) {
          $(".tp-container.tp-main").css({
            "left": "0",
            "right": ""
          }).addClass("active");
        } else if (X_LIMIT >= bodyWidth - x) {
          $(".tp-container.tp-main").css({
            "right": "0",
            "left": ""
          }).addClass("active");
        } else {
          $(".tp-container.tp-main").removeClass("active");
        }
      });

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

      check_in((result) => {
        $(".tp-container.tp-main .header").prepend(`
            <span class="check-in">(CHECK IN: ${result.launchTime})</span>
          `)
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
    }

    // Bắt đầu
    INIT();
    boxToast("ĐÃ KHỞI TẠO CHƯƠNG TRÌNH", "success");
    boxAlert("ĐÃ KHỞI TẠO CHƯƠNG TRÌNH");
  })();
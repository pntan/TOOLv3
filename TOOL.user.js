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
// @grant        none
// @updateURL    https://openuserjs.org/meta/pntan/CÔNG_CỤ_HỖ_TRỢ_V4.meta.js
// @downloadURL  https://openuserjs.org/install/pntan/CÔNG_CỤ_HỖ_TRỢ_V4.user.js
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @require      https://code.jquery.com/ui/1.13.2/jquery-ui.min.js
// ==/UserScript==
(function() {
  'use strict';

  const VERSION = '0.0.1';
  const X_LIMIT = 5;

  // --- ĐÃ CẬP NHẬT: Thêm nút action-btn vào gia_duoi_layout ---
  const HTML_UI = `<style>:root{--handle-success:rgb(69, 216, 125);--toast-success-background:rgba(111, 255, 155, .7);--toast-info-background:rgba(80, 220, 245, .7);--toast-error-background:rgba(245, 80, 80, .7);--toast-warning-background:rgba(245, 229, 80, .7);--main-background:rgba(223, 223, 223, .5)}.shopee-theme{--main-background:rgba(238, 77, 45, 0.521)}</style><style>.tp-success-bg{background:var(--handle-success)}</style><div class="tp-container tp-toast"></div><style>.tp-container.tp-toast{width:fit-content;height:auto;position:fixed;margin-left:50%;top:5%;transform:translate(-50%);z-index:999999999;display:flex;flex-direction:column;flex-wrap:wrap;gap:2vh}.tp-container.tp-toast .toast{padding:1vh 1vw;background:#fff;border-radius:10px;color:#fff;text-shadow:0 0 1px #121212,0 0 1px #121212,0 0 1px #121212,0 0 1px #121212,0 0 1px #121212}.tp-container.tp-toast .toast.info{background:var(--toast-info-background)}.tp-container.tp-toast .toast.success{background:var(--toast-success-background)}.tp-container.tp-toast .toast.error{background:var(--toast-error-background)}.tp-container.tp-toast .toast.warning{background:var(--toast-warning-background)}</style><div class="tp-container tp-main active"><div class="header"><div class="time">00:00:00</div><div class="help">Hướng Dẫn</div><div class="theme-switcher"><button class="btn-theme light-mode active"data-theme="light">☀️</button> <button class="btn-theme dark-mode"data-theme="dark">🌙</button></div></div><div class="list-screen"><div class="box-screen setting"data-screen="setting"><p>⚙️</p></div><div class="box-screen main"data-screen="main"><p>🏡</p></div><div class="box-screen online"data-screen="online"><p>🖥️</p></div></div><div class="content-screen"><div class="screen screen-setting"><p>Setting Screen</p></div><div class="screen screen-main active"><div class="list-function"><div class="box-function"><p>Function 1</p></div><div class="box-function"><p>Function 2</p></div><div class="box-function"><p>Function 3</p></div><div class="box-function"><p>Function 4</p></div><div class="box-function"><p>Function 5</p></div><div class="box-function"><p>Function 6</p></div><div class="box-function"><p>Function 7</p></div></div><div class="layout-function active"><div class="back">Trở Lại</div><div class="box gia_duoi"id="gia_duoi_layout"><p>GIÁ ĐUÔI</p><button class="action-btn"data-action="gia_duoi">THỰC HIỆN SỬA GIÁ</button></div><div class="box flash_sale show"id="flash_sale_layout"><div class="program_id"><input></div></div></div></div><div class="screen screen-online"><p>Online Screen</p></div></div></div><style>.tp-container{padding:0;margin:0;border:none;box-sizing:border-box}.tp-container *{padding:0;margin:0;border:0;box-sizing:border-box;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-weight:700;user-select:none}.tp-container ::-webkit-scrollbar{height:6px;width:6px}.tp-container ::-webkit-scrollbar-track{border-radius:20px;background-color:#000}.tp-container ::-webkit-scrollbar-track:hover{background-color:#5a5e5f}.tp-container ::-webkit-scrollbar-track:active{background-color:#ff9e9e}.tp-container ::-webkit-scrollbar-thumb{border-radius:20px;background-color:#eaeaea}.tp-container ::-webkit-scrollbar-thumb:hover{background-color:#a36f6f}.tp-container ::-webkit-scrollbar-thumb:active{background-color:#888bce}.tp-container .action-btn{margin-top:10px;padding:5px 10px;background:#90ee90;border-radius:5px;cursor:pointer;color:#121212}.tp-container.tp-main{top:0;position:fixed;background:var(--main-background);backdrop-filter:blur(10px);width:0;padding:0;height:109%;color:#fff;z-index:999999998;transition:.5s}.tp-container.tp-main.active,.tp-container.tp-main:hover{width:60vw;height:100%;padding:2vh 2vw}.tp-container.tp-main .header{display:flex;justify-content:space-between;align-items:center;width:100%;height:3vh;color:#000;overflow:hidden}.tp-container.tp-main .header .time{font-size:1.5vh;letter-spacing:1rcap}.tp-container.tp-main .header .help{color:#a79dff;cursor:help}.tp-container.tp-main .header .theme-switcher{position:relative;width:auto;height:100%;aspect-ratio:1/1}.tp-container.tp-main .header .theme-switcher .btn-theme{position:absolute;height:100%;border-radius:50%;font-size:2vh;cursor:pointer;background:0 0;transition:.5s}.tp-container.tp-main .header .theme-switcher .btn-theme.active{top:0!important;left:0}.tp-container.tp-main .header .theme-switcher .btn-theme.light-mode{top:-100%;left:0}.tp-container.tp-main .header .theme-switcher .btn-theme.dark-mode{top:100%;left:0}.tp-container.tp-main .list-screen{margin-top:2vh;display:flex;flex-direction:row;justify-content:flex-start;align-items:center;width:100%;height:4vh;overflow-y:auto}.tp-container.tp-main .list-screen .box-screen{width:100%;height:4vh;background:rgba(0,0,0,.1);backdrop-filter:blur(5px);display:flex;justify-content:center;align-items:center;font-size:2vh;color:#000;cursor:pointer}.tp-container.tp-main .list-screen .box-screen.active{background:rgba(0,0,0,.3);backdrop-filter:blur(10px)}.tp-container.tp-main .list-screen .box-screen:hover p{transform:scale(1.3);transition:.3s}.tp-container.tp-main .list-screen .box-screen:first-child{border-top-left-radius:20px;border-bottom-left-radius:20px}.tp-container.tp-main .list-screen .box-screen:last-child{border-top-right-radius:20px;border-bottom-right-radius:20px}.tp-container.tp-main .content-screen{margin-top:2vh;width:100%;height:calc(100% - 15vh);background:rgba(0,0,0,.1);backdrop-filter:blur(5px);border-radius:20px;overflow:hidden;position:relative}.tp-container.tp-main .content-screen .screen{width:100%;height:100%;color:#000;transition:.5s;position:absolute;padding:2vh 2vw}.tp-container.tp-main .content-screen .screen.screen-setting{top:0;left:-100%}.tp-container.tp-main .content-screen .screen.screen-main{top:100%;left:0;position:relative;width:100%}.tp-container.tp-main .content-screen .screen.screen-main .list-function{width:0;height:100%;margin:0 auto;overflow-y:scroll;overflow:hidden;display:flex;flex-direction:row;flex-wrap:wrap;justify-content:space-around;align-items:flex-start;align-content:flex-start;gap:2vw;transition:.5s}.tp-container.tp-main .content-screen .screen.screen-main .list-function.active{width:100%}.tp-container.tp-main .content-screen .screen.screen-main .list-function .box-function{width:auto;height:4vh;line-height:auto;background:#fff;display:flex;flex-direction:row;justify-content:center;align-items:center;border-radius:10px;padding:2vh 2vw;word-break:keep-all}.tp-container.tp-main .content-screen .screen.screen-main .layout-function{position:absolute;top:2vh;left:2vw;width:100%;height:0;transition:.5s;overflow:hidden}.tp-container.tp-main .content-screen .screen.screen-main .layout-function.active{height:100%}.tp-container.tp-main .content-screen .screen.screen-main .layout-function .back{width:100%;height:4vh;line-height:4vh;font-weight:bolder;cursor:pointer}.tp-container.tp-main .content-screen .screen.screen-main .layout-function .box{width:0;height:0;opacity:0;transition:.5s;background:rgba(0,0,0,.1);backdrop-filter:blur(5px);border-radius:10px;padding:10px;margin-bottom:10px position: absolute}.tp-container.tp-main .content-screen .screen.screen-main .layout-function .box.show{width:100%;height:auto;opacity:1}.tp-container.tp-main .content-screen .screen.screen-online{top:0;left:100%}.tp-container.tp-main .content-screen .screen.active{top:0;left:0}</style>`;

  // Khởi tạo biến toàn cục
  var INFO_PAGE = null;
  // --- KHU VỰC ĐỊNH NGHĨA CÁC HÀM CHỨC NĂNG --- (Đã chuyển lên trên func_list)
  // var funcTest = () => {
  //     boxAlert("Hàm thử nghiệm ĐÃ CHẠY", "success");
  // }

  /**
   * @func flash_sale
   * @description 'Làm chương trình khuyến mãi'
   */
  var flash_sale = () => {
    return;
  }

  /**
   * @func gia_duoi
   * @description 'Sửa giá khuyễn mãi bằng giá đuôi'
   */
  var gia_duoi = () => {
    boxAlert("SỬA GIÁ THEO GIÁ ĐUÔI", "info");
    if (INFO_PAGE.url.host.split(".").includes("shopee"))
      shopee();
    else if(INFO_PAGE.url.host.split(".").includes("tiktok"))
      tiktok();
    else if(INFO_PAGE.url.host.split(".").includes("lazada"))
      lazada();

    function lamGia(gia){
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

        if(!box.eq(indexBox).find(".eds-checkbox.discount-item-selector input").prop("checked")){
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

          if(variant_switch.find(".eds-switch--disabled").length == 0){
            if(variant_switch.find(".eds-switch--close").length > 0){
              simulateReactEvent(variant_switch.find(".eds-switch--close"), "click");
            }
          }else{
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
        //     name: "Thử Nghiệm",
        //     func: funcTest,
        //     func_name: "funcTest",
        //     layout_name: "",
        //     platform: ["*"]
        // },
    {
      name: "Sửa Giá Theo Giá Đuôi",
      func: gia_duoi,
      func_name: "gia_duoi",
      layout_name: "",
      platform: ["shopee", "tiktok", "lazada"]
    },
    {
      name: "Chương Trình Flash Sale",
      func: flash_sale,
      func_name: "flash_sale",
      layout_name: "flash_sale",
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

  // =========================================================================
  // HÀM LẤY THÔNG TIN & KIỂM TRA PHIÊN BẢN
  // =========================================================================

  /**
   * @func getUrlServer
   * @description 'Lấy dữ liệu từ file GITHUB'
   */
  async function getUrlServer(owner = "pntan", repo = "TOOLv3", path = "version", branch = "main") {
    try {
      var res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}&_=${Date.now()}`, {
        headers: {
          Authorization: `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`,
        }
      });

      if (!res.ok) {
        console.error("Lỗi HTTP khi lấy phiên bản:", res.status);
        return null;
      }

      var json = await res.json();
      var content = atob(json.content); // Giải mã base64
      var url = content.trim();

      return url;
    } catch (e) {
      console.error("Không thể lấy URL từ GitHub:", e.message);
      return null;
    }
  }

  function check_version() {
    boxAlert(`Đang kiểm tra phiên bản...`, "log");
    getUrlServer().then(latest_version => {
      if (!latest_version) {
        boxAlert("Không thể lấy phiên bản từ server!", "error");
        return;
      }
      if (latest_version != VERSION)
        boxAlert(`Phiên bản mới đã có: ${latest_version}. Vui lòng cập nhật!`, "warn");
      else
        boxAlert(`Phiên bản hiện tại: ${VERSION}`, "log");
    });
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

    theme_mode();
    screen_display();
    theme_color();
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
      $(this).addClass("active")

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
  }

  // Bắt đầu
  check_version();
  delay(3000).then(() => {
    INIT();
    boxToast("ĐÃ KHỞI TẠO CHƯƠNG TRÌNH", "success");
    boxAlert("ĐÃ KHỞI TẠO CHƯƠNG TRÌNH");
  });
})();
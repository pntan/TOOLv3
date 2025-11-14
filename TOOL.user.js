// ==UserScript==
// @name          CÔNG CỤ HỖ TRỢ V4
// @version       0.0.1
// @namespace     tanphan.toolv3
// @icon          https://www.google.com/s2/favicons?sz=64&domain=http://anonymouse.org/
// @description   Một số công cụ hỗ trợ công việc
// @license       MIT
// @author        TânPhan
// @copyright     2025, TanPhan (nhattanphan2014@gmail.com)
// @match         *://*/*
// @grant         none
// @updateURL     https://openuserjs.org/meta/pntan/TOOL.user.js
// @updateURL     https://cdn.jsdelivr.net/gh/pntan/TOOLv3@0.0.1/TOOL.user.js
// @downloadURL   https://cdn.jsdelivr.net/gh/pntan/TOOLv3@0.0.1/TOOL.user.js
// @require       https://code.jquery.com/jquery-3.7.1.min.js
// @require       https://code.jquery.com/ui/1.13.2/jquery-ui.min.js
// ==/UserScript==
(function() {
    'use strict';

    const VERSION = '0.0.1';
    const X_LIMIT = 5;
    
    // --- ĐÃ CẬP NHẬT: Thêm nút action-btn vào gia_duoi_layout ---
    const HTML_UI = `<div class="tp-container tp-toast"></div><style>.tp-container.tp-toast{width:fit-content;height:auto;position:fixed;margin-left:50%;top:5%;transform:translate(-50%);z-index:999999999;display:flex;flex-direction:column;flex-wrap:wrap;gap:2vh}.tp-container.tp-toast .toast{padding:1vh 1vw;background:#fff;border-radius:10px;color:#fff;text-shadow:0 0 1px #121212,0 0 1px #121212,0 0 1px #121212,0 0 1px #121212,0 0 1px #121212}.tp-container.tp-toast .toast.info{background:rgba(80,220,245,.7)}.tp-container.tp-toast .toast.success{background:rgba(111,255,155,.7)}.tp-container.tp-toast .toast.error{background:rgba(245,80,80,.7)}.tp-container.tp-toast .toast.warning{background:rgba(245,229,80,.7)}</style><div class="tp-container tp-main"><div class="header"><div class="time">00:00:00</div><div class="theme-switcher"><button class="btn-theme light-mode active"data-theme="light">☀️</button> <button class="btn-theme dark-mode"data-theme="dark">🌙</button></div></div><div class="list-screen"><div class="box-screen setting"data-screen="setting"><p>⚙️</p></div><div class="box-screen main"data-screen="main"><p>🏡</p></div><div class="box-screen online"data-screen="online"><p>🖥️</p></div></div><div class="content-screen"><div class="screen screen-setting"><p>Setting Screen</p></div><div class="screen screen-main active"><div class="list-function active"><div class="box-function"><p>Function 1</p></div><div class="box-function"><p>Function 2</p></div><div class="box-function"><p>Function 3</p></div><div class="box-function"><p>Function 4</p></div><div class="box-function"><p>Function 5</p></div><div class="box-function"><p>Function 6</p></div><div class="box-function"><p>Function 7</p></div></div><div class="layout-function"><div class="back">Trở Lại</div><div class="box gia_duoi show" id="gia_duoi_layout"><p>GIÁ ĐUÔI</p><button class="action-btn" data-action="gia_duoi">THỰC HIỆN SỬA GIÁ</button></div></div></div><div class="screen screen-online"><p>Online Screen</p></div></div><style>.tp-container{padding:0;margin:0;border:none;box-sizing:border-box}.tp-container *{padding:0;margin:0;border:0;box-sizing:border-box;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-weight:700;user-select:none}.tp-container ::-webkit-scrollbar{height:6px;width:6px}.tp-container ::-webkit-scrollbar-track{border-radius:20px;background-color:#000}.tp-container ::-webkit-scrollbar-track:hover{background-color:#5a5e5f}.tp-container ::-webkit-scrollbar-track:active{background-color:#ff9e9e}.tp-container ::-webkit-scrollbar-thumb{border-radius:20px;background-color:#eaeaea}.tp-container ::-webkit-scrollbar-thumb:hover{background-color:#a36f6f}.tp-container ::-webkit-scrollbar-thumb:active{background-color:#888bce}.tp-container .action-btn{margin-top:10px;padding:5px 10px;background:lightgreen;border-radius:5px;cursor:pointer;color:#121212}.tp-container.tp-main{top:0;position:fixed;background:rgba(223,223,223,.5);backdrop-filter:blur(10px);width:0;padding:0;height:109%;color:#fff;z-index:999999998;transition:.5s}.tp-container.tp-main.active,.tp-container.tp-main:hover{width:60vw;height:100%;padding:2vh 2vw}.tp-container.tp-main .header{display:flex;justify-content:space-between;align-items:center;width:100%;height:3vh;color:#000;overflow:hidden}.tp-container.tp-main .header .time{font-size:1.5vh;letter-spacing:1rcap}.tp-container.tp-main .header .theme-switcher{position:relative;width:auto;height:100%;aspect-ratio:1/1}.tp-container.tp-main .header .theme-switcher .btn-theme{position:absolute;height:100%;border-radius:50%;font-size:2vh;cursor:pointer;background:0 0;transition:.5s}.tp-container.tp-main .header .theme-switcher .btn-theme.active{top:0!important;left:0}.tp-container.tp-main .header .theme-switcher .btn-theme.light-mode{top:-100%;left:0}.tp-container.tp-main .header .theme-switcher .btn-theme.dark-mode{top:100%;left:0}.tp-container.tp-main .list-screen{margin-top:2vh;display:flex;flex-direction:row;justify-content:flex-start;align-items:center;width:100%;height:4vh;overflow-y:auto}.tp-container.tp-main .list-screen .box-screen{width:100%;height:4vh;background:rgba(0,0,0,.1);backdrop-filter:blur(5px);display:flex;justify-content:center;align-items:center;font-size:2vh;color:#000;cursor:pointer}.tp-container.tp-main .list-screen .box-screen.active{background:rgba(0,0,0,.3);backdrop-filter:blur(10px)}.tp-container.tp-main .list-screen .box-screen:hover p{transform:scale(1.3);transition:.3s}.tp-container.tp-main .list-screen .box-screen:first-child{border-top-left-radius:20px;border-bottom-left-radius:20px}.tp-container.tp-main .list-screen .box-screen:last-child{border-top-right-radius:20px;border-bottom-right-radius:20px}.tp-container.tp-main .content-screen{margin-top:2vh;width:100%;height:calc(100% - 15vh);background:rgba(0,0,0,.1);backdrop-filter:blur(5px);border-radius:20px;overflow:hidden;position:relative}.tp-container.tp-main .content-screen .screen{width:100%;height:100%;color:#000;transition:.5s;position:absolute;padding:2vh 2vw}.tp-container.tp-main .content-screen .screen.screen-setting{top:0;left:-100%}.tp-container.tp-main .content-screen .screen.screen-main{top:100%;left:0;position:relative;width:100%}.tp-container.tp-main .content-screen .screen.screen-main .list-function{width:0;height:100%;margin:0 auto;overflow-y:scroll;overflow:hidden;display:flex;flex-direction:row;flex-wrap:wrap;justify-content:space-around;align-items:flex-start;align-content:flex-start;gap:2vw;transition:.5s}.tp-container.tp-main .content-screen .screen.screen-main .list-function.active{width:100%}.tp-container.tp-main .content-screen .screen.screen-main .list-function .box-function{width:auto;height:4vh;line-height:auto;background:#fff;display:flex;flex-direction:row;justify-content:center;align-items:center;border-radius:10px;padding:2vh 2vw;word-break:keep-all}.tp-container.tp-main .content-screen .screen.screen-main .layout-function{position:absolute;top:2vh;left:2vw;width:100%;height:0;transition:.5s;overflow:hidden}.tp-container.tp-main .content-screen .screen.screen-main .layout-function.active{height:100%}.tp-container.tp-main .content-screen .screen.screen-main .layout-function .back{width:100%;height:4vh;line-height:4vh;font-weight:bolder;cursor:pointer}.tp-container.tp-main .content-screen .screen.screen-main .layout-function .box{width:0;height:0;opacity:0;transition:.5s;background:rgba(0,0,0,.1);backdrop-filter:blur(5px);border-radius:10px;padding:10px;margin-bottom:10px}.tp-container.tp-main .content-screen .screen.screen-main .layout-function .box.show{width:100%;height:auto;opacity:1}.tp-container.tp-main .content-screen .screen.screen-online{top:0;left:100%}.tp-container.tp-main .content-screen .screen.active{top:0;left:0}</style></div>`;

    // Khởi tạo biến toàn cục
    var INFO_PAGE = null;

    // --- KHU VỰC ĐỊNH NGHĨA CÁC HÀM CHỨC NĂNG --- (Đã chuyển lên trên func_list)
    // var funcTest = () => {
    //     boxAlert("Hàm thử nghiệm ĐÃ CHẠY", "success");
    // }

    var gia_duoi = () => {
        boxAlert("Chức năng sửa giá đuôi ĐANG THỰC HIỆN...", "info");
        // Logic thực thi sửa giá sẽ nằm ở đây
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
            layout_name: "gia_duoi",
            platform: ["shopee"]
        },
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

        theme_mode();
        screen_display();
        return true
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

        // Theo dõi chuột (giữ nguyên logic của bạn)
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
    }

    // Bắt đầu
    check_version();
    delay(3000).then(() => {
        INIT();
        boxToast("ĐÃ KHỞI TẠO CHƯƠNG TRÌNH", "success");
        boxAlert("ĐÃ KHỞI TẠO CHƯƠNG TRÌNH");
    });
})();
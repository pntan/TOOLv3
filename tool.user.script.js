// ==UserScript==
// @name         CÔNG CỤ HỖ TRỢ v3
// @namespace    tanphan/chuanmua/tool.user.script
// @version      4.0.0
// @author       TânPhan
// @description  Các chức năng hỗ t rợ cho sàn TMĐT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=http://anonymouse.org/
// @match        https://*/*
// @match        http://*/*
// @connect      *
// @grant        GM.addElement
// @grant        GM.addStyle
// @grant        GM.addValueChangeListener
// @grant        GM.audio
// @grant        GM.cookie
// @grant        GM.deleteValue
// @grant        GM.deleteValues
// @grant        GM.download
// @grant        GM.getResourceText
// @grant        GM.getResourceUrl
// @grant        GM.getTab
// @grant        GM.getTabs
// @grant        GM.getValue
// @grant        GM.getValues
// @grant        GM.info
// @grant        GM.listValues
// @grant        GM.log
// @grant        GM.notification
// @grant        GM.openInTab
// @grant        GM.registerMenuCommand
// @grant        GM.removeValueChangeListener
// @grant        GM.saveTab
// @grant        GM.setClipboard
// @grant        GM.setValue
// @grant        GM.setValues
// @grant        GM.unregisterMenuCommand
// @grant        GM.webRequest
// @grant        GM.xmlHttpRequest
// @grant        GM_addElement
// @grant        GM_addStyle
// @grant        GM_addValueChangeListener
// @grant        GM_audio
// @grant        GM_cookie
// @grant        GM_deleteValue
// @grant        GM_deleteValues
// @grant        GM_download
// @grant        GM_getResourceText
// @grant        GM_getResourceURL
// @grant        GM_getTab
// @grant        GM_getTabs
// @grant        GM_getValue
// @grant        GM_getValues
// @grant        GM_info
// @grant        GM_listValues
// @grant        GM_log
// @grant        GM_notification
// @grant        GM_openInTab
// @grant        GM_registerMenuCommand
// @grant        GM_removeValueChangeListener
// @grant        GM_saveTab
// @grant        GM_setClipboard
// @grant        GM_setValue
// @grant        GM_setValues
// @grant        GM_unregisterMenuCommand
// @grant        GM_webRequest
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @grant        window.close
// @grant        window.focus
// @grant        window.onurlchange

// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @run-at       document-start
// ==/UserScript==

/* globals       jQuery, $ */

(function(){
  'use strict';
  // Một số thông tin về trang đang chạy
  const CONSTANST_NAME = {
    host: document.location.host,
    pathName: document.location.pathname,
    search: document.location.search,
  }

  /**
   * HÀM GIAO DIỆN BẮT API (INTERCEPTOR)
   * Giúp lắng nghe mọi request fetch từ sàn TMĐT
   */
  const API_INTERCEPTOR = async () => {
    // 1. Chặn Fetch
    const originalFetch = unsafeWindow.fetch;
    unsafeWindow.fetch = async (...args) => {
      // console.log("Fetch call:", args);
      return originalFetch(...args);
    };

    // 2. Chặn XHR (Quan trọng)
    const originalOpen = unsafeWindow.XMLHttpRequest.prototype.open;
    unsafeWindow.XMLHttpRequest.prototype.open = function(method, url) {
      this.addEventListener('load', function() {
        console.log("XHR call:", url);
        console.log("XHR Data:", JSON.parse(this.response)); // Xem nội dung trả về ở đây
      });
      return originalOpen.apply(this, arguments);
    };
  };

  const LOGING = ({type = "log", text}) => {
    console.log(`%cTOOLv3: %c${text}`, "color: #fd5a99; font-size: 2rem", "color: #33b78e; font-size: 1.5rem")
  }

  const create_layout = () => {
    LOGING({text: "Đang khởi tạo giao diện"});
  }

  const LOAD_TOOL = () => {
    // Khởi tạo giao diện
    create_layout();
    API_INTERCEPTOR();
  }

  LOAD_TOOL();
})()
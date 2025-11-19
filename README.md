# 🛠️ CÔNG CỤ HỖ TRỢ V4

**Phiên bản hiện tại: 0.0.1**

---

- Một công cụ hỗ trợ công việc đa nền tảng, được thiết kế để tối ưu hóa quy trình làm việc và tự động hóa các tác vụ lặp đi lặp lại.

- Hiện tại công cụ đang hỗ trợ được: **SHOPEE**, **TIKTOK**, **LAZADA**

## ✨ Tính năng nổi bật

* **Giao diện trực quan:** Giao diện người dùng (UI) gọn gàng, có thể mở/đóng bằng cách di chuột về phía cạnh màn hình.
* **Hỗ trợ đa nền tảng:** Các chức năng được lọc và hiển thị dựa trên nền tảng (host) hiện tại, ví dụ: các công cụ Shopee chỉ hiển thị trên trang Shopee.
* ~~**Chế độ sáng/tối:** Dễ dàng chuyển đổi giữa chế độ `Light` (Sáng) và `Dark` (Tối)~~ ***(cập nhật sau)***.
* **Hệ thống thông báo Toast:** Hiển thị các thông báo (info, success, error, warning) ngay trên màn hình.
* ~~**Kiểm tra phiên bản tự động:** Tự động kiểm tra và cảnh báo khi có phiên bản Userscript mới trên GitHub.~~ ***(cập nhật sau)***

---

## 🚀 Hướng dẫn cài đặt và sử dụng

Đây là một **Userscript**, bạn cần cài đặt một tiện ích mở rộng (Extension) hỗ trợ Userscript trước khi sử dụng.

### 1. Cài đặt Tiện ích Userscript

Bạn nên sử dụng một trong các tiện ích sau:

* **[Tampermonkey](https://www.tampermonkey.net/)** (Được khuyến nghị)
* **[Violentmonkey](https://violentmonkey.github.io/)**

### 2. Cài đặt Userscript

Có hai cách để cài đặt Userscript này:

#### Cách 1: Cài đặt qua OpenUserJS (Được khuyến nghị)

Userscript này đã được đăng ký trên OpenUserJS, giúp việc cập nhật dễ dàng hơn:

* **[Cài đặt CÔNG CỤ HỖ TRỢ V4](https://openuserjs.org/scripts/pntan/TOOL)**

#### Cách 2: Cài đặt trực tiếp qua GitHub/CDN

Bạn có thể cài đặt trực tiếp file `.user.js` từ CDN hoặc GitHub:

* **Link Userscript:** [https://cdn.jsdelivr.net/gh/pntan/TOOLv3/TOOL.user.js](https://cdn.jsdelivr.net/gh/pntan/TOOLv3/TOOL.user.js)
    *(Nhấp vào liên kết này sau khi đã cài đặt Tampermonkey/Violentmonkey.)*

### 3. Hướng dẫn sử dụng cơ bản

1.  **Kích hoạt Giao diện:** Di chuyển con trỏ chuột về phía **cạnh trái/phải** của màn hình. Giao diện công cụ sẽ trượt ra.
2.  **Chọn Màn hình:** Nhấp vào các biểu tượng `⚙️` (Cài đặt), `🏡` (Chính), hoặc `🖥️` (Trực tuyến) để chuyển đổi giữa các màn hình chức năng.
3.  **Thực thi Chức năng:**
    * Trong màn hình **🏡 Chính**, chọn một hộp chức năng (ví dụ: "Sửa Giá Theo Giá Đuôi").
    * Nếu chức năng có giao diện riêng (layout), nó sẽ hiển thị ra. Nhấn nút **"THỰC HIỆN..."** (ví dụ: `THỰC HIỆN SỬA GIÁ`) để chạy.
    * Nếu chức năng không có giao diện riêng, nó sẽ được chạy ngay lập tức khi bạn nhấp vào.
4.  **Trở lại:** Nhấn nút **"Trở Lại"** để quay về danh sách chức năng.

---

## Hướng dẫn sử dụng

Các chức năng offline có thể sử dụng mọi lúc mà không cần máy chủ. Các chức năng ví dụ chat bot hoặc gợi ý đặt tên,... đều cần máy chủ để sử dụng
### Sửa giá theo giá đuôi

* Hàm có chắc năng biến đổi giá hoặc một số thành một giá hoặc số mới (ví dụ **95059** đổi thành **59000**)
* Với **SHOPEE** bạn cần vào trang làm chương trình khuyến mãi (*https://banhang.shopee.vn/portal/marketing/discount/xxx* với xxx là ID chương trình) và tích chọn những sản phẩm cần làm giá khuyến mãi
* Chương trình sẽ tự lấy giá hiện tại (giá niêm yết trên sàn) và sửa thành giá khuyễn mãi.
**Lưu ý: ** Giá niêm yết phải bao gồm cả giá đuôi (giá khuyến mãi)

### Lấy mã phân loại
* Lấy được mã phân loại cả 2 giao diện của **SHOPEE**
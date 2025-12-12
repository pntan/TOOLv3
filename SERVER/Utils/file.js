import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer'; // Thư viện xử lý upload file

// Cấu hình đường dẫn cho ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đường dẫn gốc của dự án (Thư mục chứa package.json)
const ROOT_DIR = path.join(__dirname, '../');

class FileManager {
    constructor() {
        this.rootDir = ROOT_DIR;
    }

    /**
     * --- 1. XỬ LÝ JSON (Dùng cho Config, Backup) ---
     */

    // Đọc file JSON, trả về object. Nếu lỗi hoặc không có file -> Trả về defaultValue
    async readJson(relativePath, defaultValue = {}) {
        try {
            const filePath = path.join(this.rootDir, relativePath);
            
            // Kiểm tra file có tồn tại không
            if (!fsSync.existsSync(filePath)) {
                return defaultValue;
            }

            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`❌ Lỗi đọc JSON (${relativePath}):`, error.message);
            return defaultValue;
        }
    }

    // Ghi object vào file JSON
    async writeJson(relativePath, data) {
        try {
            const filePath = path.join(this.rootDir, relativePath);
            // format JSON đẹp (indent 2 spaces)
            await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
            // console.log(`✅ Đã lưu file: ${relativePath}`);
            return true;
        } catch (error) {
            console.error(`❌ Lỗi ghi JSON (${relativePath}):`, error.message);
            return false;
        }
    }

    /**
     * --- 2. QUẢN LÝ THƯ MỤC & FILE ---
     */

    // Đảm bảo thư mục tồn tại. Nếu chưa có -> Tạo mới
    ensureFolder(relativePath) {
        const dirPath = path.join(this.rootDir, relativePath);
        if (!fsSync.existsSync(dirPath)) {
            fsSync.mkdirSync(dirPath, { recursive: true });
            console.log(`📂 Đã tạo thư mục mới: ${relativePath}`);
        }
        return dirPath;
    }

    // Xóa file
    async deleteFile(relativePath) {
        try {
            const filePath = path.join(this.rootDir, relativePath);
            if (fsSync.existsSync(filePath)) {
                await fs.unlink(filePath);
                console.log(`🗑️ Đã xóa file: ${relativePath}`);
            }
        } catch (error) {
            console.error(`❌ Lỗi xóa file (${relativePath}):`, error.message);
        }
    }

    /**
     * --- 3. CẤU HÌNH UPLOAD (MULTER) ---
     * Dùng để nhận file từ Client gửi lên (Ảnh, Excel...)
     */
    getUploadMiddleware(folderName = 'uploads') {
        // 1. Đảm bảo thư mục upload tồn tại
        const uploadDir = this.ensureFolder(folderName);

        // 2. Cấu hình nơi lưu và tên file
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, uploadDir);
            },
            filename: function (req, file, cb) {
                // Đặt tên file: timestamp-tên-gốc (để tránh trùng)
                // Ví dụ: 1700000_avatar.jpg
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                // Lấy đuôi file
                const ext = path.extname(file.originalname);
                cb(null, file.fieldname + '-' + uniqueSuffix + ext);
            }
        });

        // 3. Trả về đối tượng multer đã cấu hình
        return multer({ storage: storage });
    }
}

// Export một instance duy nhất
const FILE = new FileManager();
export default FILE;
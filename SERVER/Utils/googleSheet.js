import {
    google
} from 'googleapis';
import path from 'path';
import {
    fileURLToPath
} from 'url';
import 'dotenv/config';

// 1. Cấu hình đường dẫn
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Auth
const KEY_FILE_PATH = path.join(__dirname, '../service-account.json');

class GGSHEET_SERVICE {
    constructor() {
        // 1. Khởi tạo Auth và Client ngay khi class được tạo
        this.spreadsheetId = process.env.SPREADSHEET_ID;

        if (!this.spreadsheetId) {
            console.error("❌ CHƯA CẤU HÌNH SPREADSHEET_ID TRONG FILE .ENV");
        }

        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_FILE_PATH,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        this.sheets = google.sheets({
            version: 'v4',
            auth
        });
    }
    /**
     * --- HÀM HELPER (QUAN TRỌNG: Cần hàm này để lấy ID cho các thao tác cấu trúc) ---
     */
    async _getSheetIdByName(sheetName) {
        try {
            const res = await this.sheets.spreadsheets.get({
                spreadsheetId: this.spreadsheetId,
            });
            const sheet = res.data.sheets.find(s => s.properties.title === sheetName);
            return sheet ? sheet.properties.sheetId : null;
        } catch (error) {
            console.error('Lỗi _getSheetIdByName:', error.message);
            return null;
        }
    }

    // Tách tên sheet từ range (VD: 'Sheet1!A1:B2' -> 'Sheet1')
    _getSheetNameFromRange(range) {
        if (!range.includes('!')) return range; // Nếu chỉ truyền tên sheet
        return range.split('!')[0];
    }

    // Đảm bảo Sheet tồn tại. Nếu chưa có thì TỰ TẠO.
    async _ensureSheetExists(sheetName) {
        const id = await this._getSheetIdByName(sheetName);
        if (id !== null) return id; // Đã tồn tại

        console.log(`⚠️ Sheet "${sheetName}" chưa tồn tại. Đang tự động tạo mới...`);
        await this.createNewSheet(sheetName);
        
        // Lấy lại ID sau khi tạo
        return await this._getSheetIdByName(sheetName);
    }

    // 1. Kiểm tra sheet có tồn tại không (Trả về true/false)
    async checkSheetExists(sheetName) {
        const id = await this._getSheetIdByName(sheetName);
        return id !== null;
    }

    // 2. Tạo Sheet mới thủ công
    async createNewSheet(sheetName) {
        try {
            const requests = [{
                addSheet: {
                    properties: {
                        title: sheetName
                    }
                }
            }];
            await this.sheets.spreadsheets.batchUpdate({
                spreadsheetId: this.spreadsheetId,
                resource: { requests }
            });
            console.log(`✅ Đã tạo Sheet mới: "${sheetName}"`);
            return true;
        } catch (error) {
            console.error(`❌ Lỗi tạo sheet "${sheetName}":`, error.message);
            return false;
        }
    }

    // 3. Đổi tên Sheet
    async renameSheet(oldName, newName) {
        try {
            const sheetId = await this._getSheetIdByName(oldName);
            if (sheetId === null) throw new Error(`Không tìm thấy sheet: ${oldName}`);

            const requests = [{
                updateSheetProperties: {
                    properties: {
                        sheetId: sheetId,
                        title: newName
                    },
                    fields: 'title'
                }
            }];
            await this.sheets.spreadsheets.batchUpdate({
                spreadsheetId: this.spreadsheetId,
                resource: { requests }
            });
            console.log(`✅ Đã đổi tên "${oldName}" thành "${newName}"`);
            return true;
        } catch (error) {
            console.error('❌ Lỗi renameSheet:', error.message);
            return false;
        }
    }

    // 4. Đổi màu Tab (Sheet Color)
    // colorObj dạng: { red: 1, green: 0, blue: 0 } (Giá trị từ 0 đến 1)
    async changeSheetColor(sheetName, colorObj) {
        try {
            const sheetId = await this._getSheetIdByName(sheetName);
            if (sheetId === null) throw new Error(`Không tìm thấy sheet: ${sheetName}`);

            const requests = [{
                updateSheetProperties: {
                    properties: {
                        sheetId: sheetId,
                        tabColor: colorObj
                    },
                    fields: 'tabColor'
                }
            }];
            await this.sheets.spreadsheets.batchUpdate({
                spreadsheetId: this.spreadsheetId,
                resource: { requests }
            });
            console.log(`✅ Đã đổi màu tab cho sheet: "${sheetName}"`);
        } catch (error) {
            console.error('❌ Lỗi changeSheetColor:', error.message);
        }
    }

    // 5. Xóa Sheet
    async deleteSheet(sheetName) {
        try {
            const sheetId = await this._getSheetIdByName(sheetName);
            if (sheetId === null) {
                console.warn(`⚠️ Không thể xóa. Sheet "${sheetName}" không tồn tại.`);
                return;
            }

            const requests = [{
                deleteSheet: {
                    sheetId: sheetId
                }
            }];
            await this.sheets.spreadsheets.batchUpdate({
                spreadsheetId: this.spreadsheetId,
                resource: { requests }
            });
            console.log(`🗑️ Đã xóa sheet: "${sheetName}"`);
        } catch (error) {
            console.error('❌ Lỗi deleteSheet:', error.message);
        }
    }

    /**
     * 1. ĐỌC DỮ LIỆU (READ)
     */
    async readSheet(range) {
        try {
            // Với hàm đọc, nếu sheet không tồn tại thì trả về rỗng, không tự tạo
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: range,
            });
            return response.data.values || [];
        } catch (error) {
            // Nếu lỗi do sheet không tồn tại -> Trả về mảng rỗng thay vì ném lỗi
            if(error.message.includes('Unable to parse range')) {
                console.warn(`⚠️ Sheet không tồn tại khi đọc: ${range}`);
                return [];
            }
            console.error(`❌ Lỗi readSheet (${range}):`, error.message);
            return [];
        }
    }

    /**
     * 2. GHI THÊM DỮ LIỆU CUỐI CÙNG (APPEND)
     */
    async appendSheet(range, values) {
        try {
            // BƯỚC QUAN TRỌNG: Tự động tạo sheet nếu chưa có
            const sheetName = this._getSheetNameFromRange(range);
            await this._ensureSheetExists(sheetName);

            const response = await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: range,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values
                },
            });
            console.log(`✅ Đã thêm ${values.length} dòng vào: ${range}`);
            return response.data;
        } catch (error) {
            console.error(`❌ Lỗi appendSheet (${range}):`, error.message);
            throw error;
        }
    }

    /**
     * 3. GHI ĐÈ/CẬP NHẬT (UPDATE)
     */
    async updateSheet(range, values) {
        try {
            // BƯỚC QUAN TRỌNG: Tự động tạo sheet nếu chưa có
            const sheetName = this._getSheetNameFromRange(range);
            await this._ensureSheetExists(sheetName);

            const response = await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: range,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values
                },
            });
            console.log(`✅ Đã update tại: ${range}`);
            return response.data;
        } catch (error) {
            console.error(`❌ Lỗi updateSheet (${range}):`, error.message);
            return null;
        }
    }

    /**
     * 4. GHI VÀO ĐẦU TRANG (PREPEND)
     */
    async prependSheet(sheetName, values) {
        try {
            // BƯỚC QUAN TRỌNG: Tự động tạo sheet nếu chưa có
            const sheetId = await this._ensureSheetExists(sheetName);
            
            // Chèn dòng trống
            await this.sheets.spreadsheets.batchUpdate({
                spreadsheetId: this.spreadsheetId,
                resource: {
                    requests: [{
                        insertDimension: {
                            range: {
                                sheetId: sheetId,
                                dimension: "ROWS",
                                startIndex: 0,
                                endIndex: values.length
                            },
                            inheritFromBefore: false
                        }
                    }]
                }
            });

            // Ghi dữ liệu
            const range = `${sheetName}!A1`;
            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: range,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values
                }
            });

            console.log(`✅ Đã chèn ${values.length} dòng lên đầu Sheet ${sheetName}`);
        } catch (error) {
            console.error('❌ Lỗi prependSheet:', error.message);
        }
    }

    /**
     * 5. THÊM CỘT MỚI (ADD COLUMN)
     * Tự động tìm cột trống bên phải cuối cùng và điền dữ liệu
     */
    async addColumn(sheetName, headerName, columnValues) {
        try {
            // Đảm bảo sheet tồn tại trước
            await this._ensureSheetExists(sheetName);

            const readRes = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${sheetName}!1:1`, // Đọc dòng tiêu đề (Dòng 1)
            });

            const existingHeaders = readRes.data.values ? readRes.data.values[0] : [];
            const nextColIndex = existingHeaders.length;

            // Helper đổi số sang chữ (0->A, 1->B... 26->AA)
            const getColLetter = (n) => {
                let s = "";
                while (n >= 0) {
                    s = String.fromCharCode(n % 26 + 65) + s;
                    n = Math.floor(n / 26) - 1;
                }
                return s;
            };

            const nextColLetter = getColLetter(nextColIndex);
            const range = `${sheetName}!${nextColLetter}1`;

            // Google yêu cầu mảng 2 chiều dọc: [[Header], [Val1], [Val2]...]
            const updateData = [[headerName], ...columnValues.map(v => [v])];

            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: range,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: updateData
                }
            });

            console.log(`✅ Đã thêm cột "${headerName}" tại ${nextColLetter}`);
        } catch (error) {
            console.error('❌ Lỗi addColumn:', error.message);
        }
    }

    /**
     * 6. CHÈN HÀNG VÀO VỊ TRÍ BẤT KỲ (INSERT ROWS)
     * Đẩy dữ liệu cũ xuống dưới
     */
    async insertRows(sheetName, rowIndex, values) {
        try {
            // SỬA LỖI: Dùng this._getSheetIdByName thay vì gọi hàm trần
            const sheetId = await this._getSheetIdByName(sheetName);
            if (sheetId === null) {
                 // Nếu chưa có sheet thì tạo mới và chèn vào đầu luôn
                 await this.prependSheet(sheetName, values);
                 return;
            }

            // Bước 1: Chèn dòng trống
            await this.sheets.spreadsheets.batchUpdate({
                spreadsheetId: this.spreadsheetId,
                resource: {
                    requests: [{
                        insertDimension: {
                            range: {
                                sheetId: sheetId,
                                dimension: "ROWS",
                                startIndex: rowIndex,
                                endIndex: rowIndex + values.length
                            },
                            inheritFromBefore: false
                        }
                    }]
                }
            });

            // Bước 2: Ghi dữ liệu vào
            const rowNumber = rowIndex + 1; // Index 0 là dòng 1 Excel
            const range = `${sheetName}!A${rowNumber}`;

            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: range,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values
                }
            });

            console.log(`✅ Đã chèn ${values.length} dòng vào index ${rowIndex}`);
        } catch (error) {
            console.error('❌ Lỗi insertRows:', error.message);
        }
    }

    /**
     * 7. XÓA HÀNG (DELETE ROWS)
     */
    async deleteRows(sheetName, startIndex, count = 1) {
        try {
            // SỬA LỖI: Dùng this.
            const sheetId = await this._getSheetIdByName(sheetName);
            if (sheetId === null) throw new Error(`Không tìm thấy sheet: ${sheetName}`);

            await this.sheets.spreadsheets.batchUpdate({
                spreadsheetId: this.spreadsheetId,
                resource: {
                    requests: [{
                        deleteDimension: {
                            range: {
                                sheetId: sheetId,
                                dimension: "ROWS",
                                startIndex: startIndex,
                                endIndex: startIndex + count
                            }
                        }
                    }]
                }
            });
            console.log(`🗑️ Đã xóa ${count} dòng từ index ${startIndex}`);
        } catch (error) {
            console.error('❌ Lỗi deleteRows:', error.message);
        }
    }

    /**
     * 8. XÓA DỮ LIỆU (CLEAR SHEET)
     * Giữ lại ô, chỉ xóa nội dung
     */
    async clearSheet(range) {
        try {
            // Không cần check sheet exists, nếu không có thì API tự báo lỗi hoặc bỏ qua
            await this.sheets.spreadsheets.values.clear({
                spreadsheetId: this.spreadsheetId,
                range: range,
            });
            console.log(`🧹 Đã clear vùng: ${range}`);
        } catch (error) {
            console.error('❌ Lỗi clearSheet:', error.message);
        }
    }

    /**
     * 9. ĐỊNH DẠNG CELL (FORMAT: MÀU, FONT, CANH LỀ)
     * @param {string} sheetName - Tên Sheet
     * @param {number} rowIndex - Dòng bắt đầu (0-based)
     * @param {number} colIndex - Cột bắt đầu (0-based. VD: A=0, B=1)
     * @param {number} rowCount - Số lượng dòng muốn tô
     * @param {number} colCount - Số lượng cột muốn tô
     * @param {Object} style - Object cấu hình màu sắc (Xem ví dụ dưới)
     */
    async formatRange(sheetName, rowIndex, colIndex, rowCount, colCount, style) {
        try {
            const sheetId = await this._getSheetIdByName(sheetName);
            if (sheetId === null) throw new Error(`Không tìm thấy sheet: ${sheetName}`);

            const requests = [{
                repeatCell: {
                    range: {
                        sheetId: sheetId,
                        startRowIndex: rowIndex,
                        endRowIndex: rowIndex + rowCount,
                        startColumnIndex: colIndex,
                        endColumnIndex: colIndex + colCount
                    },
                    cell: {
                        userEnteredFormat: {
                            backgroundColor: style.backgroundColor,
                            textFormat: {
                                bold: style.bold || false,
                                fontSize: style.fontSize || 10,
                                foregroundColor: style.fontColor || {
                                    red: 0,
                                    green: 0,
                                    blue: 0
                                }
                            },
                            horizontalAlignment: style.align || "LEFT",
                        }
                    },
                    fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)"
                }
            }];

            await this.sheets.spreadsheets.batchUpdate({
                spreadsheetId: this.spreadsheetId,
                resource: {
                    requests
                }
            });
            console.log(`✅ Đã định dạng vùng tại dòng ${rowIndex}`);
        } catch (error) {
            console.error('❌ Lỗi formatRange:', error.message);
        }
    }
}

const GGSHEET = new GGSHEET_SERVICE();
export default GGSHEET;
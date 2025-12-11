import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// 1. Cấu hình đường dẫn
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Auth
const KEY_FILE_PATH = path.join(__dirname, '../service-account.json');
const SPREADSHEET_ID = process.env.SPREADSHEET_ID; // Đảm bảo .env có biến này

const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

/**
 * --- HÀM HELPER (QUAN TRỌNG: Cần hàm này để lấy ID cho các thao tác cấu trúc) ---
 */
async function getSheetIdByName(sheetName) {
    try {
        const res = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
        });
        const sheet = res.data.sheets.find(s => s.properties.title === sheetName);
        return sheet ? sheet.properties.sheetId : null;
    } catch (error) {
        console.error('Lỗi getSheetIdByName:', error.message);
        return null;
    }
}

/**
 * 1. ĐỌC DỮ LIỆU (READ)
 */
export async function readSheet(range) {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
        });
        return response.data.values || [];
    } catch (error) {
        console.error(`❌ Lỗi readSheet (${range}):`, error.message);
        return [];
    }
}

/**
 * 2. GHI THÊM DỮ LIỆU CUỐI CÙNG (APPEND)
 */
export async function appendSheet(range, values) {
    try {
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
            valueInputOption: 'USER_ENTERED',
            resource: { values },
        });
        console.log(`✅ Đã thêm ${values.length} dòng vào: ${range}`);
        return response.data;
    } catch (error) {
        console.error(`❌ Lỗi appendSheet (${range}):`, error.message);
        return null;
    }
}

/**
 * 3. GHI ĐÈ/CẬP NHẬT (UPDATE)
 */
export async function updateSheet(range, values) {
    try {
        const response = await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
            valueInputOption: 'USER_ENTERED',
            resource: { values },
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
export async function prependSheet(sheetName, values) {
    try {
        const sheetId = await getSheetIdByName(sheetName);
        if (sheetId === null) throw new Error(`Không tìm thấy sheet: ${sheetName}`);

        // Chèn dòng trống lên đầu
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
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

        // Ghi dữ liệu vào dòng vừa chèn
        const range = `${sheetName}!A1`;
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
            valueInputOption: 'USER_ENTERED',
            resource: { values }
        });

        console.log(`✅ Đã chèn ${values.length} dòng lên đầu Sheet ${sheetName}`);
    } catch (error) {
        console.error('❌ Lỗi prependSheet:', error.message);
    }
}

/**
 * 5. THÊM CỘT MỚI (ADD COLUMN)
 */
export async function addColumn(sheetName, headerName, columnValues) {
    try {
        const readRes = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!1:1`,
        });

        const existingHeaders = readRes.data.values ? readRes.data.values[0] : [];
        const nextColIndex = existingHeaders.length;

        // Helper đổi số sang chữ (0->A, 1->B...)
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

        const updateData = [[headerName], ...columnValues.map(v => [v])];

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
            valueInputOption: 'USER_ENTERED',
            resource: { values: updateData }
        });

        console.log(`✅ Đã thêm cột "${headerName}" tại ${nextColLetter}`);
    } catch (error) {
        console.error('❌ Lỗi addColumn:', error.message);
    }
}

/**
 * 6. CHÈN HÀNG VÀO VỊ TRÍ BẤT KỲ (INSERT ROWS)
 */
export async function insertRows(sheetName, rowIndex, values) {
    try {
        const sheetId = await getSheetIdByName(sheetName);
        if (sheetId === null) throw new Error(`Không tìm thấy sheet: ${sheetName}`);

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
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

        const rowNumber = rowIndex + 1;
        const range = `${sheetName}!A${rowNumber}`;

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
            valueInputOption: 'USER_ENTERED',
            resource: { values }
        });

        console.log(`✅ Đã chèn ${values.length} dòng vào index ${rowIndex}`);
    } catch (error) {
        console.error('❌ Lỗi insertRows:', error.message);
    }
}

/**
 * 7. XÓA HÀNG (DELETE ROWS)
 */
export async function deleteRows(sheetName, startIndex, count = 1) {
    try {
        const sheetId = await getSheetIdByName(sheetName);
        if (sheetId === null) throw new Error(`Không tìm thấy sheet: ${sheetName}`);

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
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
        console.log(`✅ Đã xóa ${count} dòng từ index ${startIndex}`);
    } catch (error) {
        console.error('❌ Lỗi deleteRows:', error.message);
    }
}

/**
 * 8. XÓA DỮ LIỆU (CLEAR)
 */
export async function clearSheet(range) {
    try {
        await sheets.spreadsheets.values.clear({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
        });
        console.log(`✅ Đã clear vùng: ${range}`);
    } catch (error) {
        console.error('❌ Lỗi clearSheet:', error);
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
export async function formatRange(sheetName, rowIndex, colIndex, rowCount, colCount, style) {
  try {
    const sheetId = await getSheetIdByName(sheetName);
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
            // 1. Màu nền (Background Color) - Dùng RGB (0-1)
            backgroundColor: style.backgroundColor,

            // 2. Định dạng chữ (Text Format)
            textFormat: {
              bold: style.bold || false,
              fontSize: style.fontSize || 10,
              foregroundColor: style.fontColor || {
                red: 0,
                green: 0,
                blue: 0
              } // Màu chữ
            },

            // 3. Canh lề (Alignment)
            horizontalAlignment: style.align || "LEFT", // LEFT, CENTER, RIGHT
          }
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)" // Chỉ áp dụng các trường này
      }
        }];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: {
        requests
      }
    });
    console.log(`✅ Đã định dạng vùng tại dòng ${rowIndex}`);
  } catch (error) {
    console.error('❌ Lỗi formatRange:', error.message);
  }
}
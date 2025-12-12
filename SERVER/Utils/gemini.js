import { GoogleGenAI } from "@google/genai";
import fs from 'fs/promises'; 
import path from 'path';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { Buffer } from 'buffer';

// Helper để lấy __dirname trong ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GEMINI_SERVICE {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("❌ [GEMINI] CHƯA CẤU HÌNH GEMINI_API_KEY TRONG FILE .ENV");
            this.genAI = null;
        } else {
            // Khởi tạo GoogleGenAI
            this.genAI = new GoogleGenAI({apiKey}); 
        }
        
        // Giả sử thư mục uploads nằm ở ../uploads so với vị trí của file gemini.js
        this.UPLOAD_DIR = path.join(__dirname, '../uploads');
    }

    /**
     * Hàm Chat chính (SỬ DỤNG AI.MODELS.GENERATECONTENT)
     */
    async chat(userMessage, context = {}) {
        if (!this.genAI) return { reply: "Lỗi cấu hình API Key Server." };

        try {
            const contextString = JSON.stringify(context, null, 2);
            
            const prompt = `
            Bạn là Trợ lý ảo hỗ trợ công việc Thương mại điện tử.
            
            DANH SÁCH CHỨC NĂNG CÓ THỂ KÍCH HOẠT:
            - "flash_sale": Nếu muốn chạy flash sale.
            - "doi_hinh_phan_loai": Nếu muốn đổi hình ảnh hàng loạt.
            - "gia_duoi": Nếu muốn sửa giá đuôi.
            - "lay_ma_sanpham": Nếu muốn copy mã sản phẩm.
            - "generate_image": Nếu người dùng yêu cầu BẠN TẠO MỘT BỨC ẢNH.

            QUY TẮC TRẢ VỀ JSON ACTION:
            Nếu người dùng yêu cầu tạo ảnh, bạn phải trả về chuỗi JSON sau (không thêm text):
            {"action": "generate_image", "reply": "Đang tạo ảnh, vui lòng đợi...", "prompt_for_image": "mô tả prompt ảnh đã dịch sang tiếng Anh"}
            
            Nếu là câu hỏi thông thường, chỉ trả lời bằng text.
            
            USER MESSAGE: "${userMessage}"
            `;

            // FIX: Gọi generateContent thông qua this.genAI.models
            const response = await this.genAI.models.generateContent({ 
                model: "gemini-2.0-flash",
                contents: prompt,
            });
            const text = response.text; // Dùng .text thay vì .text()

            try {
                const cleanedText = text.replace(/```json|```/g, '').trim();
                if (cleanedText.startsWith('{') && cleanedText.endsWith('}')) {
                    const jsonResult = JSON.parse(cleanedText);
                    if (jsonResult.action === 'generate_image' && !jsonResult.prompt_for_image) {
                        jsonResult.prompt_for_image = userMessage; 
                    }
                    return jsonResult;
                }
            } catch (e) {
                // Không phải JSON
            }

            return { reply: text };

        } catch (error) {
            console.error("❌ [GEMINI] Lỗi Chat:", error);
            return { reply: "Xin lỗi, tôi đang gặp sự cố khi suy nghĩ câu trả lời." };
        }
    }

    /**
     * Hàm gọi API Imagen để tạo và lưu ảnh (SỬ DỤNG AI.MODELS.GENERATEIMAGES)
     */
    async generateImage(prompt) {
        if (!this.genAI) throw new Error("API Key chưa cấu hình.");

        try {
            // FIX: Gọi generateImages thông qua this.genAI.models
            const response = await this.genAI.models.generateImages({
                model: 'imagen-4.0-generate-001', // Sử dụng model bạn cung cấp
                prompt: prompt,
                config: {
                    numberOfImages: 1, 
                    outputMimeType: 'image/png',
                    aspectRatio: '1:1',
                },
            });

            if (!response.generatedImages || response.generatedImages.length === 0) {
                throw new Error("Không có ảnh nào được tạo.");
            }

            const generatedImage = response.generatedImages[0];
            const imgBytes = generatedImage.image.imageBytes;
            const buffer = Buffer.from(imgBytes, "base64");
            
            const fileName = `ai_image_${Date.now()}.png`;
            const filePath = path.join(this.UPLOAD_DIR, fileName);

            await fs.writeFile(filePath, buffer);
            
            console.log(`✅ [IMAGEN] Đã tạo và lưu ảnh: ${fileName}`);
            
            return `uploads/${fileName}`; 

        } catch (error) {
            console.error("❌ [IMAGEN] Lỗi tạo ảnh:", error);
            throw new Error(`Lỗi tạo ảnh: ${error.message}`);
        }
    }
}

const GEMINI = new GEMINI_SERVICE();
export default GEMINI;
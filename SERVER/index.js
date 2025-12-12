// 1. Tải Biến Môi trường
import 'dotenv/config';

// 2. Tải Logger và Thư viện
import logger from './Utils/logger.js';
import express from 'express';
import http from 'http';
import {
  Server
} from 'socket.io';
import ngrok from 'ngrok';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Buffer } from 'buffer';

import { updateNgrokURL } from './Utils/ngrok.js';
import GEMINI from "./Utils/gemini.js";
import GGSHEET from "./Utils/googleSheet.js";
import FILE from "./Utils/file.js";

// 3. Khắc phục __dirname và __filename trong ES Modules
import {
  fileURLToPath
} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TIMEOUT_CHECKOUT = 2 * 60 * 1000; // 2 phút

const PORT = process.env.PORT || 3000;
const NGROK_TOKEN = process.env.NGROK_AUTH_TOKEN;

// 4. Khởi tạo Express App và HTTP Server
const app = express();
const httpServer = http.createServer(app);

// 5. Cấu hình Middleware Bảo mật và Xử lý Dữ liệu
app.use(helmet());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 6. Cấu hình Multer (Xử lý File Upload)
const UPLOAD_DIR = path.join(__dirname, 'uploads'); // Sử dụng __dirname mới
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage
});

// 7. Khởi tạo Socket.IO Server
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 8. Định tuyến HTTP (Để test và nhận File)
app.get('/', (req, res) => {
  res.status(200).send("Server đang chạy và Socket.IO sẵn sàng.");
});

// Endpoint nhận file từ Userscript
app.post('/upload', upload.array('files'), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      logger.warn('Yêu cầu upload file nhưng không tìm thấy file.');
      return res.status(400).send({
        message: 'Không tìm thấy file nào được tải lên.'
      });
    }

    const fileNames = req.files.map(file => file.filename);

    logger.info(`Đã nhận thành công ${req.files.length} file: ${fileNames.join(', ')}`);

    // Gửi thông báo qua Socket.IO tới tất cả client
    io.emit('file-uploaded', {
      count: req.files.length,
      message: `Server đã nhận ${req.files.length} file mới.`,
      files: fileNames
    });

    res.status(200).send({
      message: `Tải lên thành công ${req.files.length} file.`,
      fileNames: fileNames
    });

  } catch (error) {
    logger.error('Lỗi trong quá trình upload file:', error);
    res.status(500).send({
      message: 'Lỗi server trong quá trình xử lý upload.'
    });
  }
});

var userStates = {};

/**
 * --- HÀM KHÔI PHỤC DỮ LIỆU (RESTORE) ---
 * Chạy 1 lần duy nhất khi Server khởi động
 */
async function restoreSession() {
  // Dùng FileManager đọc file JSON an toàn
  // Nếu file không tồn tại hoặc lỗi, nó tự trả về {}
  userStates = await FILE.readJson("cham_cong.json", {});
  
  const userCount = Object.keys(userStates).length;
  if (userCount > 0) {
    logger.info(`♻️ [SYSTEM] Đã khôi phục ${userCount} phiên làm việc từ ổ cứng.`);
  }
}
restoreSession();

/**
 * --- HÀM LƯU BACKUP (SAVE DISK) ---
 * Gọi hàm này mỗi khi dữ liệu trong RAM thay đổi
 */
async function saveBackup() {
  // Ghi đè toàn bộ trạng thái hiện tại xuống ổ cứng
  // FileManager.writeJson tự động format đẹp và xử lý lỗi
  await FILE.writeJson("cham_cong.json", userStates);
}

// 9. Xử lý kết nối Socket.IO
io.on('connection', (socket) => {
  logger.info(`[Socket.IO] Người dùng đã kết nối: ${socket.id}`);

  socket.emit('wellcome', {
    type: 'system',
    text: `Chào mừng client ${socket.id}!`
  });

  socket.on('userscript-data', (data) => {
    logger.info(`[Socket.IO] Nhận dữ liệu từ Userscript ${socket.id}: ${JSON.stringify(data)}`);
    socket.emit('server-response', {
      status: 'OK',
      original: data
    });
  });

  socket.on('disconnect', () => {
    logger.info(`[Socket.IO] Người dùng đã ngắt kết nối: ${socket.id}`);
  });

  // --- SỰ KIỆN LƯU CHECK-IN (ĐÃ CẬP NHẬT KIỂM TRA TRÙNG) ---
  socket.on("save_check_in", async (data) => {
    const sheetName = `CHẤM CÔNG - ${data.name}`;
    logger.info(`[Socket.IO] ${data.name} yêu cầu check-in ngày ${data.date}`);

    try {
      // BƯỚC 1: Đọc dữ liệu cột A (Cột chứa ngày tháng) của Sheet nhân viên đó
      // Nếu Sheet chưa tồn tại, hàm readSheet (V3) trả về mảng rỗng [], code vẫn chạy tốt.
      const existingRows = await GGSHEET.readSheet(`${sheetName}!A:A`);

      // existingRows trả về dạng: [['2023-10-01'], ['2023-10-02'], ...]
      // Ta dùng .flat() để biến nó thành mảng 1 chiều: ['2023-10-01', '2023-10-02', ...]
      const existingDates = existingRows.flat();

      // BƯỚC 2: Kiểm tra trùng lặp
      if (existingDates.includes(data.date)) {
        logger.warn(`[Socket.IO] Bỏ qua: ${data.name} đã check-in ngày ${data.date} trước đó.`);
        
        // Gửi phản hồi về Client (Dùng status 'warning' hoặc 'info' để Client hiển thị màu vàng/xanh)
        socket.emit('check_in_saved', {
          status: 'warning', 
          message: `Hôm nay (${data.date}) bạn đã check-in rồi, không cần lưu lại!`
        });
        
        return; // DỪNG LẠI TẠI ĐÂY, KHÔNG GHI TIẾP
      }

      // BƯỚC 3: Nếu chưa có, tiến hành Ghi (Append)
      await GGSHEET.appendSheet(sheetName, [
        [data.date, data.time]
      ]);

      logger.info(`[Socket.IO] Đã lưu check-in mới cho ${data.name}`);
      
      socket.emit('check_in_saved', {
        status: 'success',
        message: 'Giờ check-in đã được lưu thành công.'
      });

    } catch (error) {
      logger.error(`Lỗi khi xử lý check-in cho ${data.name}:`, error);
      socket.emit('check_in_saved', {
        status: 'error',
        message: 'Lỗi Server: Không thể lưu giờ check-in.'
      });
    }
  });

  socket.on('IAM_ALIVE', (data) => {
    const userName = data.name;
    // Bỏ qua nếu không có tên
    if (!userName || userName === "Unknown") return;

    // 1. Cập nhật vào RAM
    userStates[userName] = {
      lastPing: Date.now(),     // Thời điểm mới nhất
      date: data.date,
      timeStr: data.time,
      isSaved: false            // Chưa lưu vào Sheet
    };

    // 2. LƯU NGAY XUỐNG Ổ CỨNG (Chống sập nguồn)
    // Thao tác này rất nhanh với file JSON nhỏ, không lo lag
    saveBackup(); 
    
    logger.info(`[Ping] ${userName} - ${data.time}`);
  });

  socket.on("save_check_out", async (data) => {
    logger.info(`[Socket.IO] ${data.name} chủ động Check-out.`);

    // 1. Cập nhật RAM & Ổ cứng trước (để tránh Auto-checkout chạy đè)
    if (userStates[data.name]) {
      userStates[data.name].isSaved = true; // Đánh dấu đã xong
      saveBackup(); // Lưu xuống ổ cứng
    }

    // 2. Ghi vào Google Sheet
    const sheetName = `CHẤM CÔNG - ${data.name}`;
    try {
      // Logic tìm dòng ngày hôm nay để update giờ về
      const existingRows = await GGSHEET.readSheet(`${sheetName}!A:A`);
      const existingDates = existingRows ? existingRows.flat() : [];
      const rowIndex = existingDates.indexOf(data.date);

      if (rowIndex !== -1) {
        // Có Check-in -> Update cột C (Giờ về)
        const rowNumber = rowIndex + 1;
        await GGSHEET.updateSheet(`${sheetName}!C${rowNumber}`, [[data.time]]);
        logger.info(`✅ [Manual] Đã cập nhật giờ về cho ${data.name}`);
      } else {
        // Không có Check-in -> Tạo dòng mới: [Ngày, "", Giờ về]
        await GGSHEET.appendSheet(sheetName, [[data.date, "", data.time]]);
        logger.info(`✅ [Manual] Check-out không Check-in cho ${data.name}`);
      }

      socket.emit('check_out_saved', {
        status: 'success',
        message: 'Đã check-out thành công!'
      });

      // 3. Dọn dẹp RAM (User đã về, không cần theo dõi nữa)
      if (userStates[data.name]) {
          delete userStates[data.name];
          saveBackup(); // Cập nhật lại file backup (đã xóa user)
      }

    } catch (error) {
      logger.error(`❌ Lỗi Manual Check-out ${data.name}:`, error.message);
      socket.emit('check_out_saved', { status: 'error', message: 'Lỗi Server' });
    }
  });

  // --- CHAT AI VÀ TẠO ẢNH ---
  socket.on('chat-request', async (data) => {
    logger.info(`[Socket.IO] Chat request từ ${data.user}: ${data.message}`);

    const aiResponse = await GEMINI.chat(data.message, data.context);
    
    // XỬ LÝ ACTION TẠO ẢNH TRÊN SERVER
    if (aiResponse.action === 'generate_image' && aiResponse.prompt_for_image) {
        logger.info(`[ACTION: IMAGEN] Đang tạo ảnh với prompt: ${aiResponse.prompt_for_image}`);
        
        aiResponse.reply = aiResponse.reply || "Đang tạo ảnh...";

        let imageUrl = null;
        try {
            const relativePath = await GEMINI.generateImage(aiResponse.prompt_for_image);
            
            // Lấy URL base của Server (ngrok url) - Cần đảm bảo hàm updateNgrokURL() trả về URL Ngrok
            const ngrokUrl = updateNgrokURL(); 
            imageUrl = `${ngrokUrl}/${relativePath}`; 
            
            aiResponse.reply = `✅ Ảnh đã được tạo thành công!`; 
            logger.info(`[IMAGEN] Ảnh đã sẵn sàng tại: ${imageUrl}`);
            
        } catch (error) {
            aiResponse.reply = `❌ Lỗi Server khi tạo ảnh: ${error.message}`;
            aiResponse.action = null; 
            logger.error(`[IMAGEN] Lỗi tạo ảnh cho ${data.user}:`, error.message);
        }
        
        aiResponse.imageUrl = imageUrl; 
    }

    // Phản hồi lại Client
    socket.emit('chat-response', {
        reply: aiResponse.reply,
        action: aiResponse.action || null, 
        imageUrl: aiResponse.imageUrl || null, 
    });
    
    logger.info(`[Socket.IO] Đã trả lời chat cho ${data.user}`);
  });
});

setInterval(async () => {
  const now = Date.now();
  const activeNames = Object.keys(userStates);
  
  // Cờ đánh dấu xem có thay đổi gì không để ghi file backup 1 lần
  let hasChange = false; 

  for (const name of activeNames) {
    const user = userStates[name];

    // Nếu đã được đánh dấu lưu rồi thì bỏ qua (hoặc xóa luôn)
    if (user.isSaved) continue;

    // --- KIỂM TRA TIMEOUT ---
    // Nếu quá 2 phút không thấy Ping
    if (now - user.lastPing > TIMEOUT_CHECKOUT) {
      logger.info(`[Auto Check-out] ${name} offline quá lâu. Chốt giờ về: ${user.timeStr}`);

      const sheetName = `CHẤM CÔNG - ${name}`;

      try {
        // 1. Ghi vào Google Sheet
        const existingRows = await GGSHEET.readSheet(`${sheetName}!A:A`);
        const existingDates = existingRows ? existingRows.flat() : [];
        const rowIndex = existingDates.indexOf(user.date);

        if (rowIndex !== -1) {
          // Update cột C
          const rowNumber = rowIndex + 1;
          await GGSHEET.updateSheet(`${sheetName}!C${rowNumber}`, [[user.timeStr]]);
          logger.info(`✅ [Auto] Đã chốt giờ về cho ${name}`);
        } else {
          // Tạo dòng mới
          await GGSHEET.appendSheet(sheetName, [[user.date, "", user.timeStr]]);
          logger.info(`✅ [Auto] Chốt giờ về (New Row) cho ${name}`);
        }

        // 2. Đánh dấu để xóa khỏi RAM
        // Chúng ta xóa luôn user khỏi RAM vì họ đã "về" rồi.
        delete userStates[name]; 
        
        hasChange = true; // Bật cờ để tí nữa lưu backup

      } catch (error) {
        logger.error(`❌ Lỗi Auto Check-out ${name}:`, error.message);
      }
    }
  }

  // Nếu danh sách user thay đổi (có người bị xóa do timeout), cập nhật file backup
  if (hasChange) {
    saveBackup();
  }
}, 30 * 1000);


// 10. Khởi động Server và Ngrok
httpServer.listen(PORT, async () => {
  logger.info(`--- Máy chủ Express đang chạy tại http://localhost:${PORT} ---`);

  try {
    const url = await ngrok.connect({
      addr: PORT,
      authtoken: NGROK_TOKEN || null
    });

    updateNgrokURL(url); // Cập nhật URL Ngrok trong Utils
    
    logger.info(`*****************************************************************`);
    logger.info(`* Ngrok Tunnel đã sẵn sàng!`);
    logger.info(`* LINK CÔNG KHAI: ${url}`);
    logger.info(`*****************************************************************`);

  } catch (err) {
    logger.error("Lỗi khi kết nối Ngrok:", err.message);
    logger.warn("Server vẫn chạy ở localhost, nhưng không thể truy cập từ bên ngoài.");
  }
});
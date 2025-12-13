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

let gsheetQueue = {};

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

function startSheetBatchWriter() {
  setInterval(async () => {
    const usersToUpdate = Object.keys(gsheetQueue);
    if (usersToUpdate.length === 0) return; // Không có gì để ghi

    logger.info(`[BATCH WRITER] Bắt đầu ghi ${usersToUpdate.length} user lên Google Sheet...`);

    for (const name of usersToUpdate) {
      const data = gsheetQueue[name];
      const sheetName = `CHẤM CÔNG - ${name}`;

      try {
        // BƯỚC 1: Đọc dữ liệu cột A (Ngày) và B (Check-in)
        const range = `${sheetName}!A:B`;
        const existingData = await GGSHEET.readSheet(range);

        // Tìm dòng của ngày hôm nay
        let rowIndex = -1;
        let existingCheckIn = null;

        // Dòng đầu tiên (index 0) là tiêu đề, nên duyệt từ 1
        for (let i = 0; i < existingData.length; i++) {
          const row = existingData[i];
          if (row[0] === data.date) {
            rowIndex = i; // Lấy index (0-based)
            // Lấy giờ check-in hiện tại (row[1] là cột B)
            existingCheckIn = row[1] || null;
            break;
          }
        }

        if (rowIndex !== -1) {
          // TRƯỜNG HỢP 1: DÒNG NGÀY HÔM NAY ĐÃ TỒN TẠI
          const rowNumber = rowIndex + 1; // Dòng Excel (1-based)
          let valuesToUpdate = [];
          let rangeToUpdate = '';

          // 1a. Ghi Check-in (Cột B) nếu nó trống
          if (data.checkIn && !existingCheckIn) {
            // Logic: Đã có ngày (A) nhưng chưa có Check-in (B) -> Phải ghi vào B
            rangeToUpdate = `${sheetName}!B${rowNumber}`;
            valuesToUpdate.push([data.checkIn]);

            // Lệnh update đầu tiên
            await GGSHEET.updateSheet(rangeToUpdate, valuesToUpdate);
            logger.info(`[BATCH] Ghi Check-in ${data.checkIn} cho ${name} tại B${rowNumber}`);
          }

          // 1b. Ghi Check-out (Cột C)
          if (data.checkOut) {
            rangeToUpdate = `${sheetName}!C${rowNumber}`;
            valuesToUpdate = [[data.checkOut]];

            // Lệnh update thứ hai (luôn ghi muộn nhất)
            await GGSHEET.updateSheet(rangeToUpdate, valuesToUpdate);
            logger.info(`[BATCH] Cập nhật Check-out ${data.checkOut} cho ${name} tại C${rowNumber}`);
          }

        } else {
          // TRƯỜNG HỢP 2: DÒNG NGÀY HÔM NAY CHƯA TỒN TẠI -> APPEND DÒNG MỚI
          const values = [data.date, data.checkIn || "", data.checkOut || ""];
          await GGSHEET.appendSheet(sheetName, [values]);
          logger.info(`[BATCH] Tạo dòng mới cho ${name}: ${data.date} (${data.checkIn}-${data.checkOut})`);
        }

        // XÓA KHỎI QUEUE KHI GHI THÀNH CÔNG
        delete gsheetQueue[name];

      } catch (error) {
        logger.error(`❌ [BATCH FAIL] Lỗi ghi sheet cho ${name}:`, error.message);
        // Giữ lại trong Queue để thử lại ở lần chạy tiếp theo
      }
    }
    logger.info(`[BATCH WRITER] Hoàn tất quá trình ghi. Queue còn ${Object.keys(gsheetQueue).length} user.`);
  }, 60000);
}
startSheetBatchWriter();

function updateCheckInQueue(name, date, time) {
  const queueData = gsheetQueue[name] || {
    date: date,
    checkIn: null,
    checkOut: null,
    status: 'pending'
  };

  // Logic Check-in: Lấy SỚM NHẤT
  const currentCI = queueData.checkIn;
  if (!currentCI || time < currentCI) {
    queueData.checkIn = time;
  }

  gsheetQueue[name] = queueData;
}

function updateCheckOutQueue(name, date, time) {
  const queueData = gsheetQueue[name] || {
    date: date,
    checkIn: null,
    checkOut: null,
    status: 'pending'
  };

  // Logic Check-out: Lấy MUỘN NHẤT
  const currentCO = queueData.checkOut;
  if (!currentCO || time > currentCO) {
    queueData.checkOut = time;
  }

  gsheetQueue[name] = queueData;
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

  // --- 1. SỰ KIỆN LƯU CHECK-IN (CHỈ GHI VÀO QUEUE) ---
  socket.on("save_check_in", async (data) => {
    logger.info(`[Socket.IO] ${data.name} yêu cầu check-in ngày ${data.date}`);
    const sheetName = `CHẤM CÔNG - ${data.name}`;
    let message = 'Giờ check-in đã được ghi nhận. Đang chờ cập nhật Sheet.';
    let status = 'info';

    try {
      // KIỂM TRA TRÙNG LẶP TRỰC TIẾP TRÊN SHEET (Để phản hồi ngay lập tức)
      // Đây là API call duy nhất được giữ lại để đảm bảo User không bị Check-in 2 lần
      const existingData = await GGSHEET.readSheet(`${sheetName}!A:B`);
      let isAlreadyCheckedIn = false;

      for (const row of existingData) {
        if (row[0] === data.date && row[1]) { // [1] là cột B (Check-in time)
          isAlreadyCheckedIn = true;
          break;
        }
      }

      if (isAlreadyCheckedIn) {
        message = `Hôm nay (${data.date}) bạn đã Check-in lúc ${existingData.find(r => r[0] === data.date)[1]} rồi!`;
        status = 'warning';
      } else {
        // GHI NHẬN VÀO QUEUE
        updateCheckInQueue(data.name, data.date, data.time);

        // Cập nhật RAM (userStates) để kích hoạt logic Auto-Check-out
        userStates[data.name] = {
          lastPing: Date.now(),
          date: data.date,
          timeStr: data.time,
          isSaved: false
        };
        saveBackup();
      }

    } catch (error) {
      logger.error(`Lỗi Check-in cho ${data.name}:`, error.message);
      message = 'Lỗi Server: Không thể xử lý yêu cầu Check-in.';
      status = 'error';
    }

    socket.emit('check_in_saved', {
      status: status,
      message: message
    });
  });

  // --- 2. SỰ KIỆN PING (IAM_ALIVE) ---
  socket.on('client_ping', (data) => {
    // 1. Cập nhật RAM (userStates) cho logic Timeout (Giữ nguyên)
    const userName = data.name;
    if (!userName || userName === "Unknown") return;

    userStates[userName] = {
      lastPing: Date.now(),
      date: data.date,
      timeStr: data.time,
      isSaved: false
    };
    saveBackup();

    // 2. CẬP NHẬT QUEUE CHO CHECK-OUT (LẤY MUỘN NHẤT)
    updateCheckOutQueue(data.name, data.date, data.time);
  });


  // --- 3. SỰ KIỆN LƯU CHECK-OUT (CHỈ GHI VÀO QUEUE) ---
  socket.on("save_check_out", async (data) => {
    logger.info(`[Socket.IO] ${data.name} chủ động Check-out.`);

    // GHI NHẬN VÀO QUEUE (LẤY MUỘN NHẤT)
    updateCheckOutQueue(data.name, data.date, data.time);

    // Đánh dấu đã lưu trong RAM (để Grim Reaper không chạy)
    if (userStates[data.name]) {
      userStates[data.name].isSaved = true;
      delete userStates[data.name]; // Xóa khỏi RAM vì đã chủ động check out
    }
    saveBackup();

    socket.emit('check_out_saved', {
      status: 'info',
      message: 'Đã ghi nhận Check-out. Đang chờ cập nhật Sheet.'
    });
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
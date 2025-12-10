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

// 3. Khắc phục __dirname và __filename trong ES Modules
import {
  fileURLToPath
} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// 9. Xử lý kết nối Socket.IO
io.on('connection', (socket) => {
  logger.info(`[Socket.IO] Người dùng đã kết nối: ${socket.id}`);

  socket.emit('message', {
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
});


// 10. Khởi động Server và Ngrok
httpServer.listen(PORT, async () => {
  logger.info(`--- Máy chủ Express đang chạy tại http://localhost:${PORT} ---`);

  try {
    const url = await ngrok.connect({
      addr: PORT,
      authtoken: NGROK_TOKEN || null
    });
    logger.info(`*****************************************************************`);
    logger.info(`* Ngrok Tunnel đã sẵn sàng!`);
    logger.info(`* LINK CÔNG KHAI: ${url}`);
    logger.info(`*****************************************************************`);

  } catch (err) {
    logger.error("Lỗi khi kết nối Ngrok:", err.message);
    logger.warn("Server vẫn chạy ở localhost, nhưng không thể truy cập từ bên ngoài.");
  }
});
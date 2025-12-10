import winston from 'winston';
const { combine, timestamp, printf, colorize } = winston.format;

// Định dạng Log tùy chỉnh
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logger = winston.createLogger({
  level: 'info', // Cấp độ log tối thiểu
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat,
  ),
  transports: [
    // Ghi Log ra Console (kèm màu sắc)
    new winston.transports.Console({
      format: combine(
        colorize(),
        logFormat
      )
    }),
    // Tùy chọn: Ghi Log lỗi vào file
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // Tùy chọn: Ghi tất cả Log vào file
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

export default logger;
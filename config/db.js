const mongoose = require('mongoose');

// autoIndex/autoCreate = false: tránh Mongoose tự tạo index/collection
// (user đọc/ghi không có quyền createIndex/createCollection)
const options = { autoIndex: false, autoCreate: false };

if (!process.env.MONGO_URI_READ || !process.env.MONGO_URI_WRITE) {
  throw new Error('Thiếu MONGO_URI_READ hoặc MONGO_URI_WRITE trong biến môi trường');
}

// Hai kết nối độc lập, hai tài khoản khác nhau
const readConn = mongoose.createConnection(process.env.MONGO_URI_READ, options);
const writeConn = mongoose.createConnection(process.env.MONGO_URI_WRITE, options);

readConn.on('connected', () => console.log('[DB] READ  connection OK (user chỉ đọc)'));
writeConn.on('connected', () => console.log('[DB] WRITE connection OK (user chỉ ghi)'));
readConn.on('error', (e) => console.error('[DB] READ  error:', e.message));
writeConn.on('error', (e) => console.error('[DB] WRITE error:', e.message));

module.exports = { readConn, writeConn };

const session = require('express-session');
const MongoStore = require('connect-mongo');
const { writeConn } = require('./db');

// Stateless: KHÔNG dùng MemoryStore. Session lưu tập trung ở collection "sessions" trên Atlas.
// Dùng kết nối của user_write (Custom Role đã được cấp quyền find/insert/update/remove trên "sessions").
module.exports = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    clientPromise: writeConn.asPromise().then((conn) => conn.getClient()),
    dbName: `DB_${process.env.MSSV}`,
    collectionName: 'sessions',
    ttl: 60 * 60,                  // 1 giờ
    autoRemove: 'interval',        // dọn session hết hạn bằng deleteMany (không cần quyền createIndex)
    autoRemoveInterval: 10         // phút
  }),
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',   // HTTPS trên Render
    maxAge: 60 * 60 * 1000
  }
});

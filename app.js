require('dotenv').config();

const express = require('express');
const { engine } = require('express-handlebars');
const { VAT } = require('./utils/vat');

const app = express();

// Render nằm sau reverse proxy → cần để cookie "secure" hoạt động
app.set('trust proxy', 1);

// Handlebars
app.engine(
  'hbs',
  engine({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
      money: (n) => Number(n).toLocaleString('vi-VN')
    }
  })
);
app.set('view engine', 'hbs');
app.set('views', './views');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Dữ liệu footer (Họ tên, MSSV, VAT) dùng cho mọi trang
app.locals.footer = {
  fullName: process.env.FULL_NAME,
  mssv: process.env.MSSV,
  vat: VAT
};

// Health check cho UptimeRobot (không đụng DB/session)
app.get('/health', (req, res) => res.send('OK'));

// [SESSION] – nhánh feature/session thêm dòng bên dưới
app.use(require('./config/session'));

// [DB-ROUTES] – nhánh feature/database thêm dòng bên dưới

// Xử lý lỗi chung
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Lỗi hệ thống: ' + err.message);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} | VAT = ${VAT}%`));

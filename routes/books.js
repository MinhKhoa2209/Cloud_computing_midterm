const router = require('express').Router();
const { BookRead, BookWrite } = require('../models/Book');
const { VAT, withVat } = require('../utils/vat');
const validateBook = require('../middleware/validateBook');

function flashAndRedirect(req, res, type, text) {
  if (req.session) {
    req.session.flash = { type, text };
    return req.session.save(() => res.redirect('/'));
  }
  return res.redirect('/');
}

// ĐỌC danh sách → dùng kết nối của user_read
router.get('/', async (req, res, next) => {
  try {
    const books = await BookRead.find().sort({ createdAt: -1 }).lean();

    let flash = null;
    let views = null;
    if (req.session) {
      flash = req.session.flash || null;
      delete req.session.flash;
      req.session.views = (req.session.views || 0) + 1;   // dữ liệu phiên (lưu trên Atlas)
      views = req.session.views;
    }

    res.render('books', { books, flash, views });
  } catch (err) {
    next(err);
  }
});

// GHI sách mới → dùng kết nối của user_write
router.post('/add', validateBook, async (req, res, next) => {
  try {
    const { code, name, price } = req.body;
    const priceAfterTax = withVat(price);   // tính giá sau thuế TRƯỚC khi lưu xuống Atlas

    await BookWrite.create({ code, name, price, vat: VAT, priceAfterTax });

    return flashAndRedirect(
      req, res, 'success',
      `Đã thêm "${name}" – giá sau thuế (VAT ${VAT}%): ${priceAfterTax.toLocaleString('vi-VN')} đ`
    );
  } catch (err) {
    if (err && err.code === 11000) {   // trùng mã (unique index ở bước 1.4)
      return flashAndRedirect(req, res, 'error', `Mã sản phẩm "${req.body.code}" đã tồn tại.`);
    }
    next(err);
  }
});

module.exports = router;

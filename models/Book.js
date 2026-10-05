const { Schema } = require('mongoose');
const { readConn, writeConn } = require('../config/db');

const bookSchema = new Schema(
  {
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },          // giá gốc
    vat: { type: Number, required: true },            // % VAT áp dụng
    priceAfterTax: { type: Number, required: true },  // giá sau thuế
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

module.exports = {
  // Model gắn kết nối ĐỌC – chỉ dùng find()
  BookRead: readConn.model('Book', bookSchema, 'books'),
  // Model gắn kết nối GHI – chỉ dùng create()
  BookWrite: writeConn.model('Book', bookSchema, 'books')
};

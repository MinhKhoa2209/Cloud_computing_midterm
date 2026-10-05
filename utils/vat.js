// VAT = (chữ số cuối MSSV + 5)%  →  23IT128: (8 + 5) = 13%
const mssv = process.env.MSSV || '';
const lastDigit = Number(mssv.slice(-1));

if (Number.isNaN(lastDigit)) {
  throw new Error('MSSV phải kết thúc bằng một chữ số (kiểm tra biến môi trường MSSV)');
}

const VAT = lastDigit + 5;

// Giá sau thuế, làm tròn 2 chữ số thập phân
const withVat = (price) => Math.round(price * (1 + VAT / 100) * 100) / 100;

module.exports = { VAT, withVat };

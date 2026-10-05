// Bộ lọc: mã sản phẩm bắt buộc bắt đầu bằng 3 ký tự cuối MSSV (23IT128 → "128")
const PREFIX = (process.env.MSSV || '').slice(-3);

function reject(req, res, message) {
  if (req.session) {
    req.session.flash = { type: 'error', text: message };
    return req.session.save(() => res.redirect('/'));
  }
  return res.status(400).send(message);
}

module.exports = (req, res, next) => {
  const code = String(req.body.code || '').trim();
  const name = String(req.body.name || '').trim();
  const price = Number(req.body.price);

  if (!code.startsWith(PREFIX)) {
    return reject(req, res, `Từ chối: mã sản phẩm phải bắt đầu bằng "${PREFIX}" (3 số cuối MSSV).`);
  }
  if (code.length > 20) {
    return reject(req, res, 'Từ chối: mã sản phẩm tối đa 20 ký tự.');
  }
  if (!name) {
    return reject(req, res, 'Từ chối: tên sách không được để trống.');
  }
  if (!Number.isFinite(price) || price <= 0) {
    return reject(req, res, 'Từ chối: giá phải là số lớn hơn 0.');
  }

  // Gán lại dữ liệu đã làm sạch cho route
  req.body.code = code;
  req.body.name = name;
  req.body.price = price;
  next();
};

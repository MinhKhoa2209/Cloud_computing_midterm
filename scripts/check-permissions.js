// Kiểm chứng đặc quyền tối thiểu: kết nối bằng đúng 2 tài khoản và thử các thao tác
require('dotenv').config();
const { MongoClient } = require('mongoose').mongo;

const DB = `DB_${process.env.MSSV}`;
const testCode = `128-TEST-${Date.now()}`;

async function attempt(title, fn, expectOk) {
  try {
    const result = await fn();
    console.log(`${expectOk ? '✅' : '⚠️  KHÔNG MONG ĐỢI'} ${title} → thành công ${result ?? ''}`);
  } catch (e) {
    console.log(`${expectOk ? '⚠️  KHÔNG MONG ĐỢI' : '✅'} ${title} → bị từ chối (${e.codeName || e.message})`);
  }
}

(async () => {
  const reader = new MongoClient(process.env.MONGO_URI_READ);
  const writer = new MongoClient(process.env.MONGO_URI_WRITE);
  const rdb = reader.db(DB);
  const wdb = writer.db(DB);

  console.log(`--- USER ĐỌC (user_read_${process.env.MSSV}) ---`);
  await attempt('find()      trên books   ', async () => `(${(await rdb.collection('books').find().limit(1).toArray()).length} doc)`, true);
  await attempt('insertOne() trên books   ', () => rdb.collection('books').insertOne({ code: testCode }), false);

  console.log(`--- USER GHI (user_write_${process.env.MSSV}) ---`);
  await attempt('insertOne() trên books   ', async () => {
    await wdb.collection('books').insertOne({ code: testCode, name: 'TEST', price: 1, vat: 13, priceAfterTax: 1.13 });
    return `(code ${testCode})`;
  }, true);
  await attempt('find()      trên books   ', () => wdb.collection('books').find().limit(1).toArray(), false);
  await attempt('deleteOne() trên books   ', () => wdb.collection('books').deleteOne({ code: testCode }), false);
  await attempt('find()      trên sessions', async () => `(${(await wdb.collection('sessions').find().limit(1).toArray()).length} doc)`, true);

  await reader.close();
  await writer.close();
  console.log(`\nĐã xong. Xóa document test có code "${testCode}" trong Atlas (Browse Collections → books).`);
})().catch((e) => { console.error('Lỗi kết nối:', e.message); process.exit(1); });

// ================================================================
// KASIRPOS DIGITAL — Google Apps Script Backend
// Versi 1.0 | Plug & Play
//
// CARA SETUP:
// 1. Buka script.google.com → New Project
// 2. Paste seluruh kode ini
// 3. Klik "Deploy" → New Deployment → Web App
//    - Execute as: Me
//    - Who has access: Anyone
// 4. Copy URL deployment → paste ke admin.html dan pesan.html
// ================================================================

const SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

// ---- SHEET NAMES ----
const SHEET_MENU    = 'Menu';
const SHEET_ORDERS  = 'Orders';
const SHEET_ITEMS   = 'OrderItems';
const SHEET_QUEUE   = 'QueueCounter';
const SHEET_CONFIG  = 'Config';

// ================================================================
// ENTRY POINTS
// ================================================================

function doGet(e) {
  const action = e.parameter.action || '';
  let result;
  try {
    if (action === 'getMenu')     result = getMenu();
    else if (action === 'adminData') result = getAdminData();
    else result = { ok: true, msg: 'KasirPos API v1.0' };
  } catch(err) {
    result = { error: err.toString() };
  }
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let body, result;
  try {
    body = JSON.parse(e.postData.contents);
    const action = body.action || '';
    if (action === 'createOrder')   result = createOrder(body);
    else if (action === 'completeOrder') result = completeOrder(body);
    else if (action === 'sendInvoice')   result = sendInvoice(body);
    else if (action === 'updateStock')   result = updateStock(body);
    else if (action === 'saveMenu')      result = saveMenuData(body);
    else result = { error: 'Unknown action: ' + action };
  } catch(err) {
    result = { error: err.toString() };
  }
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ================================================================
// SETUP — Jalankan sekali saat pertama kali
// ================================================================

function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Menu Sheet
  let menu = ss.getSheetByName(SHEET_MENU);
  if (!menu) {
    menu = ss.insertSheet(SHEET_MENU);
    menu.getRange(1,1,1,8).setValues([['id','name','emoji','price','stock','sold','cat','desc']]);
    menu.getRange(1,1,1,8).setFontWeight('bold').setBackground('#1a1208').setFontColor('#c8922a');
    // Sample data
    menu.getRange(2,1,8,8).setValues([
      ['1','Nasi Goreng Spesial','🍳',18000,24,134,'makanan','Nasi goreng bumbu rahasia dengan telur mata sapi'],
      ['2','Mie Ayam Bakso','🍜',15000,10,89,'makanan','Mie kenyal dengan topping ayam dan bakso segar'],
      ['3','Ayam Bakar Madu','🍗',25000,5,67,'makanan','Ayam bakar dengan saus madu khas warung kami'],
      ['4','Soto Ayam','🥣',14000,8,45,'makanan','Kuah bening segar dengan irisan ayam'],
      ['5','Es Teh Manis','🧊',5000,50,200,'minuman','Teh segar dengan es batu'],
      ['6','Jus Jeruk Segar','🍊',10000,30,78,'minuman','Jeruk peras segar tanpa pengawet'],
      ['7','Es Cincau Hijau','🍵',8000,20,34,'minuman','Cincau hijau alami dengan santan'],
      ['8','Kerupuk Udang','🥨',3000,99,156,'snack','Kerupuk renyah sebagai teman makan'],
    ]);
  }

  // Orders Sheet
  let orders = ss.getSheetByName(SHEET_ORDERS);
  if (!orders) {
    orders = ss.insertSheet(SHEET_ORDERS);
    orders.getRange(1,1,1,11).setValues([['orderId','queue','nama','hp','type','note','sub','tax','total','status','createdAt']]);
    orders.getRange(1,1,1,11).setFontWeight('bold').setBackground('#1a1208').setFontColor('#c8922a');
  }

  // Order Items Sheet
  let items = ss.getSheetByName(SHEET_ITEMS);
  if (!items) {
    items = ss.insertSheet(SHEET_ITEMS);
    items.getRange(1,1,1,6).setValues([['orderId','menuId','menuName','emoji','price','qty']]);
    items.getRange(1,1,1,6).setFontWeight('bold').setBackground('#1a1208').setFontColor('#c8922a');
  }

  // Queue Counter
  let queue = ss.getSheetByName(SHEET_QUEUE);
  if (!queue) {
    queue = ss.insertSheet(SHEET_QUEUE);
    queue.getRange('A1').setValue('counter');
    queue.getRange('B1').setValue(0);
    queue.getRange('A2').setValue('reset_date');
    queue.getRange('B2').setValue(new Date().toDateString());
  }

  // Config Sheet
  let config = ss.getSheetByName(SHEET_CONFIG);
  if (!config) {
    config = ss.insertSheet(SHEET_CONFIG);
    config.getRange(1,1,6,2).setValues([
      ['store_name','Warung Makan Sejahtera'],
      ['store_address','Jl. Raya No. 12, Jakarta'],
      ['store_phone','021-5550123'],
      ['tax_rate','11'],
      ['admin_pass','admin123'],
      ['invoice_mode','auto'],
    ]);
  }

  SpreadsheetApp.getUi().alert('✅ Setup selesai! Semua sheet berhasil dibuat.');
}

// ================================================================
// GET MENU
// ================================================================

function getMenu() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_MENU);
  if (!sheet) return { menu: [] };
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const menu = rows.slice(1).filter(r => r[0]).map(r => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = r[i]);
    obj.price = Number(obj.price);
    obj.stock = Number(obj.stock);
    obj.sold = Number(obj.sold);
    return obj;
  });
  return { menu };
}

// ================================================================
// GET ADMIN DATA
// ================================================================

function getAdminData() {
  const menuResult = getMenu();
  const ordersSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ORDERS);
  const itemsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ITEMS);

  if (!ordersSheet) return { menu: menuResult.menu, orders: [] };

  const oRows = ordersSheet.getDataRange().getValues();
  const oHeaders = oRows[0];
  const orders = oRows.slice(1).filter(r => r[0]).map(r => {
    const obj = {};
    oHeaders.forEach((h, i) => obj[h] = r[i]);
    obj.sub = Number(obj.sub);
    obj.tax = Number(obj.tax);
    obj.total = Number(obj.total);
    obj.queue = Number(obj.queue);
    return obj;
  });

  // Attach items to each order
  if (itemsSheet) {
    const iRows = itemsSheet.getDataRange().getValues();
    const iHeaders = iRows[0];
    const allItems = iRows.slice(1).filter(r => r[0]).map(r => {
      const obj = {};
      iHeaders.forEach((h, i) => obj[h] = r[i]);
      obj.price = Number(obj.price);
      obj.qty = Number(obj.qty);
      return obj;
    });
    orders.forEach(o => {
      o.items = allItems.filter(i => i.orderId === o.orderId).map(i => ({
        name: i.menuName, emoji: i.emoji, price: i.price, qty: i.qty
      }));
    });
  }

  return { menu: menuResult.menu, orders: orders.reverse() };
}

// ================================================================
// CREATE ORDER
// ================================================================

function createOrder(body) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ordersSheet = ss.getSheetByName(SHEET_ORDERS);
  const itemsSheet = ss.getSheetByName(SHEET_ITEMS);
  const queueSheet = ss.getSheetByName(SHEET_QUEUE);

  if (!ordersSheet || !itemsSheet || !queueSheet) {
    return { success: false, error: 'Sheet belum di-setup. Jalankan setupSheets() dulu.' };
  }

  // Queue number — reset harian
  const today = new Date().toDateString();
  const savedDate = queueSheet.getRange('B2').getValue();
  if (savedDate !== today) {
    queueSheet.getRange('B1').setValue(0);
    queueSheet.getRange('B2').setValue(today);
  }
  const counter = Number(queueSheet.getRange('B1').getValue()) + 1;
  queueSheet.getRange('B1').setValue(counter);

  const orderId = 'ORD-' + Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyyMMdd') + '-' + String(counter).padStart(3,'0');
  const now = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'HH:mm');

  ordersSheet.appendRow([
    orderId, counter, body.nama, body.hp, body.type, body.note || '',
    body.sub, body.tax, body.total, 'pending', new Date()
  ]);

  // Append items & deduct stock
  const menuSheet = ss.getSheetByName(SHEET_MENU);
  const menuRows = menuSheet.getDataRange().getValues();

  body.items.forEach(item => {
    itemsSheet.appendRow([orderId, item.id, item.name, item.emoji, item.price, item.qty]);

    // Deduct stock
    for (let i = 1; i < menuRows.length; i++) {
      if (String(menuRows[i][0]) === String(item.id)) {
        const currentStock = Number(menuRows[i][4]);
        const currentSold = Number(menuRows[i][5]);
        menuSheet.getRange(i+1, 5).setValue(Math.max(0, currentStock - item.qty));
        menuSheet.getRange(i+1, 6).setValue(currentSold + item.qty);
        break;
      }
    }
  });

  return { success: true, orderId, queueNum: counter, time: now };
}

// ================================================================
// COMPLETE ORDER + AUTO INVOICE
// ================================================================

function completeOrder(body) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ordersSheet = ss.getSheetByName(SHEET_ORDERS);
  const rows = ordersSheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === body.orderId) {
      ordersSheet.getRange(i+1, 10).setValue('done');

      // Auto-send invoice if config says so
      const config = getConfig();
      if (config.invoice_mode === 'auto') {
        sendInvoice({ orderId: body.orderId });
      }
      return { success: true };
    }
  }
  return { success: false, error: 'Order not found' };
}

// ================================================================
// SEND INVOICE (via email)
// ================================================================

function sendInvoice(body) {
  const adminData = getAdminData();
  const order = adminData.orders.find(o => o.orderId === body.orderId);
  if (!order) return { success: false, error: 'Order not found' };

  const config = getConfig();
  const fmt = n => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  // Check if HP looks like email, else log (WhatsApp integration requires 3rd party)
  const recipientEmail = order.hp.includes('@') ? order.hp : null;

  const itemsHtml = order.items.map(i =>
    `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${i.emoji} ${i.name}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center">${i.qty}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${fmt(i.price * i.qty)}</td></tr>`
  ).join('');

  const invoiceHtml = `
<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;color:#2d1f10">
<div style="background:#1a1208;color:#c8922a;padding:20px;border-radius:12px 12px 0 0;text-align:center">
  <h2 style="margin:0;font-size:22px">🍽️ ${config.store_name}</h2>
  <p style="margin:6px 0 0;font-size:13px;color:rgba(200,146,42,0.7)">${config.store_address}</p>
</div>
<div style="border:1px solid #eee;border-top:none;padding:20px;border-radius:0 0 12px 12px">
  <div style="display:flex;justify-content:space-between;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid #eee">
    <div><b style="font-size:15px">${order.orderId}</b><br><span style="font-size:13px;color:#7a6352">Antrian #${order.queue}</span></div>
    <div style="text-align:right"><span style="font-size:13px;color:#7a6352">${order.type === 'dine' ? 'Makan di tempat' : 'Bawa pulang'}</span></div>
  </div>
  <table style="width:100%;border-collapse:collapse">
    <thead><tr style="font-size:12px;color:#7a6352"><th style="text-align:left;padding-bottom:8px">Item</th><th style="text-align:center;padding-bottom:8px">Qty</th><th style="text-align:right;padding-bottom:8px">Subtotal</th></tr></thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <div style="text-align:right;margin-top:12px">
    <p style="font-size:13px;color:#7a6352;margin:4px 0">Subtotal: ${fmt(order.sub)}</p>
    <p style="font-size:13px;color:#7a6352;margin:4px 0">PPN 11%: ${fmt(order.tax)}</p>
    <p style="font-size:16px;font-weight:bold;margin:10px 0 0;color:#1a1208">Total: ${fmt(order.total)}</p>
  </div>
  <div style="margin-top:20px;padding-top:16px;border-top:1px solid #eee;text-align:center;font-size:13px;color:#7a6352">
    Terima kasih sudah makan di ${config.store_name}, ${order.nama}! 🙏<br>
    Silakan kunjungi kami kembali.
  </div>
</div></body></html>`;

  // Update status to 'done' if not already
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ordersSheet = ss.getSheetByName(SHEET_ORDERS);
  const rows = ordersSheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === body.orderId) {
      ordersSheet.getRange(i+1, 10).setValue('done');
      break;
    }
  }

  // Send email if valid email provided
  if (recipientEmail) {
    try {
      GmailApp.sendEmail(recipientEmail,
        `Invoice dari ${config.store_name} — ${order.orderId}`,
        `Terima kasih ${order.nama}! Total: ${fmt(order.total)}`,
        { htmlBody: invoiceHtml }
      );
      return { success: true, method: 'email' };
    } catch(err) {
      Logger.log('Email error: ' + err);
    }
  }

  // Log to sheet regardless
  Logger.log('Invoice generated for order: ' + body.orderId);
  return { success: true, method: 'logged', note: 'Email tidak terkirim - HP bukan format email. Untuk WhatsApp, gunakan integrasi Fonnte/Wablas.' };
}

// ================================================================
// UPDATE STOCK
// ================================================================

function updateStock(body) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_MENU);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(body.id)) {
      sheet.getRange(i+1, 5).setValue(Number(body.stock));
      return { success: true };
    }
  }
  return { success: false, error: 'Item not found' };
}

// ================================================================
// SAVE MENU
// ================================================================

function saveMenuData(body) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_MENU);
  sheet.clearContents();
  sheet.getRange(1,1,1,8).setValues([['id','name','emoji','price','stock','sold','cat','desc']]);
  if (body.menu && body.menu.length > 0) {
    const rows = body.menu.map(m => [m.id, m.name, m.emoji, m.price, m.stock, m.sold||0, m.cat, m.desc]);
    sheet.getRange(2, 1, rows.length, 8).setValues(rows);
  }
  return { success: true };
}

// ================================================================
// HELPERS
// ================================================================

function getConfig() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_CONFIG);
  if (!sheet) return { store_name: 'Warung Sejahtera', tax_rate: '11', invoice_mode: 'auto' };
  const rows = sheet.getDataRange().getValues();
  const config = {};
  rows.forEach(r => { config[r[0]] = r[1]; });
  return config;
}

// Menu untuk run manual di Apps Script editor
function testSetup() { setupSheets(); }
function testGetMenu() { Logger.log(JSON.stringify(getMenu())); }
function testGetAdminData() { Logger.log(JSON.stringify(getAdminData())); }

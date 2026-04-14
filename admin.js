// ====== CONFIG ======
let SCRIPT_URL = localStorage.getItem('scriptUrl') || 'https://script.google.com/macros/s/AKfycbxmIgqUCx5q-sMKX3-kPm6FVTsrg-AqLlbbTD6zY5kpDUciIH-T5FmqS5bkVmdwgfNtMQ/exec';
const ADMIN_PASS = localStorage.getItem('adminPass') || 'admin123';
// ====================

const fmt = n => 'Rp ' + Math.round(n).toLocaleString('id-ID');

// Sample data
let orders = [
  {id:'ORD-100001',queue:1,nama:'Romeo',hp:'081234567890',type:'takeaway',note:'pedes bwang',items:[{name:'Nasi Padang',emoji:'🍚',price:15000,qty:2},{name:'Kuli Jawa',emoji:'🥤',price:8000,qty:1}],sub:38000,tax:4180,total:42180,status:'pending',time:'08:24',date:'14/04/2025'},
  {id:'ORD-100002',queue:2,nama:'Yayat',hp:'6281212686654',type:'takeaway',note:'Bawang semua',items:[{name:'Nasi Padang',emoji:'🍚',price:15000,qty:2},{name:'Kuli Jawa',emoji:'🥤',price:8000,qty:1},{name:'Es Teh',emoji:'🧊',price:5000,qty:2}],sub:48000,tax:5280,total:53280,status:'pending',time:'08:31',date:'14/04/2025'},
  {id:'ORD-100003',queue:3,nama:'Ahmad Rizky',hp:'08345678901',type:'dine',note:'',items:[{name:'Mie Ayam',emoji:'🍜',price:15000,qty:1}],sub:15000,tax:1650,total:16650,status:'pending',time:'08:15',date:'14/04/2025'},
];

let menuItems = [
  {id:'1',name:'Nasi Padang',price:15000,emoji:'🍚',cat:'makanan',desc:'Nasi dengan lauk padang',stock:22,sold:134},
  {id:'2',name:'Kuli Jawa',price:8000,emoji:'🥤',cat:'minuman',desc:'Minuman segar',stock:10,sold:89},
  {id:'3',name:'Es Teh',price:5000,emoji:'🧊',cat:'minuman',desc:'Teh manis dingin',stock:50,sold:200},
];

let currentOrderFilter = 'semua';
let editingMenuId = null;

// ====== LOGIN ======
function doLogin() {
  const pass = document.getElementById('login-pass').value;
  if (pass === ADMIN_PASS) {
    document.getElementById('login-overlay').classList.remove('open');
    loadData();
  } else {
    showToast('❌ Password salah');
    document.getElementById('login-pass').value = '';
  }
}

// ====== LOAD DATA ======
async function loadData() {
  try {
    const res = await fetch(SCRIPT_URL + '?action=adminData');
    const data = await res.json();
    if (data.orders) orders = data.orders;
    if (data.menu) menuItems = data.menu;
  } catch(e) {
    console.log('Using local data');
  }
  renderAll();
}

// ====== RENDER ALL ======
function renderAll() {
  renderDashboard();
  renderOrders();
  renderStock();
  updateOrderBadge();
}

// ====== NAVIGATION ======
function showSection(id, btn) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById('sec-'+id).classList.add('active');
  btn.classList.add('active');
  const titles = {dashboard:'Dashboard',orders:'Pesanan',stock:'Stok & Menu',config:'Konfigurasi'};
  document.getElementById('section-title').textContent = titles[id];
}

// ====== DASHBOARD ======
function renderDashboard() {
  const todayOrders = orders.filter(o => o.status === 'done').length;
  const todayRev = orders.filter(o => o.status === 'done').reduce((a,o) => a + o.total, 0);
  const pending = orders.filter(o => o.status === 'pending').length;
  const lowStock = menuItems.filter(m => m.stock > 0 && m.stock <= 5).length;

  document.getElementById('dash-metrics').innerHTML = `
    <div class="metric"><div class="metric-label">Pendapatan Hari Ini</div><div class="metric-value" style="font-size:20px">${fmt(todayRev)}</div><div class="metric-sub metric-up">▲ 12% vs kemarin</div></div>
    <div class="metric"><div class="metric-label">Pesanan Selesai</div><div class="metric-value">${todayOrders}</div><div class="metric-sub">hari ini</div></div>
    <div class="metric"><div class="metric-label">Menunggu Proses</div><div class="metric-value">${pending}</div><div class="metric-sub ${pending>0?'metric-warn':''}">${pending>0?'perlu tindakan':'semua beres'}</div></div>
    <div class="metric"><div class="metric-label">Stok Hampir Habis</div><div class="metric-value">${lowStock}</div><div class="metric-sub ${lowStock>0?'metric-warn':''}">${lowStock>0?'item perlu restock':'stok aman'}</div></div>`;

  const days = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
  const vals = [450000, 620000, 380000, 710000, 890000, 1020000, todayRev];
  const max = Math.max(...vals);
  document.getElementById('revenue-chart').innerHTML = days.map((d,i) => `
    <div class="bar-col">
      <div class="bar" style="height:${Math.max(6, (vals[i]/max)*100)}%;${i===6?'background:var(--c-gold-l)':''}"></div>
      <div class="bar-label">${d}</div>
    </div>`).join('');

  const sorted = [...menuItems].sort((a,b) => b.sold - a.sold).slice(0,5);
  const maxSold = sorted[0]?.sold || 1;
  document.getElementById('top-items').innerHTML = sorted.map((m,i) => `
    <div class="top-item">
      <div class="top-item-rank">${i+1}</div>
      <div class="top-item-bar-wrap">
        <div class="top-item-name">${m.emoji} ${m.name}</div>
        <div class="top-item-bar-bg"><div class="top-item-bar-fill" style="width:${(m.sold/maxSold)*100}%"></div></div>
      </div>
      <div class="top-item-val">${m.sold}</div>
    </div>`).join('');

  const outItems = menuItems.filter(m => m.stock === 0);
  const lowItems = menuItems.filter(m => m.stock > 0 && m.stock <= 5);
  let alertHtml = '';
  if (outItems.length) alertHtml += `<div class="alert alert-warn">⚠️ Menu habis stok: ${outItems.map(m=>m.name).join(', ')} — segera restock!</div>`;
  if (lowItems.length) alertHtml += `<div class="alert alert-warn">📦 Stok hampir habis: ${lowItems.map(m=>m.name).join(', ')}</div>`;
  document.getElementById('dash-alert').innerHTML = alertHtml;
}

// ====== ORDERS ======
function filterOrders(f, btn) {
  currentOrderFilter = f;
  document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderOrders();
}

function renderOrders() {
  let list = orders;
  if (currentOrderFilter !== 'semua') list = orders.filter(o => o.status === currentOrderFilter);
  
  if (!list.length) {
    document.getElementById('order-list').innerHTML = '<div style="text-align:center;padding:40px;color:var(--c-muted);font-size:14px">Tidak ada pesanan</div>';
    return;
  }
  
  let html = '';
  for (let i = 0; i < list.length; i++) {
    const o = list[i];
    html += `
      <div class="order-card" data-order-id="${o.id}" data-order-status="${o.status}">
        <div class="order-num">${String(o.queue).padStart(2,'0')}</div>
        <div class="order-info">
          <div class="order-top">
            <span class="order-name">${escapeHtml(o.nama)}</span>
            <span class="order-id">${o.id}</span>
            <span class="order-type-badge">${o.type==='dine'?'Makan di tempat':'Bawa pulang'}</span>
          </div>
          <div class="order-items">${o.items.map(i=>`${i.emoji} ${i.name} ×${i.qty}`).join(' · ')}${o.note?' · 📝 '+escapeHtml(o.note):''}</div>
          <div class="order-bottom">
            <div>
              <span class="order-total">${fmt(o.total)}</span>
              <span class="order-hp"> · ${o.hp}</span>
            </div>
            <span class="order-status ${o.status==='done'?'status-done':o.status==='processing'?'status-processing':'status-pending'}">
              ${o.status==='pending'?'Menunggu':o.status==='processing'?'Diproses':'Selesai'}
            </span>
          </div>
        </div>
        <div class="order-actions" id="actions-${o.id}">
          ${o.status==='pending' ? `<button class="btn-process" data-id="${o.id}" data-action="process">✅ Proses</button><button class="btn-cancel-order" data-id="${o.id}" data-action="cancel">✕ Batalkan</button>` : ''}
          ${o.status==='processing' ? `<button class="btn-done" data-id="${o.id}" data-action="done">✓ Selesai</button>` : ''}
          ${o.status==='done' ? `<button class="btn-process" style="background:var(--c-cream);color:var(--c-text)" data-id="${o.id}" data-action="invoice">📄 Invoice</button>` : ''}
        </div>
      </div>
    `;
  }
  
  document.getElementById('order-list').innerHTML = html;
  
  // Attach event listeners ke tombol-tombol yang baru dibuat
  attachOrderButtonListeners();
}

// ATTACH EVENT LISTENERS ke tombol dinamis
function attachOrderButtonListeners() {
  // Tombol Proses (pending -> processing)
  document.querySelectorAll('.btn-process').forEach(btn => {
    btn.removeEventListener('click', handleProcessClick);
    btn.addEventListener('click', handleProcessClick);
  });
  
  // Tombol Selesai (processing -> done)
  document.querySelectorAll('.btn-done').forEach(btn => {
    btn.removeEventListener('click', handleDoneClick);
    btn.addEventListener('click', handleDoneClick);
  });
  
  // Tombol Batalkan
  document.querySelectorAll('.btn-cancel-order').forEach(btn => {
    btn.removeEventListener('click', handleCancelClick);
    btn.addEventListener('click', handleCancelClick);
  });
}

// Handler untuk tombol Proses
function handleProcessClick(e) {
  e.stopPropagation();
  const btn = e.currentTarget;
  const orderId = btn.getAttribute('data-id');
  if (orderId) {
    processOrder(orderId);
  }
}

// Handler untuk tombol Selesai
function handleDoneClick(e) {
  e.stopPropagation();
  const btn = e.currentTarget;
  const orderId = btn.getAttribute('data-id');
  if (orderId) {
    doneOrder(orderId);
  }
}

// Handler untuk tombol Batalkan
function handleCancelClick(e) {
  e.stopPropagation();
  const btn = e.currentTarget;
  const orderId = btn.getAttribute('data-id');
  if (orderId) {
    cancelOrder(orderId);
  }
}

// ====== ORDER ACTIONS ======
function processOrder(orderId) {
  console.log('Processing order:', orderId);
  const orderIndex = orders.findIndex(x => x.id === orderId);
  
  if (orderIndex !== -1 && orders[orderIndex].status === 'pending') {
    orders[orderIndex].status = 'processing';
    renderOrders();
    updateOrderBadge();
    renderDashboard();
    showToast(`✅ Pesanan #${orders[orderIndex].queue} (${orders[orderIndex].nama}) sedang diproses`);
    
    // Simpan ke localStorage
    saveToLocalStorage();
    syncToBackend('updateOrder', { id: orderId, status: 'processing' });
  } else {
    console.warn('Order not found or not in pending status:', orderId);
    showToast('⚠️ Pesanan tidak ditemukan atau sudah diproses');
  }
}

function doneOrder(orderId) {
  console.log('Completing order:', orderId);
  const orderIndex = orders.findIndex(x => x.id === orderId);
  
  if (orderIndex !== -1 && orders[orderIndex].status === 'processing') {
    const order = orders[orderIndex];
    order.status = 'done';
    
    // Kurangi stok untuk item yang dipesan
    order.items.forEach(item => {
      const menu = menuItems.find(m => m.name === item.name);
      if (menu) {
        menu.stock = Math.max(0, menu.stock - item.qty);
        menu.sold = (menu.sold || 0) + item.qty;
      }
    });
    
    renderOrders();
    updateOrderBadge();
    renderDashboard();
    renderStock();
    showToast(`🎉 Pesanan #${order.queue} (${order.nama}) selesai!`);
    
    // Simpan ke localStorage
    saveToLocalStorage();
    syncToBackend('completeOrder', { id: orderId, status: 'done' });
    
    // Tanya apakah ingin kirim invoice
    setTimeout(() => {
      if (confirm(`Kirim invoice ke ${order.hp}?`)) {
        sendInvoice(order.id);
      }
    }, 500);
  } else {
    console.warn('Order not found or not in processing status:', orderId);
    showToast('⚠️ Pesanan tidak ditemukan atau sudah selesai');
  }
}

function cancelOrder(orderId) {
  if (!confirm('Batalkan pesanan ini? Pesanan akan dihapus.')) return;
  
  const orderIndex = orders.findIndex(x => x.id === orderId);
  if (orderIndex !== -1) {
    const orderName = orders[orderIndex].nama;
    orders.splice(orderIndex, 1);
    renderOrders();
    updateOrderBadge();
    renderDashboard();
    showToast(`❌ Pesanan ${orderName} dibatalkan`);
    saveToLocalStorage();
    syncToBackend('cancelOrder', { id: orderId });
  }
}

function updateOrderBadge() {
  const count = orders.filter(o => o.status === 'pending').length;
  const badge = document.getElementById('badge-orders');
  if (badge) {
    badge.textContent = count;
    if (count > 0) {
      badge.classList.add('show');
    } else {
      badge.classList.remove('show');
    }
  }
}

async function sendInvoice(orderId) {
  const order = orders.find(x => x.id === orderId);
  if (!order) return;
  
  closeModal('modal-invoice');
  showToast(`📲 Mengirim invoice ke ${order.hp}...`);
  
  try {
    await fetch(SCRIPT_URL, { 
      method: 'POST', 
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'sendInvoice', orderId: orderId, phone: order.hp }) 
    });
    showToast('✅ Invoice terkirim!');
  } catch(e) { 
    // Simulasi kirim WhatsApp
    const waUrl = `https://wa.me/${order.hp.replace(/^0/, '62').replace(/^62/, '62')}?text=${encodeURIComponent(
      `Halo ${order.nama},\n\n*INVOICE PESANAN*\n` +
      `Order ID: ${order.id}\n` +
      `Antrian: #${order.queue}\n\n` +
      order.items.map(i => `- ${i.emoji} ${i.name} x${i.qty} = ${fmt(i.price * i.qty)}`).join('\n') +
      `\n\nSubtotal: ${fmt(order.sub)}` +
      `\nPPN 11%: ${fmt(order.tax)}` +
      `\n*TOTAL: ${fmt(order.total)}*` +
      `\n\nTerima kasih telah memesan di Warung Sejahtera!`
    )}`;
    window.open(waUrl, '_blank');
    showToast('✅ Invoice siap dikirim via WhatsApp');
  }
}

function showInvoice(orderId) {
  const order = orders.find(x => x.id === orderId);
  if (!order) return;
  
  const modalContent = document.getElementById('inv-preview-content');
  if (modalContent) {
    modalContent.innerHTML = `
      <div class="inv-preview">
        <div class="inv-head">
          <div><div class="inv-brand-name">🍽️ Warung Sejahtera</div><div class="inv-brand-sub">Jl. Raya No. 12 · Tel 021-5550123</div></div>
          <div class="inv-meta"><b>${order.id}</b><span>${order.time} · Antrian #${order.queue}</span></div>
        </div>
        <div class="inv-table-wrap">
          <table style="width:100%">
            <thead><tr><th>Item</th><th>Qty</th><th style="text-align:right">Subtotal</th></tr></thead>
            <tbody>${order.items.map(i=>`<tr><td>${i.emoji} ${i.name}</td><td>${i.qty}</td><td style="text-align:right">${fmt(i.price*i.qty)}</td></tr>`).join('')}</tbody>
          </table>
        </div>
        <div class="inv-sums">
          <div class="inv-sum-row"><span>Subtotal</span><span>${fmt(order.sub)}</span></div>
          <div class="inv-sum-row"><span>PPN 11%</span><span>${fmt(order.tax)}</span></div>
          <div class="inv-sum-row grand"><span>Total</span><span>${fmt(order.total)}</span></div>
        </div>
        <div class="inv-foot">Terima kasih, ${order.nama}! Pesanan: ${order.type==='dine'?'Makan di tempat':'Bawa pulang'}</div>
      </div>
      <button class="btn-send-inv" onclick="sendInvoice('${order.id}')">📲 Kirim Invoice ke ${order.hp}</button>`;
  }
  
  const modal = document.getElementById('modal-invoice');
  if (modal) modal.classList.add('open');
}

// ====== STOCK ======
function renderStock() {
  const low = menuItems.filter(m => m.stock > 0 && m.stock <= 5);
  const out = menuItems.filter(m => m.stock === 0);
  let alerts = '';
  if (out.length) alerts += `<div class="alert alert-warn">⚠️ Stok habis: ${out.map(m=>m.name).join(', ')}</div>`;
  if (low.length) alerts += `<div class="alert alert-warn">📦 Hampir habis: ${low.map(m=>m.name).join(', ')}</div>`;
  
  const alertDiv = document.getElementById('stock-alerts');
  if (alertDiv) alertDiv.innerHTML = alerts;

  const tbody = document.getElementById('stock-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = menuItems.map(m => `
    <tr>
      <td><span style="font-size:18px">${m.emoji}</span> ${m.name}<br><span style="font-size:11px;color:var(--c-muted)">${m.cat}</span></td>
      <td>${fmt(m.price)}</td>
      <td style="font-weight:500">${m.stock}</td>
      <td><span class="stk-badge ${m.stock===0?'stk-out':m.stock<=5?'stk-low':'stk-ok'}">${m.stock===0?'Habis':m.stock<=5?'Menipis':'Aman'}</span></td>
      <td>${m.sold||0}</td>
      <td>
        <button class="stk-btn" onclick="openRestock('${m.id}')">Stok</button>
        <button class="stk-btn" onclick="openEditMenu('${m.id}')">Edit</button>
        <button class="stk-btn-del" onclick="deleteMenu('${m.id}')">✕</button>
      </td>
    </tr>
  `).join('');
}

function openRestock(id) {
  const m = menuItems.find(x => x.id === id);
  if (!m) return;
  document.getElementById('rst-id').value = id;
  document.getElementById('modal-restock-title').textContent = `Stok — ${m.emoji} ${m.name} (${m.stock})`;
  document.getElementById('rst-qty').value = 10;
  document.getElementById('modal-restock').classList.add('open');
}

function saveRestock() {
  const id = document.getElementById('rst-id').value;
  const type = document.getElementById('rst-type').value;
  const qty = parseInt(document.getElementById('rst-qty').value) || 0;
  const m = menuItems.find(x => x.id === id);
  if (!m) return;
  if (type === 'set') m.stock = Math.max(0, qty);
  else if (type === 'add') m.stock += qty;
  else if (type === 'sub') m.stock = Math.max(0, m.stock - qty);
  closeModal('modal-restock');
  renderStock(); 
  renderDashboard();
  showToast('✅ Stok diperbarui!');
  saveToLocalStorage();
  syncToBackend('updateStock', { id, stock: m.stock });
}

function openAddMenu() {
  editingMenuId = null;
  document.getElementById('modal-menu-title').textContent = 'Tambah Menu Baru';
  ['mn-id','mn-name','mn-desc','mn-price','mn-stock'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const emojiEl = document.getElementById('mn-emoji');
  if (emojiEl) emojiEl.value = '🍽️';
  const catEl = document.getElementById('mn-cat');
  if (catEl) catEl.value = 'makanan';
  document.getElementById('modal-menu').classList.add('open');
}

function openEditMenu(id) {
  editingMenuId = id;
  const m = menuItems.find(x => x.id === id);
  if (!m) return;
  document.getElementById('modal-menu-title').textContent = 'Edit Menu';
  document.getElementById('mn-id').value = id;
  document.getElementById('mn-emoji').value = m.emoji;
  document.getElementById('mn-name').value = m.name;
  document.getElementById('mn-desc').value = m.desc;
  document.getElementById('mn-price').value = m.price;
  document.getElementById('mn-stock').value = m.stock;
  document.getElementById('mn-cat').value = m.cat;
  document.getElementById('modal-menu').classList.add('open');
}

function saveMenu() {
  const name = document.getElementById('mn-name').value.trim();
  const price = parseInt(document.getElementById('mn-price').value);
  const stock = parseInt(document.getElementById('mn-stock').value);
  if (!name || !price) { showToast('⚠️ Nama dan harga wajib diisi'); return; }

  if (editingMenuId) {
    const m = menuItems.find(x => x.id === editingMenuId);
    if (m) {
      m.name = name;
      m.price = price;
      m.stock = stock;
      m.emoji = document.getElementById('mn-emoji').value;
      m.desc = document.getElementById('mn-desc').value;
      m.cat = document.getElementById('mn-cat').value;
    }
  } else {
    menuItems.push({ 
      id: Date.now().toString(), 
      name, price, stock, sold: 0, 
      emoji: document.getElementById('mn-emoji').value, 
      desc: document.getElementById('mn-desc').value, 
      cat: document.getElementById('mn-cat').value 
    });
  }
  closeModal('modal-menu');
  renderStock(); 
  renderDashboard();
  showToast('✅ Menu disimpan!');
  saveToLocalStorage();
  syncToBackend('saveMenu', { menu: menuItems });
}

function deleteMenu(id) {
  const m = menuItems.find(x => x.id === id);
  if (!m || !confirm(`Hapus menu "${m.name}"?`)) return;
  menuItems = menuItems.filter(x => x.id !== id);
  renderStock(); 
  renderDashboard();
  showToast('🗑️ Menu dihapus');
  saveToLocalStorage();
  syncToBackend('deleteMenu', { id });
}

// ====== CONFIG ======
function saveConfig() {
  const url = document.getElementById('cfg-url').value;
  const tax = document.getElementById('cfg-tax').value;
  const lowStock = document.getElementById('cfg-low-stock').value;
  const newPass = document.getElementById('cfg-pass').value;
  
  if (url) {
    SCRIPT_URL = url;
    localStorage.setItem('scriptUrl', url);
  }
  if (newPass) {
    localStorage.setItem('adminPass', newPass);
  }
  if (tax) localStorage.setItem('taxRate', tax);
  if (lowStock) localStorage.setItem('lowStockAlert', lowStock);
  
  showToast('✅ Konfigurasi disimpan!');
}

// ====== UTILITIES ======
function saveToLocalStorage() {
  localStorage.setItem('warung_orders', JSON.stringify(orders));
  localStorage.setItem('warung_menu', JSON.stringify(menuItems));
}

function loadFromLocalStorage() {
  const savedOrders = localStorage.getItem('warung_orders');
  const savedMenu = localStorage.getItem('warung_menu');
  if (savedOrders) {
    try { orders = JSON.parse(savedOrders); } catch(e) {}
  }
  if (savedMenu) {
    try { menuItems = JSON.parse(savedMenu); } catch(e) {}
  }
}

async function syncToBackend(action, data) {
  try {
    await fetch(SCRIPT_URL, { 
      method: 'POST', 
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...data }) 
    });
  } catch(e) { console.log('Sync error:', e); }
}

function closeModal(id) { 
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open'); 
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg; 
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// ====== INIT ======
const dateEl = document.getElementById('topbar-date');
if (dateEl) {
  dateEl.textContent = new Date().toLocaleDateString('id-ID', {weekday:'long',day:'numeric',month:'long',year:'numeric'});
}

loadFromLocalStorage();
renderAll();

// Auto refresh setiap 30 detik
setInterval(() => { try { loadData(); } catch(e) {} }, 30000);

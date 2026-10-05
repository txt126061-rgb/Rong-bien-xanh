// ====== CẤU HÌNH ======
const ZALO_PHONE = '0966770176';   // đổi thành số Zalo của shop
const FREE_SHIP = 300000;
const CATEGORIES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'canh', label: 'Rong biển ăn liền' },
  
];
// Thêm ảnh thật: gắn img:'images/ten-anh.jpg' vào sản phẩm
const PRODUCTS = [
  { id: 1, cat: 'canh', name: 'Rong biển khô ăn liền 100g', price: 30000, old: 55000, img:'image/rongbien.jpg ', tag: 'Bán chạy' },
  
];

// ====== TIỆN ÍCH ======
const $ = (s) => document.querySelector(s);
const fmt = (n) => n.toLocaleString('vi-VN') + 'đ';
let cart = [];
try { cart = JSON.parse(localStorage.getItem('rb_cart')) || []; } catch (e) { cart = []; }
const save = () => { try { localStorage.setItem('rb_cart', JSON.stringify(cart)); } catch (e) {} };
const total = () => cart.reduce((s, i) => s + i.price * i.qty, 0);

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.style.opacity = 1;
  clearTimeout(toast.t); toast.t = setTimeout(() => (t.style.opacity = 0), 1800);
}

// ====== SẢN PHẨM ======
function renderFilters(active = 'all') {
  $('#filters').innerHTML = CATEGORIES.map((c) =>
    `<button data-cat="${c.id}" class="filter-btn border border-nori-100 rounded-full px-4 py-2 text-sm font-medium hover:border-nori-600 ${c.id === active ? 'active' : ''}">${c.label}</button>`
  ).join('');
}
function renderProducts(cat = 'all') {
  const list = cat === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.cat === cat);
  $('#productGrid').innerHTML = list.map((p) => `
    <div class="border border-nori-100 rounded-xl overflow-hidden flex flex-col bg-white">
      <div class="relative h-32 md:h-44 bg-ocean-50 grid place-items-center text-5xl overflow-hidden">
        ${p.img ? `<img src="${p.img}" alt="${p.name}" class="w-full h-full object-cover">` : p.emoji}
        ${p.tag ? `<span class="absolute top-2 left-2 bg-sun-500 text-nori-900 text-xs font-semibold px-2 py-0.5 rounded-full">${p.tag}</span>` : ''}
      </div>
      <div class="p-3 md:p-4 flex flex-col flex-1">
        <h3 class="text-sm font-semibold leading-snug flex-1">${p.name}</h3>
        <div class="mt-2"><span class="font-bold text-nori-700">${fmt(p.price)}</span>
          ${p.old ? `<span class="text-xs text-gray-400 line-through ml-1">${fmt(p.old)}</span>` : ''}</div>
        <button data-add="${p.id}" class="mt-3 bg-nori-800 hover:bg-nori-600 text-white text-sm font-medium py-2 rounded-full transition">Thêm vào giỏ</button>
      </div>
    </div>`).join('');
}

// ====== GIỎ HÀNG ======
function renderCart() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  $('#cartCount').textContent = count;
  $('#cartTotal').textContent = fmt(total());
  $('#checkoutTotal').textContent = fmt(total());
  $('#toCheckout').disabled = !cart.length;
  $('#toCheckout').classList.toggle('opacity-50', !cart.length);
  const left = FREE_SHIP - total();
  $('#shipNote').textContent = !cart.length ? '' : left > 0 ? `Mua thêm ${fmt(left)} để được miễn phí giao hàng` : 'Đơn hàng được miễn phí giao hàng';
  $('#cartItems').innerHTML = cart.length ? cart.map((i) => `
    <div class="flex gap-3 items-center">
      <div class="w-14 h-14 rounded-lg bg-ocean-50 grid place-items-center text-2xl shrink-0">${i.emoji}</div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium leading-snug">${i.name}</p>
        <p class="text-sm text-nori-700">${fmt(i.price)}</p>
        <div class="mt-1 inline-flex items-center border border-nori-100 rounded-full text-sm">
          <button data-dec="${i.id}" class="w-8 h-7" aria-label="Giảm">−</button>
          <span class="w-6 text-center">${i.qty}</span>
          <button data-inc="${i.id}" class="w-8 h-7" aria-label="Tăng">+</button>
        </div>
      </div>
      <button data-del="${i.id}" class="text-gray-400 hover:text-red-600 text-xl" aria-label="Xóa">×</button>
    </div>`).join('')
    : '<p class="text-center text-nori-700 mt-10">Giỏ hàng đang trống.<br>Chọn vài gói rong biển để bắt đầu.</p>';
}
function addToCart(id) {
  const p = PRODUCTS.find((x) => x.id === id);
  const it = cart.find((x) => x.id === id);
  it ? it.qty++ : cart.push({ id, name: p.name, price: p.price, emoji: p.emoji, qty: 1 });
  save(); renderCart(); toast('Đã thêm vào giỏ hàng');
}
function changeQty(id, d) {
  const it = cart.find((x) => x.id === id); if (!it) return;
  it.qty += d; if (it.qty <= 0) cart = cart.filter((x) => x.id !== id);
  save(); renderCart();
}

// ====== DRAWER ======
function showStep(step) {
  const checkout = step === 'checkout';
  $('#cartView').classList.toggle('hidden', checkout);
  $('#checkoutView').classList.toggle('hidden', !checkout);
  $('#drawerTitle').textContent = checkout ? 'Thông tin đặt hàng' : 'Giỏ hàng';
}
function openDrawer() {
  showStep('cart'); $('#drawer').classList.remove('translate-x-full');
  $('#overlay').classList.remove('opacity-0', 'pointer-events-none'); document.body.classList.add('lock');
}
function closeDrawer() {
  $('#drawer').classList.add('translate-x-full');
  $('#overlay').classList.add('opacity-0', 'pointer-events-none'); document.body.classList.remove('lock');
}

// ====== ĐẶT HÀNG ======
function buildMessage(d) {
  const lines = cart.map((i) => `- ${i.name} x${i.qty} = ${fmt(i.price * i.qty)}`);
  return `ĐƠN HÀNG MỚI\n${lines.join('\n')}\nTổng: ${fmt(total())}\n\nKhách: ${d.name}\nSĐT: ${d.phone}\nĐịa chỉ: ${d.address}\nGhi chú: ${d.note || 'Không'}`;
}
function submitOrder(e) {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(e.target));
  const err = $('#formError');
  if (!d.name.trim() || !d.address.trim()) return (err.textContent = 'Vui lòng nhập họ tên và địa chỉ nhận hàng.');
  if (!/^(0|\+84)\d{9,10}$/.test(d.phone.replace(/\s/g, ''))) return (err.textContent = 'Số điện thoại chưa đúng, ví dụ 0901234567.');
  err.textContent = '';
  const msg = buildMessage(d);
  let note = 'Cảm ơn bạn! Chúng tôi sẽ gọi xác nhận đơn trong ít phút.';
  if (e.submitter && e.submitter.dataset.mode === 'zalo') {
    if (navigator.clipboard) navigator.clipboard.writeText(msg).catch(() => {});
    window.open(`https://zalo.me/${ZALO_PHONE}`, '_blank');
    note = 'Nội dung đơn hàng đã được sao chép. Hãy dán (Ctrl+V) và gửi vào khung chat Zalo của shop.';
  }
  console.log(msg);
  cart = []; save(); renderCart(); e.target.reset(); closeDrawer();
  $('#modalMsg').textContent = note; $('#modal').classList.remove('hidden');
}

// ====== SỰ KIỆN ======
document.addEventListener('click', (e) => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.add) addToCart(+t.dataset.add);
  if (t.dataset.inc) changeQty(+t.dataset.inc, 1);
  if (t.dataset.dec) changeQty(+t.dataset.dec, -1);
  if (t.dataset.del) { cart = cart.filter((x) => x.id !== +t.dataset.del); save(); renderCart(); }
  if (t.dataset.cat) { renderFilters(t.dataset.cat); renderProducts(t.dataset.cat); }
});
$('#openCart').onclick = openDrawer;
$('#closeCart').onclick = closeDrawer;
$('#overlay').onclick = closeDrawer;
$('#toCheckout').onclick = () => cart.length && showStep('checkout');
$('#backCart').onclick = () => showStep('cart');
$('#checkoutView').addEventListener('submit', submitOrder);
$('#closeModal').onclick = () => $('#modal').classList.add('hidden');
$('#burger').onclick = () => $('#mobileNav').classList.toggle('hidden');
$('#mobileNav').onclick = () => $('#mobileNav').classList.add('hidden');
document.addEventListener('keydown', (e) => e.key === 'Escape' && closeDrawer());

renderFilters(); renderProducts(); renderCart();

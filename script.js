
const WH_BASE = "https://wa.me/5511988831326";
const PRODUCTS_FILE = "products.json";
const grid = document.getElementById('catalog');
const searchInput = document.getElementById('search');
const categoryFilter = document.getElementById('categoryFilter');

fetch(PRODUCTS_FILE)
  .then(r => r.json())
  .then(products => {
    window.products = products;
    populateCategories(products);
    renderGrid(products);
  })
  .catch(err => {
    grid.innerHTML = `<p style="padding:20px;color:#a00">Erro ao carregar products.json — verifique o arquivo na mesma pasta.</p>`;
    console.error(err);
  });

searchInput.addEventListener('input', () => applyFilters());
categoryFilter.addEventListener('change', () => applyFilters());

function applyFilters(){
  const q = searchInput.value.trim().toLowerCase();
  const cat = categoryFilter.value;
  let filtered = window.products || [];
  if(cat) filtered = filtered.filter(p => (p.category||'').toLowerCase() === cat.toLowerCase());
  if(q) filtered = filtered.filter(p => (p.name + ' ' + (p.desc||'') + ' ' + (p.category||'')).toLowerCase().includes(q));
  renderGrid(filtered);
}

function populateCategories(products){
  const cats = Array.from(new Set(products.map(p => p.category || 'Outros').map(s => s.trim()))).sort();
  cats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    categoryFilter.appendChild(opt);
  });
}

function renderGrid(products){
  if(!products || products.length === 0){
    grid.innerHTML = `<p style="padding:18px;color:#666">Nenhum produto encontrado.</p>`;
    return;
  }
  grid.innerHTML = '';
  products.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card';
    const imgWrap = document.createElement('div');
    imgWrap.className = 'img';
    const img = document.createElement('img');
    img.src = p.image || 'images/placeholder.png';
    img.alt = p.name;
    imgWrap.appendChild(img);
    const body = document.createElement('div');
    body.className = 'body';
    const h = document.createElement('h3'); h.textContent = p.name;
    const desc = document.createElement('p'); desc.className = 'desc'; desc.textContent = p.desc || '';
    const price = document.createElement('div'); price.className = 'price'; price.textContent = p.price ? `R$ ${p.price}` : '';
    const actions = document.createElement('div'); actions.className = 'actions';
    const waText = encodeURIComponent(`Olá, tenho interesse no produto: ${p.name} - Código: ${p.id || ''}`);
    const waHref = `${WH_BASE}?text=${waText}`;
    const btnWh = document.createElement('a'); btnWh.className = 'btn wh'; btnWh.href = waHref; btnWh.target = '_blank'; btnWh.rel='noopener'; btnWh.textContent = 'Falar no WhatsApp';
    const btnInfo = document.createElement('a'); btnInfo.className = 'btn info'; btnInfo.href = '#'; btnInfo.textContent = 'Detalhes';
    btnInfo.addEventListener('click', (e) => { e.preventDefault(); alert(p.name + "\n\n" + (p.desc||'') + "\n\nPreço: " + (p.price ? 'R$ ' + p.price : '—')); });
    actions.appendChild(btnWh);
    actions.appendChild(btnInfo);
    body.appendChild(h);
    body.appendChild(desc);
    body.appendChild(price);
    body.appendChild(actions);
    card.appendChild(imgWrap);
    card.appendChild(body);
    grid.appendChild(card);
  });
}

// smooth scroll for CTA
document.querySelectorAll('.btn-cta').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    e.preventDefault();
    document.querySelector('#catalog').scrollIntoView({behavior:'smooth'});
  });
});

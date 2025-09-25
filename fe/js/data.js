const searchInput = document.getElementById('searchInput');
const filterSelect = document.getElementById('filterSelect');
const sortSelect = document.getElementById('sortSelect');
const limitSelect = document.querySelector('select#limitSelect');
const applyBtn = document.getElementById('applyBtn');
const tableBody = document.querySelector('#sensorTable tbody');
const pagination = document.getElementById('pagination');

let currentPage = 1;
const sortBaseOptions = ['ASC', 'DESC']; 
const sortLabels = {
  temperature: 'Nhiệt độ',
  humidity: 'Độ ẩm',
  light: 'Ánh sáng',
  time: 'Thời gian',
};

// Cập nhật sort options khi thay đổi filter
filterSelect.addEventListener('change', () => {
  const selectedFilter = filterSelect.value;
  sortSelect.innerHTML = '';

  if (!sortLabels[selectedFilter]) {
    sortSelect.innerHTML = `
      <option selected>Sắp xếp</option>
      <option value="ASC">Tăng dần</option>
      <option value="DESC">Giảm dần</option>
    `;
    return;
  }

  sortBaseOptions.forEach(val => {
    const opt = document.createElement('option');
    opt.value = val;
    opt.text = `${sortLabels[selectedFilter]} ${val === 'ASC' ? 'tăng dần' : 'giảm dần'}`;
    sortSelect.appendChild(opt);
  });

  const defaultOpt = document.createElement('option');
  defaultOpt.text = 'Sắp xếp';
  defaultOpt.selected = true;
  sortSelect.insertBefore(defaultOpt, sortSelect.firstChild);
});

// Fetch dữ liệu
async function fetchSensorData(page = 1) {
  currentPage = page; // ✅ Update currentPage global

  const search = searchInput.value;
  const filter = filterSelect.value;
  const sort = sortSelect.value;
  const limit = limitSelect.value;

  const url = new URL('http://localhost:3000/sensor-data');
  url.search = new URLSearchParams({ search, filter, sort, limit, page }).toString();

  const res = await fetch(url);
  const data = await res.json();

  renderTable(data.data);
  renderPagination(currentPage, data.totalPages);
}

// Render table
function renderTable(data) {
  tableBody.innerHTML = '';
  if (!data || data.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td colspan="5" style="text-align:center; color:#E91E63; font-weight:bold;">
        🚫 Không có dữ liệu hợp lệ
      </td>
    `;
    tableBody.appendChild(tr);
    return;
  }
  data.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.id}</td>
      <td>${row.temperature}°C</td>
      <td>${row.humidity}%</td>
      <td>${row.light} Lux</td>
      <td>${formatDate(row.createdAt)}</td>
    `;
    tableBody.appendChild(tr);
  });
}
function formatDate(dateStr) {
  const d = new Date(dateStr);
  const pad = n => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
         `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
// Render pagination
function renderPagination(current, total) {
  pagination.innerHTML = '';

  current = Number(current);
  total = Number(total);

  // Previous
  const prev = document.createElement('li');
  prev.classList.add('page-item');
  if (current === 1) prev.classList.add('disabled');

  const prevLink = document.createElement('a');
  prevLink.classList.add('page-link', 'page-animate');
  prevLink.href = '#';
  prevLink.innerText = '«';
  prevLink.style.color = '#E91E63';
  prevLink.addEventListener('click', e => {
    e.preventDefault();
    if (currentPage > 1) fetchSensorData(currentPage - 1);
  });
  prev.appendChild(prevLink);
  pagination.appendChild(prev);

  // Tối đa 3 page hiển thị
  let start = Math.max(current - 1, 1);
  let end = Math.min(current + 1, total);
  if (current === 1) end = Math.min(3, total);
  if (current === total) start = Math.max(total - 2, 1);

  for (let i = start; i <= end; i++) {
    const li = document.createElement('li');
    li.classList.add('page-item');

    const a = document.createElement('a');
    a.classList.add('page-link', 'page-animate');
    a.href = '#';
    a.innerText = i;

    if (i === current) {
      li.classList.add('active');
      a.style.backgroundColor = '#E91E63';
      a.style.borderColor = '#E91E63';
      a.style.color = '#fff';
    } else {
      a.style.color = '#E91E63';
    }

    a.addEventListener('click', e => {
      e.preventDefault();
      fetchSensorData(i); // ✅ cập nhật currentPage bên trong fetch
    });

    li.appendChild(a);
    pagination.appendChild(li);
  }

  // Next
  const next = document.createElement('li');
  next.classList.add('page-item');
  if (current === total) next.classList.add('disabled');

  const nextLink = document.createElement('a');
  nextLink.classList.add('page-link', 'page-animate');
  nextLink.href = '#';
  nextLink.innerText = '»';
  nextLink.style.color = '#E91E63';
  nextLink.addEventListener('click', e => {
    e.preventDefault();
    if (currentPage < total) fetchSensorData(currentPage + 1);
  });

  next.appendChild(nextLink);
  pagination.appendChild(next);
}

// Auto fetch khi thay đổi
[searchInput, filterSelect, sortSelect, limitSelect].forEach(el => {
  el.addEventListener('change', () => fetchSensorData(1));
});

// Initial load
fetchSensorData(1);

// Apply button
applyBtn.addEventListener('click', e => {
  e.preventDefault();
  fetchSensorData(1);
});

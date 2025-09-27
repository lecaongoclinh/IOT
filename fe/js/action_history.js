const searchInput = document.getElementById('searchInput');
const filterSelect = document.getElementById('filterSelect');
const sortSelect = document.getElementById('sortSelect');
const limitSelect = document.querySelector('select#limitSelect');
const applyBtn = document.getElementById('applyBtn');
const tableBody = document.querySelector('#actionTable tbody');
const pagination = document.getElementById('pagination');

let currentPage = 1;

// Fetch dữ liệu
async function fetchActionHistory(page = 1) {
  currentPage = page;

  const search = searchInput.value;
  const filter = filterSelect.value;
  const sort = sortSelect.value;
  const limit = limitSelect.value;

  const url = new URL('http://localhost:3000/action-history');
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
      <td colspan="4" style="text-align:center; color:#E91E63; font-weight:bold;">
        🚫 Không có dữ liệu hợp lệ
      </td>
    `;
    tableBody.appendChild(tr);
    return;
  }
  data.forEach(row => {
    const tr = document.createElement('tr');

    // Map action sang tiếng Việt + màu
    let actionClass = "";
    let actionText = row.action;

    if (row.action === "on") {
      actionClass = "badge bg-success"; // xanh
      actionText = "Bật";
    } else if (row.action === "off") {
      actionClass = "badge bg-danger"; // đỏ
      actionText = "Tắt";
    } else if (row.action === "blink") {
      actionClass = "badge bg-warning text-dark"; // vàng
      actionText = "Nhấp nháy";
    } else {
      actionClass = "badge bg-secondary"; // mặc định
      actionText = row.action;
    }

    tr.innerHTML = `
      <td>${row.id}</td>
      <td>${row.deviceName || row.deviceId}</td>
      <td><div class="${actionClass}">${actionText}</div></td>
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
    if (currentPage > 1) fetchActionHistory(currentPage - 1);
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
      fetchActionHistory(i); // ✅ cập nhật currentPage bên trong fetch
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
    if (currentPage < total) fetchActionHistory(currentPage + 1);
  });

  next.appendChild(nextLink);
  pagination.appendChild(next);
}

// Auto fetch khi thay đổi
[searchInput, filterSelect, sortSelect, limitSelect].forEach(el => {
  el.addEventListener('change', () => fetchActionHistory(1));
});

// Initial load
fetchActionHistory(1);

// Apply button
applyBtn.addEventListener('click', e => {
  e.preventDefault();
  fetchActionHistory(1);
});


//copy
  document.getElementById("actionTable").addEventListener("click", function (e) {
    if (e.target && e.target.tagName === "TD") {
      const text = e.target.innerText.trim();

      // Copy vào clipboard
      navigator.clipboard.writeText(text).then(() => {
        console.log("Copied:", text);

        // Hiệu ứng báo copy thành công
        e.target.style.backgroundColor = "#d4edda";
        setTimeout(() => {
          e.target.style.backgroundColor = "";
        }, 500);
      });
    }
  });
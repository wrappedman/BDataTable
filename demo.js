/* Showcase logic only; the reusable module is entirely in BDataTable.js. */
(function () {
  'use strict';
  const names = ['سارا محمدی', 'علی رضایی', 'نگار حسینی', 'آرمان احمدی', 'مریم کریمی', 'پارسا کاظمی', 'هلیا موسوی', 'محمد مرادی', 'نرگس صادقی', 'امیرحسین نوری', 'آیدا رستمی', 'کیان اکبری', 'مهسا شریفی', 'پویا حیدری', 'ریحانه زمانی', 'سامان رحیمی'];
  const roles = ['طراح محصول', 'توسعه‌دهنده', 'مدیر پروژه', 'تحلیل‌گر داده', 'کارشناس محتوا', 'مدیر محصول'];
  const cities = ['تهران', 'اصفهان', 'شیراز', 'مشهد', 'تبریز', 'رشت'];
  const statuses = [{ label: 'فعال', key: 'active' }, { label: 'در انتظار', key: 'pending' }, { label: 'غیرفعال', key: 'inactive' }];
  const people = Array.from({ length: 48 }, (_, index) => ({
    id: 'BD-' + String(1001 + index),
    name: names[index % names.length],
    email: 'member' + (index + 1) + '@example.com',
    role: roles[(index * 5) % roles.length],
    city: cities[(index * 7) % cities.length],
    joined: '۱۴۰۳/' + String(1 + index % 12).padStart(2, '0') + '/' + String(1 + (index * 3) % 28).padStart(2, '0'),
    status: statuses[(index * 7 + (index % 4 === 0 ? 0 : 1)) % statuses.length].label,
    state: statuses[(index * 7 + (index % 4 === 0 ? 0 : 1)) % statuses.length].key
  }));
  const number = new Intl.NumberFormat('fa-IR');
  function personCell(value, row, index) {
    const container = document.createElement('div'); container.className = 'BDemo-person';
    const avatar = document.createElement('span'); avatar.className = 'BDemo-avatar'; avatar.dataset.tone = String(index % 4); avatar.textContent = value.charAt(0);
    const copy = document.createElement('span'); copy.className = 'BDemo-person-copy';
    const name = document.createElement('strong'); name.textContent = value;
    const email = document.createElement('small'); email.textContent = row.email;
    copy.append(name, email); container.append(avatar, copy); return container;
  }
  function statusCell(value, row) {
    const badge = document.createElement('span'); badge.className = 'BDemo-pill'; badge.dataset.state = row.state; badge.textContent = value; return badge;
  }
  function idCell(value) {
    const id = document.createElement('span'); id.className = 'BDemo-id'; id.textContent = value; return id;
  }
  const table = new BDataTable('#people-table', {
    label: 'فهرست اعضا', language: 'fa', theme: 'light', data: people,
    pageSize: 6, pageSizes: [6, 10, 20, -1], selection: true, columnSearch: true,
    columns: [
      { key: 'name', title: 'نام و نام خانوادگی', render: personCell, searchValue: (value, row) => value + ' ' + row.email },
      { key: 'id', title: 'شناسه', render: idCell },
      { key: 'role', title: 'سمت' },
      { key: 'city', title: 'شهر' },
      { key: 'joined', title: 'تاریخ عضویت' },
      { key: 'status', title: 'وضعیت', render: statusCell }
    ],
    onCellClick: ({ column, value, row }) => {
      const label = document.querySelector('#last-click');
      label.textContent = 'انتخاب شما: ' + column.title + ' «' + value + '» از ' + row.name;
    },
    onSelectionChange: ({ rows }) => { document.querySelector('#selected-count').textContent = number.format(rows.length) + ' انتخاب‌شده'; }
  });
  document.querySelector('#dataset-count').textContent = number.format(people.length) + ' ردیف نمونه';
  document.querySelector('#theme').addEventListener('change', event => table.setTheme(event.target.value));
  document.querySelector('#row-search').addEventListener('change', event => table.setRowSearch(event.target.checked));
  document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-mode]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    table.setMode(button.dataset.mode);
  }));
  new BDataTable('#html-table', { language: 'fa', pageSize: 3, searching: false, showLength: false, columnVisibility: false, exporting: false });
  document.querySelector('#copy-button').addEventListener('click', async function () {
    try {
      await navigator.clipboard.writeText(document.querySelector('#copy-code').textContent);
      this.textContent = 'کپی شد ✓';
    } catch (_) {
      this.textContent = 'کپی در این مرورگر در دسترس نیست';
    }
    window.setTimeout(() => { this.textContent = 'کپی کد'; }, 2500);
  });
  // Exposed only to make the interactive example easy to inspect in DevTools.
  window.demoTable = table;
})();

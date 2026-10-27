/* Showcase logic only; the reusable module is entirely in BDataTable.js. */
(function () {
  'use strict';
  const names = ['سارا محمدی', 'علی رضایی', 'نگار حسینی', 'آرمان احمدی', 'مریم کریمی', 'پارسا کاظمی', 'هلیا موسوی', 'محمد مرادی', 'نرگس صادقی', 'امیرحسین نوری', 'آیدا رستمی', 'کیان اکبری', 'مهسا شریفی', 'پویا حیدری', 'ریحانه زمانی', 'سامان رحیمی'];
  const roles = ['طراح محصول', 'توسعه‌دهنده', 'مدیر پروژه', 'تحلیل‌گر داده', 'کارشناس محتوا', 'مدیر محصول'];
  const cities = ['تهران', 'اصفهان', 'شیراز', 'مشهد', 'تبریز', 'رشت'];
  const statuses = [{ label: 'فعال', key: 'active' }, { label: 'در انتظار', key: 'pending' }, { label: 'غیرفعال', key: 'inactive' }];
  const number = new Intl.NumberFormat('fa-IR');
  function makePeople(count) {
    return Array.from({ length: count }, (_, index) => ({
      id: 'BD-' + String(1001 + index),
      name: names[index % names.length],
      email: 'member' + (index + 1) + '@example.com',
      role: roles[(index * 5) % roles.length],
      city: cities[(index * 7) % cities.length],
      joined: '۱۴۰۳/' + String(1 + index % 12).padStart(2, '0') + '/' + String(1 + (index * 3) % 28).padStart(2, '0'),
      status: statuses[(index * 7 + (index % 4 === 0 ? 0 : 1)) % statuses.length].label,
      state: statuses[(index * 7 + (index % 4 === 0 ? 0 : 1)) % statuses.length].key
    }));
  }
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
    label: 'فهرست اعضا', language: 'fa', theme: 'light', data: makePeople(48),
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
      document.querySelector('#last-click').textContent = 'خانهٔ انتخاب‌شده: ' + column.title + ' «' + value + '» از ' + row.name;
    },
    onRowClick: ({ row }) => { document.querySelector('#last-click').textContent += ' · شناسهٔ ردیف: ' + row.id; },
    onSelectionChange: ({ rows }) => { document.querySelector('#selected-count').textContent = number.format(rows.length) + ' انتخاب‌شده'; }
  });
  document.querySelector('#theme').addEventListener('change', event => table.setTheme(event.target.value));
  document.querySelector('#column-search').addEventListener('change', event => table.setColumnSearch(event.target.checked));
  document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-mode]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    table.setMode(button.dataset.mode);
  }));
  document.querySelectorAll('[data-dataset]').forEach(button => button.addEventListener('click', async () => {
    const count = Number(button.dataset.dataset);
    const started = performance.now();
    // Clear active filters so the full data set is visible after switching sizes.
    const columnSearch = document.querySelector('#column-search').checked;
    table.search('').setColumnSearch(false);
    if (columnSearch) table.setColumnSearch(true);
    try {
      await table.setData(makePeople(count));
      document.querySelectorAll('[data-dataset]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      document.querySelector('#selected-count').textContent = number.format(0) + ' انتخاب‌شده';
      document.querySelector('#dataset-count').textContent = number.format(count) + ' ردیف نمونه';
      document.querySelector('#performance-info').textContent = 'داده و جدول در این دستگاه در ' + number.format(Math.round(performance.now() - started)) + ' میلی‌ثانیه آماده شدند.';
    } catch (error) {
      document.querySelector('#performance-info').textContent = 'خطا در ساخت داده: ' + error.message;
    }
  }));

  // Each function below is the actual running example. Its source and the initial
  // HTML are displayed next to the live table, without evaluating generated code.
  function createHTMLExample() {
    const output = document.querySelector('#html-result');
    const button = document.querySelector('#html-destroy');
    let instance;
    function mount() {
      instance = new BDataTable('#html-table', {
        language: 'fa', pageSize: 2, searching: false, showLength: false,
        columnVisibility: false, exporting: false,
        onRowClick({ row }) {
          output.textContent = 'پروژه: ' + row[0] + '، مسئول: ' + row[1];
        }
      });
    }
    mount();
    button.addEventListener('click', () => {
      if (instance) {
        instance.destroy(); instance = null;
        button.textContent = 'راه‌اندازی دوباره';
        output.textContent = 'جدول HTML اصلی بازگردانده شد.';
      } else {
        mount(); button.textContent = 'حذف ماژول';
        output.textContent = 'جدول دوباره راه‌اندازی شد.';
      }
    });
    return { getTable: () => instance };
  }

  function createObjectExample() {
    const output = document.querySelector('#object-result');
    const rows = [
      { name: 'سارا', city: 'تهران', score: '85', active: true },
      { name: 'نیما', city: 'شیراز', score: '9', active: false },
      { name: 'هلیا', city: 'رشت', score: '42', active: true }
    ];
    const columns = [
      { key: 'name', title: 'نام', searchValue: (value, row) => value + ' ' + row.city },
      { key: 'city', title: 'شهر' },
      {
        key: 'score', title: 'امتیاز',
        render: value => value + ' امتیاز',
        sortValue: value => Number(value),
        compare: (a, b) => a - b,
        exportValue: value => Number(value)
      },
      { id: 'state', key: row => row.active, title: 'وضعیت', render: value => value ? 'فعال' : 'غیرفعال', searchValue: value => value ? 'فعال' : 'غیرفعال' }
    ];
    const instance = new BDataTable('#object-table', {
      language: 'fa', theme: 'ocean', data: rows, columns,
      pageSize: 2, selection: true, columnSearch: true,
      onCellClick({ value, column }) { output.textContent = column.title + ': ' + value; },
      onRowClick({ row }) { output.textContent += ' · ردیف: ' + row.name; },
      onSelectionChange({ rows: selected }) { output.textContent = 'تعداد انتخاب‌شده: ' + selected.length; }
    });
    document.querySelector('#object-add').addEventListener('click', () => {
      rows.push({ name: 'کاربر جدید ' + (rows.length - 2), city: 'تبریز', score: '60', active: true });
      instance.setData(rows);
      output.textContent = 'دادهٔ جدید اضافه و با setData جایگزین شد.';
    });
    document.querySelector('#object-update').addEventListener('click', () => {
      rows[0].score = String(Number(rows[0].score) + 1);
      instance.refresh(); // Invalidates the search/sort cache after an in-place edit.
      output.textContent = 'امتیاز سارا تغییر کرد: ' + rows[0].score;
    });
    let compact = false;
    document.querySelector('#object-columns').addEventListener('click', () => {
      compact = !compact;
      instance.setColumns(compact ? [columns[0], columns[2]] : columns);
      output.textContent = compact ? 'فقط ستون‌های نام و امتیاز نمایش داده می‌شوند.' : 'همهٔ ستون‌ها بازگردانده شدند.';
    });
    return instance;
  }

  function createListExamples() {
    const common = { language: 'fa', paging: false, searching: false, columnVisibility: false, exporting: false };
    const matrix = new BDataTable('#matrix-table', {
      ...common,
      columns: [{ key: 0, title: 'نام' }, { key: 1, title: 'شهر' }],
      data: [['سارا', 'تهران'], ['نیما', 'شیراز']]
    });
    const list = new BDataTable('#list-table', {
      ...common,
      columns: [{ key: 'text', title: 'نام' }, { key: 'city', title: 'شهر' }],
      data: document.querySelectorAll('#source-list li')
    });
    const values = new BDataTable('#set-table', {
      ...common, data: new Set(['طراحی', 'توسعه', 'آزمون'])
    });
    return { matrix, list, values };
  }

  function createJSONExamples() {
    const output = document.querySelector('#json-result');
    const jsonTable = new BDataTable('#json-table', {
      language: 'fa', pageSize: 2,
      ajax: { url: 'examples/people.json', dataPath: 'data' },
      columns: [
        { key: 'id', title: 'شناسه' }, { key: 'name', title: 'نام' },
        { key: 'city', title: 'شهر' }, { key: 'score', title: 'امتیاز' }
      ],
      onError(error) { output.textContent = 'خطا در دریافت JSON: ' + error.message + '؛ از سرور HTTP استفاده کنید.'; }
    });
    jsonTable.ready.then(() => { output.textContent = 'فایل JSON با موفقیت دریافت شد.'; }).catch(() => {});
    document.querySelector('#json-reload').addEventListener('click', async () => {
      output.textContent = 'در حال دریافت دوباره…';
      try { await jsonTable.reload(); output.textContent = 'اطلاعات دوباره دریافت شد.'; } catch (_) { /* onError updates the message */ }
    });
    const asyncTable = new BDataTable('#async-table', {
      language: 'fa', paging: false, searching: false, columnVisibility: false, exporting: false,
      data: async (_instance, signal) => {
        if (signal && signal.aborted) return [];
        return ['تحلیل', 'طراحی', 'پیاده‌سازی'];
      }
    });
    return { jsonTable, asyncTable };
  }

  function createAPIExample() {
    const output = document.querySelector('#api-result');
    const data = [
      { id: 1, name: 'سارا', city: 'تهران' }, { id: 2, name: 'نیما', city: 'شیراز' },
      { id: 3, name: 'هلیا', city: 'تهران' }, { id: 4, name: 'آرمان', city: 'رشت' }
    ];
    const instance = new BDataTable('#api-table', {
      language: 'fa', data, pageSize: 2, columnSearch: true, selection: true,
      columns: [{ key: 'name', title: 'نام' }, { key: 'city', title: 'شهر' }, { key: 'id', title: 'شناسه' }],
      onCellClick({ value, column }) { output.textContent = 'خانهٔ ' + column.title + ': ' + value; },
      onRowClick({ row, rowIndex }) { output.textContent += ' · ردیف ' + rowIndex + ': ' + row.name; }
    });
    document.querySelector('#api-table').addEventListener('bdatatable:cellclick', event => {
      // event.detail contains row, column, value, cell, rowIndex, and original event.
      console.debug('BDataTable cell:', event.detail.value);
    });
    document.querySelector('#api-filter').addEventListener('click', () => instance.searchColumn('city', 'تهران'));
    document.querySelector('#api-clear').addEventListener('click', () => instance.search('').searchColumn('city', ''));
    document.querySelector('#api-sort').addEventListener('click', () => instance.sort('name', 'asc'));
    document.querySelector('#api-column').addEventListener('click', () => {
      instance.setColumnVisible('city', !instance.getState().visibleColumns.includes('city'));
    });
    document.querySelector('#api-filters').addEventListener('click', () => {
      instance.setColumnSearch(!instance.getState().columnSearch);
    });
    document.querySelector('#api-theme').addEventListener('click', () => {
      const themes = ['light', 'dark', 'ocean'];
      instance.setTheme(themes[(themes.indexOf(instance.getState().theme) + 1) % themes.length]);
    });
    document.querySelector('#api-mode').addEventListener('click', () => {
      instance.setMode(instance.getState().mode === 'pages' ? 'scroll' : 'pages');
    });
    document.querySelector('#api-page').addEventListener('click', () => {
      instance.setMode('pages').setPageSize(1).goToPage(2);
      output.textContent = 'صفحهٔ فعلی: ' + instance.getState().page;
    });
    document.querySelector('#api-load').addEventListener('click', () => {
      if (instance.getState().mode !== 'scroll') instance.setMode('scroll');
      instance.loadMore();
      output.textContent = 'تعداد نمایش‌داده‌شده: ' + instance.getState().displayed;
    });
    document.querySelector('#api-inspect').addEventListener('click', () => {
      const first = instance.getRow(0), city = instance.getCell(0, 'city');
      const selected = instance.getSelectedRows(), filtered = instance.getData({ scope: 'filtered' });
      output.textContent = 'ردیف اول: ' + first.name + '، شهر: ' + city + '، انتخاب‌شده: ' + selected.length + '، نتایج: ' + filtered.length;
    });
    document.querySelector('#api-export').addEventListener('click', () => {
      const format = document.querySelector('#api-export-format').value;
      const scope = document.querySelector('#api-export-scope').value;
      const includeHidden = document.querySelector('#api-export-hidden').checked;
      instance.export(format, { scope, includeHidden }); // html, txt, csv, xlsx
    });
    return instance;
  }

  function createAdvancedExample() {
    const output = document.querySelector('#advanced-result');
    const instance = new BDataTable('#advanced-table', {
      language: 'fa', dir: 'rtl', theme: 'dark', label: 'فهرست کافه‌ها',
      paging: false, columnVisibility: false, exporting: false,
      strings: { search: 'جست‌وجوی سفارشی', searchPlaceholder: 'مثلاً cafe…' },
      // If a CSP nonce is required, supply it before the first instance is created.
      styleNonce: document.querySelector('meta[name="csp-nonce"]')?.content || null,
      searchNormalizer(value) {
        return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
      },
      data: [{ name: 'Café', city: 'تهران', code: 'A1' }, { name: 'Coffee', city: 'شیراز', code: 'B2' }],
      columns: [
        { key: 'name', title: 'نام' }, { key: 'city', title: 'شهر' },
        { key: 'code', title: 'کد', searchable: false, sortable: false }
      ],
      onDraw({ state }) { output.textContent = 'تعداد نتایج: ' + state.filtered + '؛ cafe با Café هم مطابقت دارد.'; },
      onError(error) { output.textContent = 'خطا: ' + error.message; }
    });
    return instance;
  }

  const mainCode = `<div id="people-table"></div>
<script src="BDataTable.js"></script>
<script>
const people = [
  { id: 'BD-1001', name: 'سارا', email: 'sara@example.com', role: 'طراح', city: 'تهران', joined: '۱۴۰۳/۰۱/۰۱', status: 'فعال' },
  { id: 'BD-1002', name: 'نیما', email: 'nima@example.com', role: 'توسعه‌دهنده', city: 'شیراز', joined: '۱۴۰۳/۰۲/۰۴', status: 'در انتظار' }
];
const table = new BDataTable('#people-table', {
  language: 'fa', theme: 'light', data: people,
  pageSize: 6, pageSizes: [6, 10, 20, -1], mode: 'pages',
  columnSearch: true, selection: true,
  columns: [
    { key: 'name', title: 'نام', searchValue: (value, row) => value + ' ' + row.email },
    { key: 'id', title: 'شناسه' }, { key: 'role', title: 'سمت' },
    { key: 'city', title: 'شهر' }, { key: 'joined', title: 'تاریخ عضویت' },
    { key: 'status', title: 'وضعیت' }
  ],
  onCellClick: ({ value, row }) => console.log('خانه:', value, 'ردیف:', row),
  onRowClick: ({ row }) => console.log('شناسه:', row.id),
  onSelectionChange: ({ rows }) => console.log('انتخاب‌ها:', rows)
});
// در زمان اجرا:
// table.setColumnSearch(false);  // حذف ورودی‌ها و پاک‌کردن فیلترهای ستون
// table.setColumnSearch(true);   // نمایش دوبارهٔ جست‌وجوی مستقل ستون‌ها
// table.setTheme('dark');
// table.setMode('scroll');
// table.setData(Array.from({ length: 5000 }, (_, i) => ({
//   id: i + 1, name: 'کاربر ' + i, email: 'user' + i + '@example.com',
//   role: 'کارشناس', city: 'تهران', joined: '۱۴۰۳/۰۱/۰۱', status: 'فعال'
// })));
</script>`;
  document.querySelector('#main-code').textContent = mainCode;

  const examples = {
    html: createHTMLExample,
    object: createObjectExample,
    list: createListExamples,
    json: createJSONExamples,
    api: createAPIExample,
    advanced: createAdvancedExample
  };
  const initialized = new Map();
  function dedent(markup) {
    const lines = markup.replace(/^\s*\n/, '').replace(/\n\s*$/, '').split('\n');
    const nonempty = lines.filter(line => line.trim());
    const indent = Math.min(...nonempty.map(line => line.match(/^\s*/)[0].length));
    return lines.map(line => line.slice(indent)).join('\n');
  }
  Object.entries(examples).forEach(([name, setup]) => {
    const markup = dedent(document.querySelector('#preview-' + name).innerHTML);
    document.querySelector('#code-' + name).textContent = markup + '\n\n<script src="BDataTable.js"></script>\n<script>\n' + setup.toString() + '\n\nconst example = ' + setup.name + '();\n</script>';
  });
  const tabs = Array.from(document.querySelectorAll('[role="tab"][data-example]'));
  function activateExample(name, focus) {
    tabs.forEach(tab => {
      const active = tab.dataset.example === name;
      tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
      if (active && focus) tab.focus();
    });
    if (!initialized.has(name)) initialized.set(name, examples[name]());
  }
  tabs.forEach(tab => {
    tab.addEventListener('click', () => activateExample(tab.dataset.example, false));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let index = tabs.indexOf(tab);
      if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = tabs.length - 1;
      else index = (index + (event.key === 'ArrowLeft' ? 1 : -1) + tabs.length) % tabs.length;
      activateExample(tabs[index].dataset.example, true);
    });
  });
  activateExample('html', false);

  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-copy-target]');
    if (!button) return;
    const content = document.getElementById(button.dataset.copyTarget).textContent;
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(content);
      else {
        const area = document.createElement('textarea');
        area.value = content; area.setAttribute('readonly', ''); area.style.position = 'fixed'; area.style.left = '-9999px';
        document.body.appendChild(area); area.select();
        const copied = document.execCommand('copy'); area.remove();
        if (!copied) throw new Error('Copy unavailable');
      }
      button.textContent = 'کپی شد ✓';
    } catch (_) {
      button.textContent = 'کپی در دسترس نیست';
    }
    window.setTimeout(() => { button.textContent = 'کپی کد'; }, 2500);
  });
  // Exposed only to make the interactive examples easy to inspect in DevTools.
  window.demoTable = table;
  window.demoExamples = initialized;
})();

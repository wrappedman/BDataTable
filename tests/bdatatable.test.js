'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { JSDOM } = require('jsdom');
const BDataTable = require('../BDataTable.js');

function setup(markup = '<div id="target"></div>') {
  const dom = new JSDOM('<!doctype html><html><head></head><body>' + markup + '</body></html>', { url: 'https://example.test/', pretendToBeVisual: true, runScripts: 'outside-only' });
  dom.window.Blob = Blob;
  dom.window.TextEncoder = TextEncoder;
  return { dom, window: dom.window, document: dom.window.document, target: dom.window.document.querySelector('#target') };
}
function click(window, element) { element.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true })); }
function input(window, element, value) { element.value = value; element.dispatchEvent(new window.Event('input', { bubbles: true })); }
function change(window, element, value) { if (value !== undefined) element.value = value; element.dispatchEvent(new window.Event('change', { bubbles: true })); }
function cells(table) { return Array.from(table.table.tBodies[0].rows, row => Array.from(row.cells, cell => cell.textContent)); }
function zipFiles(buffer) {
  const data = Buffer.from(buffer), files = {};
  let offset = 0;
  while (data.readUInt32LE(offset) === 0x04034b50) {
    assert.equal(data.readUInt16LE(offset + 8), 0, 'ZIP entries should use the store method');
    const size = data.readUInt32LE(offset + 18), nameLength = data.readUInt16LE(offset + 26), extraLength = data.readUInt16LE(offset + 28);
    const name = data.subarray(offset + 30, offset + 30 + nameLength).toString();
    const start = offset + 30 + nameLength + extraLength;
    files[name] = data.subarray(start, start + size).toString('utf8');
    offset = start + size;
  }
  assert.equal(data.readUInt32LE(offset), 0x02014b50, 'central directory follows file data');
  return files;
}

test('browser script exposes a global and injects one namespaced stylesheet, with no dependencies', () => {
  const { dom, window, document } = setup('<div id="target"></div><div id="other"></div>');
  window.eval(readFileSync(require.resolve('../BDataTable.js'), 'utf8'));
  assert.equal(typeof window.BDataTable, 'function');
  assert.equal(window.jQuery, undefined);
  new window.BDataTable(document.querySelector('#target'), { data: ['one'] });
  new window.BDataTable(document.querySelector('#other'), { data: ['two'], theme: 'dark' });
  assert.equal(document.querySelectorAll('#BDataTable-styles-v1').length, 1);
  const css = document.querySelector('#BDataTable-styles-v1').textContent;
  assert.match(css, /\.BDataTable-root/);
  for (const match of css.matchAll(/\.([A-Za-z][\w-]*)/g)) assert.ok(match[1].startsWith('BDataTable-'), match[1]);
  dom.window.close();
});

test('initializes an HTML table, preserves live cell nodes, and restores the original structure and listeners', () => {
  const { window, document, target } = setup('<table id="target" class="original" aria-busy="mixed"><caption>People</caption><thead><tr><th data-key="person">Name</th><th>Score</th></tr></thead><tbody>\n<tr><td><button>Charlie</button></td><td>10</td></tr>\n<tr><td>Anna</td><td hidden>2</td></tr></tbody><tbody><tr><td>Ben</td><td>3</td></tr></tbody><tfoot><tr><td>End</td><td>!</td></tr></tfoot></table><p id="after">after</p>');
  const originalHTML = target.outerHTML;
  const originalButton = target.querySelector('button');
  let hits = 0;
  originalButton.addEventListener('click', () => hits++);
  const table = new BDataTable(target, { pageSize: 2, columnSearch: true, rowSearch: true, selection: true });
  assert.equal(table.getState().total, 3);
  assert.deepEqual(table.getRow(0), ['Charlie', '10']);
  assert.equal(table.getCell(0, 'person'), 'Charlie');
  assert.throws(() => new BDataTable(target), /already has/);
  click(window, originalButton);
  assert.equal(hits, 1);
  table.sort('person', 'asc');
  assert.deepEqual(table.getData({ scope: 'page' }).map(row => row[0]), ['Anna', 'Ben']);
  table.goToPage(2);
  assert.equal(target.querySelector('tbody button'), originalButton);
  click(window, originalButton);
  assert.equal(hits, 2);
  table.setColumnVisible('person', false);
  table.destroy();
  assert.equal(document.querySelector('#target'), target);
  assert.equal(target.nextElementSibling.id, 'after');
  assert.equal(target.outerHTML, originalHTML);
  click(window, originalButton);
  assert.equal(hits, 3);
  assert.doesNotThrow(() => new BDataTable(target).destroy());
});

test('rejects unsupported merged HTML cells before changing the document', () => {
  const { target } = setup('<table id="target"><thead><tr><th colspan="2">Merged</th></tr></thead><tbody><tr><td>x</td><td>y</td></tr></tbody></table>');
  const before = target.outerHTML;
  assert.throws(() => new BDataTable(target), /rowspan or colspan/);
  assert.equal(target.outerHTML, before);
});

test('pagination, size changes, filtering, sorting and natural numeric ordering are stable', () => {
  const { window, target } = setup();
  const rows = [
    { name: 'Item 10', score: 10, secret: 'private' }, { name: 'Item 2', score: 2, secret: 'hidden' },
    { name: 'Item 2', score: 2, secret: 'hidden' }, { name: 'Item 1', score: null, secret: 'other' },
    { name: 'آرش ۱۲', score: 3, secret: 'other' }
  ];
  const table = new BDataTable(target, { data: rows, pageSize: 2, columnSearch: true, columns: [
    { key: 'name', title: 'Name' }, { key: 'score', title: 'Score' }, { key: 'secret', visible: false, searchable: false }
  ] });
  assert.equal(table.getState().displayed, 2);
  assert.deepEqual(table.getData({ scope: 'page' }), rows.slice(0, 2));
  table.goToPage(3);
  assert.equal(table.getState().page, 3);
  assert.deepEqual(table.getData({ scope: 'page' }), [rows[4]]);
  table.sort('score', 'asc');
  assert.deepEqual(table.getData({ scope: 'filtered' }), [rows[1], rows[2], rows[4], rows[0], rows[3]]);
  table.sort('score', 'desc');
  assert.deepEqual(table.getData({ scope: 'filtered' }), [rows[0], rows[4], rows[1], rows[2], rows[3]]);
  table.sort('name', 'asc');
  const itemNames = table.getData({ scope: 'filtered' }).map(row => row.name).filter(x => x.startsWith('Item'));
  assert.deepEqual(itemNames, ['Item 1', 'Item 2', 'Item 2', 'Item 10']);
  table.search('۱۲');
  assert.equal(table.getState().filtered, 1);
  assert.equal(table.getData({ scope: 'filtered' })[0], rows[4]);
  table.search('12');
  assert.equal(table.getState().filtered, 1, 'Persian and Latin digits compare equally');
  table.search('private');
  assert.equal(table.getState().filtered, 0, 'searchable:false is respected');
  table.search('');
  const filter = table.table.querySelector('input[aria-label="Filter Name"]');
  filter.focus(); input(window, filter, 'Item 2');
  assert.equal(table.getState().filtered, 2);
  assert.equal(table.document.activeElement, filter, 'column input stays focused on redraw');
  table.searchColumn('name', '');
  table.setPageSize(-1);
  assert.equal(table.getState().displayed, 5);
  assert.equal(table.pagination.children.length, 0);
  table.setPageSize(3).goToPage(50);
  assert.equal(table.getState().page, 2);
  assert.equal(table.getState().displayed, 2);
});

test('columns can be hidden, restored and redefined; the last visible column cannot be hidden', () => {
  const { window, target } = setup();
  const table = new BDataTable(target, { data: [{ name: 'Ada', city: 'Tehran', age: 29 }] });
  const menu = table.columnsPanel;
  const checkbox = menu.querySelectorAll('input')[1];
  checkbox.checked = false; change(window, checkbox);
  assert.deepEqual(table.getState().visibleColumns, ['name', 'age']);
  assert.deepEqual(cells(table)[0], ['Ada', '29']);
  table.setColumnVisible('age', false);
  assert.equal(table.setColumnVisible('name', false), false);
  assert.equal(table.columnsPanel.querySelector('input').disabled, true);
  table.setColumnVisible('city', true);
  assert.deepEqual(cells(table)[0], ['Ada', 'Tehran']);
  table.setColumns([{ key: 'age', title: 'Years' }, { key: row => row.name.toUpperCase(), id: 'upper', title: 'Upper' }]);
  assert.deepEqual(cells(table)[0], ['29', 'ADA']);
  assert.equal(table.getCell(0, 'upper'), 'ADA');
  assert.throws(() => table.setColumns([{ key: 'x' }, { key: 'x' }]), /unique/);
});

test('row search highlights each row independently without filtering it out', () => {
  const { window, target } = setup();
  const table = new BDataTable(target, { data: [['Red', 'Apple'], ['Red', 'Berry'], ['Green', 'Apple']], rowSearch: true, pageSize: 2 });
  let rows = table.table.tBodies[0].rows;
  input(window, rows[0].querySelector('.BDataTable-row-search'), 'apple');
  input(window, rows[1].querySelector('.BDataTable-row-search'), 'red');
  assert.equal(rows[0].cells[1].classList.contains('BDataTable-match'), true);
  assert.equal(rows[1].cells[0].classList.contains('BDataTable-match'), true);
  assert.equal(table.getState().filtered, 3);
  table.goToPage(2).goToPage(1);
  rows = table.table.tBodies[0].rows;
  assert.equal(rows[0].querySelector('.BDataTable-row-search').value, 'apple');
  assert.equal(rows[0].cells[1].classList.contains('BDataTable-match'), true);
  table.setRowSearch(false);
  assert.equal(table.table.querySelectorAll('.BDataTable-row-search').length, 0);
});

test('scroll mode appends on scroll and via load more without replacing existing rows', () => {
  const { window, target } = setup();
  const table = new BDataTable(target, { data: Array.from({ length: 7 }, (_, i) => [i]), mode: 'scroll', pageSize: 2 });
  const first = table.table.tBodies[0].rows[0];
  assert.equal(table.getState().displayed, 2);
  assert.ok(table.pagination.textContent.includes('Load more'));
  table.viewport.dispatchEvent(new window.Event('scroll'));
  assert.equal(table.getState().displayed, 4);
  assert.equal(table.table.tBodies[0].rows[0], first);
  click(window, table.pagination.querySelector('button'));
  assert.equal(table.getState().displayed, 6);
  assert.equal(table.loadMore(), true);
  assert.equal(table.getState().displayed, 7);
  assert.equal(table.loadMore(), false);
  table.search('2');
  assert.equal(table.getState().displayed, 1);
  table.search('');
  assert.equal(table.getState().displayed, 2);
  table.setMode('pages');
  assert.equal(table.getState().mode, 'pages');
});

test('selection persists across pages and only selects currently displayed rows', () => {
  const { window, target } = setup();
  let changes = 0, rowsClicked = 0;
  const table = new BDataTable(target, { data: [1, 2, 3, 4, 5], pageSize: 2, selection: true,
    onSelectionChange: () => changes++, onRowClick: () => rowsClicked++ });
  const all = table.table.tHead.querySelector('.BDataTable-check');
  all.checked = true; change(window, all);
  assert.deepEqual(table.getSelectedRows(), [1, 2]);
  table.goToPage(2);
  const one = table.table.tBodies[0].querySelector('.BDataTable-check');
  click(window, one);
  assert.deepEqual(table.getSelectedRows(), [1, 2, 3]);
  assert.equal(rowsClicked, 0, 'selection controls do not invoke row clicks');
  assert.equal(table.table.tHead.querySelector('.BDataTable-check').indeterminate, true);
  table.goToPage(1);
  assert.equal(table.table.tHead.querySelector('.BDataTable-check').checked, true);
  table.clearSelection();
  assert.equal(table.getSelectedRows().length, 0);
  assert.equal(changes, 3);
});

test('click, custom events and keyboard expose row, raw cell, column and source index', () => {
  const { window, target } = setup();
  const events = [];
  const table = new BDataTable(target, { data: [{ name: 'Ada', age: 29 }, { name: 'Bob', age: 31 }],
    onCellClick: detail => { events.push(['cell', detail]); },
    onRowClick: detail => { events.push(['row', detail]); }
  });
  let domEvent;
  target.addEventListener('bdatatable:cellclick', event => { domEvent = event.detail; });
  table.sort('name', 'desc');
  const cell = table.table.tBodies[0].rows[0].cells[1];
  click(window, cell);
  assert.deepEqual(events.map(e => e[0]), ['cell', 'row']);
  assert.equal(events[0][1].value, 31);
  assert.equal(events[0][1].row.name, 'Bob');
  assert.equal(events[0][1].rowIndex, 1);
  assert.equal(events[0][1].column.id, 'age');
  assert.equal(domEvent.cell, cell);
  events.length = 0;
  cell.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
  assert.deepEqual(events.map(e => e[0]), ['cell', 'row']);
  events.length = 0;
  const row = table.table.tBodies[0].rows[0];
  row.dispatchEvent(new window.KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
  assert.deepEqual(events.map(e => e[0]), ['row']);
  table.options.onCellClick = () => false;
  events.length = 0; click(window, cell);
  assert.equal(events.length, 0, 'returning false suppresses row callback');
});

test('exports filtered visible data as escaped HTML, safe UTF-8 text/CSV and real XLSX', async () => {
  const { window, target } = setup();
  const rows = [
    { name: '<img src=x onerror=alert(1)>', formula: '=1+1', amount: 3.5, secret: 'not exported' },
    { name: 'فارسی & "quoted"', formula: '  @HYPERLINK("evil")', amount: -4, secret: 'hidden' },
    { name: 'Other', formula: '+1', amount: 5, secret: 'hidden' }
  ];
  const table = new BDataTable(target, { data: rows, pageSize: 1, columns: [
    { key: 'name', title: 'Name <unsafe>' }, { key: 'formula', title: 'Formula' },
    { key: 'amount', title: 'Amount' }, { key: 'secret', title: 'Secret', visible: false }
  ] });
  assert.equal(table.table.tBodies[0].querySelector('img'), null, 'untrusted data is rendered as text');
  const htmlBlob = table.export('html', { download: false });
  const html = await htmlBlob.text();
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(html, /Name &lt;unsafe&gt;/);
  assert.doesNotMatch(html, /<img|not exported/);
  const csv = await table.export('csv', { download: false }).text();
  assert.match(csv, /'=1\+1/);
  assert.match(csv, /'  @HYPERLINK/);
  assert.match(csv, /-4/); // numeric negatives remain numeric
  const text = await table.export('txt', { download: false, scope: 'page', includeHidden: true }).text();
  assert.match(text, /Secret/);
  assert.match(text, /not exported/);
  assert.doesNotMatch(text, /فارسی/);
  const blob = table.export('xlsx', { download: false });
  assert.equal(blob.type, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  const files = zipFiles(await blob.arrayBuffer());
  assert.deepEqual(Object.keys(files).sort(), ['[Content_Types].xml', '_rels/.rels', 'xl/_rels/workbook.xml.rels', 'xl/workbook.xml', 'xl/worksheets/sheet1.xml'].sort());
  for (const content of Object.values(files)) {
    const parsed = new window.DOMParser().parseFromString(content, 'application/xml');
    assert.equal(parsed.querySelector('parsererror'), null);
  }
  const sheet = files['xl/worksheets/sheet1.xml'];
  assert.match(sheet, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(sheet, /فارسی &amp; &quot;quoted&quot;/);
  assert.match(sheet, /t="inlineStr"[^>]*><is><t xml:space="preserve">=1\+1/);
  assert.match(sheet, /<c r="C2"><v>3\.5<\/v><\/c>/);
  assert.doesNotMatch(sheet, /<f>|not exported/);
  table.search('فارسی');
  const filtered = await table.export('html', { download: false }).text();
  assert.match(filtered, /فارسی/);
  assert.doesNotMatch(filtered, /Other|onerror/);
});

test('download uses the expected name, type, and releases its object URL', async () => {
  const { window, target } = setup();
  const table = new BDataTable(target, { data: [1] });
  let receivedBlob, clicked, revoked;
  window.URL.createObjectURL = blob => { receivedBlob = blob; return 'blob:example'; };
  window.URL.revokeObjectURL = url => { revoked = url; };
  window.HTMLAnchorElement.prototype.click = function () { clicked = { filename: this.download, href: this.href }; };
  window.setTimeout = fn => fn();
  const blob = table.export('excel', { filename: 'report/2026' });
  assert.equal(blob, receivedBlob);
  assert.equal(clicked.filename, 'report_2026.xlsx');
  assert.equal(clicked.href, 'blob:example');
  assert.equal(revoked, 'blob:example');
});

test('accepts arrays, iterable lists, DOM lists and data from a promise', async () => {
  const { document, target } = setup('<div id="target"></div><ul id="list"><li data-id="1">Ali</li><li data-id="2">Sara</li></ul>');
  const table = new BDataTable(target, { data: document.querySelector('#list') });
  assert.deepEqual(table.getData(), [{ text: 'Ali', id: '1' }, { text: 'Sara', id: '2' }]);
  await table.setData(new Set(['one', 'two']));
  assert.deepEqual(table.getData(), ['one', 'two']);
  assert.deepEqual(cells(table), [['one'], ['two']]);
  await table.setData(Promise.resolve([[10, 20], [30, 40]]));
  assert.deepEqual(cells(table), [['10', '20'], ['30', '40']]);
  await table.setData(document.querySelectorAll('#list li'));
  assert.equal(table.getData()[1].text, 'Sara');
});

test('fetches JSON, follows dataPath, reloads, and displays errors', async () => {
  const { target } = setup();
  const requests = []; let count = 0; let receivedError;
  const table = new BDataTable(target, {
    ajax: { url: '/team.json', headers: { Authorization: 'test' }, dataPath: 'result.items' },
    onError: error => { receivedError = error; },
    fetch: async (url, init) => {
      requests.push({ url, init });
      count++;
      if (count === 3) return { ok: false, status: 503, statusText: 'Unavailable' };
      return { ok: true, json: async () => ({ result: { items: [{ name: count === 1 ? 'First' : 'Reloaded' }] } }) };
    }
  });
  assert.equal(table.getState().loading, true);
  assert.match(table.info.textContent, /Loading/);
  await table.ready;
  assert.equal(table.getRow(0).name, 'First');
  assert.equal(requests[0].url, '/team.json');
  assert.equal(requests[0].init.headers.Authorization, 'test');
  assert.ok(requests[0].init.signal);
  await table.reload();
  assert.equal(table.getRow(0).name, 'Reloaded');
  await assert.rejects(table.reload(), /HTTP 503/);
  assert.match(table.table.tBodies[0].textContent, /Unable to load data.*503/);
  assert.match(receivedError.message, /HTTP 503/);
  await table.setData([{ name: 'Recovered' }]);
  assert.equal(table.getRow(0).name, 'Recovered');
});

test('setData ignores stale responses, aborts old requests, and destroy prevents later updates', async () => {
  const { target } = setup();
  let firstResolve, secondResolve;
  const signals = [];
  const table = new BDataTable(target, { data: (_table, signal) => {
    signals.push(signal); return new Promise(resolve => { firstResolve = resolve; });
  } });
  const old = table.ready;
  const newer = table.setData((_table, signal) => {
    signals.push(signal); return new Promise(resolve => { secondResolve = resolve; });
  });
  assert.equal(signals[0].aborted, true);
  secondResolve([{ value: 'new' }]); await newer;
  firstResolve([{ value: 'old' }]); await old;
  assert.equal(table.getRow(0).value, 'new');
  let later;
  const pending = table.setData(() => new Promise(resolve => { later = resolve; }));
  table.destroy();
  later([{ value: 'too late' }]); await pending;
  assert.equal(target.children.length, 0);
});

test('dataPath errors are observable; explicit arrays remain usable after configuring a path', async () => {
  const { target } = setup();
  const table = new BDataTable(target, { data: Promise.resolve({ wrong: [] }), dataPath: 'items' });
  await assert.rejects(table.ready, /dataPath/);
  await table.setData([{ value: 'works' }]);
  assert.equal(table.getRow(0).value, 'works');
});

test('supports localization, themes, custom search values and supplied render nodes', () => {
  const { document, target } = setup();
  const node = document.createElement('strong'); node.textContent = 'Beautiful';
  const table = new BDataTable(target, { language: 'fa', theme: 'ocean', data: [{ name: 'علي', code: 12 }],
    strings: { search: 'پیدا کن' }, columns: [
      { key: 'name', title: 'نام', render: () => node, searchValue: value => value },
      { key: 'code', title: 'کد' }
    ] });
  assert.equal(table.root.dir, 'rtl');
  assert.ok(table.root.classList.contains('BDataTable-theme-ocean'));
  assert.match(table.toolbar.textContent, /پیدا کن/);
  assert.equal(table.table.querySelector('strong'), node);
  table.search('علی');
  assert.equal(table.getState().filtered, 1, 'Arabic and Persian yeh normalize');
  table.search('۱۲');
  assert.equal(table.getState().filtered, 1);
  table.setTheme('dark');
  assert.equal(table.getState().theme, 'dark');
  assert.throws(() => table.setTheme('other'), /Unknown theme/);
});

test('HTML columns can be reordered, duplicated and computed while original cells remain restorable', () => {
  const { window, target } = setup('<table id="target"><thead><tr><th data-key="name">Name</th><th data-key="score">Score</th></tr></thead><tbody><tr><td><button>Ada</button></td><td>10</td></tr></tbody></table>');
  const initial = target.outerHTML, button = target.querySelector('button');
  let hits = 0;
  button.addEventListener('click', () => hits++);
  const table = new BDataTable(target, { columns: [
    { key: 'score', title: 'Score' },
    { key: 'name', title: 'Name' },
    { key: 'name', id: 'duplicate', title: 'Again' },
    { key: row => row[0] + '!', id: 'computed', title: 'Computed' }
  ] });
  assert.deepEqual(cells(table), [['10', 'Ada', 'Ada', 'Ada!']]);
  assert.equal(table.table.tBodies[0].rows[0].cells[1].querySelector('button'), button);
  click(window, button); assert.equal(hits, 1);
  assert.equal(table.getCell(0, 'score'), '10');
  table.setColumns([{ key: 1, title: 'Score' }, { key: 0, title: 'Name' }]);
  assert.deepEqual(cells(table), [['10', 'Ada']]);
  table.destroy();
  assert.equal(target.outerHTML, initial);
  click(window, button); assert.equal(hits, 2);
});

test('Excel export rejects cell text beyond its documented format limit', () => {
  const { target } = setup();
  const table = new BDataTable(target, { data: ['a'.repeat(32768)] });
  assert.throws(() => table.export('xlsx', { download: false }), /32,767/);
});

test('custom event cancellation prevents the row event; controls remain keyboard accessible', () => {
  const { window, target } = setup();
  const hits = [];
  const table = new BDataTable(target, { data: [{ name: 'Ada' }], onCellClick: () => hits.push('cell'), onRowClick: () => hits.push('row') });
  target.addEventListener('bdatatable:cellclick', event => event.preventDefault());
  click(window, table.table.tBodies[0].rows[0].cells[0]);
  assert.deepEqual(hits, ['cell']);
  const cell = table.table.tBodies[0].rows[0].cells[0];
  assert.equal(cell.getAttribute('tabindex'), '0');
  assert.equal(table.table.tBodies[0].rows[0].getAttribute('tabindex'), '0');
});

test('HTML reload re-reads edited original cells and destroy restores the original class state', async () => {
  const { target } = setup('<table id="target"><tbody><tr><th data-key="name">Name</th></tr><tr><td>Ada</td></tr></tbody></table>');
  const before = target.outerHTML;
  const table = new BDataTable(target);
  assert.equal(table.getRow(0)[0], 'Ada');
  table.table.tBodies[0].rows[0].cells[0].textContent = 'Updated';
  await table.reload();
  assert.equal(table.getCell(0, 'name'), 'Updated');
  table.table.tBodies[0].rows[0].cells[0].textContent = 'Ada';
  table.destroy();
  assert.equal(target.outerHTML, before);
});

test('style nonce, hidden controls and localized HTML export are applied', async () => {
  const { document, target } = setup();
  const table = new BDataTable(target, { language: 'fa', styleNonce: 'abc123', data: ['سارا'], searching: false, showLength: false, columnVisibility: false, exporting: false, showInfo: false });
  assert.equal(document.querySelector('#BDataTable-styles-v1').getAttribute('nonce'), 'abc123');
  assert.equal(table.toolbar.hidden, true);
  assert.equal(table.info.hidden, true);
  const html = await table.export('html', { download: false }).text();
  assert.match(html, /<html lang="fa" dir="rtl">/);
});

test('replacing a schema drops stale filters and an obsolete sort', () => {
  const { target } = setup();
  const table = new BDataTable(target, { data: [{ a: 'one', b: 2 }] });
  table.searchColumn('a', 'one').sort('b', 'desc');
  table.setColumns([{ key: 'b', sortable: false }, { key: 'c' }]);
  assert.deepEqual(table.getState().columnSearches, {});
  assert.equal(table.getState().sort, null);
  table.setColumns([{ key: 'a' }, { key: 'b' }]);
  assert.equal(table.searchColumn('a'), '');
});

test('row search respects columns excluded from searching', () => {
  const { window, target } = setup();
  const table = new BDataTable(target, { data: [{ visible: 'safe', private: 'secret' }], rowSearch: true,
    columns: [{ key: 'visible' }, { key: 'private', searchable: false }] });
  input(window, table.table.querySelector('.BDataTable-row-search'), 'secret');
  assert.equal(table.table.querySelectorAll('.BDataTable-match').length, 0);
});

test('column and pagination controls retain keyboard focus after redraw', () => {
  const { window, document, target } = setup();
  const table = new BDataTable(target, { data: Array.from({ length: 5 }, (_, i) => ({ a: i, b: i })), pageSize: 2 });
  table.columnsMenu.open = true;
  const b = table.columnsPanel.querySelectorAll('input')[1];
  b.focus(); b.checked = false; change(window, b);
  assert.equal(document.activeElement, table.columnsPanel.querySelectorAll('input')[1]);
  const next = Array.from(table.pagination.querySelectorAll('button')).find(button => button.textContent === 'Next');
  next.focus(); click(window, next);
  assert.equal(table.getState().page, 2);
  assert.equal(document.activeElement.getAttribute('aria-current'), 'page');
  assert.equal(document.activeElement.textContent, '2');
});

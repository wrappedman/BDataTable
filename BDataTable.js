/* BDataTable — a dependency-free, browser-native data table.
 * Copyright (C) 2026 BDataTable contributors. Licensed under GPL-3.0.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BDataTable = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const STYLE_ID = 'BDataTable-styles-v1';
  const INSTANCES = new WeakMap();
  const HTML_SOURCE = Symbol('BDataTable HTML source');
  const THEMES = ['light', 'dark', 'ocean'];
  const STYLES = `
.BDataTable-root{--BDataTable-bg:#fff;--BDataTable-soft:#f7f9fc;--BDataTable-hover:#f1f6ff;--BDataTable-text:#1e293b;--BDataTable-muted:#66758c;--BDataTable-border:#e4eaf2;--BDataTable-accent:#3c63dd;--BDataTable-accent-soft:#edf2ff;--BDataTable-shadow:0 16px 42px rgba(25,42,70,.06);position:relative;color:var(--BDataTable-text);background:var(--BDataTable-bg);border:1px solid var(--BDataTable-border);border-radius:16px;box-shadow:var(--BDataTable-shadow);font:14px/1.55 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Tahoma,sans-serif;min-width:0}
.BDataTable-root.BDataTable-theme-dark{--BDataTable-bg:#182231;--BDataTable-soft:#202d3e;--BDataTable-hover:#263850;--BDataTable-text:#edf3fb;--BDataTable-muted:#a4b5ca;--BDataTable-border:#344459;--BDataTable-accent:#91a8ff;--BDataTable-accent-soft:#2b3b59;--BDataTable-shadow:0 16px 42px rgba(0,0,0,.2);color-scheme:dark}
.BDataTable-root.BDataTable-theme-ocean{--BDataTable-bg:#f9ffff;--BDataTable-soft:#edfafa;--BDataTable-hover:#e2f7f4;--BDataTable-text:#173b42;--BDataTable-muted:#5d7d82;--BDataTable-border:#cfe7e4;--BDataTable-accent:#008c82;--BDataTable-accent-soft:#d9f3ef}
.BDataTable-root,.BDataTable-root *{box-sizing:border-box}
.BDataTable-toolbar{display:flex;align-items:end;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:18px 20px;border-bottom:1px solid var(--BDataTable-border)}
.BDataTable-toolbar-group,.BDataTable-actions{display:flex;align-items:end;gap:10px;flex-wrap:wrap;min-width:0}
.BDataTable-field{display:flex;flex-direction:column;gap:5px;min-width:0}
.BDataTable-label{font-size:11px;font-weight:700;color:var(--BDataTable-muted)}
.BDataTable-search-wrap{position:relative;display:flex;align-items:center;min-width:min(260px,100%)}
.BDataTable-search-icon{position:absolute;inset-inline-start:12px;color:var(--BDataTable-muted);font-size:18px;line-height:1;pointer-events:none}
.BDataTable-input,.BDataTable-select{font:inherit;color:var(--BDataTable-text);background:var(--BDataTable-bg);border:1px solid var(--BDataTable-border);border-radius:9px;min-height:38px;outline:none}
.BDataTable-input{width:100%;padding:8px 10px}
.BDataTable-global-search{padding-inline-start:36px;min-width:0}
.BDataTable-input::placeholder{color:var(--BDataTable-muted);opacity:.8}
.BDataTable-input:focus,.BDataTable-select:focus,.BDataTable-button:focus-visible,.BDataTable-summary:focus-visible,.BDataTable-table button:focus-visible,.BDataTable-table td:focus-visible,.BDataTable-table tr:focus-visible{outline:3px solid var(--BDataTable-accent-soft);outline-offset:1px;border-color:var(--BDataTable-accent)}
.BDataTable-select{padding:7px 28px 7px 10px;cursor:pointer}
.BDataTable-button,.BDataTable-summary{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:38px;padding:7px 12px;border:1px solid var(--BDataTable-border);border-radius:9px;background:var(--BDataTable-bg);color:var(--BDataTable-text);font:600 13px/1.4 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Tahoma,sans-serif;cursor:pointer;white-space:nowrap;user-select:none;text-decoration:none}
.BDataTable-button:hover:not(:disabled),.BDataTable-summary:hover{background:var(--BDataTable-soft);border-color:var(--BDataTable-accent)}
.BDataTable-button:disabled{opacity:.43;cursor:not-allowed}
.BDataTable-button.BDataTable-active{color:var(--BDataTable-accent);background:var(--BDataTable-accent-soft);border-color:transparent}
.BDataTable-menu{position:relative}
.BDataTable-summary{list-style:none}
.BDataTable-summary::-webkit-details-marker{display:none}
.BDataTable-menu-panel{position:absolute;z-index:5;inset-inline-end:0;top:calc(100% + 7px);min-width:190px;max-height:280px;overflow:auto;padding:6px;background:var(--BDataTable-bg);border:1px solid var(--BDataTable-border);border-radius:11px;box-shadow:0 14px 35px rgba(17,30,48,.14)}
.BDataTable-menu-item{display:flex;align-items:center;gap:9px;width:100%;padding:9px 10px;border:0;border-radius:7px;text-align:start;background:transparent;color:var(--BDataTable-text);font:inherit;cursor:pointer;white-space:nowrap}
.BDataTable-menu-item:hover{background:var(--BDataTable-soft)}
.BDataTable-menu-item:has(input:disabled){opacity:.6;cursor:not-allowed}
.BDataTable-check{width:15px;height:15px;margin:0;accent-color:var(--BDataTable-accent);cursor:pointer;flex:none}
.BDataTable-viewport{overflow:auto;overscroll-behavior:contain;border-radius:0;max-width:100%}
.BDataTable-mode-scroll .BDataTable-viewport{max-height:var(--BDataTable-scroll-height,360px)}
.BDataTable-mode-scroll .BDataTable-table>thead{position:sticky;top:0;z-index:2}
.BDataTable-table{width:100%;border-collapse:collapse;border-spacing:0;text-align:start;color:var(--BDataTable-text);font:inherit}
.BDataTable-table>thead>tr>th{background:var(--BDataTable-soft);color:var(--BDataTable-muted);font-size:11px;font-weight:700;letter-spacing:.015em;text-align:start;white-space:nowrap;border-bottom:1px solid var(--BDataTable-border);padding:11px 14px}
.BDataTable-table>tbody>tr>td,.BDataTable-table>tbody>tr>th{border-bottom:1px solid var(--BDataTable-border);padding:13px 14px;text-align:start;vertical-align:middle}
.BDataTable-table>tbody>tr:last-child>td,.BDataTable-table>tbody>tr:last-child>th{border-bottom:0}
.BDataTable-table>tbody>tr:hover>td,.BDataTable-table>tbody>tr:hover>th{background:var(--BDataTable-hover)}
.BDataTable-root [hidden]{display:none!important}
.BDataTable-sort-button{display:flex;align-items:center;gap:7px;padding:0;border:0;background:transparent;color:inherit;font:inherit;text-align:inherit;cursor:pointer}
.BDataTable-sort-icon{color:var(--BDataTable-accent);font-size:13px;line-height:1}
.BDataTable-filter-row>th{padding:8px 14px 12px!important}
.BDataTable-column-input{min-width:85px;min-height:32px;padding:5px 8px;font-size:12px}
.BDataTable-control-cell{width:1%;white-space:nowrap;text-align:center!important}
.BDataTable-empty{text-align:center!important;color:var(--BDataTable-muted);padding:36px 18px!important}
.BDataTable-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px 20px;border-top:1px solid var(--BDataTable-border)}
.BDataTable-info{margin:0;color:var(--BDataTable-muted);font-size:12px}
.BDataTable-pagination{display:flex;align-items:center;gap:5px;flex-wrap:wrap}
.BDataTable-page-button{min-width:34px;min-height:34px;padding:5px 9px}
.BDataTable-ellipsis{padding:0 3px;color:var(--BDataTable-muted)}
.BDataTable-download{display:none}
@media(max-width:600px){.BDataTable-toolbar{padding:14px}.BDataTable-toolbar-group,.BDataTable-search-wrap{width:100%}.BDataTable-actions{width:100%;justify-content:space-between}.BDataTable-actions>.BDataTable-menu:first-child .BDataTable-menu-panel{inset-inline-start:0;inset-inline-end:auto}.BDataTable-footer{padding:12px 14px}.BDataTable-filter-row>th{padding-inline:12px!important}.BDataTable-table>tbody>tr>td,.BDataTable-table>tbody>tr>th{padding:11px 12px}}
`;

  const LANGUAGES = {
    en: {
      search: 'Search', searchPlaceholder: 'Search all columns…', rowsPerPage: 'Rows per page', rowsPerLoad: 'Rows per load',
      all: 'All', columns: 'Columns', export: 'Export', exportHTML: 'HTML', exportText: 'Text (.txt)',
      exportCSV: 'CSV', exportExcel: 'Excel (.xlsx)', filterColumn: 'Filter…', filterLabel: 'Filter {column}',
      selection: 'Select',
      selectRow: 'Select row {row}', selectPage: 'Select all displayed rows', previous: 'Previous', next: 'Next',
      pageLabel: 'Page {page}', pagination: 'Pagination', loadMore: 'Load more',
      info: 'Showing {start}–{end} of {filtered} entries', filteredFrom: ' (filtered from {total} total)',
      empty: 'No matching records found.', noData: 'No data available.', loading: 'Loading…',
      loadError: 'Unable to load data', column: 'Column {number}', value: 'Value',
      sortLabel: 'Sort by {column}', emptyColumns: 'No columns available.'
    },
    fa: {
      search: 'جست‌وجو', searchPlaceholder: 'جست‌وجو در همهٔ ستون‌ها…', rowsPerPage: 'تعداد در هر صفحه', rowsPerLoad: 'تعداد در هر بار',
      all: 'همه', columns: 'ستون‌ها', export: 'خروجی', exportHTML: 'HTML', exportText: 'متن (.txt)',
      exportCSV: 'CSV', exportExcel: 'اکسل (.xlsx)', filterColumn: 'فیلتر…', filterLabel: 'فیلتر {column}',
      selection: 'انتخاب',
      selectRow: 'انتخاب ردیف {row}', selectPage: 'انتخاب همهٔ ردیف‌های نمایش‌داده‌شده', previous: 'قبلی', next: 'بعدی',
      pageLabel: 'صفحهٔ {page}', pagination: 'صفحه‌بندی', loadMore: 'نمایش بیشتر',
      info: 'نمایش {start} تا {end} از {filtered} ردیف', filteredFrom: ' (فیلترشده از {total} ردیف)',
      empty: 'ردیفی مطابق جست‌وجو پیدا نشد.', noData: 'داده‌ای برای نمایش وجود ندارد.', loading: 'در حال دریافت اطلاعات…',
      loadError: 'دریافت اطلاعات ممکن نشد', column: 'ستون {number}', value: 'مقدار',
      sortLabel: 'مرتب‌سازی بر اساس {column}', emptyColumns: 'ستونی وجود ندارد.'
    }
  };

  const DEFAULTS = {
    theme: 'light', language: 'en', dir: null, pageSize: 10, pageSizes: [10, 25, 50, 100],
    mode: 'pages', paging: true, searching: true, columnSearch: false,
    columnVisibility: true, exporting: true, selection: false, showLength: true, showInfo: true,
    scrollHeight: 360, dataPath: null, label: null, styleNonce: null
  };

  function has(object, key) { return Object.prototype.hasOwnProperty.call(object, key); }
  function format(template, values) { return String(template).replace(/\{(\w+)\}/g, (_, key) => values[key] == null ? '' : String(values[key])); }
  function text(value) {
    if (value == null) return '';
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? '' : value.toISOString();
    if (typeof value === 'object') {
      try { const result = JSON.stringify(value); return result === undefined ? String(value) : result; } catch (_) { return String(value); }
    }
    return String(value);
  }
  function normalize(value) {
    return text(value).normalize('NFKC').toLocaleLowerCase()
      .replace(/[۰-۹]/g, c => String(c.charCodeAt(0) - 1776))
      .replace(/[٠-٩]/g, c => String(c.charCodeAt(0) - 1632))
      .replace(/ي/g, 'ی').replace(/ك/g, 'ک').trim();
  }
  function getPath(object, path) {
    if (path == null || path === '') return object;
    if (typeof path === 'function') return path(object);
    if (object == null) return undefined;
    if (has(Object(object), path)) return object[path];
    return String(path).split('.').reduce((value, part) => value == null ? undefined : value[part], object);
  }
  function create(doc, tag, className, content) {
    const element = doc.createElement(tag);
    if (className) element.className = className;
    if (content != null) element.textContent = content;
    return element;
  }
  function ensureStyles(doc, nonce) {
    if (doc.getElementById(STYLE_ID)) return;
    const style = doc.createElement('style');
    style.id = STYLE_ID;
    if (nonce) style.setAttribute('nonce', nonce);
    style.textContent = STYLES;
    (doc.head || doc.documentElement).appendChild(style);
  }
  function restoreAttribute(element, name, value) {
    if (value === null) element.removeAttribute(name);
    else element.setAttribute(name, value);
  }
  function normalizeSize(value) {
    const number = Number(value);
    if (!Number.isInteger(number) || (number < 1 && number !== -1)) throw new TypeError('pageSize must be a positive integer or -1 (all rows).');
    return number;
  }
  function domItem(item) {
    if (!item || item.nodeType !== 1) return item;
    const value = (item.textContent || '').trim();
    const data = item.dataset ? Object.assign({}, item.dataset) : {};
    return Object.keys(data).length ? Object.assign({ text: value }, data) : value;
  }
  function toRows(payload, path) {
    // A direct array is already a row list, even when a remote dataPath is configured.
    let value = path != null && (!Array.isArray(payload) || typeof path === 'function') ? getPath(payload, path) : payload;
    if (path != null && value === undefined) throw new TypeError('The configured dataPath did not resolve to a row list.');
    if (path == null && value && !Array.isArray(value) && Array.isArray(value.data)) value = value.data;
    if (value == null) return [];
    if (value.nodeType === 1 && /^(UL|OL)$/.test(value.tagName)) value = Array.from(value.children).filter(child => child.tagName === 'LI');
    if (!Array.isArray(value) && typeof value !== 'string' && value && typeof value[Symbol.iterator] === 'function') value = Array.from(value);
    if (!Array.isArray(value)) throw new TypeError('The data source must resolve to an array, an iterable, or a list element. Check dataPath for JSON objects.');
    return value.map(domItem);
  }
  function inferColumns(rows, strings) {
    const sample = rows.find(row => row != null);
    if (sample == null) return [];
    if (Array.isArray(sample)) return sample.map((_, i) => ({ key: i, title: format(strings.column, { number: i + 1 }) }));
    if (typeof sample === 'object' && !(sample instanceof Date)) return Object.keys(sample).map(key => ({ key, title: key }));
    return [{ key: null, title: strings.value }];
  }
  function normalizeColumns(definitions, previous) {
    if (!Array.isArray(definitions)) throw new TypeError('columns must be an array.');
    const ids = new Set();
    const columns = definitions.map((definition, index) => {
      const source = typeof definition === 'string' ? { key: definition, title: definition } : Object.assign({}, definition);
      const key = has(source, 'key') ? source.key : index;
      const id = String(source.id != null ? source.id : (typeof key === 'string' || typeof key === 'number' ? key : index));
      if (ids.has(id)) throw new TypeError('Column ids must be unique: ' + id);
      ids.add(id);
      const prior = previous && previous.get(id);
      return Object.assign({}, source, {
        key, id, index, title: String(source.title != null ? source.title : (key == null ? '' : key)),
        visible: prior ? prior.visible : source.visible !== false,
        searchable: source.searchable !== false, sortable: source.sortable !== false
      });
    });
    if (columns.length && !columns.some(column => column.visible)) columns[0].visible = true;
    return columns;
  }
  function xml(value) {
    return text(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }
  function html(value) { return text(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function spreadsheetText(value) {
    let result = text(value);
    // Text/CSV can be opened by spreadsheets; protect untrusted strings from formulas.
    if (typeof value !== 'number' && /^[\s\uFEFF]*[=+\-@\t\r\n]/.test(result)) result = "'" + result;
    return result;
  }
  function delimited(value, separator) {
    const result = spreadsheetText(value);
    return result.includes(separator) || /["\r\n]/.test(result) ? '"' + result.replace(/"/g, '""') + '"' : result;
  }
  function columnName(index) {
    let number = index + 1, name = '';
    while (number) { number--; name = String.fromCharCode(65 + number % 26) + name; number = Math.floor(number / 26); }
    return name;
  }
  const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let value = 0; value < table.length; value++) {
      let crc = value;
      for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
      table[value] = crc >>> 0;
    }
    return table;
  })();
  function crc32(bytes) {
    let crc = -1;
    for (let i = 0; i < bytes.length; i++) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[i]) & 0xff];
    return (crc ^ -1) >>> 0;
  }
  // ZIP "store" method. XLSX files remain standards-compliant without a ZIP dependency.
  function zip(files, BlobClass, EncoderClass) {
    const encoder = new EncoderClass(), localParts = [], centralParts = [];
    let offset = 0, centralSize = 0;
    files.forEach(file => {
      const name = encoder.encode(file.name), bytes = encoder.encode(file.content), crc = crc32(bytes);
      const local = new Uint8Array(30 + name.length), lv = new DataView(local.buffer);
      lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 20, true); lv.setUint16(6, 0x0800, true);
      lv.setUint16(8, 0, true); lv.setUint16(12, 0x21, true); lv.setUint32(14, crc, true);
      lv.setUint32(18, bytes.length, true); lv.setUint32(22, bytes.length, true); lv.setUint16(26, name.length, true);
      local.set(name, 30); localParts.push(local, bytes);
      const central = new Uint8Array(46 + name.length), cv = new DataView(central.buffer);
      cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true);
      cv.setUint16(8, 0x0800, true); cv.setUint16(10, 0, true); cv.setUint16(14, 0x21, true);
      cv.setUint32(16, crc, true); cv.setUint32(20, bytes.length, true); cv.setUint32(24, bytes.length, true);
      cv.setUint16(28, name.length, true); cv.setUint32(42, offset, true); central.set(name, 46);
      centralParts.push(central); centralSize += central.length; offset += local.length + bytes.length;
    });
    const end = new Uint8Array(22), ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true);
    ev.setUint32(12, centralSize, true); ev.setUint32(16, offset, true);
    return new BlobClass([...localParts, ...centralParts, end], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
  function xlsx(matrix, BlobClass, EncoderClass) {
    if (matrix.length > 1048576 || (matrix[0] && matrix[0].length > 16384)) throw new RangeError('The data exceeds the Excel worksheet size limit.');
    const rows = matrix.map((row, r) => '<row r="' + (r + 1) + '">' + row.map((value, c) => {
      const ref = columnName(c) + (r + 1);
      if (typeof value === 'number' && Number.isFinite(value)) return '<c r="' + ref + '"><v>' + value + '</v></c>';
      if (typeof value === 'boolean') return '<c r="' + ref + '" t="b"><v>' + (value ? 1 : 0) + '</v></c>';
      const cellText = text(value);
      if (cellText.length > 32767) throw new RangeError('Excel cells cannot exceed 32,767 characters.');
      return '<c r="' + ref + '" t="inlineStr"><is><t xml:space="preserve">' + xml(cellText) + '</t></is></c>';
    }).join('') + '</row>').join('');
    return zip([
      { name: '[Content_Types].xml', content: '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>' },
      { name: '_rels/.rels', content: '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
      { name: 'xl/workbook.xml', content: '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Data" sheetId="1" r:id="rId1"/></sheets></workbook>' },
      { name: 'xl/_rels/workbook.xml.rels', content: '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>' },
      { name: 'xl/worksheets/sheet1.xml', content: '<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' + rows + '</sheetData></worksheet>' }
    ], BlobClass, EncoderClass);
  }

  class BDataTable {
    constructor(target, options) {
      if (!options) options = {};
      if (typeof options !== 'object' || Array.isArray(options)) throw new TypeError('Options must be an object.');
      const defaultDocument = typeof document !== 'undefined' ? document : null;
      const element = typeof target === 'string' ? (defaultDocument && defaultDocument.querySelector(target)) : target;
      if (!element || element.nodeType !== 1) throw new TypeError('BDataTable needs an existing table or container element.');
      if (INSTANCES.has(element)) throw new Error('This element already has a BDataTable. Destroy it before initializing again.');
      this.target = element;
      this.document = element.ownerDocument;
      this.window = this.document.defaultView || globalThis;
      this.options = Object.assign({}, DEFAULTS, options);
      this.options.pageSize = normalizeSize(this.options.pageSize);
      if (!Array.isArray(this.options.pageSizes)) throw new TypeError('pageSizes must be an array.');
      this.options.pageSizes = Array.from(new Set(this.options.pageSizes.map(normalizeSize)));
      if (!this.options.pageSizes.includes(this.options.pageSize)) this.options.pageSizes.push(this.options.pageSize);
      if (!THEMES.includes(this.options.theme)) throw new TypeError('Unknown theme: ' + this.options.theme);
      if (!['pages', 'scroll'].includes(this.options.mode)) throw new TypeError('mode must be "pages" or "scroll".');
      if (this.options.dir != null && !['rtl', 'ltr', 'auto'].includes(this.options.dir)) throw new TypeError('dir must be "rtl", "ltr", or "auto".');
      const language = this.options.language === 'fa' ? 'fa' : 'en';
      this.strings = Object.assign({}, LANGUAGES[language], typeof this.options.language === 'object' ? this.options.language : {}, this.options.strings || {});
      this.language = language;
      this._number = new Intl.NumberFormat(language === 'fa' ? 'fa-IR' : 'en-US');
      this._collator = new Intl.Collator(language === 'fa' ? 'fa' : undefined, { numeric: true, sensitivity: 'base' });
      this._columns = [];
      this._autoColumns = options.columns == null;
      this._records = [];
      this._view = [];
      this._displayed = [];
      this._recordId = 0;
      this._selected = new Set();
      this._searchCache = new WeakMap();
      this._orderedCache = null;
      this._viewCache = null;
      this._columnTerms = new Map();
      this._search = '';
      this._sort = null;
      this._page = 0;
      this._loaded = this.options.pageSize;
      this._loading = false;
      this._error = null;
      this._destroyed = false;
      this._sequence = 0;
      this._abort = null;
      this._rowMap = new WeakMap();
      this._cellMap = new WeakMap();
      this._source = HTML_SOURCE;
      const isTable = element.tagName === 'TABLE';
      const useHTML = isTable && !has(options, 'data') && !has(options, 'ajax');
      this._original = isTable ? this._captureTable(element, useHTML) : null;
      this._originalRecords = this._original ? this._original.records : [];
      if (options.columns != null) this._columns = normalizeColumns(options.columns);
      else if (useHTML) this._columns = normalizeColumns(this._original.definitions);
      ensureStyles(this.document, this.options.styleNonce);
      this._mount(isTable);
      INSTANCES.set(element, this);
      this._buildHeader();
      if (useHTML) {
        this._records = this._originalRecords;
        this._refresh(true);
        this.ready = Promise.resolve(this);
      } else {
        const source = has(options, 'data') ? options.data : (has(options, 'ajax') ? options.ajax : []);
        this.setData(source);
      }
    }

    _captureTable(table, useHTML) {
      if (!table.parentNode) throw new Error('A table must have a parent before initialization.');
      const children = Array.from(table.childNodes);
      const bodies = Array.from(table.tBodies).map(body => ({ body, children: Array.from(body.childNodes) }));
      const original = { children, bodies, records: [], definitions: [], hadClass: table.classList.contains('BDataTable-table'), classAttribute: table.getAttribute('class'), label: table.getAttribute('aria-label'), busy: table.getAttribute('aria-busy') };
      if (!useHTML) return original;
      const headRows = table.tHead ? Array.from(table.tHead.rows) : [];
      let rows = Array.from(table.rows).filter(row => !row.closest('thead') && !row.closest('tfoot'));
      let header = headRows.length ? headRows[headRows.length - 1] : null;
      if (!header && rows.length && rows[0].cells.length && Array.from(rows[0].cells).every(cell => cell.tagName === 'TH')) header = rows.shift();
      const relevant = [...headRows, ...(header && !headRows.includes(header) ? [header] : []), ...rows];
      if (relevant.some(row => Array.from(row.cells).some(cell => cell.colSpan !== 1 || cell.rowSpan !== 1))) {
        throw new Error('HTML tables with rowspan or colspan are not supported; use one cell per column.');
      }
      const headerCells = header ? Array.from(header.cells) : [];
      const count = rows.reduce((maximum, row) => Math.max(maximum, row.cells.length), headerCells.length);
      original.definitions = Array.from({ length: count }, (_, i) => ({
        key: i, id: headerCells[i] && headerCells[i].getAttribute('data-key') || String(i),
        title: headerCells[i] ? headerCells[i].textContent.trim() : format(this.strings.column, { number: i + 1 })
      }));
      original.records = rows.map((row, index) => {
        const cells = Array.from(row.cells);
        const values = cells.map(cell => cell.textContent.trim());
        return {
          id: ++this._recordId, index, data: values.slice(), values, element: row, cells, controls: [],
          rowTabindex: row.getAttribute('tabindex'), rowChildren: Array.from(row.childNodes),
          cellStates: cells.map(cell => ({ hidden: cell.getAttribute('hidden'), tabindex: cell.getAttribute('tabindex'), classAttribute: cell.getAttribute('class'), children: Array.from(cell.childNodes), rendered: false }))
        };
      });
      return original;
    }

    _mount(isTable) {
      const doc = this.document;
      this.root = create(doc, 'div', 'BDataTable-root');
      this.root.setAttribute('dir', this.options.dir || (this.language === 'fa' ? 'rtl' : 'ltr'));
      this.root.setAttribute('lang', this.language);
      const height = this.options.scrollHeight;
      this.root.style.setProperty('--BDataTable-scroll-height', typeof height === 'number' ? height + 'px' : String(height));
      if (isTable) {
        this.target.parentNode.insertBefore(this.root, this.target);
        this.table = this.target;
      } else {
        this.target.appendChild(this.root);
        this.table = create(doc, 'table');
      }
      this.table.classList.add('BDataTable-table');
      if (this.options.label) this.table.setAttribute('aria-label', this.options.label);
      this._setThemeClass(this.options.theme);
      this.root.classList.toggle('BDataTable-mode-scroll', this.options.mode === 'scroll');
      this.toolbar = create(doc, 'div', 'BDataTable-toolbar');
      const group = create(doc, 'div', 'BDataTable-toolbar-group');
      const actions = create(doc, 'div', 'BDataTable-actions');
      if (this.options.searching) {
        const field = create(doc, 'label', 'BDataTable-field');
        field.appendChild(create(doc, 'span', 'BDataTable-label', this.strings.search));
        const wrap = create(doc, 'span', 'BDataTable-search-wrap');
        const icon = create(doc, 'span', 'BDataTable-search-icon', '⌕');
        icon.setAttribute('aria-hidden', 'true');
        this.searchInput = create(doc, 'input', 'BDataTable-input BDataTable-global-search');
        this.searchInput.type = 'search'; this.searchInput.placeholder = this.strings.searchPlaceholder;
        this.searchInput.addEventListener('input', () => this.search(this.searchInput.value));
        wrap.append(icon, this.searchInput); field.appendChild(wrap); group.appendChild(field);
      }
      if (this.options.showLength && this.options.paging) {
        const field = create(doc, 'label', 'BDataTable-field');
        this.lengthLabel = create(doc, 'span', 'BDataTable-label', this.options.mode === 'scroll' ? this.strings.rowsPerLoad : this.strings.rowsPerPage);
        this.lengthSelect = create(doc, 'select', 'BDataTable-select');
        this._renderLengthOptions();
        this.lengthSelect.addEventListener('change', () => this.setPageSize(Number(this.lengthSelect.value)));
        field.append(this.lengthLabel, this.lengthSelect); group.appendChild(field);
      }
      if (this.options.columnVisibility) {
        this.columnsMenu = create(doc, 'details', 'BDataTable-menu');
        const summary = create(doc, 'summary', 'BDataTable-summary');
        const icon = create(doc, 'span', '', '☷'); icon.setAttribute('aria-hidden', 'true');
        summary.append(icon, doc.createTextNode(this.strings.columns));
        this.columnsPanel = create(doc, 'div', 'BDataTable-menu-panel');
        this.columnsMenu.append(summary, this.columnsPanel); actions.appendChild(this.columnsMenu);
      }
      if (this.options.exporting) {
        this.exportMenu = create(doc, 'details', 'BDataTable-menu');
        const summary = create(doc, 'summary', 'BDataTable-summary');
        const icon = create(doc, 'span', '', '↓'); icon.setAttribute('aria-hidden', 'true');
        summary.append(icon, doc.createTextNode(this.strings.export));
        const panel = create(doc, 'div', 'BDataTable-menu-panel');
        [['html', 'exportHTML'], ['txt', 'exportText'], ['csv', 'exportCSV'], ['xlsx', 'exportExcel']].forEach(([type, label]) => {
          const button = create(doc, 'button', 'BDataTable-menu-item', this.strings[label]);
          button.type = 'button';
          button.addEventListener('click', () => { this.exportMenu.open = false; summary.focus(); this.export(type); });
          panel.appendChild(button);
        });
        this.exportMenu.append(summary, panel); actions.appendChild(this.exportMenu);
      }
      this.toolbar.append(group, actions);
      if (!group.children.length && !actions.children.length) this.toolbar.hidden = true;
      this.viewport = create(doc, 'div', 'BDataTable-viewport');
      this.viewport.appendChild(this.table);
      this.table.replaceChildren();
      this._thead = create(doc, 'thead'); this._tbody = create(doc, 'tbody');
      this.table.append(this._thead, this._tbody);
      this.footer = create(doc, 'div', 'BDataTable-footer');
      this.info = create(doc, 'p', 'BDataTable-info'); this.info.setAttribute('aria-live', 'polite');
      if (!this.options.showInfo) this.info.hidden = true;
      this.pagination = create(doc, 'nav', 'BDataTable-pagination'); this.pagination.setAttribute('aria-label', this.strings.pagination);
      this.footer.append(this.info, this.pagination);
      this.root.append(this.toolbar, this.viewport, this.footer);
      this.viewport.addEventListener('scroll', () => {
        if (this.options.mode === 'scroll' && this.options.paging && this.viewport.scrollTop + this.viewport.clientHeight >= this.viewport.scrollHeight - 32) this.loadMore();
      }, { passive: true });
      this._tbody.addEventListener('click', event => this._handleInteraction(event, false));
      this._tbody.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        const target = event.target;
        if (target && (target.tagName === 'TD' || target.tagName === 'TH' || target.tagName === 'TR')) {
          event.preventDefault(); this._handleInteraction(event, true);
        }
      });
    }

    _renderLengthOptions() {
      if (!this.lengthSelect) return;
      this.lengthSelect.replaceChildren();
      this.options.pageSizes.forEach(size => {
        const option = create(this.document, 'option', '', size === -1 ? this.strings.all : this._number.format(size));
        option.value = String(size); this.lengthSelect.appendChild(option);
      });
      this.lengthSelect.value = String(this.options.pageSize);
    }

    _buildHeader() {
      const doc = this.document;
      this._thead.replaceChildren();
      const row = create(doc, 'tr');
      this._headerCells = new Map();
      if (this.options.selection) {
        const th = create(doc, 'th', 'BDataTable-control-cell'); th.scope = 'col';
        this._selectAll = create(doc, 'input', 'BDataTable-check'); this._selectAll.type = 'checkbox';
        this._selectAll.setAttribute('aria-label', this.strings.selectPage);
        this._selectAll.addEventListener('change', () => {
          this._displayed.forEach(record => this._selectAll.checked ? this._selected.add(record.id) : this._selected.delete(record.id));
          this._syncSelection(); this._selectionChanged();
        });
        th.appendChild(this._selectAll); row.appendChild(th);
      } else this._selectAll = null;
      this._columns.filter(column => column.visible).forEach(column => {
        const th = create(doc, 'th'); th.scope = 'col';
        if (column.sortable) {
          const button = create(doc, 'button', 'BDataTable-sort-button'); button.type = 'button';
          button.setAttribute('aria-label', format(this.strings.sortLabel, { column: column.title }));
          const label = create(doc, 'span', '', column.title), icon = create(doc, 'span', 'BDataTable-sort-icon', '↕');
          icon.setAttribute('aria-hidden', 'true'); button.append(label, icon);
          button.addEventListener('click', () => {
            const direction = !this._sort || this._sort.id !== column.id ? 'asc' : (this._sort.direction === 'asc' ? 'desc' : null);
            this.sort(column.id, direction);
          });
          th.appendChild(button); this._headerCells.set(column.id, { th, icon });
        } else th.textContent = column.title;
        row.appendChild(th);
      });
      this._thead.appendChild(row);
      if (this.options.columnSearch) {
        const filters = create(doc, 'tr', 'BDataTable-filter-row');
        if (this.options.selection) filters.appendChild(create(doc, 'th', 'BDataTable-control-cell'));
        this._columns.filter(column => column.visible).forEach(column => {
          const th = create(doc, 'th');
          if (column.searchable) {
            const input = create(doc, 'input', 'BDataTable-input BDataTable-column-input'); input.type = 'search';
            input.placeholder = this.strings.filterColumn;
            input.setAttribute('aria-label', format(this.strings.filterLabel, { column: column.title }));
            input.value = this._columnTerms.get(column.id) || '';
            input.addEventListener('input', () => this.searchColumn(column.id, input.value));
            th.appendChild(input);
          }
          filters.appendChild(th);
        });
        this._thead.appendChild(filters);
      }
      this._updateSortHeader(); this._renderColumnsMenu();
    }

    _renderColumnsMenu() {
      if (!this.columnsPanel) return;
      this.columnsPanel.replaceChildren();
      if (!this._columns.length) { this.columnsPanel.appendChild(create(this.document, 'span', 'BDataTable-menu-item', this.strings.emptyColumns)); return; }
      const visible = this._columns.filter(column => column.visible).length;
      this._columnCheckboxes = new Map();
      this._columns.forEach(column => {
        const label = create(this.document, 'label', 'BDataTable-menu-item');
        const input = create(this.document, 'input', 'BDataTable-check'); input.type = 'checkbox';
        input.checked = column.visible; input.disabled = column.visible && visible === 1;
        this._columnCheckboxes.set(column.id, input);
        input.addEventListener('change', () => {
          this.setColumnVisible(column.id, input.checked);
          const replacement = this._columnCheckboxes.get(column.id);
          if (replacement && !replacement.disabled) replacement.focus();
          else this.columnsMenu.querySelector('summary').focus();
        });
        label.append(input, this.document.createTextNode(column.title)); this.columnsPanel.appendChild(label);
      });
    }

    _updateSortHeader() {
      if (!this._headerCells) return;
      this._headerCells.forEach((entry, id) => {
        const direction = this._sort && this._sort.id === id ? this._sort.direction : null;
        entry.th.setAttribute('aria-sort', direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none');
        entry.icon.textContent = direction === 'asc' ? '↑' : direction === 'desc' ? '↓' : '↕';
      });
    }

    _htmlColumnIndex(column) {
      if (typeof column.key === 'number') return column.key;
      if (typeof column.key === 'string' && this._original) {
        const index = this._original.definitions.findIndex(definition => definition.id === column.key);
        if (index !== -1) return index;
        return column.index;
      }
      return -1;
    }
    _value(record, column) {
      if (typeof column.key === 'function') return column.key(record.data, record.index);
      if (column.key === null) return record.data;
      if (record.element) return record.values[this._htmlColumnIndex(column)];
      return getPath(record.data, column.key);
    }
    _transform(record, column, property) {
      const value = this._value(record, column);
      return typeof column[property] === 'function' ? column[property](value, record.data, record.index) : value;
    }
    _normalize(value) { return typeof this.options.searchNormalizer === 'function' ? String(this.options.searchNormalizer(text(value))) : normalize(value); }
    _invalidateCaches() {
      this._searchCache = new WeakMap();
      this._orderedCache = null;
      this._viewCache = null;
    }
    _searchText(record, column) {
      let values = this._searchCache.get(record);
      if (!values) { values = new Map(); this._searchCache.set(record, values); }
      if (!values.has(column.id)) values.set(column.id, this._normalize(this._transform(record, column, 'searchValue')));
      return values.get(column.id);
    }
    _orderedRecords() {
      if (!this._sort) return this._records;
      if (this._orderedCache) return this._orderedCache;
      const column = this._columns.find(item => item.id === this._sort.id);
      if (!column) return this._records;
      const direction = this._sort.direction === 'asc' ? 1 : -1;
      // Compute a sort value once per row rather than on every comparison.
      const decorated = this._records.map(record => ({ record, value: this._transform(record, column, 'sortValue') }));
      decorated.sort((a, b) => {
        const av = a.value, bv = b.value;
        const aEmpty = av == null || av === '' || (typeof av === 'number' && Number.isNaN(av));
        const bEmpty = bv == null || bv === '' || (typeof bv === 'number' && Number.isNaN(bv));
        if (aEmpty || bEmpty) return aEmpty === bEmpty ? a.record.index - b.record.index : (aEmpty ? 1 : -1);
        let comparison;
        if (typeof column.compare === 'function') comparison = Number(column.compare(av, bv, a.record.data, b.record.data)) || 0;
        else if (typeof av === 'number' && typeof bv === 'number') comparison = av - bv;
        else if (av instanceof Date && bv instanceof Date) comparison = av.getTime() - bv.getTime();
        else comparison = this._collator.compare(text(av), text(bv));
        return comparison ? comparison * direction : a.record.index - b.record.index;
      });
      this._orderedCache = decorated.map(item => item.record);
      return this._orderedCache;
    }
    _calculateView() {
      if (this._viewCache) return this._viewCache;
      const query = this._normalize(this._search);
      const searchable = this._columns.filter(column => column.searchable);
      const filters = searchable.map(column => ({ column, term: this._normalize(this._columnTerms.get(column.id) || '') })).filter(filter => filter.term);
      const records = this._orderedRecords();
      if (!query && !filters.length) {
        this._viewCache = records.slice();
        return this._viewCache;
      }
      const result = [];
      for (const record of records) {
        if (query) {
          let matched = false;
          for (const column of searchable) {
            if (this._searchText(record, column).includes(query)) { matched = true; break; }
          }
          if (!matched) continue;
        }
        let matched = true;
        for (const filter of filters) {
          if (!this._searchText(record, filter.column).includes(filter.term)) { matched = false; break; }
        }
        if (matched) result.push(record);
      }
      this._viewCache = result;
      return result;
    }

    _refresh(reset) {
      if (this._destroyed) return;
      if (reset) { this._page = 0; this._loaded = this.options.pageSize; this.viewport.scrollTop = 0; }
      this._tbody.replaceChildren();
      this.table.setAttribute('aria-busy', this._loading ? 'true' : 'false');
      if (this._loading || this._error) {
        this._view = []; this._displayed = [];
        this._placeholder(this._loading ? this.strings.loading : this.strings.loadError + (this._error.message ? ': ' + this._error.message : ''));
        this.info.textContent = this._loading ? this.strings.loading : this.strings.loadError;
        this.pagination.replaceChildren(); this._syncSelection(); return;
      }
      this._view = this._calculateView();
      const size = this.options.pageSize;
      if (!this.options.paging || size === -1) this._displayed = this._view.slice();
      else if (this.options.mode === 'scroll') this._displayed = this._view.slice(0, Math.min(Math.max(size, this._loaded), this._view.length));
      else {
        const pages = Math.max(1, Math.ceil(this._view.length / size));
        this._page = Math.min(this._page, pages - 1);
        this._displayed = this._view.slice(this._page * size, (this._page + 1) * size);
      }
      const fragment = this.document.createDocumentFragment();
      this._displayed.forEach(record => fragment.appendChild(this._renderRecord(record)));
      this._tbody.appendChild(fragment);
      if (!this._displayed.length) this._placeholder(this._records.length ? this.strings.empty : this.strings.noData);
      this._updateFooter(); this._syncSelection(); this._notifyDraw(); this._fillViewport();
    }

    _placeholder(message) {
      const row = create(this.document, 'tr'); const cell = create(this.document, 'td', 'BDataTable-empty', message);
      cell.colSpan = Math.max(1, this._columns.filter(column => column.visible).length + (this.options.selection ? 1 : 0));
      row.appendChild(cell); this._tbody.appendChild(row);
    }

    _renderValue(cell, record, column) {
      const value = this._value(record, column);
      const result = typeof column.render === 'function' ? column.render(value, record.data, record.index) : value;
      cell.replaceChildren();
      if (result && typeof result === 'object' && typeof result.nodeType === 'number') cell.appendChild(result);
      else cell.textContent = text(result);
    }

    _renderRecord(record) {
      const doc = this.document, row = record.element || create(doc, 'tr');
      if (record.element) {
        record.controls.forEach(control => control.remove()); record.controls = [];
        // Move the original cells into the configured order instead of cloning them.
        // Unused cells stay detached until destroy(), retaining their event listeners.
        record.cells.forEach(cell => cell.remove());
        const used = new Set();
        this._columns.forEach(column => {
          const index = this._htmlColumnIndex(column);
          const originalCell = index >= 0 && index < record.cells.length && !used.has(index);
          const cell = originalCell ? record.cells[index] : create(doc, 'td');
          const state = originalCell ? record.cellStates[index] : null;
          if (originalCell) used.add(index); else record.controls.push(cell);
          cell.hidden = (state && state.hidden !== null) || !column.visible;
          this._cellMap.set(cell, column);
          if (!originalCell || typeof column.render === 'function') {
            this._renderValue(cell, record, column);
            if (state) state.rendered = true;
          } else if (state.rendered) {
            cell.replaceChildren(...state.children); state.rendered = false;
          }
          if (this.options.onCellClick) cell.setAttribute('tabindex', '0');
          else if (state) restoreAttribute(cell, 'tabindex', state.tabindex);
          row.appendChild(cell);
        });
        if (this.options.onRowClick) row.setAttribute('tabindex', '0');
        else restoreAttribute(row, 'tabindex', record.rowTabindex);
      } else {
        if (this.options.onRowClick) row.setAttribute('tabindex', '0');
        this._columns.filter(column => column.visible).forEach(column => {
          const cell = create(doc, 'td');
          if (this.options.onCellClick) cell.setAttribute('tabindex', '0');
          this._cellMap.set(cell, column); this._renderValue(cell, record, column); row.appendChild(cell);
        });
      }
      this._rowMap.set(row, record);
      if (this.options.selection) {
        const cell = create(doc, 'td', 'BDataTable-control-cell');
        const input = create(doc, 'input', 'BDataTable-check'); input.type = 'checkbox'; input.checked = this._selected.has(record.id);
        input.setAttribute('aria-label', format(this.strings.selectRow, { row: this._number.format(record.index + 1) }));
        input.addEventListener('change', () => {
          if (input.checked) this._selected.add(record.id); else this._selected.delete(record.id);
          this._syncSelection(); this._selectionChanged();
        });
        cell.appendChild(input); row.insertBefore(cell, row.firstChild);
        if (record.element) record.controls.push(cell);
      }
      return row;
    }

    _syncSelection() {
      if (!this.options.selection) return;
      Array.from(this._tbody.rows).forEach(row => {
        const record = this._rowMap.get(row);
        const first = row.cells[0];
        const input = record && first && first.classList.contains('BDataTable-control-cell') && first.querySelector('.BDataTable-check');
        if (input) input.checked = this._selected.has(record.id);
      });
      if (this._selectAll) {
        const count = this._displayed.filter(record => this._selected.has(record.id)).length;
        this._selectAll.disabled = !this._displayed.length;
        this._selectAll.checked = !!this._displayed.length && count === this._displayed.length;
        this._selectAll.indeterminate = count > 0 && count < this._displayed.length;
      }
    }
    _selectionChanged() {
      const detail = { table: this, rows: this.getSelectedRows() };
      if (typeof this.options.onSelectionChange === 'function') this.options.onSelectionChange(detail);
      this._emit('selectionchange', detail);
    }

    _updateFooter() {
      const filtered = this._view.length, total = this._records.length;
      const start = filtered ? (this.options.paging && this.options.mode === 'pages' && this.options.pageSize !== -1 ? this._page * this.options.pageSize + 1 : 1) : 0;
      const end = filtered ? (this.options.paging && this.options.mode === 'pages' && this.options.pageSize !== -1 ? Math.min(start + this._displayed.length - 1, filtered) : this._displayed.length) : 0;
      this.info.textContent = format(this.strings.info, { start: this._number.format(start), end: this._number.format(end), filtered: this._number.format(filtered), total: this._number.format(total) }) + (filtered !== total ? format(this.strings.filteredFrom, { total: this._number.format(total) }) : '');
      this.pagination.replaceChildren();
      if (!this.options.paging || this.options.pageSize === -1) return;
      if (this.options.mode === 'scroll') {
        if (this._displayed.length < filtered) {
          const button = create(this.document, 'button', 'BDataTable-button', this.strings.loadMore); button.type = 'button';
          button.addEventListener('click', () => {
            this.loadMore();
            const next = this.pagination.querySelector('button');
            if (next) next.focus(); else { this.info.tabIndex = -1; this.info.focus(); }
          }); this.pagination.appendChild(button);
        }
        return;
      }
      const pages = Math.ceil(filtered / this.options.pageSize);
      if (pages <= 1) return;
      const button = (label, page, disabled, active, aria) => {
        const item = create(this.document, 'button', 'BDataTable-button BDataTable-page-button' + (active ? ' BDataTable-active' : ''), label);
        item.type = 'button'; item.disabled = disabled;
        if (aria) item.setAttribute('aria-label', aria);
        if (active) item.setAttribute('aria-current', 'page');
        item.addEventListener('click', () => {
          this.goToPage(page + 1);
          const current = this.pagination.querySelector('[aria-current="page"]');
          if (current) current.focus();
        }); this.pagination.appendChild(item);
      };
      button(this.strings.previous, this._page - 1, this._page === 0, false);
      const indices = Array.from(new Set([0, this._page - 1, this._page, this._page + 1, pages - 1].filter(index => index >= 0 && index < pages))).sort((a, b) => a - b);
      let previous = -1;
      indices.forEach(index => {
        if (previous >= 0 && index - previous > 1) {
          if (index - previous === 2) button(this._number.format(index), index - 1, false, false, format(this.strings.pageLabel, { page: this._number.format(index) }));
          else { const dots = create(this.document, 'span', 'BDataTable-ellipsis', '…'); dots.setAttribute('aria-hidden', 'true'); this.pagination.appendChild(dots); }
        }
        button(this._number.format(index + 1), index, false, index === this._page, format(this.strings.pageLabel, { page: this._number.format(index + 1) })); previous = index;
      });
      button(this.strings.next, this._page + 1, this._page === pages - 1, false);
    }

    _fillViewport() {
      if (!this.options.paging || this.options.mode !== 'scroll' || this.options.pageSize === -1 || this._displayed.length >= this._view.length) return;
      const raf = this.window.requestAnimationFrame;
      if (typeof raf !== 'function') return;
      const sequence = this._sequence;
      raf.call(this.window, () => {
        if (!this._destroyed && sequence === this._sequence && this.options.mode === 'scroll' && this.viewport.clientHeight > 0 && this.viewport.scrollHeight <= this.viewport.clientHeight + 1) this.loadMore();
      });
    }
    _notifyDraw() {
      const detail = { table: this, state: this.getState() };
      if (typeof this.options.onDraw === 'function') this.options.onDraw(detail);
      this._emit('draw', detail);
    }
    _emit(name, detail) {
      const EventClass = this.window.CustomEvent;
      if (typeof EventClass !== 'function') return true;
      return this.table.dispatchEvent(new EventClass('bdatatable:' + name, { bubbles: true, cancelable: true, detail }));
    }
    _handleInteraction(event, keyboard) {
      let node = event.target && (event.target.nodeType === 1 ? event.target : event.target.parentElement);
      if (!node) return;
      let row = node;
      while (row && row.parentElement !== this._tbody) row = row.parentElement;
      const record = row && this._rowMap.get(row);
      if (!record) return;
      let cell = node;
      while (cell && cell.parentElement !== row) cell = cell.parentElement;
      if (cell && cell.classList.contains('BDataTable-control-cell')) return;
      if (keyboard && node !== row && node !== cell) return;
      const column = cell && this._cellMap.get(cell);
      const context = { table: this, event, row: record.data, rowIndex: record.index, rowElement: row,
        cell: column ? cell : null, column: column || null, columnIndex: column ? column.index : null,
        value: column ? this._value(record, column) : undefined };
      let allowRow = true;
      if (column) {
        if (typeof this.options.onCellClick === 'function' && this.options.onCellClick(context) === false) allowRow = false;
        if (!this._emit('cellclick', context)) allowRow = false;
      }
      if (allowRow) {
        if (typeof this.options.onRowClick === 'function') this.options.onRowClick(context);
        this._emit('rowclick', context);
      }
    }

    _resolveColumn(reference) {
      const column = typeof reference === 'number' ? this._columns[reference] : this._columns.find(item => item.id === String(reference) || item.key === reference || item.title === reference);
      if (!column) throw new RangeError('Unknown column: ' + String(reference));
      return column;
    }
    _fetchSource(source, signal) {
      const config = typeof source === 'string' ? { url: source } : Object.assign({}, source);
      const url = config.url, path = has(config, 'dataPath') ? config.dataPath : this.options.dataPath;
      delete config.url; delete config.dataPath;
      const fetcher = this.options.fetch || (this.window.fetch && this.window.fetch.bind(this.window)) || (typeof fetch === 'function' && fetch);
      if (!fetcher) throw new Error('fetch is not available in this browser.');
      config.signal = signal;
      return Promise.resolve(fetcher(url, config)).then(response => {
        if (!response.ok) throw new Error('HTTP ' + response.status + (response.statusText ? ' ' + response.statusText : ''));
        return response.json();
      }).then(payload => ({ payload, path }));
    }
    _pruneColumnState() {
      const columns = new Map(this._columns.map(column => [column.id, column]));
      for (const id of this._columnTerms.keys()) {
        if (!columns.has(id) || !columns.get(id).searchable) this._columnTerms.delete(id);
      }
      if (this._sort && (!columns.has(this._sort.id) || !columns.get(this._sort.id).sortable)) this._sort = null;
    }
    _commitData(rows) {
      if (this._autoColumns && rows.length) {
        const previous = new Map(this._columns.map(column => [column.id, column]));
        this._columns = normalizeColumns(inferColumns(rows, this.strings), previous);
        this._pruneColumnState();
        this._buildHeader();
      }
      this._records = rows.map((data, index) => ({ id: ++this._recordId, index, data }));
      this._selected.clear(); this._invalidateCaches(); this._loading = false; this._error = null;
      this._refresh(true);
      this._emit('data', { table: this, rows: this.getData() });
      return this;
    }
    _loadError(error) {
      this._loading = false; this._error = error instanceof Error ? error : new Error(String(error)); this._refresh(true);
      if (typeof this.options.onError === 'function') this.options.onError(this._error, this);
      this._emit('error', { table: this, error: this._error });
    }

    setData(source) {
      if (this._destroyed) throw new Error('This BDataTable has been destroyed.');
      this._source = source;
      if (this._abort) this._abort.abort();
      const Controller = typeof AbortController !== 'undefined' ? AbortController : this.window.AbortController;
      this._abort = Controller ? new Controller() : null;
      const signal = this._abort ? this._abort.signal : undefined;
      const sequence = ++this._sequence;
      const isCurrent = () => !this._destroyed && sequence === this._sequence;
      let result, path = this.options.dataPath;
      try {
        result = typeof source === 'function' ? source(this, signal) : source;
        if (typeof result === 'string' || (result && !Array.isArray(result) && typeof result.url === 'string')) {
          result = this._fetchSource(result, signal).then(response => { path = response.path; return response.payload; });
        }
        if (!result || typeof result.then !== 'function') {
          this._commitData(toRows(result, path));
          this.ready = Promise.resolve(this);
          return this.ready;
        }
      } catch (error) {
        if (isCurrent()) this._loadError(error);
        this.ready = Promise.reject(error); this.ready.catch(() => {}); return this.ready;
      }
      this._loading = true; this._error = null; this._refresh(true);
      this.ready = Promise.resolve(result).then(payload => {
        if (!isCurrent()) return this;
        return this._commitData(toRows(payload, path));
      }).catch(error => {
        if (!isCurrent()) return this;
        this._loadError(error); throw error;
      });
      this.ready.catch(() => {});
      return this.ready;
    }

    reload() {
      if (this._source !== HTML_SOURCE) return this.setData(this._source);
      this._originalRecords.forEach(record => {
        record.values = record.cells.map((cell, i) => record.cellStates[i].rendered ? text(record.values[i]) : cell.textContent.trim());
        record.data = record.values.slice();
      });
      this._records = this._originalRecords; this._selected.clear(); this._invalidateCaches(); this._loading = false; this._error = null;
      this._refresh(true); this.ready = Promise.resolve(this); return this.ready;
    }
    refresh() { this._invalidateCaches(); this._refresh(false); return this; }
    search(value) {
      if (arguments.length === 0) return this._search;
      const next = text(value);
      if (this._search !== next) this._viewCache = null;
      this._search = next; if (this.searchInput && this.searchInput.value !== this._search) this.searchInput.value = this._search;
      this._refresh(true); return this;
    }
    searchColumn(reference, value) {
      const column = this._resolveColumn(reference);
      if (arguments.length < 2) return this._columnTerms.get(column.id) || '';
      const term = value == null ? '' : text(value);
      if ((this._columnTerms.get(column.id) || '') !== term) this._viewCache = null;
      if (!term) this._columnTerms.delete(column.id); else this._columnTerms.set(column.id, term);
      // Keep the focused input in place, including its caret, while filtering.
      const visibleColumns = this._columns.filter(item => item.visible);
      const filterRow = this._thead.querySelector('.BDataTable-filter-row');
      const position = visibleColumns.indexOf(column) + (this.options.selection ? 1 : 0);
      const input = filterRow && position >= 0 && filterRow.cells[position] && filterRow.cells[position].querySelector('input');
      if (input && input.value !== text(value)) input.value = text(value);
      this._refresh(true); return this;
    }
    sort(reference, direction) {
      const column = this._resolveColumn(reference);
      if (!column.sortable) return this;
      if (direction != null && !['asc', 'desc'].includes(direction)) throw new TypeError('Sort direction must be "asc", "desc", or null.');
      this._sort = direction == null ? null : { id: column.id, direction };
      this._orderedCache = null; this._viewCache = null;
      this._updateSortHeader(); this._refresh(true); return this;
    }
    goToPage(page) {
      if (!Number.isInteger(Number(page)) || Number(page) < 1) throw new TypeError('Page numbers start at 1.');
      if (!this.options.paging || this.options.mode !== 'pages' || this.options.pageSize === -1) return this;
      this._page = Math.min(Number(page) - 1, Math.max(0, Math.ceil(this._view.length / this.options.pageSize) - 1));
      this.viewport.scrollTop = 0; this._refresh(false); return this;
    }
    setPageSize(size) {
      size = normalizeSize(size); this.options.pageSize = size;
      if (!this.options.pageSizes.includes(size)) this.options.pageSizes.push(size);
      this._renderLengthOptions(); this._refresh(true); return this;
    }
    setColumnVisible(reference, visible) {
      const column = this._resolveColumn(reference); visible = Boolean(visible);
      if (!visible && column.visible && this._columns.filter(item => item.visible).length === 1) return false;
      column.visible = visible; this._buildHeader(); this._refresh(false);
      this._emit('columnschange', { table: this, column, visible }); return true;
    }
    setColumns(columns) {
      this._columns = normalizeColumns(columns); this._autoColumns = false;
      this._pruneColumnState(); this._invalidateCaches(); this._buildHeader(); this._refresh(true); return this;
    }
    _setThemeClass(theme) {
      THEMES.forEach(name => this.root.classList.remove('BDataTable-theme-' + name));
      this.root.classList.add('BDataTable-theme-' + theme); this.options.theme = theme;
    }
    setTheme(theme) {
      if (!THEMES.includes(theme)) throw new TypeError('Unknown theme: ' + theme);
      this._setThemeClass(theme); return this;
    }
    setMode(mode) {
      if (!['pages', 'scroll'].includes(mode)) throw new TypeError('mode must be "pages" or "scroll".');
      this.options.mode = mode; this.root.classList.toggle('BDataTable-mode-scroll', mode === 'scroll');
      if (this.lengthLabel) this.lengthLabel.textContent = mode === 'scroll' ? this.strings.rowsPerLoad : this.strings.rowsPerPage;
      this._refresh(true); return this;
    }
    setColumnSearch(enabled) {
      enabled = Boolean(enabled);
      // Remove invisible filters when the controls are switched off.
      if (!enabled && this._columnTerms.size) { this._columnTerms.clear(); this._viewCache = null; }
      this.options.columnSearch = enabled;
      this._buildHeader(); this._refresh(true);
      this._emit('columnsearchtoggle', { table: this, enabled });
      return this;
    }
    loadMore() {
      if (this._destroyed || this._loading || this._error || !this.options.paging || this.options.mode !== 'scroll' || this.options.pageSize === -1 || this._displayed.length >= this._view.length) return false;
      const start = this._displayed.length, end = Math.min(start + this.options.pageSize, this._view.length);
      this._loaded = end;
      const fragment = this.document.createDocumentFragment();
      this._view.slice(start, end).forEach(record => fragment.appendChild(this._renderRecord(record)));
      this._tbody.appendChild(fragment); this._displayed = this._view.slice(0, end);
      this._updateFooter(); this._syncSelection(); this._notifyDraw(); this._fillViewport(); return true;
    }
    getData(options) {
      const scope = options && options.scope || 'all';
      if (!['all', 'filtered', 'page'].includes(scope)) throw new TypeError('scope must be "all", "filtered", or "page".');
      return (scope === 'page' ? this._displayed : scope === 'filtered' ? this._view : this._records).map(record => record.data);
    }
    getRow(index) { const record = this._records[Number(index)]; return record ? record.data : undefined; }
    getCell(index, reference) { const record = this._records[Number(index)]; return record ? this._value(record, this._resolveColumn(reference)) : undefined; }
    getSelectedRows() { return this._records.filter(record => this._selected.has(record.id)).map(record => record.data); }
    clearSelection() { this._selected.clear(); this._syncSelection(); this._selectionChanged(); return this; }
    getState() {
      return { search: this._search, columnSearches: Object.fromEntries(this._columnTerms), sort: this._sort && Object.assign({}, this._sort),
        page: this._page + 1, pageSize: this.options.pageSize, mode: this.options.mode, theme: this.options.theme, columnSearch: this.options.columnSearch,
        total: this._records.length, filtered: this._view.length, displayed: this._displayed.length,
        visibleColumns: this._columns.filter(column => column.visible).map(column => column.id), selected: this._selected.size, loading: this._loading };
    }
    export(type, options) {
      options = Object.assign({ scope: 'filtered', includeHidden: false, download: true, filename: 'BDataTable' }, options || {});
      type = String(type).toLowerCase();
      if (type === 'text') type = 'txt'; if (type === 'excel') type = 'xlsx';
      if (!['html', 'txt', 'csv', 'xlsx'].includes(type)) throw new TypeError('Export type must be html, txt, csv, or xlsx.');
      if (!['all', 'filtered', 'page'].includes(options.scope)) throw new TypeError('Export scope must be "all", "filtered", or "page".');
      const columns = this._columns.filter(column => options.includeHidden || column.visible);
      const records = options.scope === 'page' ? this._displayed : options.scope === 'filtered' ? this._view : this._records;
      const matrix = [columns.map(column => column.title), ...records.map(record => columns.map(column => this._transform(record, column, 'exportValue')))];
      const BlobClass = this.window.Blob || Blob;
      let blob;
      if (type === 'xlsx') {
        const EncoderClass = this.window.TextEncoder || (typeof TextEncoder !== 'undefined' && TextEncoder);
        if (!EncoderClass) throw new Error('TextEncoder is required for XLSX export.');
        blob = xlsx(matrix, BlobClass, EncoderClass);
      } else if (type === 'html') {
        const header = matrix[0].map(value => '<th scope="col">' + html(value) + '</th>').join('');
        const body = matrix.slice(1).map(row => '<tr>' + row.map(value => '<td>' + html(value) + '</td>').join('') + '</tr>').join('');
        blob = new BlobClass(['<!doctype html><html lang="' + this.language + '" dir="' + this.root.getAttribute('dir') + '"><head><meta charset="utf-8"><title>BDataTable</title></head><body><table><thead><tr>' + header + '</tr></thead><tbody>' + body + '</tbody></table></body></html>'], { type: 'text/html;charset=utf-8' });
      } else {
        const separator = type === 'csv' ? ',' : '\t';
        const content = matrix.map(row => row.map(value => delimited(value, separator)).join(separator)).join('\r\n');
        blob = new BlobClass(['\ufeff', content], { type: type === 'csv' ? 'text/csv;charset=utf-8' : 'text/plain;charset=utf-8' });
      }
      if (options.download) {
        const urlAPI = this.window.URL;
        if (!urlAPI || typeof urlAPI.createObjectURL !== 'function') throw new Error('File download is not available in this browser. Use download: false to obtain the Blob.');
        const url = urlAPI.createObjectURL(blob), link = create(this.document, 'a', 'BDataTable-download');
        const filename = String(options.filename || 'BDataTable').replace(/[\\/:*?"<>|]/g, '_');
        link.download = filename.toLowerCase().endsWith('.' + type) ? filename : filename + '.' + type;
        link.href = url; this.root.appendChild(link); link.click(); link.remove();
        this.window.setTimeout(() => urlAPI.revokeObjectURL(url), 1000);
      }
      this._emit('export', { table: this, type, scope: options.scope, blob });
      return blob;
    }
    destroy() {
      if (this._destroyed) return;
      this._destroyed = true; this._sequence++; if (this._abort) this._abort.abort();
      this._emit('destroy', { table: this });
      if (this._original) {
        this._originalRecords.forEach(record => {
          record.controls.forEach(control => control.remove());
          record.cells.forEach((cell, index) => {
            const state = record.cellStates[index];
            if (state.rendered) cell.replaceChildren(...state.children);
            restoreAttribute(cell, 'hidden', state.hidden); restoreAttribute(cell, 'tabindex', state.tabindex);
            if (state.classAttribute === null && !cell.className) cell.removeAttribute('class');
          });
          restoreAttribute(record.element, 'tabindex', record.rowTabindex);
          record.element.replaceChildren(...record.rowChildren);
        });
        this._original.bodies.forEach(item => item.body.replaceChildren(...item.children));
        this.table.replaceChildren(...this._original.children);
        if (!this._original.hadClass) this.table.classList.remove('BDataTable-table');
        if (this._original.classAttribute === null && !this.table.className) this.table.removeAttribute('class');
        restoreAttribute(this.table, 'aria-label', this._original.label);
        restoreAttribute(this.table, 'aria-busy', this._original.busy);
        if (this.root.parentNode) this.root.parentNode.insertBefore(this.table, this.root);
      }
      this.root.remove(); INSTANCES.delete(this.target);
      // Release large data/index structures even if the caller retains the instance.
      this._tbody.replaceChildren();
      this._records = []; this._view = []; this._displayed = []; this._originalRecords = [];
      this._selected.clear(); this._columnTerms.clear(); this._invalidateCaches();
      this._rowMap = new WeakMap(); this._cellMap = new WeakMap();
      this._original = null; this._source = null; this._abort = null;
      delete this.options.data; delete this.options.ajax;
    }
  }

  BDataTable.themes = Object.freeze(THEMES.slice());
  return BDataTable;
});

'use strict';
// A reproducible local smoke benchmark; browser and machine timings will differ.
const { performance } = require('node:perf_hooks');
const { JSDOM } = require('jsdom');
const BDataTable = require('../BDataTable.js');

const count = Number(process.argv[2] || 5000);
if (!Number.isInteger(count) || count < 1 || count > 1000000) {
  throw new TypeError('Pass a row count between 1 and 1,000,000.');
}
const dom = new JSDOM('<!doctype html><div id="table"></div>', { pretendToBeVisual: true });
const rows = Array.from({ length: count }, (_, index) => ({
  id: index + 1,
  name: 'کاربر ' + index,
  city: ['تهران', 'شیراز', 'رشت'][index % 3],
  role: 'کارشناس ' + (index % 5),
  score: index % 100,
  status: index % 2 ? 'فعال' : 'غیرفعال'
}));
function measure(name, action) {
  const start = performance.now();
  const result = action();
  console.log(name.padEnd(28), (performance.now() - start).toFixed(1).padStart(8), 'ms');
  return result;
}
const table = measure('initialize (10 DOM rows)', () => new BDataTable(dom.window.document.querySelector('#table'), {
  language: 'fa', data: rows, pageSize: 10, columnSearch: true
}));
measure('first search (cold cache)', () => table.search('not-present'));
measure('second search (warm cache)', () => table.search('کاربر 12'));
measure('sort all rows', () => table.search('').sort('score', 'desc'));
measure('search after sort', () => table.search('تهران'));
measure('next page (cached view)', () => table.goToPage(2));
console.log('total:', table.getState().total, '| matching:', table.getState().filtered, '| DOM rows:', table.table.tBodies[0].rows.length);
table.destroy();
dom.window.close();

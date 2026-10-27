'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const moduleSource = fs.readFileSync(path.join(root, 'BDataTable.js'), 'utf8');
const demoSource = fs.readFileSync(path.join(root, 'demo.js'), 'utf8');
const sampleJSON = JSON.parse(fs.readFileSync(path.join(root, 'examples/people.json'), 'utf8'));

function createDOM(markup = html) {
  const dom = new JSDOM(markup, { url: 'https://example.test/', runScripts: 'outside-only', pretendToBeVisual: true });
  const window = dom.window;
  window.TextEncoder = TextEncoder;
  window.Blob = Blob;
  window.fetch = async () => ({ ok: true, json: async () => sampleJSON });
  window.URL.createObjectURL = () => 'blob:test';
  window.URL.revokeObjectURL = () => {};
  window.HTMLAnchorElement.prototype.click = function () {};
  window.eval(moduleSource);
  return dom;
}
function click(window, selector) {
  const element = window.document.querySelector(selector);
  assert.ok(element, selector + ' exists');
  element.click();
}

test('showcase demonstrates 5,000 records, switchable column filters and all source examples', async () => {
  const dom = createDOM();
  const { window } = dom;
  window.eval(demoSource);
  const doc = window.document, table = window.demoTable;
  assert.equal(table.getState().total, 48);
  assert.equal(table.table.querySelectorAll('.BDataTable-column-input').length, 6);
  const toggle = doc.querySelector('#column-search');
  toggle.click();
  assert.equal(table.getState().columnSearch, false);
  assert.equal(table.table.querySelectorAll('.BDataTable-column-input').length, 0);
  toggle.click();
  assert.equal(table.getState().columnSearch, true);
  assert.equal(table.table.querySelectorAll('.BDataTable-column-input').length, 6);
  click(window, '[data-dataset="5000"]');
  await table.ready;
  await Promise.resolve();
  assert.equal(table.getState().total, 5000);
  assert.equal(table.getState().displayed, 6);
  assert.match(doc.querySelector('#performance-info').textContent, /میلی‌ثانیه/);
  assert.equal(doc.querySelector('[data-dataset="5000"]').getAttribute('aria-pressed'), 'true');
  assert.equal(doc.querySelector('#row-search'), null);
  assert.match(doc.querySelector('#main-code').textContent, /setColumnSearch/);

  // Existing HTML table can be destroyed and mounted again.
  assert.ok(doc.querySelector('#html-table').classList.contains('BDataTable-table'));
  click(window, '#html-destroy');
  assert.equal(doc.querySelector('#html-table').classList.contains('BDataTable-table'), false);
  click(window, '#html-destroy');
  assert.ok(doc.querySelector('#html-table').classList.contains('BDataTable-table'));

  click(window, '#tab-object');
  const objects = window.demoExamples.get('object');
  assert.equal(objects.getState().total, 3);
  click(window, '#object-add');
  assert.equal(objects.getState().total, 4);
  click(window, '#object-update');
  assert.equal(objects.getRow(0).score, '86');
  click(window, '#object-columns');
  assert.deepEqual(Array.from(objects.getState().visibleColumns), ['name', 'score']);

  click(window, '#tab-list');
  const list = window.demoExamples.get('list');
  assert.equal(list.matrix.getState().total, 2);
  assert.equal(list.list.getRow(0).city, 'تهران');
  assert.equal(list.values.getState().total, 3);

  click(window, '#tab-json');
  const json = window.demoExamples.get('json');
  await Promise.all([json.jsonTable.ready, json.asyncTable.ready]);
  assert.equal(json.jsonTable.getState().total, 4);
  assert.equal(json.asyncTable.getState().total, 3);
  click(window, '#json-reload');
  await json.jsonTable.ready;
  assert.equal(json.jsonTable.getState().total, 4);

  click(window, '#tab-api');
  const api = window.demoExamples.get('api');
  click(window, '#api-filter');
  assert.equal(api.getState().filtered, 2);
  click(window, '#api-filters');
  assert.equal(api.getState().columnSearch, false);
  assert.equal(api.getState().filtered, 4);
  click(window, '#api-column');
  assert.equal(api.getState().visibleColumns.includes('city'), false);
  click(window, '#api-page');
  assert.equal(api.getState().page, 2);
  click(window, '#api-load');
  assert.equal(api.getState().mode, 'scroll');
  assert.ok(api.getState().displayed > 1);
  click(window, '#api-export');

  click(window, '#tab-advanced');
  const advanced = window.demoExamples.get('advanced');
  assert.equal(advanced.getState().theme, 'dark');
  advanced.search('cafe');
  assert.equal(advanced.getState().filtered, 1);
  assert.equal(advanced.getData({ scope: 'filtered' })[0].name, 'Café');
  dom.window.close();
});

test('the compact main setup snippet also runs independently', () => {
  const demo = createDOM();
  demo.window.eval(demoSource);
  const snippet = demo.window.document.querySelector('#main-code').textContent;
  const copy = createDOM(snippet);
  const script = copy.window.document.querySelector('script:not([src])');
  assert.ok(script);
  assert.doesNotThrow(() => copy.window.eval(script.textContent));
  assert.equal(copy.window.document.querySelectorAll('.BDataTable-table tbody tr').length, 2);
  assert.equal(copy.window.document.querySelectorAll('.BDataTable-column-input').length, 6);
  copy.window.close(); demo.window.close();
});

test('each displayed example includes the real initialization code and runs independently', async () => {
  const demo = createDOM();
  demo.window.eval(demoSource);
  for (const name of ['html', 'object', 'list', 'json', 'api', 'advanced']) {
    const code = demo.window.document.querySelector('#code-' + name).textContent;
    assert.match(code, /new BDataTable/);
    assert.match(code, /<script src="BDataTable\.js"><\/script>/);
    const copy = createDOM(code);
    const scripts = copy.window.document.querySelectorAll('script:not([src])');
    assert.equal(scripts.length, 1, name);
    assert.doesNotThrow(() => copy.window.eval(scripts[0].textContent), name);
    await Promise.resolve(); await Promise.resolve();
    assert.ok(copy.window.document.querySelector('.BDataTable-table'), name + ' renders a table');
    copy.window.close();
  }
  demo.window.close();
});

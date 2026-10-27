# BDataTable

ماژول جدول داده با جاوااسکریپت خالص، بدون jQuery و بدون وابستگی اجرایی. تنها فایل موردنیاز برای استفاده **`BDataTable.js`** است؛ تمام CSS خود جدول از داخل همین فایل و تنها یک بار در صفحه ساخته می‌شود. کلاس‌های ماژول همگی با پیشوند اختصاصی `BDataTable-` شروع می‌شوند.

- تبدیل جدول HTML موجود یا ساخت جدول از داده‌های جاوااسکریپت، JSON و لیست
- صفحه‌بندی، تعداد ردیف قابل تنظیم و نمایش تدریجی هنگام اسکرول
- جست‌وجوی سراسری و جست‌وجوی مستقل هر ستون با امکان روشن و خاموش‌کردن در زمان اجرا
- مرتب‌سازی با کلیک روی سربرگ، نمایش یا پنهان‌کردن ستون‌ها و انتخاب ردیف‌ها
- خروجی HTML، متن، CSV و فایل واقعی Excel با پسوند `.xlsx`
- سه تم `light`، `dark` و `ocean`، پشتیبانی از فارسی و RTL
- رویدادهای انعطاف‌پذیر سلول و ردیف، متن‌های قابل ترجمه و کار با صفحه‌کلید

## راه‌اندازی سریع

فایل `BDataTable.js` را در پروژه قرار دهید. بعد از ساخته‌شدن عنصر جدول، اسکریپت را اجرا کنید:

```html
<table id="people">
  <thead>
    <tr><th data-key="name">نام</th><th data-key="city">شهر</th></tr>
  </thead>
  <tbody>
    <tr><td>سارا</td><td>تهران</td></tr>
    <tr><td>علی</td><td>اصفهان</td></tr>
  </tbody>
</table>

<script src="BDataTable.js"></script>
<script>
  const table = new BDataTable('#people', {
    language: 'fa',        // متن فارسی و جهت راست‌به‌چپ
    theme: 'light',        // light | dark | ocean
    pageSize: 10,
    columnSearch: true
  });
</script>
```

انتخابگر یا خود عنصر DOM پذیرفته می‌شود. در جدول HTML، مقادیر ردیف به شکل آرایه هستند؛ مثلاً `row[0]` نام است. `data-key` اختیاری است و شناسهٔ ستون را برای متدها تعیین می‌کند. نودهای اصلی ردیف و شنونده‌های رویداد آن‌ها در حالت عادی حفظ می‌شوند. جدول باید ساختار سادهٔ یک سلول برای هر ستون داشته باشد؛ `rowspan` و `colspan` پشتیبانی نمی‌شوند. `thead` آخرین ردیف سربرگ است؛ اگر `thead` نباشد و ردیف اول فقط `th` داشته باشد، آن ردیف سربرگ در نظر گرفته می‌شود. `caption` و `tfoot` در زمان فعال‌بودن ماژول نمایش داده نمی‌شوند، اما با `destroy()` بازگردانده می‌شوند.

### ساخت کامل جدول با تنظیمات جاوااسکریپت

```html
<div id="users"></div>
<script src="BDataTable.js"></script>
<script>
  const users = new BDataTable('#users', {
    language: 'fa',
    theme: 'ocean',
    pageSize: 5,
    pageSizes: [5, 10, 25, -1], // -1 یعنی همه
    columnSearch: true,
    selection: true,
    columns: [
      { key: 'id', title: 'شناسه' },
      { key: 'name', title: 'نام' },
      { key: 'address.city', title: 'شهر' },
      { key: 'score', title: 'امتیاز', visible: false }
    ],
    data: [
      { id: 1, name: 'سارا', address: { city: 'تهران' }, score: 94 },
      { id: 2, name: 'علی', address: { city: 'اصفهان' }, score: 87 }
    ]
  });
</script>
```

هدف می‌تواند یک `div` یا یک جدول موجود باشد. در صورت مشخص‌کردن `data` برای جدول HTML، دادهٔ آن جایگزین نمایش اولیه می‌شود و نسخهٔ اصلی هنگام `destroy()` برمی‌گردد. اگر `columns` را ندهید، ستون‌ها از اولین ردیف غیرخالی حدس زده می‌شوند. داده‌ها می‌توانند آرایه‌ای از شیء، آرایه‌ای از آرایه‌ها یا آرایه‌ای از مقادیر ساده باشند. برای آرایهٔ ساده از `{ key: null, title: 'مقدار' }` و برای آرایهٔ آرایه‌ها از `key: 0`، `key: 1` و ... استفاده کنید.

### فایل JSON، درخواست و لیست

```js
// examples/people.json یک نمونهٔ قابل اجرا در مخزن است: { "data": [...] }
const remote = new BDataTable('#users', {
  language: 'fa',
  data: 'examples/people.json',
  onError(error) { console.error(error); }
});
remote.ready.catch(error => console.error('خطا در دریافت:', error));

// JSON تودرتو و تنظیمات fetch؛ dataPath می‌تواند تابع هم باشد.
const other = new BDataTable('#other', {
  language: 'fa',
  ajax: {
    url: '/api/people',
    method: 'GET',
    headers: { Accept: 'application/json' },
    dataPath: 'result.items'
  }
});
await other.ready;
await other.reload();

// لیست HTML، NodeList، Set، Promise یا تابعی که داده/Promise برمی‌گرداند:
const fromList = new BDataTable('#list-table', {
  data: document.querySelectorAll('#my-list li')
});
const fromPromise = new BDataTable('#promise-table', {
  data: async (instance, signal) => {
    const response = await fetch('/api/people', { signal });
    if (!response.ok) throw new Error('Request failed');
    return (await response.json()).data;
  }
});
```

اگر پاسخ JSON یک شیء با کلید `data` و مقدار آرایه باشد، این آرایه به‌طور خودکار استفاده می‌شود؛ برای ساختارهای دیگر `dataPath` را تعیین کنید. اگر `dataPath` در شیء `ajax` باشد بر گزینهٔ سراسری اولویت دارد. آرایهٔ مستقیمی که به `setData()` داده می‌شود، نیازی به `dataPath` ندارد. یک `li` بدون `data-*` به متن تبدیل می‌شود؛ اگر `data-*` داشته باشد، به شیئی شامل `text` و مقادیر `dataset` تبدیل می‌شود.

دریافت JSON از محدودیت‌های معمول مرورگر مانند CORS پیروی می‌کند؛ هنگام آزمایش فایل محلی به‌جای `file://` از یک سرور HTTP استفاده کنید. در بارگذاری جدید، درخواست قبلی لغو می‌شود و پاسخ‌های قدیمی جدول را بازنویسی نمی‌کنند. برای تابع دریافت داده، در صورت امکان از `signal` استفاده کنید.

## جست‌وجو، مرتب‌سازی و اسکرول

```js
const table = new BDataTable('#users', {
  data: users,
  language: 'fa',
  searching: true,       // جست‌وجوی سراسری
  columnSearch: true,    // یک فیلتر مستقل زیر هر عنوان ستون
  mode: 'scroll',        // 'pages' یا 'scroll'
  pageSize: 20,          // در حالت scroll تعداد ردیف هر مرحله است
  scrollHeight: 400      // پیکسل؛ یا مثلاً '50vh'
});

table.search('تهران');             // خالی: حذف جست‌وجوی سراسری
table.searchColumn('name', 'سارا');
table.sort('name', 'asc');         // 'asc'، 'desc' یا null برای ترتیب اولیه
table.setPageSize(10);
table.setMode('pages');
table.goToPage(2);                 // شمارهٔ صفحه از ۱ شروع می‌شود
table.setColumnSearch(false);      // حذف ورودی‌ها و پاک‌کردن فیلترهای ستونی
table.setColumnSearch(true);       // نمایش دوبارهٔ فیلترها
```

فیلتر مستقل هر ستون، **ردیف‌های جدول را فیلتر می‌کند**. `setColumnSearch(false)` ورودی‌های زیر سربرگ و همهٔ فیلترهای ستونی فعال را حذف می‌کند تا هیچ فیلتر پنهانی باقی نماند؛ با `setColumnSearch(true)` ورودی‌های خالی دوباره نمایش داده می‌شوند. متد `searchColumn()` حتی زمانی که ورودی‌ها غیرفعال‌اند برای فیلتر برنامه‌نویسی در دسترس است. جست‌وجو حروف عربی/فارسی «ی» و «ک» و ارقام فارسی، عربی و لاتین را یکسان در نظر می‌گیرد. به‌صورت پیش‌فرض ستون پنهان نیز قابل جست‌وجو است؛ برای حذف آن از جست‌وجو `searchable: false` بگذارید.

در حالت `scroll` داده‌ها از قبل در مرورگر موجودند و با رسیدن اسکرول به انتهای جدول به‌تدریج نمایش داده می‌شوند؛ این قابلیت صفحه‌بندی سمت سرور نیست. دکمهٔ «نمایش بیشتر» نیز برای صفحه‌کلید و مواقعی که اسکرول ممکن نیست وجود دارد. `paging: false` تمام ردیف‌ها را یک‌جا نمایش می‌دهد.

## ستون‌ها و شخصی‌سازی نمایش

```js
table.setColumnVisible('score', true); // false برای پنهان‌کردن
// افزودن/حذف یا تعریف دوبارهٔ ستون‌های موجود در داده:
table.setColumns([
  { key: 'name', title: 'نام' },
  { key: 'score', title: 'امتیاز' }
]);
table.setTheme('dark');
```

منوی ستون‌ها نیز همین کار را انجام می‌دهد. برای حفظ ساختار جدول، حداقل یک ستون باید قابل نمایش بماند؛ تلاش برای پنهان‌کردن آخرین ستون `false` برمی‌گرداند. شناسهٔ ستون‌ها باید یکتا باشد. ارجاع به ستون در متدها با `id`، `key`، عنوان یا شمارهٔ صفرمبنای ستون ممکن است؛ برای `key` تابعی حتماً یک `id` یکتا بدهید.

| ویژگی ستون | کاربرد |
| --- | --- |
| `key` | کلید شیء، مسیر نقطه‌ای، شمارهٔ خانهٔ آرایه، `null` برای کل مقدار، یا تابع `(row, index) => value` |
| `id`, `title` | شناسهٔ یکتا و عنوان نمایشی؛ برای جدول HTML، `data-key` می‌تواند شناسه باشد |
| `visible`, `searchable`, `sortable` | تنظیم نمایش، جست‌وجو و مرتب‌سازی؛ پیش‌فرض هر سه `true` |
| `render(value, row, index)` | خروجی نمایشی: متن/عدد یا یک نود DOM |
| `searchValue(value, row, index)` | مقدار مورد استفاده در جست‌وجوی سراسری و فیلتر ستون |
| `sortValue(value, row, index)` | مقدار مورد استفاده در مرتب‌سازی |
| `compare(a, b, rowA, rowB)` | مقایسه‌گر سفارشی برای مقادیر غیرخالی؛ عدد منفی، صفر یا مثبت برگرداند |
| `exportValue(value, row, index)` | مقدار مورد استفاده در خروجی |

مقادیر معمول و رشتهٔ برگشتی `render` به‌صورت **متن** نمایش داده می‌شوند، نه HTML؛ این کار از تزریق HTML جلوگیری می‌کند. برای ساخت محتوای دلخواه، نود DOM برگردانید:

```js
{
  key: 'status', title: 'وضعیت',
  render(value) {
    const badge = document.createElement('strong');
    badge.textContent = value;
    return badge;
  }
}
```

جست‌وجو، مرتب‌سازی و خروجی به‌طور پیش‌فرض از مقدار خام استفاده می‌کنند، نه متن نود نمایشی. برای تغییر این رفتار از `searchValue`، `sortValue` یا `exportValue` استفاده کنید. در جدول HTML می‌توانید با `key` عددی یا `data-key` سربرگ به خانهٔ اصلی اشاره کنید و ترتیب ستون‌ها را تغییر دهید؛ تعریف یک `render` برای خانه تا زمان `destroy()` محتوای نمایشی آن را جایگزین می‌کند.

## دریافت اطلاعات با کلیک

برای نمایش اطلاعات دلخواه می‌توانید از مقدار سلول، کل ردیف، شمارهٔ ردیف، نام ستون و رویداد اصلی استفاده کنید:

```js
const table = new BDataTable('#users', {
  data: users,
  onCellClick({ value, row, column, rowIndex, event }) {
    alert(`ستون ${column.title}: ${value}`);
    // row کل شیء داده، و rowIndex شمارهٔ صفرمبنای ردیف در دادهٔ اصلی است.
    // return false;  // در صورت نیاز، اجرای onRowClick را متوقف می‌کند.
  },
  onRowClick({ row, cell, value }) {
    alert(`کاربر انتخاب‌شده: ${row.name}، شناسه: ${row.id}`);
  }
});

// یا بدون callback، با CustomEvent استاندارد:
document.querySelector('#users').addEventListener('bdatatable:cellclick', event => {
  console.log(event.detail.row, event.detail.value, event.detail.column.id);
});
```

هر دو callback، شیئی با `table`، `event`، `row`، `rowIndex`، `rowElement`، `cell`، `column`، `columnIndex` و `value` دریافت می‌کنند. `rowIndex` و `columnIndex` شماره‌های صفرمبنای منبع هستند، نه شمارهٔ صفحه یا ترتیب بعد از مرتب‌سازی. در کلیک روی سلول، ابتدا callback/رویداد سلول و سپس ردیف اجرا می‌شود؛ `return false` از `onCellClick` یا `preventDefault()` در رویداد `bdatatable:cellclick` اجرای رویداد ردیف را لغو می‌کند. کنترل‌های انتخاب ردیف، کلیک داده محسوب نمی‌شوند. در صورت تنظیم callback، ردیف/سلول با `Enter` یا `Space` هم فعال می‌شود.

رویدادهای DOM دیگر عبارت‌اند از `bdatatable:rowclick`، `bdatatable:selectionchange`، `bdatatable:draw`، `bdatatable:data`، `bdatatable:columnschange`، `bdatatable:columnsearchtoggle`، `bdatatable:export`، `bdatatable:error` و `bdatatable:destroy`. رویدادها از عنصر جدول به بالا منتشر می‌شوند. هنگام مقداردهی هم ممکن است `draw` و `data` همگام اجرا شوند؛ برای دریافت آن‌ها شنونده را پیش از ساخت نمونه وصل کنید یا از callback استفاده کنید.

## خروجی و انتخاب ردیف

```js
// به‌طور پیش‌فرض همهٔ ردیف‌های فیلترشده و ستون‌های قابل نمایش دانلود می‌شوند.
table.export('html');
table.export('txt',  { filename: 'people' });
table.export('csv',  { scope: 'page' });
table.export('xlsx', { scope: 'all', includeHidden: true });

// دریافت Blob بدون دانلود:
const excelBlob = table.export('xlsx', { download: false });
console.log(excelBlob.type);

const selected = table.getSelectedRows();
table.clearSelection();
```

`scope` می‌تواند `filtered` (پیش‌فرض، با ترتیب فعلی)، `page` (صفحه یا ردیف‌های بارگذاری‌شده در حالت اسکرول) یا `all` (تمام داده‌ها به ترتیب اصلی، بدون فیلتر) باشد. انتخاب همه فقط ردیف‌های نمایش‌داده‌شده را انتخاب می‌کند و انتخاب‌ها هنگام تغییر صفحه و فیلتر حفظ می‌شوند. `setData()` انتخاب‌های قبلی را پاک می‌کند.

خروجی اکسل یک فایل واقعی OOXML/ZIP است، نه CSV با پسوند جعلی؛ اعداد و مقادیر بولی به همان نوع ذخیره می‌شوند و رشته‌ها فرمول اکسل محسوب نمی‌شوند. خروجی متنی tab-separated و UTF-8 است و خروجی CSV نیز UTF-8 با BOM دارد. برای جلوگیری از اجرای فرمول، رشته‌های مشکوک در CSV و متن با `'` شروع می‌شوند؛ بنابراین متن خروجی در این موارد عمداً با دادهٔ خام متفاوت است. محدودیت استاندارد اکسل برای تعداد سلول و طول متن سلول رعایت می‌شود و در صورت عبور از آن خطا صادر می‌شود.

## گزینه‌های اصلی

| گزینه | پیش‌فرض | توضیح |
| --- | --- | --- |
| `data`, `ajax`, `dataPath` | جدول HTML یا `[]` | منبع داده، تنظیمات درخواست و مسیر آرایهٔ JSON |
| `columns` | خودکار | تعریف ستون‌ها؛ برای جدول HTML از شمارهٔ سلول یا `data-key` استفاده کنید |
| `theme` | `light` | `light`، `dark`، `ocean` |
| `language`, `strings`, `dir` | `en`، متن پیش‌فرض، خودکار | `language: 'fa'` برای فارسی؛ `strings` برای جایگزینی کلیدهای متن؛ `dir: 'rtl' \| 'ltr' \| 'auto'` |
| `pageSize`, `pageSizes` | `10`، `[10,25,50,100]` | تعداد ردیف و گزینه‌های انتخاب؛ `-1` یعنی همه |
| `mode`, `paging`, `scrollHeight` | `pages`، `true`، `360` | حالت صفحه‌ای یا `scroll`، فعال‌بودن صفحه‌بندی و ارتفاع اسکرول |
| `searching`, `columnSearch` | `true`، `false` | کنترل جست‌وجوی سراسری و ورودی مستقل هر ستون |
| `columnVisibility`, `exporting`, `selection` | `true`، `true`، `false` | منوی ستون‌ها، منوی خروجی و انتخاب ردیف |
| `showLength`, `showInfo` | `true`, `true` | نمایش انتخاب تعداد ردیف و اطلاعات پایین جدول |
| `label` | `null` | متن `aria-label` برای جدول |
| `styleNonce` | `null` | nonce تگ style برای سیاست CSP |
| `searchNormalizer` | داخلی | تابع تبدیل رشته برای سفارشی‌کردن تطبیق جست‌وجو |
| `onCellClick`, `onRowClick` | — | callback کلیک/فعال‌سازی سلول و ردیف |
| `onSelectionChange`, `onDraw`, `onError` | — | به‌ترتیب `({table, rows})`، `({table, state})` و `(error, table)` |
| `fetch` | `window.fetch` | تابع fetch جایگزین در صورت نیاز |

برای CSP باید درج `style` مجاز باشد یا nonce معتبر با `styleNonce` بدهید. برای دانلود مرورگر باید اجازهٔ استفاده از Blob URL را داشته باشد.

## API و چرخهٔ حیات

```js
await table.setData([{ name: 'دادهٔ جدید' }]); // آرایه، Promise، URL، لیست یا تابع
await table.reload();                          // بارگذاری دوبارهٔ آخرین منبع

table.search();                      // مقدار جست‌وجوی فعلی
table.searchColumn('name');          // مقدار فیلتر ستون
table.setColumnSearch(true);         // نمایش یا حذف ورودی‌های مستقل ستون‌ها
table.getData();                     // همهٔ ردیف‌ها به ترتیب اصلی
table.getData({ scope: 'filtered' }); // ردیف‌های فیلترشده و مرتب‌شده
table.getData({ scope: 'page' });     // ردیف‌های فعلی/بارگذاری‌شده
table.getRow(0);                     // دادهٔ اولین ردیف در منبع
table.getCell(0, 'name');            // مقدار خام خانه در منبع
table.getState();                    // جست‌وجو، صفحه، مرتب‌سازی، تعداد و ستون‌های نمایان
table.refresh();                     // رسم مجدد و بازسازی کش پس از تغییر اشیای داده
table.loadMore();                    // نمایش مرحلهٔ بعد در حالت scroll
table.destroy();                     // حذف رابط و بازگرداندن جدول HTML اولیه
```

`setData()` و `reload()` یک Promise برمی‌گردانند و همان Promise در `table.ready` نیز قرار می‌گیرد. `reload()` روی منبع HTML، متن سلول‌های اصلی را دوباره می‌خواند؛ روی منبع URL یا تابع، آن را دوباره دریافت می‌کند. ستون‌های حدس‌زده‌شده با دریافت دادهٔ غیرخالی جدید مجدداً حدس زده می‌شوند؛ با `setColumns()` تعریف صریح می‌شود. نمونهٔ تخریب‌شده را استفاده نکنید و برای راه‌اندازی دوباره نمونهٔ جدید بسازید.

## داده‌های حجیم و کارایی

جدول در حالت صفحه‌بندی تنها ردیف‌های صفحهٔ فعلی را در DOM می‌سازد؛ در حالت اسکرول نیز ردیف‌ها مرحله‌به‌مرحله اضافه می‌شوند. برای داده‌های حجیم مانند ۵٬۰۰۰ ردیف، یکی از این دو حالت و یک `pageSize` معقول را انتخاب کنید. گزینهٔ «همه» (`-1`) یا `paging: false` عمداً **تمام ردیف‌ها را یک‌جا** می‌سازد و برای داده‌های بسیار زیاد سبک‌ترین حالت نیست. این کتابخانه سمت کلاینت است و تمام داده‌های دریافتی در حافظهٔ مرورگر قرار می‌گیرند؛ صفحه‌بندی سمت سرور نیست.

مقادیر جست‌وجوی نرمال‌شده در اولین استفاده به‌صورت تدریجی کش می‌شوند و ترتیب مرتب‌شده در جست‌وجوها و جابه‌جایی صفحه دوباره استفاده می‌شود. `sortValue` در هر بار مرتب‌سازی یک‌بار برای هر ردیف اجرا می‌شود، نه برای هر مقایسه. بعد از تغییر مستقیم یک شیء داده یا وابستگی توابع `searchValue`، `sortValue` و `searchNormalizer`، برای بازسازی کش و نمایش از `table.refresh()` استفاده کنید. `setData()` و `reload()` این کار را خودکار انجام می‌دهند.

در صفحهٔ نمونه می‌توانید با دکمهٔ **۵٬۰۰۰ ردیف** دادهٔ آزمایشی بسازید و جست‌وجو، مرتب‌سازی و اسکرول را امتحان کنید. عدد زمان نمایش‌داده‌شده صرفاً زمان آماده‌سازی همان دستگاه است، نه تضمین کارایی برای همهٔ دستگاه‌ها و داده‌ها. همچنین پس از `npm install`، دستور `npm run benchmark -- 5000` یک اندازه‌گیری قابل تکرار با Node و jsdom اجرا می‌کند؛ زمان واقعی مرورگر متفاوت خواهد بود.

> جست‌وجوی مستقل هر ردیف و `setRowSearch()` از نسخهٔ قبلی حذف شده‌اند. به‌جای آن از `columnSearch` و `setColumnSearch()` برای جست‌وجوی مستقل ستون‌ها استفاده کنید.

## اجرا و آزمایش پروژه

برای دیدن نمونهٔ تعاملی، در ریشهٔ پروژه اجرا کنید:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

برای آزمون‌ها به Node.js نسخهٔ ۱۸ یا بالاتر نیاز است:

```bash
npm install
npm test
```

`jsdom` فقط وابستگی توسعه برای آزمون‌هاست؛ فایل نهایی هیچ وابستگی اجرایی ندارد. نمونهٔ `index.html` و `demo.js` صرفاً برای نمایش امکانات هستند و برای استفاده از ماژول لازم نیستند؛ صفحهٔ نمونه، کد واقعی هر مثال و روش راه‌اندازی آن را نیز نمایش می‌دهد. مرورگرهای جدید با پشتیبانی از `Promise`، `fetch`، `Intl`، `TextEncoder` و DOM APIهای مدرن پشتیبانی می‌شوند.

## مجوز

[GNU GPL v3](LICENSE)

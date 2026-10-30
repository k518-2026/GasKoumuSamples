// 第6章：Webアプリの土台（第2章のコードが必要です）
// アドレスの最後に「?page=ページ名」をつけると、「ページ_ページ名」という名前の部品が動きます。
//   例：?page=hello → ページ_hello　　?page=yoyaku → ページ_yoyaku（第7章）
// ページ名は、半角の小文字の英字だけにします。

// 文字の中の、HTMLで特別な意味をもつ記号を、無害な形に変えます。画面に出す文字は、必ずこれを通します。
function エスケープ_(文字) {
  return String(文字)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ページの外側（題名・文字の大きさなど）をつけます。本文のHTMLは、呼ぶ側が安全にしておきます。
function ページの枠_(題名, 本文) {
  return (
    '<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>' + エスケープ_(題名) + '</title>' +
    '<style>body{font-family:sans-serif;margin:1.2em;line-height:1.7;color:#16233c}' +
    'h1{font-size:1.4em;border-bottom:3px solid #22578f;padding-bottom:.3em}' +
    'h2{font-size:1.15em;margin-top:1.6em}table{border-collapse:collapse}' +
    'td,th{border:1px solid #c6d0de;padding:.4em .8em}.hen{color:#c21a4c;font-weight:bold}</style>' +
    '</head><body><h1>' + エスケープ_(題名) + '</h1>' + 本文 + '</body></html>'
  );
}

// Webアプリに、アドレスでアクセスされたときに、最初に動く部品です。
function doGet(e) {
  const 名前 = e && e.parameter && e.parameter.page ? String(e.parameter.page) : 'hello';
  const 関数 = /^[a-z]+$/.test(名前) ? globalThis['ページ_' + 名前] : null;
  if (typeof 関数 !== 'function') {
    return HtmlService.createHtmlOutput(ページの枠_('ページが見つかりません', '<p>アドレスを確かめてください。</p>')).setTitle('見つかりません');
  }
  return 関数(e);
}

function ページ_hello() {
  const 本文 = '<p>Webアプリが動いています。今日は ' + エスケープ_(日付の表示にする_(今日の文字_())) + ' です。</p>';
  return HtmlService.createHtmlOutput(ページの枠_('こんにちは', 本文)).setTitle('こんにちは');
}

// 第8章：「今日の予定」ページと「案内」ページ（第2章・第5章・第6章のコードが必要です）
// アドレスの最後に、「?page=today」（今日の予定）や「?page=info」（案内）をつけて開きます。
// 「連絡」シート：見出しは「日付」「内容」「表示」。表示に「○」がついた、その日の行だけが出ます。
// 「案内」シート：見出しは「見出し」「内容」「リンク」。リンクは「https://」で始まるものだけが出ます。
// このページには、児童生徒の氏名など、個人情報を出しません（名簿を読みません）。

function 安全なリンクか_(文字) {
  return /^https:\/\/[^\s"'<>]+$/.test(String(文字));
}

function 連絡を選ぶ_(連絡の行, 今日) {
  return 連絡の行
    .filter(function (r) { return 日付の文字にする_(r['日付']) === 今日 && r['表示'] === '○'; })
    .map(function (r) { return String(r['内容']); });
}

// 「今日の予定」ページの本文（HTML）を作ります。画面に出す文字は、すべてエスケープします。
function 今日のページを作る_(予定, 連絡) {
  let 本文 = '<h2>今日の行事</h2>';
  本文 += 予定.行事.length
    ? '<ul>' + 予定.行事.map(function (x) { return '<li>' + エスケープ_(x) + '</li>'; }).join('') + '</ul>'
    : '<p>なし</p>';
  本文 += '<h2>時間割</h2><table>';
  予定.時間割.forEach(function (x) {
    本文 += '<tr><th>' + x.校時 + '校時</th><td' + (x.変更 ? ' class="hen"' : '') + '>' + エスケープ_(x.内容) + (x.変更 ? '　★変更' : '') + '</td></tr>';
  });
  本文 += '</table><h2>連絡</h2>';
  本文 += 連絡.length
    ? '<ul>' + 連絡.map(function (x) { return '<li>' + エスケープ_(x) + '</li>'; }).join('') + '</ul>'
    : '<p>なし</p>';
  return 本文;
}

function ページ_today() {
  const 予定 = 今日の予定を読む_();
  const 連絡 = 連絡を選ぶ_(シートの行を読む_('連絡'), 今日の文字_());
  return HtmlService.createHtmlOutput(ページの枠_(予定.表示 + ' の予定', 今日のページを作る_(予定, 連絡))).setTitle('今日の予定');
}

// 「案内」ページの本文（HTML）を作ります。
function 案内のページを作る_(行一覧) {
  return 行一覧
    .map(function (r) {
      let 文 = '<h2>' + エスケープ_(r['見出し']) + '</h2><p>' + エスケープ_(r['内容']).replace(/\n/g, '<br>') + '</p>';
      if (r['リンク'] !== '' && 安全なリンクか_(r['リンク'])) {
        文 += '<p><a href="' + エスケープ_(r['リンク']) + '" target="_blank" rel="noopener">' + エスケープ_(r['リンク']) + '</a></p>';
      }
      return 文;
    })
    .join('');
}

function ページ_info() {
  const 行 = シートの行を読む_('案内');
  return HtmlService.createHtmlOutput(ページの枠_('お知らせ・ご案内', 案内のページを作る_(行))).setTitle('案内');
}

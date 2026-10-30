// 第4章：提出物・締切の通知（第2章のコードが必要です）
// 「提出物」シート：見出しは「項目」「締切」「対象」。
// 「設定」シートの「通知する日数」に、締切の何日前に知らせるかを「、」でつないで入れます（空欄なら「0、1、3」）。
// 通知は、自分あてのメールにだけ送ります。

// 締切が、きょうから数えて指定した日数ぶん先にあるものを選びます。
function 締切が近いものを選ぶ_(行一覧, 今日, 日数一覧) {
  const 結果 = [];
  行一覧.forEach(function (r) {
    const 締切 = 日付の文字にする_(r['締切']);
    const 残り = 日数の差_(今日, 締切);
    if (!isNaN(残り) && 日数一覧.indexOf(残り) >= 0) {
      結果.push({ 項目: String(r['項目']), 対象: String(r['対象']), 締切: 締切, 残り: 残り });
    }
  });
  return 結果.sort(function (a, b) { return a.残り - b.残り; });
}

function 通知の文を作る_(近いもの) {
  return 近いもの
    .map(function (x) {
      const 見出し = x.残り === 0 ? '【きょう締切】' : '【あと' + x.残り + '日】';
      return 見出し + x.項目 + (x.対象 ? '（' + x.対象 + '）' : '') + ' … ' + x.締切;
    })
    .join('\n');
}

// きょうの通知を、すでに出したかを調べます（同じ日に何度も送らないため）。
function 今日すでに通知した_(種類, 今日) {
  const シート = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('通知記録');
  if (!シート) return false;
  return 表を読む_(シート).some(function (r) {
    return r['種類'] === 種類 && 日付の文字にする_(r['日付']) === 今日;
  });
}

function 通知を記録する_(種類, 今日) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let シート = ss.getSheetByName('通知記録');
  if (!シート) {
    シート = ss.insertSheet('通知記録');
    シート.appendRow(['日付', '種類']);
  }
  シート.appendRow([今日, 種類]);
}

function 締切の通知の仕事() {
  仕事を実行する_('締切の通知', function () {
    const 今日 = 今日の文字_();
    if (今日すでに通知した_('締切', 今日)) return 'きょうは通知ずみです';
    const シート = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('提出物');
    if (!シート) throw new Error('「提出物」という名前のシートが見つかりません。');
    const 日数一覧 = String(設定を読む_('通知する日数', '0、1、3'))
      .split('、')
      .map(function (s) { return Number(s.trim()); })
      .filter(function (n) { return !isNaN(n); });
    const 近いもの = 締切が近いものを選ぶ_(表を読む_(シート), 今日, 日数一覧);
    if (近いもの.length === 0) return '通知するものはありません';
    自分に知らせる_('【締切のお知らせ】' + 日付の表示にする_(今日), 通知の文を作る_(近いもの));
    通知を記録する_('締切', 今日);
    return 近いもの.length + '件を知らせました';
  });
}

function 締切の自動実行を作る() {
  自動実行を作る_('締切の通知の仕事', '毎日', Number(設定を読む_('朝の時刻', 7)));
}

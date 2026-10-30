// 第9章：日々の記録の「週のまとめ」（特別支援学校・特別支援学級など）（第2章のコードが必要です）
// 「記録」シート：見出しは「日付」「番号」「項目」「結果」。
//   項目は「登校」「給食」「活動」など、先生が決めたもの。結果は、「できた」「手伝いあり」「未実施」のように、先生が決めた言葉。
// 「設定」シートの「記録の結果」に、結果の言葉を「、」でつないで入れます（空欄なら「できた、手伝いあり、未実施」）。
// この記録は、個人情報です。このスプレッドシートは、見てよい人だけに共有してください。

// 指定した期間（開始〜終了、どちらも含む）の記録を、人ごと・項目ごと・結果ごとに数えます。
function 記録を集計する_(行一覧, 開始, 終了, 結果の種類) {
  const 集計 = {};
  行一覧.forEach(function (r) {
    const 日 = 日付の文字にする_(r['日付']);
    if (日 < 開始 || 日 > 終了) return;
    const 結果 = String(r['結果']);
    if (結果の種類.indexOf(結果) < 0) return;
    const キー = r['番号'] + '|' + r['項目'];
    if (!集計[キー]) {
      集計[キー] = { 番号: r['番号'], 項目: String(r['項目']), 数: {} };
      結果の種類.forEach(function (k) { 集計[キー].数[k] = 0; });
    }
    集計[キー].数[結果]++;
  });
  return Object.keys(集計).map(function (k) { return 集計[k]; });
}

// 「週のまとめ」シートに、きょうまでの7日間の記録のまとめを書きます。
function 週のまとめを作る() {
  const 結果の種類 = String(設定を読む_('記録の結果', 'できた、手伝いあり、未実施'))
    .split('、')
    .map(function (s) { return s.trim(); })
    .filter(function (s) { return s !== ''; });
  const 今日 = 今日の文字_();
  const 開始 = 日付に足す_(今日, -6);
  const シート = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('記録');
  if (!シート) throw new Error('「記録」という名前のシートが見つかりません。');
  const 人 = 名簿を読む_();
  const まとめ = 記録を集計する_(表を読む_(シート), 開始, 今日, 結果の種類);
  まとめ.sort(function (a, b) { return Number(a.番号) - Number(b.番号) || (a.項目 < b.項目 ? -1 : 1); });
  const 表 = [[開始 + ' 〜 ' + 今日 + ' のまとめ'].concat(結果の種類.map(function () { return ''; })).concat(['', ''])];
  表.push(['番号', '氏名', '項目'].concat(結果の種類));
  まとめ.forEach(function (x) {
    const p = 人.filter(function (q) { return Number(q['番号']) === Number(x.番号); })[0];
    表.push([x.番号, p ? p['氏名'] : '（名簿にない番号）', x.項目].concat(結果の種類.map(function (k) { return x.数[k]; })));
  });
  const 幅 = 3 + 結果の種類.length;
  const そろえた = 表.map(function (r) { return r.concat(Array(Math.max(0, 幅 - r.length)).fill('')).slice(0, 幅); });
  出力シートを用意する_('週のまとめ').getRange(1, 1, そろえた.length, 幅).setValues(そろえた);
}

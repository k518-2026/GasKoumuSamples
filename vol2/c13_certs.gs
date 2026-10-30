// 第13章：賞状・名札の一括作成（第2章と第11章のコードが必要です）
// 「賞状」シート：見出しは「番号」「賞名」。
// 「設定」シート：「賞状テンプレートID」「出力フォルダID」。
// 賞状のひな形には、「{{氏名}}」「{{賞名}}」「{{日付}}」を書いておきます。

function 賞状を作る() {
  const ui = SpreadsheetApp.getUi();
  const シート = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('賞状');
  if (!シート) throw new Error('「賞状」という名前のシートが見つかりません。');
  const 人 = 名簿を読む_();
  const 日付 = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy年M月d日');
  const 行一覧 = [];
  表を読む_(シート).forEach(function (r) {
    const n = 番号にそろえる_(r['番号']);
    const p = 人.filter(function (x) { return Number(x['番号']) === n; })[0];
    if (!p) return;
    行一覧.push({ 番号: p['番号'], 氏名: p['氏名'], 賞名: String(r['賞名']), 日付: 日付 });
  });
  const 答え = ui.alert('確認', 行一覧.length + '枚の賞状（Googleドキュメント）を作ります。氏名と賞名を、もう一度見直しましたか？', ui.ButtonSet.YES_NO);
  if (答え !== ui.Button.YES) return;
  const 結果 = 差し込み文書を作る_(
    String(設定を読む_('賞状テンプレートID', '')),
    String(設定を読む_('出力フォルダID', '')),
    行一覧,
    function (行) { return '賞状_' + 行['番号'] + '_' + 行['氏名'] + '_' + 行['賞名']; }
  );
  ui.alert('終わりました。\n作った：' + 結果.作った + '件\nすでにあり、飛ばした：' + 結果.飛ばした + '件');
}

// 名簿から、名札のマス目（列数ずつ区切った表）を作ります。足りない分は空欄にします。
function 名札の表を作る_(人, 列数) {
  const 表 = [];
  for (let i = 0; i < 人.length; i += 列数) {
    const 行 = [];
    for (let j = 0; j < 列数; j++) {
      const p = 人[i + j];
      行.push(p ? p['番号'] + '\n' + p['氏名'] : '');
    }
    表.push(行);
  }
  return 表;
}

// 「名札」シートに、名札のマス目をつくります（印刷して切り分けて使います）。
function 名札シートを作る() {
  const 列数 = Number(設定を読む_('名札の列数', 3));
  const 表 = 名札の表を作る_(名簿を読む_(), 列数);
  const 出力 = 出力シートを用意する_('名札');
  const 範囲 = 出力.getRange(1, 1, 表.length, 列数);
  範囲.setValues(表);
  範囲
    .setFontSize(20)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true)
    .setBorder(true, true, true, true, true, true);
  出力.setColumnWidths(1, 列数, 220);
  出力.setRowHeights(1, 表.length, 90);
}

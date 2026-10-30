// 第12章：通知表・要録の「様式づくり」（第2章と第11章のコードが必要です）
// 所見の文章は、先生が自分で「所見」シートに入れます。AIには書かせません。
// 「所見」シート：見出しは「番号」「所見」。
// 「設定」シート：「様式テンプレートID」「出力フォルダID」「所見の上限字数」（空欄なら200）。
// 様式の中には、「{{氏名}}」「{{番号}}」「{{所見}}」を書いておきます。

// 名簿と所見を番号でつなぎ、所見が空の人と、上限字数をこえた人を分けて返します。
function 所見をつなぐ_(人, 所見の行, 上限) {
  const 文章 = {};
  所見の行.forEach(function (r) {
    const n = 番号にそろえる_(r['番号']);
    if (!isNaN(n)) 文章[n] = String(r['所見']);
  });
  const 使える = [];
  const 空 = [];
  const 長すぎる = [];
  人.forEach(function (p) {
    const 所見 = 文章[Number(p['番号'])];
    if (所見 === undefined || 所見.trim() === '') {
      空.push(p['番号']);
      return;
    }
    if (所見.length > 上限) 長すぎる.push(p['番号']);
    const 行 = {};
    Object.keys(p).forEach(function (k) { 行[k] = p[k]; });
    行['所見'] = 所見;
    使える.push(行);
  });
  return { 使える: 使える, 空: 空, 長すぎる: 長すぎる };
}

function 様式を作る() {
  const ui = SpreadsheetApp.getUi();
  const シート = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('所見');
  if (!シート) throw new Error('「所見」という名前のシートが見つかりません。');
  const 上限 = Number(設定を読む_('所見の上限字数', 200));
  const つないだ = 所見をつなぐ_(名簿を読む_(), 表を読む_(シート), 上限);
  if (つないだ.長すぎる.length > 0) {
    ui.alert('所見が ' + 上限 + '字をこえている人がいます（番号：' + つないだ.長すぎる.join('、') + '）。\n直してから、もう一度実行してください。');
    return;
  }
  const 答え = ui.alert(
    '確認',
    つないだ.使える.length + '人分の様式を作ります。所見が空の人（' + つないだ.空.length + '人）は飛ばします。\nよろしいですか？',
    ui.ButtonSet.YES_NO
  );
  if (答え !== ui.Button.YES) return;
  const 結果 = 差し込み文書を作る_(
    String(設定を読む_('様式テンプレートID', '')),
    String(設定を読む_('出力フォルダID', '')),
    つないだ.使える,
    function (行) { return '所見_' + 行['番号'] + '_' + 行['氏名']; }
  );
  ui.alert('終わりました。\n作った：' + 結果.作った + '件\nすでにあり、飛ばした：' + 結果.飛ばした + '件');
}

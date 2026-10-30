// 第11章：月ごとの担当を、月の初めに知らせる（部活動・学年・校務分掌）（第2章のコードが必要です）
// 「担当表」シート：見出しは「月」「担当」「名前」。月は「10月」や「10」のように書きます。
// 知らせは、自分あてのメールにだけ送ります。

// 「10月」「10」「１０月」などを、数字の10にします。
function 月の数にする_(値) {
  const 文字 = String(値).replace(/[０-９]/g, function (c) {
    return String.fromCharCode(c.charCodeAt(0) - 0xfee0);
  }).replace(/[^0-9]/g, '');
  return 文字 === '' ? NaN : Number(文字);
}

function 今月の担当を選ぶ_(行一覧, 月) {
  return 行一覧
    .filter(function (r) { return 月の数にする_(r['月']) === 月; })
    .map(function (r) { return { 担当: String(r['担当']), 名前: String(r['名前']) }; });
}

function 月初の担当通知の仕事() {
  仕事を実行する_('月初の担当通知', function () {
    const 月 = Number(今日の文字_().split('/')[1]);
    const シート = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('担当表');
    if (!シート) throw new Error('「担当表」という名前のシートが見つかりません。');
    const 担当 = 今月の担当を選ぶ_(表を読む_(シート), 月);
    if (担当.length === 0) return '今月の担当は、表にありません';
    const 文 = 担当.map(function (x) { return '・' + x.担当 + '：' + x.名前; }).join('\n');
    自分に知らせる_('【' + 月 + '月の担当】', 月 + '月の担当は、次のとおりです。\n\n' + 文);
    return 担当.length + '件を知らせました';
  });
}

function 月初の担当通知の自動実行を作る() {
  自動実行を作る_('月初の担当通知の仕事', '毎月1日', Number(設定を読む_('朝の時刻', 7)));
}

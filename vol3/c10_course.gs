// 第10章：科目選択の希望の集計（高等学校など）（第2章のコードが必要です）
// 「科目」シート：見出しは「科目」「定員」。
// フォームの質問：番号、第1希望、第2希望（科目の名前は、「科目」シートと同じにします）。

// 同じ人が何回か出したときは、最後の回答を使って、科目ごとに希望の人数を数えます。
function 希望を集計する_(回答, 科目一覧) {
  const 最新 = {};
  回答.forEach(function (r) {
    const n = 番号にそろえる_(r['番号']);
    if (!isNaN(n)) 最新[n] = r;
  });
  const 結果 = 科目一覧.map(function (k) {
    return { 科目: String(k['科目']), 定員: Number(k['定員']), 第1希望: 0, 第2希望: 0 };
  });
  Object.keys(最新).forEach(function (n) {
    結果.forEach(function (x) {
      if (最新[n]['第1希望'] === x.科目) x.第1希望++;
      if (最新[n]['第2希望'] === x.科目) x.第2希望++;
    });
  });
  結果.forEach(function (x) {
    x.判定 = x.第1希望 > x.定員 ? '定員を超えています（' + (x.第1希望 - x.定員) + '人）' : x.第1希望 === x.定員 ? '定員ちょうど' : 'あと' + (x.定員 - x.第1希望) + '人';
  });
  return { 一覧: 結果, 回答した人数: Object.keys(最新).length };
}

function 科目の希望を集計する() {
  const シート = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('科目');
  if (!シート) throw new Error('「科目」という名前のシートが見つかりません。');
  const 集計 = 希望を集計する_(表を読む_(回答シートを取る_()), 表を読む_(シート));
  const 表 = [['回答した人：' + 集計.回答した人数 + '人', '', '', '', ''], ['科目', '定員', '第1希望', '第2希望', '判定']];
  集計.一覧.forEach(function (x) {
    表.push([x.科目, x.定員, x.第1希望, x.第2希望, x.判定]);
  });
  出力シートを用意する_('科目の希望').getRange(1, 1, 表.length, 5).setValues(表);
}

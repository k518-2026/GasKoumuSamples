// 第14章：座席表・班表を見やすく整える（第6章・第10章のコードが必要です）

// 「座席表」シートの見た目を整えます（文字の大きさ・罫線・マス目の大きさ）。
function 座席表を整える() {
  const シート = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('座席表');
  if (!シート) throw new Error('「座席表」シートがありません。先に席替えを実行してください。');
  整える_(シート);
}

function 班表を整える() {
  const シート = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('班');
  if (!シート) throw new Error('「班」シートがありません。先に班分けを実行してください。');
  整える_(シート);
}

function 整える_(シート) {
  const 範囲 = シート.getDataRange();
  範囲
    .setFontSize(14)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true)
    .setBorder(true, true, true, true, true, true);
  シート.setColumnWidths(1, 範囲.getNumColumns(), 130);
  シート.setRowHeights(1, 範囲.getNumRows(), 56);
}

// 先生側から見た向きと、子どもの側から見た向きを切り替えます。
// （座席表を上下左右に反転し、「【黒板・前】」の行を逆の端へ移します）
function 座席表の向きを切り替える() {
  const シート = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('座席表');
  if (!シート) throw new Error('「座席表」シートがありません。');
  const 範囲 = シート.getDataRange();
  const 値 = 範囲.getValues();
  const 黒板が上 = String(値[0][0]).indexOf('【黒板') === 0;
  const ラベル = 黒板が上 ? 値[0] : 値[値.length - 1];
  const 席 = 黒板が上 ? 値.slice(1) : 値.slice(0, 値.length - 1);
  const 反転 = 席
    .slice()
    .reverse()
    .map(function (行) {
      return 行.slice().reverse();
    });
  const 新しい = 黒板が上 ? 反転.concat([ラベル]) : [ラベル].concat(反転);
  範囲.setValues(新しい);
}

// 第6章：共通部品（以降の章のコードから使われます。消さないでください）

// 「名簿」シートを読み込んで、1人1行の一覧にして返します。
function 名簿を読む_() {
  const シート = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('名簿');
  if (!シート) {
    throw new Error('「名簿」という名前のシートが見つかりません。シートの名前を確かめてください。');
  }
  const 値 = シート.getDataRange().getValues();
  const 見出し = 値[0];
  const 人 = [];
  for (let i = 1; i < 値.length; i++) {
    if (値[i][0] === '' && 値[i][1] === '') continue; // 空の行は飛ばす
    const 行 = {};
    見出し.forEach(function (名前, j) {
      行[名前] = 値[i][j];
    });
    人.push(行);
  }
  return 人;
}

// 「設定」シートから、項目名に合う値を取り出します。なければ既定値を返します。
function 設定を読む_(項目名, 既定値) {
  const シート = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('設定');
  if (!シート) return 既定値;
  const 値 = シート.getDataRange().getValues();
  for (let i = 0; i < 値.length; i++) {
    if (値[i][0] === 項目名 && 値[i][1] !== '') return 値[i][1];
  }
  return 既定値;
}

// 結果を書き出すシートを用意します。あれば中身を消し、なければ作ります。
function 出力シートを用意する_(名前) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let シート = ss.getSheetByName(名前);
  if (シート) {
    シート.clear();
  } else {
    シート = ss.insertSheet(名前);
  }
  return シート;
}

// 動作確認用：名簿が読めているかをログに出します。
function 名簿を確認する() {
  const 人 = 名簿を読む_();
  Logger.log(人.length + '人の名簿を読み込みました');
  Logger.log(JSON.stringify(人[0]));
}

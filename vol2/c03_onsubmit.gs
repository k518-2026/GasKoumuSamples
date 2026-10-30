// 第3章：回答が届いたら自動で処理する（第2章の共通部品が必要です）

// 回答の「番号」を名簿とつき合わせて、結果の文字を返します。
function 照合結果を作る_(名簿, 番号の値) {
  const 番号 = 番号にそろえる_(番号の値);
  if (isNaN(番号)) return '番号が読み取れません';
  const 人 = 名簿.filter(function (p) {
    return Number(p['番号']) === 番号;
  })[0];
  return 人 ? '○ ' + 人['氏名'] : '名簿に番号がありません';
}

// フォームが送信されるたびに、自動で動きます（引数 e に、届いた回答の情報が入ります）。
function 回答を受け付けた(e) {
  const シート = e.range.getSheet();
  const 行 = e.range.getRow();
  const 見出し = シート.getRange(1, 1, 1, シート.getLastColumn()).getValues()[0];
  let 列 = 見出し.indexOf('照合結果') + 1;
  if (列 === 0) {
    列 = 見出し.length + 1;
    シート.getRange(1, 列).setValue('照合結果');
  }
  const 番号の値 = e.namedValues && e.namedValues['番号'] ? e.namedValues['番号'][0] : '';
  シート.getRange(行, 列).setValue(照合結果を作る_(名簿を読む_(), 番号の値));
}

// 最初に1回だけ実行します。フォームが送信されたら「回答を受け付けた」を動かす設定を作ります。
function 回答受付のトリガーを作る() {
  const すでに = ScriptApp.getProjectTriggers().some(function (t) {
    return t.getHandlerFunction() === '回答を受け付けた';
  });
  if (すでに) {
    Logger.log('すでに作ってあります');
    return;
  }
  ScriptApp.newTrigger('回答を受け付けた').forSpreadsheet(SpreadsheetApp.getActive()).onFormSubmit().create();
  Logger.log('自動で動く設定を作りました');
}

// 動作確認用：いちばん下の回答を使って、フォームが送信されたときと同じ処理を試します。
function 受付をためす() {
  const シート = 回答シートを取る_();
  const 列数 = シート.getLastColumn();
  const 行 = シート.getLastRow();
  const 見出し = シート.getRange(1, 1, 1, 列数).getValues()[0];
  const 値 = シート.getRange(行, 1, 1, 列数).getValues()[0];
  const 名前つき = {};
  見出し.forEach(function (h, j) {
    名前つき[h] = [String(値[j])];
  });
  回答を受け付けた({ range: シート.getRange(行, 1, 1, 列数), namedValues: 名前つき });
}

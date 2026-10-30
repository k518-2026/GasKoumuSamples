// 第8章：自作メニュー（第6・7章のコードが必要です）

// スプレッドシートを開いたときに、自動で「校務ツール」メニューを作ります。
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('校務ツール')
    .addItem('名簿を五十音順に並べる', 'メニュー五十音順')
    .addItem('名簿を番号順に並べる', 'メニュー番号順')
    .addSeparator()
    .addItem('人数を集計する', 'メニュー集計')
    .addToUi();
}

// 「本当に実行しますか？」と確かめてから、処理を実行します。
function 確認してから実行する_(質問, 処理) {
  const ui = SpreadsheetApp.getUi();
  const 答え = ui.alert('確認', 質問, ui.ButtonSet.YES_NO);
  if (答え === ui.Button.YES) {
    処理();
    SpreadsheetApp.getActiveSpreadsheet().toast('完了しました', '校務ツール', 3);
  }
}

function メニュー五十音順() {
  確認してから実行する_('名簿を五十音順に並べ替えます。よろしいですか？', 名簿を五十音順に並べる);
}

function メニュー番号順() {
  確認してから実行する_('名簿を番号順に並べ替えます。よろしいですか？', 名簿を番号順に並べる);
}

function メニュー集計() {
  確認してから実行する_('人数を集計して「集計」シートに書き出します。よろしいですか？', 人数を集計する);
}

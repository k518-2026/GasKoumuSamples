// 第4章：はじめてのスクリプト
// スプレッドシートの A1 に挨拶を、A2 に今の日時を書き込みます。
function はじめてのスクリプト() {
  const シート = SpreadsheetApp.getActiveSheet();
  シート.getRange('A1').setValue('こんにちは、先生！');
  シート.getRange('A2').setValue(new Date());
  Logger.log('できました');
}

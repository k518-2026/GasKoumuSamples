// 第15章：引き継ぎメモを作る（第2章のコードが必要です）
// スプレッドシートの中身（シート・設定の項目名・自動実行）を、「引き継ぎメモ」シートに書き出します。
// 設定の「値」（IDなど）は書き出しません。項目名だけです。

// メモの表（2次元の配列）を作ります。
function 引き継ぎの表を作る_(今日, スプレッドシート名, シート一覧, 設定の項目名, 自動実行) {
  const 表 = [];
  表.push(['引き継ぎメモ', 日付の表示にする_(今日) + ' 作成', '']);
  表.push(['スプレッドシート', スプレッドシート名, '']);
  表.push(['', '', '']);
  表.push(['■ シート', '行数', '']);
  シート一覧.forEach(function (s) { 表.push([s.名前, s.行数, '']); });
  表.push(['', '', '']);
  表.push(['■ 設定シートの項目', '', '']);
  設定の項目名.forEach(function (n) { 表.push([n, '', '']); });
  表.push(['', '', '']);
  表.push(['■ 自動で動く仕事', 'きっかけ', '']);
  if (自動実行.length === 0) 表.push(['（なし）', '', '']);
  自動実行.forEach(function (t) { 表.push([t.仕事, t.きっかけ, '']); });
  表.push(['', '', '']);
  表.push(['■ 引き継ぎで確かめること', '', '']);
  表.push(['自動で動く仕事は、作った人のアカウントで動きます。担当が変わるときは、新しい担当の人が作り直します。', '', '']);
  表.push(['古い仕事を止めてから、新しい仕事を作ります（二重に動かさないため）。', '', '']);
  表.push(['共有の範囲と、編集できる人を、見直します。', '', '']);
  表.push(['Webアプリを公開しているときは、公開の範囲を、見直します。', '', '']);
  return 表;
}

function 引き継ぎメモを作る() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const シート一覧 = ss.getSheets().map(function (s) {
    return { 名前: s.getName(), 行数: s.getLastRow() };
  });
  const 設定 = ss.getSheetByName('設定');
  const 設定の項目名 = 設定
    ? 設定.getDataRange().getValues().map(function (r) { return String(r[0]); }).filter(function (s) { return s !== ''; })
    : [];
  const 自動実行 = ScriptApp.getProjectTriggers().map(function (t) {
    return { 仕事: t.getHandlerFunction(), きっかけ: t.getTriggerSource() };
  });
  const 表 = 引き継ぎの表を作る_(今日の文字_(), DriveApp.getFileById(ss.getId()).getName(), シート一覧, 設定の項目名, 自動実行);
  出力シートを用意する_('引き継ぎメモ').getRange(1, 1, 表.length, 3).setValues(表);
}

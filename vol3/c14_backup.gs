// 第14章：バックアップ（第2章のコードが必要です）
// 「設定」シートに、「バックアップフォルダID」（バックアップを入れるドライブのフォルダのID）と、
// 「残すバックアップ数」（空欄なら7）を入れます。
// バックアップには、名簿など、スプレッドシートの中身がそのまま入ります。フォルダの共有範囲に気をつけます。

function バックアップのフォルダを取る_() {
  const ID = String(設定を読む_('バックアップフォルダID', ''));
  if (ID === '') throw new Error('設定シートに、「バックアップフォルダID」を入れてください。');
  try {
    return DriveApp.getFolderById(ID);
  } catch (e) {
    throw new Error('バックアップフォルダIDが正しくありません。設定シートの値を確かめてください。');
  }
}

// このスプレッドシートのコピーを、「名前_2026-10-19_0700」のような名前で、フォルダに作ります。
function バックアップを作る_() {
  const 元 = DriveApp.getFileById(SpreadsheetApp.getActiveSpreadsheet().getId());
  const 印 = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd_HHmm');
  return 元.makeCopy(元.getName() + '_' + 印, バックアップのフォルダを取る_()).getName();
}

// 作った日が新しい順に並べて、「残す数」より古いものを選びます。
function 古いバックアップを選ぶ_(ファイル一覧, 残す数) {
  return ファイル一覧
    .slice()
    .sort(function (a, b) { return b.作成日時 - a.作成日時; })
    .slice(残す数);
}

// 毎日動かす仕事：バックアップを1つ作ります。
function 毎日のバックアップの仕事() {
  仕事を実行する_('バックアップ', function () {
    return バックアップを作る_() + 'を作りました';
  });
}

function バックアップの自動実行を作る() {
  自動実行を作る_('毎日のバックアップの仕事', '毎日', Number(設定を読む_('朝の時刻', 7)));
}

// 古いバックアップを、ゴミ箱に移します（ゴミ箱から、もとに戻せます）。確認の画面を出します。
function 古いバックアップを整理する() {
  const ui = SpreadsheetApp.getUi();
  const 名前の頭 = DriveApp.getFileById(SpreadsheetApp.getActiveSpreadsheet().getId()).getName() + '_';
  const 残す数 = Number(設定を読む_('残すバックアップ数', 7));
  const ファイルたち = バックアップのフォルダを取る_().getFiles();
  const 一覧 = [];
  while (ファイルたち.hasNext()) {
    const f = ファイルたち.next();
    if (f.getName().indexOf(名前の頭) === 0) 一覧.push({ ファイル: f, 作成日時: f.getDateCreated() });
  }
  const 古い = 古いバックアップを選ぶ_(一覧, 残す数);
  if (古い.length === 0) {
    ui.alert('整理するバックアップは、ありません。');
    return;
  }
  const 答え = ui.alert('確認', '新しい ' + 残す数 + '個を残して、古い ' + 古い.length + '個を、ゴミ箱に移します。よろしいですか？', ui.ButtonSet.YES_NO);
  if (答え !== ui.Button.YES) return;
  古い.forEach(function (x) { x.ファイル.setTrashed(true); });
  ui.alert('ゴミ箱に移しました：' + 古い.length + '個');
}

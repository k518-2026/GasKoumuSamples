// 第11章：名簿からお便り・案内文を一括作成する（第2章の共通部品が必要です）
// 「設定」シートに、次の3つを入れます。
//   お便りテンプレートID … Googleドキュメントのひな形のID（URLの「/d/」と「/edit」の間）
//   出力フォルダID … できた文書を入れるドライブのフォルダのID（URLの「folders/」のあと）
//   お便りの日付 … 文書に入れる日付（空欄なら今日）
// ひな形の中には、「{{氏名}}」「{{番号}}」「{{日付}}」のように、差し込みたい場所を書いておきます。

// 文書の置きかえに使う文字の中の、特別な記号をよけます（例：{{氏名}}）。
function 記号をよける_(文字) {
  return 文字.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ひな形をコピーして、行ごとに「{{見出し}}」を値に置きかえた文書を作ります。
// すでに同じ名前のファイルがフォルダにあるときは、作り直さず飛ばします。
function 差し込み文書を作る_(テンプレートID, フォルダID, 行一覧, 名前を作る) {
  let フォルダ;
  try {
    フォルダ = DriveApp.getFolderById(フォルダID);
    DriveApp.getFileById(テンプレートID);
  } catch (e) {
    throw new Error('テンプレートIDか、出力フォルダIDが正しくありません。設定シートの値を確かめてください。');
  }
  const 結果 = { 作った: 0, 飛ばした: 0 };
  行一覧.forEach(function (行) {
    const 名前 = 名前を作る(行);
    if (フォルダ.getFilesByName(名前).hasNext()) {
      結果.飛ばした++;
      return;
    }
    const コピー = DriveApp.getFileById(テンプレートID).makeCopy(名前, フォルダ);
    const 文書 = DocumentApp.openById(コピー.getId());
    const 本体 = 文書.getBody();
    Object.keys(行).forEach(function (見出し) {
      本体.replaceText(記号をよける_('{{' + 見出し + '}}'), String(行[見出し]));
    });
    文書.saveAndClose();
    結果.作った++;
  });
  return 結果;
}

function お便りを作る() {
  const ui = SpreadsheetApp.getUi();
  const 人 = 名簿を読む_();
  const 日付 = String(設定を読む_('お便りの日付', Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy年M月d日')));
  const 行一覧 = 人.map(function (p) {
    const 行 = {};
    Object.keys(p).forEach(function (k) { 行[k] = p[k]; });
    行['日付'] = 日付;
    return 行;
  });
  const 答え = ui.alert('確認', 行一覧.length + '人分のお便り（Googleドキュメント）を、フォルダに作ります。よろしいですか？', ui.ButtonSet.YES_NO);
  if (答え !== ui.Button.YES) return;
  const 結果 = 差し込み文書を作る_(
    String(設定を読む_('お便りテンプレートID', '')),
    String(設定を読む_('出力フォルダID', '')),
    行一覧,
    function (行) { return 'お便り_' + 行['番号'] + '_' + 行['氏名']; }
  );
  ui.alert('終わりました。\n作った：' + 結果.作った + '件\nすでにあり、飛ばした：' + 結果.飛ばした + '件');
}

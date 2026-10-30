// 第14章：PDFにして、ドライブのフォルダに整理する（第2章の共通部品が必要です）
// 「設定」シートの「出力フォルダID」のフォルダにあるGoogleドキュメントを、PDFにします。

// フォルダの中の、決まった名前の子フォルダを返します。なければ作ります。
function 子フォルダを用意する_(親, 名前) {
  const 見つかった = 親.getFoldersByName(名前);
  return 見つかった.hasNext() ? 見つかった.next() : 親.createFolder(名前);
}

function 文書をPDFにする() {
  const ui = SpreadsheetApp.getUi();
  let フォルダ;
  try {
    フォルダ = DriveApp.getFolderById(String(設定を読む_('出力フォルダID', '')));
  } catch (e) {
    throw new Error('出力フォルダIDが正しくありません。設定シートの値を確かめてください。');
  }
  const 今日 = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy年M月d日');
  const 保存先 = 子フォルダを用意する_(フォルダ, 'PDF_' + 今日);
  const 文書たち = フォルダ.getFilesByType(MimeType.GOOGLE_DOCS);
  let 作った = 0;
  let 飛ばした = 0;
  while (文書たち.hasNext()) {
    const 文書 = 文書たち.next();
    const 名前 = 文書.getName() + '.pdf';
    if (保存先.getFilesByName(名前).hasNext()) {
      飛ばした++;
      continue;
    }
    保存先.createFile(文書.getAs(MimeType.PDF).setName(名前));
    作った++;
  }
  ui.alert('終わりました。\n「' + 保存先.getName() + '」に、PDFを ' + 作った + '件作りました。\nすでにあり、飛ばした：' + 飛ばした + '件');
}

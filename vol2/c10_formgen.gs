// 第10章：毎年同じフォームを一括で作る（第2章の共通部品が必要です）
// 「質問」シート：見出しは「質問文」「種類」「選択肢」「必須」。
//   種類は「短い文章」「長い文章」「選択」「5段階」「日付」のどれか。
//   選択肢は「、」でつなぐ（種類が「選択」のときだけ）。必須は「○」。
// 「設定」シートの「フォームの題名」に、題名を入れます。

function フォームに質問を足す_(フォーム, 行, 行番号) {
  let 項目;
  const 種類 = String(行['種類']).trim();
  if (種類 === '短い文章') {
    項目 = フォーム.addTextItem();
  } else if (種類 === '長い文章') {
    項目 = フォーム.addParagraphTextItem();
  } else if (種類 === '選択') {
    const 選択肢 = String(行['選択肢']).split('、').map(function (s) { return s.trim(); }).filter(function (s) { return s !== ''; });
    if (選択肢.length < 2) throw new Error(行番号 + '行目：種類が「選択」のときは、選択肢を「、」でつないで2つ以上入れてください。');
    項目 = フォーム.addMultipleChoiceItem().setChoiceValues(選択肢);
  } else if (種類 === '5段階') {
    項目 = フォーム.addScaleItem().setBounds(1, 5);
  } else if (種類 === '日付') {
    項目 = フォーム.addDateItem();
  } else {
    throw new Error(行番号 + '行目：種類「' + 種類 + '」は使えません。「短い文章」「長い文章」「選択」「5段階」「日付」のどれかにしてください。');
  }
  項目.setTitle(String(行['質問文'])).setRequired(行['必須'] === '○');
}

function フォームを作る() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const シート = ss.getSheetByName('質問');
  if (!シート) throw new Error('「質問」という名前のシートが見つかりません。');
  const 質問 = 表を読む_(シート);
  if (質問.length === 0) throw new Error('「質問」シートに、質問が1つもありません。');
  const 題名 = String(設定を読む_('フォームの題名', '無題のフォーム'));
  const フォーム = FormApp.create(題名);
  質問.forEach(function (行) {
    フォームに質問を足す_(フォーム, 行, 行['_行']);
  });
  フォーム.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  let 一覧 = ss.getSheetByName('フォーム一覧');
  if (!一覧) {
    一覧 = ss.insertSheet('フォーム一覧');
    一覧.appendRow(['作った日時', '題名', '回答用のURL（配る）', '編集用のURL（自分だけ）']);
  }
  一覧.appendRow([Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm'), 題名, フォーム.getPublishedUrl(), フォーム.getEditUrl()]);
  Logger.log('フォームを作りました：' + フォーム.getPublishedUrl());
}

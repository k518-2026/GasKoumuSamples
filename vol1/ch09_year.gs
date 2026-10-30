// 第9章：日付と年度更新（第6章の共通部品が必要です）

// 今日の日付を「2026年10月18日（日）」の形で返します。
function 今日の日付() {
  const 曜日 = ['日', '月', '火', '水', '木', '金', '土'];
  const 今 = new Date();
  const 番号 = Number(Utilities.formatDate(今, 'Asia/Tokyo', 'u')); // 月曜=1 ... 日曜=7
  return Utilities.formatDate(今, 'Asia/Tokyo', 'yyyy年M月d日') + '（' + 曜日[番号 % 7] + '）';
}

// 今の年度を返します。4月から翌年3月までが同じ年度です。
function 今の年度() {
  const 今 = new Date();
  const 年 = Number(Utilities.formatDate(今, 'Asia/Tokyo', 'yyyy'));
  const 月 = Number(Utilities.formatDate(今, 'Asia/Tokyo', 'M'));
  return 月 >= 4 ? 年 : 年 - 1;
}

// 名簿のコピーを「名簿_2026年度」の名前で残します。
function 名簿を年度つきで保存する() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const 名簿 = ss.getSheetByName('名簿');
  if (!名簿) throw new Error('「名簿」という名前のシートが見つかりません。');
  let 名前 = '名簿_' + 今の年度() + '年度';
  if (ss.getSheetByName(名前)) {
    名前 = 名前 + '_' + new Date().getTime(); // 同じ名前があるときは数字をつける
  }
  名簿.copyTo(ss).setName(名前);
  return 名前;
}

// 新しい年度の準備：保存してから、毎年変わる列（前列希望・固定席）を空にします。
function 新年度の準備をする() {
  const 保存した名前 = 名簿を年度つきで保存する();
  const シート = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('名簿');
  const 見出し = シート.getRange(1, 1, 1, シート.getLastColumn()).getValues()[0];
  const 人数 = シート.getLastRow() - 1;
  ['前列希望', '固定席'].forEach(function (列の見出し) {
    const 列 = 見出し.indexOf(列の見出し) + 1;
    if (列 > 0 && 人数 > 0) シート.getRange(2, 列, 人数, 1).clearContent();
  });
  Logger.log('「' + 保存した名前 + '」に保存して、前列希望と固定席を空にしました');
}

// 動作確認用：今日の日付と年度を、実行ログに出します。
function 日付と年度を確認する() {
  Logger.log(今日の日付() + '／' + 今の年度() + '年度');
}

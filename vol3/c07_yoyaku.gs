// 第7章：備品・教室の予約表（第2章・第6章のコードと、HTMLファイル「yoyaku」が必要です）
// 「予約枠」シート：見出しは「場所」「時間帯」。予約できる組み合わせを、1行に1つずつ書きます。
//   例：理科室 ／ 1校時、理科室 ／ 2校時、タブレット ／ 3校時
// 「予約」シート：自動で作られます。見出しは「日付」「場所」「時間帯」「予約者」「登録日時」。

// 予約枠の行から、画面に出す選択肢（場所の一覧と、場所ごとの時間帯）を作ります。
function 予約の選択肢を作る_(枠の行) {
  const 場所 = [];
  const 時間帯 = {};
  枠の行.forEach(function (r) {
    const 場 = String(r['場所']);
    if (!時間帯[場]) {
      場所.push(場);
      時間帯[場] = [];
    }
    時間帯[場].push(String(r['時間帯']));
  });
  return { 場所: 場所, 時間帯: 時間帯 };
}

// 入力を確かめます。問題がなければ空の文字、あれば理由の文を返します。
function 予約の入力を確かめる_(日付, 場所, 時間帯, 予約者, 選択肢, 今日) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(日付))) return '日付を選んでください。';
  const 日 = String(日付).replace(/-/g, '/');
  if (isNaN(日数の差_(今日, 日)) || 日付に足す_(日, 0) !== 日) return '日付が正しくありません。';
  if (日数の差_(今日, 日) < 0) return '過ぎた日には、予約できません。';
  if (選択肢.場所.indexOf(場所) < 0) return '場所を選んでください。';
  if (選択肢.時間帯[場所].indexOf(時間帯) < 0) return '時間帯を選んでください。';
  const 名前 = String(予約者).trim();
  if (名前.length < 1 || 名前.length > 20) return '予約者の名前を、1〜20文字で入れてください。';
  return '';
}

function 予約が重なるか_(予約の行, 日付, 場所, 時間帯) {
  return 予約の行.some(function (r) {
    return 日付の文字にする_(r['日付']) === 日付 && String(r['場所']) === 場所 && String(r['時間帯']) === 時間帯;
  });
}

// シートの式として読まれないように、先頭が「=」「+」「-」「@」の文字には、「'」をつけます。
function 式にならない文字_(文字) {
  return /^[=+\-@]/.test(文字) ? "'" + 文字 : 文字;
}

function 予約シートを取る_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let シート = ss.getSheetByName('予約');
  if (!シート) {
    シート = ss.insertSheet('予約');
    シート.appendRow(['日付', '場所', '時間帯', '予約者', '登録日時']);
  }
  return シート;
}

// ---- 画面（yoyaku.html）から呼ばれる部品です

function 予約画面の選択肢を返す() {
  const シート = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('予約枠');
  if (!シート) throw new Error('「予約枠」という名前のシートが見つかりません。');
  return 予約の選択肢を作る_(表を読む_(シート));
}

// 指定した日の予約の状況（「場所」「時間帯」「予約者」の一覧）を返します。
function 予約状況を返す(日付) {
  const 日 = 日付の文字にする_(String(日付).replace(/-/g, '/'));
  return 表を読む_(予約シートを取る_())
    .filter(function (r) { return 日付の文字にする_(r['日付']) === 日; })
    .map(function (r) { return { 場所: String(r['場所']), 時間帯: String(r['時間帯']), 予約者: String(r['予約者']) }; });
}

// 予約を登録します。同時に2人が押しても重ならないよう、順番待ち（ロック）をかけます。
function 予約を登録する(日付, 場所, 時間帯, 予約者) {
  const ロック = LockService.getScriptLock();
  ロック.waitLock(10000);
  try {
    const 問題 = 予約の入力を確かめる_(日付, 場所, 時間帯, 予約者, 予約画面の選択肢を返す(), 今日の文字_());
    if (問題 !== '') return { ok: false, message: 問題 };
    const シート = 予約シートを取る_();
    const 日 = String(日付).replace(/-/g, '/');
    if (予約が重なるか_(表を読む_(シート), 日, 場所, 時間帯)) {
      return { ok: false, message: 'その時間は、すでに予約が入っています。' };
    }
    シート.appendRow([日, 場所, 時間帯, 式にならない文字_(String(予約者).trim()), Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm')]);
    return { ok: true, message: '予約しました。' };
  } finally {
    ロック.releaseLock();
  }
}

function ページ_yoyaku() {
  return HtmlService.createHtmlOutputFromFile('yoyaku').setTitle('予約');
}

// 第2章：共通部品（第1巻・第2巻と同じ部品を含みます。入っていても、重なって問題ありません）

// シートを読んで、1行を1人分（見出し→値）の一覧にして返します。空の行は飛ばします。
function 表を読む_(シート) {
  const 値 = シート.getDataRange().getValues();
  const 見出し = 値[0];
  const 一覧 = [];
  for (let i = 1; i < 値.length; i++) {
    if (値[i].every(function (v) { return v === ''; })) continue;
    const 行 = {};
    見出し.forEach(function (名前, j) {
      行[名前] = 値[i][j];
    });
    行['_行'] = i + 1; // シートの何行目か
    一覧.push(行);
  }
  return 一覧;
}

function 名簿を読む_() {
  const シート = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('名簿');
  if (!シート) {
    throw new Error('「名簿」という名前のシートが見つかりません。シートの名前を確かめてください。');
  }
  return 表を読む_(シート);
}

// 「設定」シートから、項目名に合う値を取り出します。なければ既定値を返します。
function 設定を読む_(項目名, 既定値) {
  const シート = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('設定');
  if (!シート) return 既定値;
  const 値 = シート.getDataRange().getValues();
  for (let i = 0; i < 値.length; i++) {
    if (値[i][0] === 項目名 && 値[i][1] !== '') return 値[i][1];
  }
  return 既定値;
}

// 結果を書き出すシートを用意します。あれば中身を消し、なければ作ります。
function 出力シートを用意する_(名前) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let シート = ss.getSheetByName(名前);
  if (シート) {
    シート.clear();
  } else {
    シート = ss.insertSheet(名前);
  }
  return シート;
}

// フォームの回答が入るシートを返します（名前が「フォームの回答」で始まるシート）。
function 回答シートを取る_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const 指定 = String(設定を読む_('回答シート名', ''));
  if (指定) {
    const シート = ss.getSheetByName(指定);
    if (!シート) throw new Error('「' + 指定 + '」という名前のシートが見つかりません。');
    return シート;
  }
  const 候補 = ss.getSheets().filter(function (s) {
    return s.getName().indexOf('フォームの回答') === 0;
  });
  if (候補.length === 0) {
    throw new Error('「フォームの回答」で始まるシートが見つかりません。フォームの回答先に、このスプレッドシートを指定したか確かめてください。');
  }
  return 候補[0];
}

// 「5」「５」「5番」などを、数字の 5 にそろえます。読み取れなければ NaN を返します。
function 番号にそろえる_(値) {
  const 文字 = String(値)
    .replace(/[０-９]/g, function (c) {
      return String.fromCharCode(c.charCodeAt(0) - 0xfee0);
    })
    .replace(/[^0-9]/g, '');
  return 文字 === '' ? NaN : Number(文字);
}

// ---- 日付の部品（日本時間で、「2026/10/19」の文字にそろえて扱います）

// 日付の値（日付型でも「2026/10/19」「2026-10-9」のような文字でも）を「2026/10/19」の形にそろえます。
function 日付の文字にする_(値) {
  if (値 instanceof Date) return Utilities.formatDate(値, 'Asia/Tokyo', 'yyyy/MM/dd');
  const 部分 = String(値).replace(/-/g, '/').split('/');
  if (部分.length !== 3) return String(値);
  return 部分[0] + '/' + ('0' + 部分[1]).slice(-2) + '/' + ('0' + 部分[2]).slice(-2);
}

function 今日の文字_() {
  return Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd');
}

function 日付の数にする_(文字) {
  const 部分 = 文字.split('/');
  return Date.UTC(Number(部分[0]), Number(部分[1]) - 1, Number(部分[2]));
}

// 2つの日付の間の日数（あとの日付 − 前の日付）を返します。
function 日数の差_(前, 後) {
  return Math.round((日付の数にする_(後) - 日付の数にする_(前)) / 86400000);
}

// 日付に、日数を足した（引いた）日付を、「2026/10/19」の形で返します。
function 日付に足す_(文字, 日数) {
  const d = new Date(日付の数にする_(文字) + 日数 * 86400000);
  return d.getUTCFullYear() + '/' + ('0' + (d.getUTCMonth() + 1)).slice(-2) + '/' + ('0' + d.getUTCDate()).slice(-2);
}

function 曜日の文字_(文字) {
  return ['日', '月', '火', '水', '木', '金', '土'][new Date(日付の数にする_(文字)).getUTCDay()];
}

// 「2026/10/19」を「2026年10月19日（月）」にします。
function 日付の表示にする_(文字) {
  const 部分 = 文字.split('/');
  return 部分[0] + '年' + Number(部分[1]) + '月' + Number(部分[2]) + '日（' + 曜日の文字_(文字) + '）';
}

// ---- 自動で動かす仕事の部品

function 自分のアドレス_() {
  return Session.getEffectiveUser().getEmail();
}

// 自動で動く仕事は、メールを「自分あて」にだけ送ります。保護者などには送りません。
function 自分に知らせる_(件名, 本文) {
  MailApp.sendEmail(自分のアドレス_(), 件名, 本文);
}

// 「実行記録」シートに、いつ・何の仕事が・どうなったかを残します。
function 実行記録を書く_(名前, 結果) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let シート = ss.getSheetByName('実行記録');
  if (!シート) {
    シート = ss.insertSheet('実行記録');
    シート.appendRow(['日時', '仕事', '結果']);
  }
  シート.appendRow([Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm'), 名前, 結果]);
}

// 仕事を実行して、成功も失敗も記録します。失敗したときは、自分あてにだけメールで知らせます。
function 仕事を実行する_(名前, 仕事) {
  try {
    const 結果 = 仕事();
    実行記録を書く_(名前, '成功' + (結果 ? '：' + 結果 : ''));
  } catch (e) {
    実行記録を書く_(名前, '失敗：' + e.message);
    自分に知らせる_('【自動実行の失敗】' + 名前, 'エラーの内容：' + e.message + '\n\n「実行記録」シートも見てください。');
  }
}

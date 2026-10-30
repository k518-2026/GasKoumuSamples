// 第5章：メールを安全に送る共通部品（第2章の共通部品が必要です）
// 「設定」シートの「送信モード」が「本番」のときだけ、本当の宛先に送ります。
// それ以外（空欄・「テスト」）は、すべて自分あてに送ります。

function 送信モード_() {
  return String(設定を読む_('送信モード', 'テスト')) === '本番' ? '本番' : 'テスト';
}

function 自分のアドレス_() {
  return Session.getEffectiveUser().getEmail();
}

function 宛先として正しい_(文字) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(文字).trim());
}

// 1通送ります。テストのときは自分あてに、本来の宛先を書き添えて送ります。
function メールを送る_(宛先, 件名, 本文) {
  if (!宛先として正しい_(宛先)) {
    throw new Error('メールアドレスの形が正しくありません：' + 宛先);
  }
  if (送信モード_() === '本番') {
    MailApp.sendEmail(String(宛先).trim(), 件名, 本文);
    return;
  }
  MailApp.sendEmail(
    自分のアドレス_(),
    '[テスト] ' + 件名,
    '【本来の宛先：' + 宛先 + '】\n（テスト送信のため、自分あてに送っています）\n\n' + 本文
  );
}

// きょう送れるメールの残りより多く送ろうとしていないかを確かめます。
function 送れる数を確かめる_(必要な数) {
  const 残り = MailApp.getRemainingDailyQuota();
  if (必要な数 > 残り) {
    throw new Error('きょう送れるメールの残り（' + 残り + '通）より、送る数（' + 必要な数 + '通）が多いです。数を分けて送ってください。');
  }
}

// 「{{氏名}}」のような部分を、その人の値に置きかえます。
function 差し込む_(型, 行) {
  return String(型).replace(/\{\{([^}]+)\}\}/g, function (全体, 名前) {
    return 名前 in 行 ? String(行[名前]) : 全体;
  });
}

// 送ったことを「送信記録」シートに残します。
function 送信を記録する_(種類, 宛先, 件名) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let シート = ss.getSheetByName('送信記録');
  if (!シート) {
    シート = ss.insertSheet('送信記録');
    シート.appendRow(['日時', 'モード', '種類', '宛先', '件名']);
  }
  シート.appendRow([Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm'), 送信モード_(), 種類, 宛先, 件名]);
}

// 同じ種類・宛先・件名のメールを、本番モードですでに送っていないかを調べます。
function すでに送った_(種類, 宛先, 件名) {
  const シート = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('送信記録');
  if (!シート) return false;
  return 表を読む_(シート).some(function (r) {
    return r['モード'] === '本番' && r['種類'] === 種類 && r['宛先'] === 宛先 && r['件名'] === 件名;
  });
}

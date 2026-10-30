// 第2章：決まった時刻に自動で動かす（上の共通部品が必要です）
// 「設定」シートの「朝の時刻」に、動かす時（0〜23の数字）を入れます。空欄なら7時です。

// 同じ仕事の自動実行が、すでに作ってあるかを調べます。
function 同じ仕事の自動実行があるか_(関数名) {
  return ScriptApp.getProjectTriggers().some(function (t) {
    return t.getHandlerFunction() === 関数名;
  });
}

// 自動実行（トリガー）を作ります。同じ仕事のものがすでにあるときは、作りません。
function 自動実行を作る_(関数名, 種類, 時) {
  if (同じ仕事の自動実行があるか_(関数名)) {
    Logger.log('「' + 関数名 + '」の自動実行は、すでに作ってあります');
    return false;
  }
  let 作り方 = ScriptApp.newTrigger(関数名).timeBased();
  if (種類 === '毎日') {
    作り方 = 作り方.everyDays(1).atHour(時);
  } else if (種類 === '毎週月曜') {
    作り方 = 作り方.onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(時);
  } else if (種類 === '毎月1日') {
    作り方 = 作り方.onMonthDay(1).atHour(時);
  } else {
    throw new Error('自動実行の種類「' + 種類 + '」は使えません。');
  }
  作り方.inTimezone('Asia/Tokyo').create();
  Logger.log('「' + 関数名 + '」の自動実行を作りました（' + 種類 + '・' + 時 + '時ごろ）');
  return true;
}

// 明日が月の初めか（＝きょうが月末か）を調べます。
function 明日は月の初め_(今日) {
  const 明日 = new Date(日付の数にする_(今日) + 86400000);
  return 明日.getUTCDate() === 1;
}

// ---- 自動で動かす仕事の見本

// 毎朝動く仕事：「今日の日付」シートに、今日の日付を書きます。
function 朝の見守りの仕事() {
  仕事を実行する_('朝の見守り', function () {
    const 出力 = 出力シートを用意する_('今日の日付');
    const 表示 = 日付の表示にする_(今日の文字_());
    出力.getRange('A1').setValue(表示);
    return 表示 + 'を書きました';
  });
}

// 毎週月曜の朝に動く仕事（中身は、あとの章で作ります）
function 週のはじめの仕事() {
  仕事を実行する_('週のはじめ', function () {
    return '週のはじめの仕事が動きました';
  });
}

// 毎日動かして、月末の日だけ中身を動かす仕事
function 月末の仕事() {
  仕事を実行する_('月末', function () {
    if (!明日は月の初め_(今日の文字_())) return '';
    return '月末の仕事が動きました';
  });
}

// ---- 自動実行を作る・見る・止める

function 毎朝の自動実行を作る() {
  自動実行を作る_('朝の見守りの仕事', '毎日', Number(設定を読む_('朝の時刻', 7)));
}

function 毎週月曜の自動実行を作る() {
  自動実行を作る_('週のはじめの仕事', '毎週月曜', Number(設定を読む_('朝の時刻', 7)));
}

function 月末の自動実行を作る() {
  自動実行を作る_('月末の仕事', '毎日', Number(設定を読む_('朝の時刻', 7)));
}

// いま動いている自動実行の一覧を、「自動実行の一覧」シートに書きます。
function 自動実行の一覧を見る() {
  const 表 = [['仕事', '種類', 'きっかけ']];
  ScriptApp.getProjectTriggers().forEach(function (t) {
    表.push([t.getHandlerFunction(), t.getEventType(), t.getTriggerSource()]);
  });
  出力シートを用意する_('自動実行の一覧').getRange(1, 1, 表.length, 3).setValues(表);
}

// 指定した仕事の自動実行を止めます（削除します）。
function 自動実行を止める_(関数名) {
  let 数 = 0;
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 関数名) {
      ScriptApp.deleteTrigger(t);
      数++;
    }
  });
  return 数;
}

function 毎朝の自動実行を止める() {
  Logger.log(自動実行を止める_('朝の見守りの仕事') + '件を止めました');
}

// このプロジェクトの自動実行を、すべて止めます。確認の画面を出します。
function 自動実行をすべて止める() {
  const ui = SpreadsheetApp.getUi();
  const 数 = ScriptApp.getProjectTriggers().length;
  const 答え = ui.alert('確認', '自動実行 ' + 数 + '件を、すべて止めます。よろしいですか？', ui.ButtonSet.YES_NO);
  if (答え !== ui.Button.YES) return;
  ScriptApp.getProjectTriggers().forEach(function (t) {
    ScriptApp.deleteTrigger(t);
  });
  ui.alert('止めました。');
}

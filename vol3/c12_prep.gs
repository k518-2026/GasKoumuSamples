// 第12章：行事の準備表の「進み具合」（第2章のコードが必要です）
// 「準備表」シート：見出しは「行事」「項目」「担当」「期限」「完了」。完了したら「○」を書きます。

// 行事ごとに、全部の数・完了の数・期限が過ぎた未完了の数・期限が近い（3日以内）未完了の数を数えます。
function 準備の進み具合を集計する_(行一覧, 今日) {
  const 行事 = {};
  const 順 = [];
  行一覧.forEach(function (r) {
    const 名 = String(r['行事']);
    if (!行事[名]) {
      行事[名] = { 行事: 名, 全部: 0, 完了: 0, 期限切れ: 0, 近い: 0, 期限切れの項目: [] };
      順.push(名);
    }
    const x = 行事[名];
    x.全部++;
    if (r['完了'] === '○') {
      x.完了++;
      return;
    }
    const 残り = 日数の差_(今日, 日付の文字にする_(r['期限']));
    if (isNaN(残り)) return;
    if (残り < 0) {
      x.期限切れ++;
      x.期限切れの項目.push(String(r['項目']) + '（' + String(r['担当']) + '）');
    } else if (残り <= 3) {
      x.近い++;
    }
  });
  return 順.map(function (名) { return 行事[名]; });
}

// 「準備の進み具合」シートに書きます。
function 準備の進み具合を見る() {
  const シート = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('準備表');
  if (!シート) throw new Error('「準備表」という名前のシートが見つかりません。');
  const 結果 = 準備の進み具合を集計する_(表を読む_(シート), 今日の文字_());
  const 表 = [['行事', '全部', '完了', '進み具合', '期限切れ', '期限が近い']];
  結果.forEach(function (x) {
    表.push([x.行事, x.全部, x.完了, Math.round((x.完了 / x.全部) * 100) + '%', x.期限切れ, x.近い]);
  });
  出力シートを用意する_('準備の進み具合').getRange(1, 1, 表.length, 6).setValues(表);
}

// 期限が過ぎた未完了があるときだけ、自分あてにメールで知らせます（毎週月曜の朝に動かします）。
function 準備の遅れの通知の仕事() {
  仕事を実行する_('準備の遅れの通知', function () {
    const シート = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('準備表');
    if (!シート) throw new Error('「準備表」という名前のシートが見つかりません。');
    const 遅れ = 準備の進み具合を集計する_(表を読む_(シート), 今日の文字_()).filter(function (x) { return x.期限切れ > 0; });
    if (遅れ.length === 0) return '遅れはありません';
    const 文 = 遅れ.map(function (x) { return '■ ' + x.行事 + '\n' + x.期限切れの項目.map(function (s) { return '　・' + s; }).join('\n'); }).join('\n\n');
    自分に知らせる_('【準備の遅れ】期限が過ぎた項目があります', 文);
    return 遅れ.length + '件の行事で遅れがあります';
  });
}

function 準備の遅れの自動実行を作る() {
  自動実行を作る_('準備の遅れの通知の仕事', '毎週月曜', Number(設定を読む_('朝の時刻', 7)));
}

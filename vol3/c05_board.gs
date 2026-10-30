// 第5章：時間割と予定の「今日のボード」（第2章のコードが必要です）
// 「時間割」シート：見出しは「曜日」「1」「2」「3」「4」「5」「6」。曜日の列に「月」〜「金」、あとは教科名。
// 「変更」シート：見出しは「日付」「校時」「内容」。変わった日だけ書きます。
// 「行事予定」シート：見出しに「日付」「行事名」があるもの（第2巻と同じ）。

function シートの行を読む_(名前) {
  const シート = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(名前);
  return シート ? 表を読む_(シート) : [];
}

// きょうの予定（時間割・変更・行事）を、ひとまとめにします。
function 今日の予定を作る_(時間割, 変更, 行事, 今日) {
  const 曜 = 曜日の文字_(今日);
  const 行 = 時間割.filter(function (r) { return r['曜日'] === 曜; })[0];
  const 一覧 = [];
  if (行) {
    Object.keys(行).forEach(function (k) {
      if (/^\d+$/.test(k) && 行[k] !== '') 一覧.push({ 校時: Number(k), 内容: String(行[k]), 変更: false });
    });
  }
  変更.forEach(function (r) {
    if (日付の文字にする_(r['日付']) !== 今日) return;
    const n = Number(r['校時']);
    const 既 = 一覧.filter(function (x) { return x.校時 === n; })[0];
    if (既) {
      既.内容 = String(r['内容']);
      既.変更 = true;
    } else {
      一覧.push({ 校時: n, 内容: String(r['内容']), 変更: true });
    }
  });
  一覧.sort(function (a, b) { return a.校時 - b.校時; });
  const 行事名 = 行事
    .filter(function (r) { return 日付の文字にする_(r['日付']) === 今日; })
    .map(function (r) { return String(r['行事名']); });
  return { 日付: 今日, 表示: 日付の表示にする_(今日), 時間割: 一覧, 行事: 行事名 };
}

function 今日の予定を読む_() {
  const 時間割 = シートの行を読む_('時間割');
  if (時間割.length === 0) throw new Error('「時間割」という名前のシートが見つかりません。');
  return 今日の予定を作る_(時間割, シートの行を読む_('変更'), シートの行を読む_('行事予定'), 今日の文字_());
}

// 「今日のボード」シートに、きょうの予定を書きます（自動で動かす仕事の本体）。
function 今日のボードの仕事() {
  仕事を実行する_('今日のボード', function () {
    const 予定 = 今日の予定を読む_();
    const 表 = [[予定.表示, ''], ['行事：' + (予定.行事.length ? 予定.行事.join('、') : 'なし'), ''], ['校時', '内容']];
    予定.時間割.forEach(function (x) {
      表.push([x.校時 + '校時', x.内容 + (x.変更 ? '　★変更' : '')]);
    });
    出力シートを用意する_('今日のボード').getRange(1, 1, 表.length, 2).setValues(表);
    return 予定.時間割.length + '校時ぶんを書きました';
  });
}

function ボードの自動実行を作る() {
  自動実行を作る_('今日のボードの仕事', '毎日', Number(設定を読む_('朝の時刻', 7)));
}

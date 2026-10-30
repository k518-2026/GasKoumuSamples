// 第7章：アンケートの集計（第2章の共通部品が必要です）

// 1つの質問の回答（値の一覧）を、数値・選択式・自由記述のどれかとして集計します。
function 質問ごとに集計する_(値の一覧) {
  const 値 = 値の一覧.filter(function (v) { return v !== '' && v !== null && v !== undefined; });
  if (値.length === 0) return { 種類: '回答なし', 回答数: 0 };

  const 数字 = 値.map(function (v) { return Number(v); });
  const 度数 = {};
  値.forEach(function (v) {
    const キー = String(v);
    度数[キー] = (度数[キー] || 0) + 1;
  });
  const 種類数 = Object.keys(度数).length;

  if (数字.every(function (n) { return !isNaN(n); })) {
    const 合計 = 数字.reduce(function (s, n) { return s + n; }, 0);
    return { 種類: '数値', 回答数: 値.length, 平均: 合計 / 値.length, 度数: 度数 };
  }
  if (種類数 <= 8) {
    return { 種類: '選択', 回答数: 値.length, 度数: 度数 };
  }
  return { 種類: '自由記述', 回答数: 値.length, 一覧: 値.map(String) };
}

// 全部の質問を集計して、「集計結果」シートに書き出します。
function アンケートを集計する() {
  const シート = 回答シートを取る_();
  const 見出し = シート.getRange(1, 1, 1, シート.getLastColumn()).getValues()[0];
  const 回答 = 表を読む_(シート);
  const 除く = ['タイムスタンプ', '番号', '氏名', '照合結果'].concat(
    String(設定を読む_('集計しない見出し', '')).split('、')
  );
  const 表 = [['回答は ' + 回答.length + '件です', '', '']];
  見出し.forEach(function (質問) {
    if (質問 === '' || 除く.indexOf(質問) >= 0) return;
    const 結果 = 質問ごとに集計する_(
      回答.map(function (r) { return r[質問]; })
    );
    表.push(['', '', '']);
    表.push(['■ ' + 質問 + '（' + 結果.種類 + '・' + 結果.回答数 + '件）', '', '']);
    if (結果.種類 === '数値') {
      表.push(['平均', 結果.平均.toFixed(2), '']);
    }
    if (結果.度数) {
      Object.keys(結果.度数)
        .sort()
        .forEach(function (キー) {
          表.push([キー, 結果.度数[キー], (結果.度数[キー] / 結果.回答数 * 100).toFixed(1) + '%']);
        });
    }
    if (結果.一覧) {
      結果.一覧.forEach(function (文) {
        表.push([文, '', '']);
      });
    }
  });
  出力シートを用意する_('集計結果').getRange(1, 1, 表.length, 3).setValues(表);
}

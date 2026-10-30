// 第8章：行事の希望調査・係決め（第2章の共通部品が必要です）
// フォームの質問：番号、第1希望、第2希望、第3希望
// 「係」シート：A列に係の名前、B列に定員（見出しは「係」「定員」）

// 全員の第1希望から順に、定員に空きがあれば決めていきます。
// 同じ希望どうしは、混ぜた順（くじ引き）で決めます。
function 係を決める_(回答, 係一覧, 乱数) {
  const 残り = {};
  係一覧.forEach(function (k) {
    残り[k['係']] = Number(k['定員']);
  });
  // 同じ人が何回か出したときは、最後の回答を使う
  const 最新 = {};
  回答.forEach(function (r) {
    const n = 番号にそろえる_(r['番号']);
    if (!isNaN(n)) 最新[n] = r;
  });
  let 決める人 = Object.keys(最新).map(function (n) {
    return { 番号: Number(n), 回答: 最新[n] };
  });
  混ぜる_(決める人, 乱数);

  const 割当 = {};
  ['第1希望', '第2希望', '第3希望'].forEach(function (列) {
    決める人.forEach(function (x) {
      if (割当[x.番号] !== undefined) return;
      const 係 = x.回答[列];
      if (係 in 残り && 残り[係] > 0) {
        割当[x.番号] = 係;
        残り[係]--;
      }
    });
  });
  const 未定 = 決める人
    .filter(function (x) { return 割当[x.番号] === undefined; })
    .map(function (x) { return x.番号; });
  return { 割当: 割当, 未定: 未定 };
}

function 係決めを実行する() {
  const 人 = 名簿を読む_();
  const 係シート = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('係');
  if (!係シート) throw new Error('「係」という名前のシートが見つかりません。');
  const 係一覧 = 表を読む_(係シート);
  const 結果 = 係を決める_(表を読む_(回答シートを取る_()), 係一覧, Math.random);

  const 氏名 = function (番号) {
    const p = 人.filter(function (x) { return Number(x['番号']) === 番号; })[0];
    return p ? 番号 + ' ' + p['氏名'] : 番号 + '（名簿にない番号）';
  };
  const 列 = 係一覧.map(function (k) {
    const 名前 = Object.keys(結果.割当)
      .filter(function (n) { return 結果.割当[n] === k['係']; })
      .map(function (n) { return 氏名(Number(n)); });
    return [k['係'] + '（定員' + k['定員'] + '）'].concat(名前);
  });
  列.push(['未定'].concat(結果.未定.map(氏名)));
  const 行数 = Math.max.apply(null, 列.map(function (c) { return c.length; }));
  const 表 = [];
  for (let r = 0; r < 行数; r++) {
    表.push(列.map(function (c) { return c[r] || ''; }));
  }
  出力シートを用意する_('係決め結果').getRange(1, 1, 表.length, 列.length).setValues(表);
}

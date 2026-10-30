// 第13章：クラス分け（第6章・第10章・第12章のコードが必要です）
// 注意：結果はあくまで「たたき台」です。最後は必ず先生が見て決めます。

function クラス分けを実行する() {
  const 人 = 名簿を読む_();
  const クラス数 = Number(設定を読む_('クラスの数', 3));
  const 離すペア = 離すペアを読む_();
  const 結果 = クラスを決める_(人, クラス数, 離すペア, Math.random);
  クラス分けを書き出す_(結果.クラス, 結果.残った問題);
}

// バランス点が空欄の人は 0 として扱います。
function 点_(p) {
  return Number(p['バランス点']) || 0;
}

// 性別ごとに点の高い順に並べ、クラスへ「行って・戻って」と配ります。
// そのあと「離す」条件に反している組があれば、別クラスの同性の人と入れ替えます。
function クラスを決める_(人, クラス数, 離すペア, 乱数) {
  if (クラス数 < 2 || クラス数 > 人.length) {
    throw new Error('クラスの数は、2以上、人数（' + 人.length + '人）以下にしてください。');
  }
  const クラス = [];
  for (let i = 0; i < クラス数; i++) クラス.push([]);

  // 性別ごとに分ける（性別が空欄だけの名簿でも動きます）
  const 区分ごと = {};
  混ぜる_(人.slice(), 乱数).forEach(function (p) {
    const キー = p['性別'] === '' ? '未入力' : p['性別'];
    (区分ごと[キー] = 区分ごと[キー] || []).push(p);
  });

  let 位置 = 0; // 0,1,2,2,1,0,0,1,2,... と蛇行して進む
  Object.keys(区分ごと).forEach(function (キー) {
    区分ごと[キー]
      .sort(function (a, b) {
        return 点_(b) - 点_(a);
      })
      .forEach(function (p) {
        const 周 = Math.floor(位置 / クラス数);
        const 余り = 位置 % クラス数;
        クラス[周 % 2 === 0 ? 余り : クラス数 - 1 - 余り].push(p);
        位置++;
      });
  });

  // 「離す」条件に反している組を入れ替えで直す
  const 残った問題 = [];
  離すペア.forEach(function (ペア) {
    const 場所 = 探す_(クラス, ペア[0]);
    const 場所2 = 探す_(クラス, ペア[1]);
    if (場所 < 0 || 場所2 < 0 || 場所 !== 場所2) return;
    if (!入れ替えて直す_(クラス, 場所, ペア[1], 離すペア)) {
      残った問題.push(ペア[0] + '番と' + ペア[1] + '番を離せませんでした');
    }
  });
  return { クラス: クラス, 残った問題: 残った問題 };
}

function 探す_(クラス, 番号) {
  for (let i = 0; i < クラス.length; i++) {
    if (クラス[i].some(function (p) { return Number(p['番号']) === 番号; })) return i;
  }
  return -1;
}

function 同じクラスにいる_(グループ, 番号, 離すペア) {
  const 相手 = [];
  離すペア.forEach(function (ペア) {
    if (ペア[0] === 番号) 相手.push(ペア[1]);
    if (ペア[1] === 番号) 相手.push(ペア[0]);
  });
  return グループ.some(function (p) {
    return 相手.indexOf(Number(p['番号'])) >= 0;
  });
}

// 動かす人（番号）を、ほかのクラスの同じ性別・近い点の人と入れ替えます。
function 入れ替えて直す_(クラス, 元の場所, 動かす番号, 離すペア) {
  const 動かす人 = クラス[元の場所].filter(function (p) { return Number(p['番号']) === 動かす番号; })[0];
  let 最良 = null;
  for (let k = 0; k < クラス.length; k++) {
    if (k === 元の場所) continue;
    クラス[k].forEach(function (相手) {
      if (相手['性別'] !== 動かす人['性別']) return;
      const 元から抜く = クラス[元の場所].filter(function (p) { return p !== 動かす人; });
      const 先から抜く = クラス[k].filter(function (p) { return p !== 相手; });
      if (同じクラスにいる_(先から抜く, Number(動かす人['番号']), 離すペア)) return;
      if (同じクラスにいる_(元から抜く, Number(相手['番号']), 離すペア)) return;
      const 差 = Math.abs(点_(動かす人) - 点_(相手));
      if (!最良 || 差 < 最良.差) 最良 = { k: k, 相手: 相手, 差: 差 };
    });
  }
  if (!最良) return false;
  クラス[元の場所] = クラス[元の場所].map(function (p) { return p === 動かす人 ? 最良.相手 : p; });
  クラス[最良.k] = クラス[最良.k].map(function (p) { return p === 最良.相手 ? 動かす人 : p; });
  return true;
}

// 「クラス分け結果」シートに、クラスごとの名簿と、人数・男女・点の平均をまとめて書きます。
function クラス分けを書き出す_(クラス, 残った問題) {
  const 最大 = Math.max.apply(null, クラス.map(function (g) { return g.length; }));
  const 表 = [クラス.map(function (g, i) { return (i + 1) + '組'; })];
  for (let r = 0; r < 最大; r++) {
    表.push(クラス.map(function (g) {
      return g[r] ? g[r]['番号'] + ' ' + g[r]['氏名'] : '';
    }));
  }
  表.push(クラス.map(function () { return ''; }));
  表.push(クラス.map(function (g) { return '人数 ' + g.length; }));
  表.push(クラス.map(function (g) {
    const 男 = g.filter(function (p) { return p['性別'] === '男'; }).length;
    const 女 = g.filter(function (p) { return p['性別'] === '女'; }).length;
    return '男 ' + 男 + ' / 女 ' + 女;
  }));
  表.push(クラス.map(function (g) {
    const 合計 = g.reduce(function (s, p) { return s + 点_(p); }, 0);
    return 'バランス点の平均 ' + (g.length ? (合計 / g.length).toFixed(2) : '-');
  }));
  残った問題.forEach(function (文) {
    表.push([文].concat(Array(クラス.length - 1).fill('')));
  });
  const 出力 = 出力シートを用意する_('クラス分け結果');
  出力.getRange(1, 1, 表.length, クラス.length).setValues(表);
}

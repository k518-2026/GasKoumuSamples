// 第12章：班づくり（第6章・第10章のコードが必要です）

function 班分けを実行する() {
  const 人 = 名簿を読む_();
  const 班数 = Number(設定を読む_('班の数', 6));
  const 離すペア = 離すペアを読む_();
  const 班 = 班を決める_(人, 班数, 離すペア, Math.random);
  班を書き出す_(班);
}

// 「離す」シートの1列目と2列目にある、同じ班にしたくない2人の番号を読みます。
function 離すペアを読む_() {
  const シート = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('離す');
  if (!シート) return [];
  const 値 = シート.getDataRange().getValues();
  const ペア = [];
  for (let i = 1; i < 値.length; i++) {
    if (値[i][0] !== '' && 値[i][1] !== '') {
      ペア.push([Number(値[i][0]), Number(値[i][1])]);
    }
  }
  return ペア;
}

// 人を混ぜて班に順番に配り、条件を守れるまでやり直します。
function 班を決める_(人, 班数, 離すペア, 乱数) {
  if (班数 < 1 || 班数 > 人.length) {
    throw new Error('班の数は、1以上、人数（' + 人.length + '人）以下にしてください。');
  }
  for (let 試し = 0; 試し < 2000; 試し++) {
    const 並び = 混ぜる_(人.slice(), 乱数);
    const 班 = [];
    for (let i = 0; i < 班数; i++) 班.push([]);
    並び.forEach(function (p, i) {
      班[i % 班数].push(p);
    });
    if (条件を守っている_(班, 離すペア)) return 班;
  }
  throw new Error('「離す」の条件を守れる班分けが見つかりませんでした。条件を減らすか、班の数を増やしてみてください。');
}

function 条件を守っている_(班, 離すペア) {
  return 離すペア.every(function (ペア) {
    return !班.some(function (グループ) {
      const 番号 = グループ.map(function (p) {
        return Number(p['番号']);
      });
      return 番号.indexOf(ペア[0]) >= 0 && 番号.indexOf(ペア[1]) >= 0;
    });
  });
}

// 班ごとに1列にして「班」シートに書き出します。
function 班を書き出す_(班) {
  const 最大人数 = Math.max.apply(null, 班.map(function (g) {
    return g.length;
  }));
  const 表 = [班.map(function (g, i) {
    return (i + 1) + '班';
  })];
  for (let r = 0; r < 最大人数; r++) {
    表.push(班.map(function (g) {
      return g[r] ? g[r]['番号'] + ' ' + g[r]['氏名'] : '';
    }));
  }
  const 出力 = 出力シートを用意する_('班');
  出力.getRange(1, 1, 表.length, 班.length).setValues(表);
}

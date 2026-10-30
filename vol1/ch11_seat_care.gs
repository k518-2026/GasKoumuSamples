// 第11章：席替え②（固定席・前列希望つき）（第6章・第10章のコードが必要です）

function 席替えを実行する配慮つき() {
  const 人 = 名簿を読む_();
  const 列数 = Number(設定を読む_('列数（横）', 6));
  const 前列の行数 = Number(設定を読む_('前列の行数', 2));
  const 配置 = 席を決める配慮つき_(人, 列数, 前列の行数, Math.random);
  座席表を書き出す_(配置);
}

// 「1行2列」のような書き方を、行と列の数字に直します。空欄なら null を返します。
function 固定席を読む_(値, 氏名) {
  if (値 === '' || 値 === null || 値 === undefined) return null;
  if (値 instanceof Date) {
    throw new Error(氏名 + ' さんの固定席が日付になっています。固定席の列を「書式なしテキスト」にして、「1行2列」の形で入れ直してください。');
  }
  const 文字 = String(値).replace(/[０-９]/g, function (c) {
    return String.fromCharCode(c.charCodeAt(0) - 0xfee0);
  });
  const m = /^\s*(\d+)\s*行\s*(\d+)\s*列\s*$/.exec(文字);
  if (!m) {
    throw new Error(氏名 + ' さんの固定席「' + 値 + '」の書き方が読み取れません。「1行2列」の形で入れてください。');
  }
  return { 行: Number(m[1]), 列: Number(m[2]) };
}

// 固定席 → 前列希望 → そのほか、の順に席を決めます。
function 席を決める配慮つき_(人, 列数, 前列の行数, 乱数) {
  const 行数 = Math.ceil(人.length / 列数);
  const 配置 = [];
  for (let r = 0; r < 行数; r++) {
    配置.push(Array(列数).fill(null));
  }

  // 1. 固定席の人を先に座らせる
  const 残り = [];
  人.forEach(function (p) {
    const 席 = 固定席を読む_(p['固定席'], p['氏名']);
    if (!席) {
      残り.push(p);
      return;
    }
    if (席.行 < 1 || 席.列 < 1 || 席.行 > 行数 || 席.列 > 列数) {
      throw new Error(p['氏名'] + ' さんの固定席「' + p['固定席'] + '」は、教室の席（' + 行数 + '行' + 列数 + '列）の外です。');
    }
    const すでに = 配置[席.行 - 1][席.列 - 1];
    if (すでに) {
      throw new Error('固定席「' + p['固定席'] + '」が、' + すでに['氏名'] + ' さんと ' + p['氏名'] + ' さんで重なっています。');
    }
    配置[席.行 - 1][席.列 - 1] = p;
  });

  // 2. 前列希望の人を、前列の空いている席にランダムに座らせる
  const 前列希望 = 残り.filter(function (p) {
    return p['前列希望'] !== '';
  });
  const そのほか = 残り.filter(function (p) {
    return p['前列希望'] === '';
  });
  const 前列の空席 = [];
  for (let r = 0; r < Math.min(前列の行数, 行数); r++) {
    for (let c = 0; c < 列数; c++) {
      if (!配置[r][c]) 前列の空席.push([r, c]);
    }
  }
  if (前列希望.length > 前列の空席.length) {
    throw new Error('前列希望の人（' + 前列希望.length + '人）が、前列の空席（' + 前列の空席.length + '席）より多くなっています。「前列の行数」を増やすか、希望を見直してください。');
  }
  混ぜる_(前列の空席, 乱数);
  前列希望.forEach(function (p, i) {
    配置[前列の空席[i][0]][前列の空席[i][1]] = p;
  });

  // 3. そのほかの人を、のこりの席（前から順）にランダムに座らせる
  const 空席 = [];
  for (let r = 0; r < 行数; r++) {
    for (let c = 0; c < 列数; c++) {
      if (!配置[r][c]) 空席.push([r, c]);
    }
  }
  混ぜる_(そのほか, 乱数).forEach(function (p, i) {
    配置[空席[i][0]][空席[i][1]] = p;
  });
  return 配置;
}

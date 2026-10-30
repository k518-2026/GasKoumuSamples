// 第10章：席替え①（ランダム）（第6章の共通部品が必要です）

// 「設定」シートの「列数（横）」を読み、名簿の全員をランダムに席へ並べます。
function 席替えを実行する() {
  const 人 = 名簿を読む_();
  const 列数 = Number(設定を読む_('列数（横）', 6));
  const 配置 = 席を決める_(人, 列数, Math.random);
  座席表を書き出す_(配置);
}

// 人を列数で区切って、行と列の表（配置）にします。席がない場所は null です。
function 席を決める_(人, 列数, 乱数) {
  const 行数 = Math.ceil(人.length / 列数);
  const 並び = 混ぜる_(人.slice(), 乱数);
  const 配置 = [];
  for (let r = 0; r < 行数; r++) {
    const 行 = [];
    for (let c = 0; c < 列数; c++) {
      行.push(並び[r * 列数 + c] || null);
    }
    配置.push(行);
  }
  return 配置;
}

// 配列をランダムに並べ替えます（トランプを切るのと同じやり方です）。
function 混ぜる_(配列, 乱数) {
  for (let i = 配列.length - 1; i > 0; i--) {
    const j = Math.floor(乱数() * (i + 1));
    const 一時 = 配列[i];
    配列[i] = 配列[j];
    配列[j] = 一時;
  }
  return 配列;
}

// 「座席表」シートに書き出します。1行目が黒板（前）側です。
function 座席表を書き出す_(配置) {
  const 列数 = 配置[0].length;
  const 表 = [['【黒板・前】'].concat(Array(列数 - 1).fill(''))];
  配置.forEach(function (行) {
    表.push(
      行.map(function (p) {
        return p ? p['番号'] + ' ' + p['氏名'] : '';
      })
    );
  });
  const 出力 = 出力シートを用意する_('座席表');
  出力.getRange(1, 1, 表.length, 列数).setValues(表);
}

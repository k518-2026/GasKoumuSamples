// 第7章：並べ替え・集計・絞り込み（第6章の共通部品が必要です）

// 指定した見出しの列で、名簿を小さい順（五十音順）に並べ替えます。
function 並べ替える_(列の見出し) {
  const シート = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('名簿');
  const 列数 = シート.getLastColumn();
  const 見出し = シート.getRange(1, 1, 1, 列数).getValues()[0];
  const 列 = 見出し.indexOf(列の見出し) + 1;
  if (列 === 0) {
    throw new Error('「' + 列の見出し + '」という見出しの列が見つかりません。');
  }
  const 人数 = シート.getLastRow() - 1;
  シート.getRange(2, 1, 人数, 列数).sort({ column: 列, ascending: true });
}

function 名簿を五十音順に並べる() {
  並べ替える_('ふりがな');
}

function 名簿を番号順に並べる() {
  並べ替える_('番号');
}

// 性別ごとの人数を「集計」シートに書き出します。
function 人数を集計する() {
  const 人 = 名簿を読む_();
  const 数 = {};
  人.forEach(function (p) {
    const 区分 = p['性別'] === '' ? '未入力' : p['性別'];
    数[区分] = (数[区分] || 0) + 1;
  });
  const 表 = [['区分', '人数'], ['全体', 人.length]];
  Object.keys(数).forEach(function (区分) {
    表.push([区分, 数[区分]]);
  });
  const 出力 = 出力シートを用意する_('集計');
  出力.getRange(1, 1, 表.length, 2).setValues(表);
}

// 「前列希望」に何か入っている人を、別のシートに取り出します。
function 前列希望の人を取り出す() {
  const 人 = 名簿を読む_().filter(function (p) {
    return p['前列希望'] !== '';
  });
  const 表 = [['番号', '氏名']];
  人.forEach(function (p) {
    表.push([p['番号'], p['氏名']]);
  });
  const 出力 = 出力シートを用意する_('前列希望');
  出力.getRange(1, 1, 表.length, 2).setValues(表);
}

// 第4章：提出状況の確認と、未提出者の一覧（第2章の共通部品が必要です）

// 名簿の全員について、回答があるかどうかを調べます。同じ人が何回か出したときは、いちばん新しい日時を使います。
function 提出状況を調べる_(人, 回答, 番号の見出し, 日時の見出し) {
  const 結果 = {};
  const 名簿にない = [];
  回答.forEach(function (r) {
    const 番号 = 番号にそろえる_(r[番号の見出し]);
    if (isNaN(番号)) return;
    if (!人.some(function (p) { return Number(p['番号']) === 番号; })) {
      名簿にない.push(番号);
      return;
    }
    const 日時 = r[日時の見出し];
    if (!結果[番号]) {
      結果[番号] = { 日時: 日時, 件数: 1 };
    } else {
      結果[番号].件数++;
      if (日時 > 結果[番号].日時) 結果[番号].日時 = 日時;
    }
  });
  const 一覧 = 人.map(function (p) {
    const x = 結果[Number(p['番号'])];
    return { 番号: p['番号'], 氏名: p['氏名'], 提出: !!x, 日時: x ? x.日時 : '', 件数: x ? x.件数 : 0 };
  });
  return { 一覧: 一覧, 名簿にない番号: 名簿にない };
}

// 「提出状況」シートに、全員の提出状況と、未提出の人数を書き出します。
function 提出状況を確認する() {
  const 人 = 名簿を読む_();
  const 見出し = String(設定を読む_('番号の見出し', '番号'));
  const 結果 = 提出状況を調べる_(人, 表を読む_(回答シートを取る_()), 見出し, 'タイムスタンプ');
  const 出した = 結果.一覧.filter(function (x) { return x.提出; }).length;
  const 表 = [['提出 ' + 出した + '人 ／ 全体 ' + 結果.一覧.length + '人（未提出 ' + (結果.一覧.length - 出した) + '人）', '', '', '', '']];
  表.push(['番号', '氏名', '提出', '提出した日時', '回答の回数']);
  結果.一覧.forEach(function (x) {
    表.push([
      x.番号,
      x.氏名,
      x.提出 ? '○' : '未提出',
      x.日時 instanceof Date ? Utilities.formatDate(x.日時, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm') : '',
      x.件数,
    ]);
  });
  if (結果.名簿にない番号.length > 0) {
    表.push(['名簿にない番号の回答：' + 結果.名簿にない番号.join('、'), '', '', '', '']);
  }
  const 出力 = 出力シートを用意する_('提出状況');
  出力.getRange(1, 1, 表.length, 5).setValues(表);
}

// 第6章：出欠・欠席連絡の集計（第2章の共通部品が必要です）
// フォームの質問：日付、番号、区分（欠席・遅刻・早退）、理由（体調不良・家庭の都合・その他）

// 日付の値（日付型でも「2026/10/19」のような文字でも）を「2026/10/19」の形にそろえます。
function 日付の文字にする_(値) {
  if (値 instanceof Date) return Utilities.formatDate(値, 'Asia/Tokyo', 'yyyy/MM/dd');
  const 部分 = String(値).replace(/-/g, '/').split('/');
  if (部分.length !== 3) return String(値);
  return 部分[0] + '/' + ('0' + 部分[1]).slice(-2) + '/' + ('0' + 部分[2]).slice(-2);
}

// 指定した日の連絡だけを選びます。
function 連絡を選ぶ_(回答, 日付の文字, 日付の見出し) {
  return 回答.filter(function (r) {
    return 日付の文字にする_(r[日付の見出し]) === 日付の文字;
  });
}

// 「本日の連絡」シートに、きょうの連絡の一覧を書き出します。
function 本日の連絡をまとめる() {
  const 人 = 名簿を読む_();
  const 回答 = 表を読む_(回答シートを取る_());
  const 今日 = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd');
  const 連絡 = 連絡を選ぶ_(回答, 今日, '日付');
  const 表 = [[今日 + ' の連絡 ' + 連絡.length + '件', '', '', ''], ['番号', '氏名', '区分', '理由']];
  連絡.forEach(function (r) {
    const 番号 = 番号にそろえる_(r['番号']);
    const p = 人.filter(function (x) { return Number(x['番号']) === 番号; })[0];
    表.push([isNaN(番号) ? r['番号'] : 番号, p ? p['氏名'] : '（名簿にない番号）', r['区分'], r['理由']]);
  });
  出力シートを用意する_('本日の連絡').getRange(1, 1, 表.length, 4).setValues(表);
}

// 日ごとに、欠席・遅刻・早退が何人かを数えて、「日別集計」シートに書き出します。
function 日別に集計する() {
  const 回答 = 表を読む_(回答シートを取る_());
  const 区分一覧 = ['欠席', '遅刻', '早退'];
  const 日別 = {};
  回答.forEach(function (r) {
    const 日 = 日付の文字にする_(r['日付']);
    if (!日別[日]) 日別[日] = { 欠席: 0, 遅刻: 0, 早退: 0 };
    if (区分一覧.indexOf(r['区分']) >= 0) 日別[日][r['区分']]++;
  });
  const 表 = [['日付'].concat(区分一覧)];
  Object.keys(日別).sort().forEach(function (日) {
    表.push([日].concat(区分一覧.map(function (k) { return 日別[日][k]; })));
  });
  出力シートを用意する_('日別集計').getRange(1, 1, 表.length, 4).setValues(表);
}

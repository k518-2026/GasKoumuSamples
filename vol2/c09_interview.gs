// 第9章：個人面談の日程調整（第2章の共通部品が必要です）
// 「面談設定」シート：見出しは「日付」「開始」「終了」「1枠の分」。
//   「開始」「終了」の列は、書式を「書式なしテキスト」にして「15:00」の形で入れます。
// フォームの質問：番号、希望の日時（選択式）。設定シートに「フォームID」を入れておきます。

// 「15:00」を、分の数（900）にします。読み取れなければエラーにします。
function 時刻を分にする_(文字, 見出し) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(文字).trim());
  if (!m) {
    throw new Error('面談設定の「' + 見出し + '」が読み取れません（「' + 文字 + '」）。列を「書式なしテキスト」にして、「15:00」の形で入れ直してください。');
  }
  return Number(m[1]) * 60 + Number(m[2]);
}

function 分を時刻にする_(分) {
  return ('0' + Math.floor(分 / 60)).slice(-2) + ':' + ('0' + (分 % 60)).slice(-2);
}

// 面談設定の1行から、「11/10 15:00〜15:15」のような枠の一覧を作ります。
function 面談枠の一覧を作る_(設定の行) {
  const 枠 = [];
  設定の行.forEach(function (r) {
    const 日 = r['日付'] instanceof Date ? Utilities.formatDate(r['日付'], 'Asia/Tokyo', 'M/d') : String(r['日付']);
    const 開始 = 時刻を分にする_(r['開始'], '開始');
    const 終了 = 時刻を分にする_(r['終了'], '終了');
    const 長さ = Number(r['1枠の分']);
    if (!(長さ > 0)) throw new Error('面談設定の「1枠の分」が正しくありません。');
    for (let t = 開始; t + 長さ <= 終了; t += 長さ) {
      枠.push(日 + ' ' + 分を時刻にする_(t) + '〜' + 分を時刻にする_(t + 長さ));
    }
  });
  return 枠;
}

// 先に回答した人から順に、希望の枠を決めます。同じ枠を選んだ後の人は「重複」として分けます。
function 面談日程を決める_(回答, 枠の見出し) {
  const 最新 = {};
  回答.forEach(function (r) {
    const n = 番号にそろえる_(r['番号']);
    if (isNaN(n)) return;
    if (!最新[n] || r['タイムスタンプ'] > 最新[n]['タイムスタンプ']) 最新[n] = r;
  });
  const 順 = Object.keys(最新)
    .map(function (n) { return { 番号: Number(n), 回答: 最新[n] }; })
    .sort(function (a, b) { return a.回答['タイムスタンプ'] - b.回答['タイムスタンプ']; });
  const 決定 = {};
  const 重複 = [];
  順.forEach(function (x) {
    const 枠 = String(x.回答[枠の見出し]);
    if (決定[枠] === undefined) {
      決定[枠] = x.番号;
    } else {
      重複.push({ 番号: x.番号, 枠: 枠 });
    }
  });
  return { 決定: 決定, 重複: 重複 };
}

// 「面談枠」シートに、枠の一覧を書き出します。
function 面談枠を作る() {
  const シート = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('面談設定');
  if (!シート) throw new Error('「面談設定」という名前のシートが見つかりません。');
  const 枠 = 面談枠の一覧を作る_(表を読む_(シート));
  const 表 = [['枠']].concat(枠.map(function (s) { return [s]; }));
  出力シートを用意する_('面談枠').getRange(1, 1, 表.length, 1).setValues(表);
}

// フォームの「希望の日時」の選択肢を、まだ空いている枠だけにします。
function 空き枠をフォームに反映する() {
  const 枠 = 表を読む_(SpreadsheetApp.getActiveSpreadsheet().getSheetByName('面談枠')).map(function (r) { return r['枠']; });
  const 質問名 = String(設定を読む_('枠の質問名', '希望の日時'));
  const 回答 = 表を読む_(回答シートを取る_());
  const 決まった = 面談日程を決める_(回答, 質問名).決定;
  const 空き = 枠.filter(function (s) { return 決まった[s] === undefined; });
  if (空き.length === 0) throw new Error('空いている枠がありません。');
  const フォーム = FormApp.openById(String(設定を読む_('フォームID', '')));
  const 項目 = フォーム.getItems().filter(function (i) { return i.getTitle() === 質問名; })[0];
  if (!項目) throw new Error('フォームに「' + 質問名 + '」という質問が見つかりません。');
  項目.asMultipleChoiceItem().setChoiceValues(空き);
  Logger.log('空き枠 ' + 空き.length + ' 件をフォームに反映しました');
}

// 「面談日程」シートに、日程の一覧と、調整が必要な人を書き出します。
function 面談日程をまとめる() {
  const 人 = 名簿を読む_();
  const 枠 = 表を読む_(SpreadsheetApp.getActiveSpreadsheet().getSheetByName('面談枠')).map(function (r) { return r['枠']; });
  const 質問名 = String(設定を読む_('枠の質問名', '希望の日時'));
  const 結果 = 面談日程を決める_(表を読む_(回答シートを取る_()), 質問名);
  const 氏名 = function (n) {
    const p = 人.filter(function (x) { return Number(x['番号']) === n; })[0];
    return p ? p['氏名'] : '（名簿にない番号）';
  };
  const 表 = [['日時', '番号', '氏名']];
  枠.forEach(function (s) {
    const n = 結果.決定[s];
    表.push(n === undefined ? [s, '', '（空き）'] : [s, n, 氏名(n)]);
  });
  if (結果.重複.length > 0) {
    表.push(['', '', '']);
    表.push(['調整が必要（先に決まった人がいる枠を選びました）', '', '']);
    結果.重複.forEach(function (x) {
      表.push([x.枠, x.番号, 氏名(x.番号)]);
    });
  }
  出力シートを用意する_('面談日程').getRange(1, 1, 表.length, 3).setValues(表);
}

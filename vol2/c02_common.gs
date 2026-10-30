// 第2章：共通部品（第1巻と同じ部品を含みます。第1巻のコードが入っていても、重なって問題ありません）

// シートを読んで、1行を1人分（見出し→値）の一覧にして返します。空の行は飛ばします。
function 表を読む_(シート) {
  const 値 = シート.getDataRange().getValues();
  const 見出し = 値[0];
  const 一覧 = [];
  for (let i = 1; i < 値.length; i++) {
    if (値[i].every(function (v) { return v === ''; })) continue;
    const 行 = {};
    見出し.forEach(function (名前, j) {
      行[名前] = 値[i][j];
    });
    行['_行'] = i + 1; // シートの何行目か
    一覧.push(行);
  }
  return 一覧;
}

function 名簿を読む_() {
  const シート = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('名簿');
  if (!シート) {
    throw new Error('「名簿」という名前のシートが見つかりません。シートの名前を確かめてください。');
  }
  return 表を読む_(シート);
}

// 「設定」シートから、項目名に合う値を取り出します。なければ既定値を返します。
function 設定を読む_(項目名, 既定値) {
  const シート = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('設定');
  if (!シート) return 既定値;
  const 値 = シート.getDataRange().getValues();
  for (let i = 0; i < 値.length; i++) {
    if (値[i][0] === 項目名 && 値[i][1] !== '') return 値[i][1];
  }
  return 既定値;
}

// 結果を書き出すシートを用意します。あれば中身を消し、なければ作ります。
function 出力シートを用意する_(名前) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let シート = ss.getSheetByName(名前);
  if (シート) {
    シート.clear();
  } else {
    シート = ss.insertSheet(名前);
  }
  return シート;
}

// フォームの回答が入るシートを返します（名前が「フォームの回答」で始まるシート）。
function 回答シートを取る_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const 指定 = String(設定を読む_('回答シート名', ''));
  if (指定) {
    const シート = ss.getSheetByName(指定);
    if (!シート) throw new Error('「' + 指定 + '」という名前のシートが見つかりません。');
    return シート;
  }
  const 候補 = ss.getSheets().filter(function (s) {
    return s.getName().indexOf('フォームの回答') === 0;
  });
  if (候補.length === 0) {
    throw new Error('「フォームの回答」で始まるシートが見つかりません。フォームの回答先に、このスプレッドシートを指定したか確かめてください。');
  }
  return 候補[0];
}

// 「5」「５」「5番」などを、数字の 5 にそろえます。読み取れなければ NaN を返します。
function 番号にそろえる_(値) {
  const 文字 = String(値)
    .replace(/[０-９]/g, function (c) {
      return String.fromCharCode(c.charCodeAt(0) - 0xfee0);
    })
    .replace(/[^0-9]/g, '');
  return 文字 === '' ? NaN : Number(文字);
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

// 動作確認用：回答シートの見出しと件数を、実行ログに出します。
function 回答を確認する() {
  const シート = 回答シートを取る_();
  const 見出し = シート.getRange(1, 1, 1, シート.getLastColumn()).getValues()[0];
  Logger.log('シート名：' + シート.getName());
  Logger.log('見出し：' + 見出し.join('／'));
  Logger.log('回答の件数：' + 表を読む_(シート).length + '件');
}

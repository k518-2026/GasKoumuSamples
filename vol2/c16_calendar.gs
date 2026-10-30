// 第16章：行事予定をカレンダーに一括で登録する（第2章の共通部品が必要です）
// 「行事予定」シート：見出しは「日付」「行事名」「開始」「終了」「場所」「説明」「登録済」。
//   「開始」「終了」の列は、書式を「書式なしテキスト」にして「9:00」の形で入れます。空欄なら終日の予定です。
// 「設定」シートの「カレンダー名」に、登録先のカレンダーの名前を入れます（空欄なら、自分の標準のカレンダー）。

// 「9:00」を {時, 分} にします。読み取れなければエラーにします。
function 時刻を読む_(文字, 行番号, 見出し) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(文字).trim());
  if (!m) {
    throw new Error(行番号 + '行目の「' + 見出し + '」が読み取れません（「' + 文字 + '」）。列を「書式なしテキスト」にして、「9:00」の形で入れ直してください。');
  }
  return { 時: Number(m[1]), 分: Number(m[2]) };
}

// 日付型の値、または「2026/11/3」のような文字から、日付を作ります。
function 日付を読む_(値, 行番号) {
  if (値 instanceof Date) return new Date(値.getFullYear(), 値.getMonth(), 値.getDate());
  const m = /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/.exec(String(値).trim());
  if (!m) throw new Error(行番号 + '行目の「日付」が読み取れません（「' + 値 + '」）。「2026/11/3」の形で入れてください。');
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function カレンダーを選ぶ_() {
  const 名前 = String(設定を読む_('カレンダー名', ''));
  if (名前 === '') return CalendarApp.getDefaultCalendar();
  const 候補 = CalendarApp.getCalendarsByName(名前);
  if (候補.length === 0) throw new Error('「' + 名前 + '」という名前のカレンダーが見つかりません。');
  return 候補[0];
}

function 行事を登録する() {
  const ui = SpreadsheetApp.getUi();
  const シート = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('行事予定');
  if (!シート) throw new Error('「行事予定」という名前のシートが見つかりません。');
  const 見出し = シート.getRange(1, 1, 1, シート.getLastColumn()).getValues()[0];
  const 登録済の列 = 見出し.indexOf('登録済') + 1;
  if (登録済の列 === 0) throw new Error('「行事予定」シートに、「登録済」という見出しの列がありません。');
  const 行一覧 = 表を読む_(シート).filter(function (r) { return r['登録済'] !== '○'; });
  if (行一覧.length === 0) {
    ui.alert('これから登録する予定はありません。');
    return;
  }
  const カレンダー = カレンダーを選ぶ_();
  const 答え = ui.alert('確認', 行一覧.length + '件の予定を、カレンダー「' + カレンダー.getName() + '」に登録します。よろしいですか？', ui.ButtonSet.YES_NO);
  if (答え !== ui.Button.YES) return;

  let 登録した = 0;
  let 飛ばした = 0;
  行一覧.forEach(function (r) {
    const 日 = 日付を読む_(r['日付'], r['_行']);
    const 名前 = String(r['行事名']);
    const 同じ予定 = カレンダー.getEventsForDay(日).some(function (e) { return e.getTitle() === 名前; });
    if (!同じ予定) {
      const 詳細 = { location: String(r['場所']), description: String(r['説明']) };
      if (r['開始'] === '') {
        カレンダー.createAllDayEvent(名前, 日, 詳細);
      } else {
        const 始 = 時刻を読む_(r['開始'], r['_行'], '開始');
        const 終 = 時刻を読む_(r['終了'] === '' ? r['開始'] : r['終了'], r['_行'], '終了');
        カレンダー.createEvent(
          名前,
          new Date(日.getFullYear(), 日.getMonth(), 日.getDate(), 始.時, 始.分),
          new Date(日.getFullYear(), 日.getMonth(), 日.getDate(), 終.時, 終.分),
          詳細
        );
      }
      登録した++;
    } else {
      飛ばした++;
    }
    シート.getRange(r['_行'], 登録済の列).setValue('○');
  });
  ui.alert('終わりました。\n登録した：' + 登録した + '件\nすでにあり、飛ばした：' + 飛ばした + '件');
}

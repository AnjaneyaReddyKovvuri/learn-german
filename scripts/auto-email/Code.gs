/**
 * Anshi German Learning App – automatic daily progress email (Google Apps Script)
 *
 * Runs in YOUR Google account: the app sends each day's practice numbers here,
 * they are stored in a Google Sheet in your Drive, and every evening you get an
 * email from your own Gmail. Setup: see docs/AUTO-EMAIL.md in the app's repository.
 */

const CONFIG = {
  EMAIL: '',                    // where to send the report; empty = your own Google address
  HOUR: 20,                     // send around this hour (script time zone, see Project Settings)
  SEND_WHEN_NO_PRACTICE: true,  // also send an email on days without practice
  SHEET_NAME: 'Anshi – Deutsch-Fortschritt',
};

const HEADERS = ['Datum', 'Name', 'Spiel geübt', 'Spiel richtig', 'Fälle geübt', 'Fälle richtig', 'Minuten (ms)', 'Fehler', 'Aktualisiert'];
const WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

/** Run once (▶ Run "setup"): creates the sheet, the key and the daily trigger. */
function setup() {
  const props = PropertiesService.getScriptProperties();
  let secret = props.getProperty('SECRET');
  if (!secret) {
    secret = Utilities.getUuid().replace(/-/g, '').slice(0, 10);
    props.setProperty('SECRET', secret);
  }
  const sheet = getSheet_();
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === 'sendDailyReport')
    .forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('sendDailyReport').timeBased().everyDays(1).atHour(CONFIG.HOUR).nearMinute(0).create();
  Logger.log('✅ Fertig · Done');
  Logger.log('Schlüssel für die App · key for the app: ' + secret);
  Logger.log('Tabelle · sheet: ' + sheet.getParent().getUrl());
  Logger.log('Tägliche E-Mail um ca. ' + CONFIG.HOUR + ':00 Uhr an ' + recipient_());
}

/** The app posts here (deployed as a web app). */
function doPost(e) {
  let p;
  try {
    p = JSON.parse(e.postData.contents);
  } catch (err) {
    return text_('bad request');
  }
  const secret = PropertiesService.getScriptProperties().getProperty('SECRET');
  if (!secret || p.secret !== secret) return text_('wrong key');
  if (p.name) PropertiesService.getScriptProperties().setProperty('NAME', String(p.name).slice(0, 40));
  if (Array.isArray(p.days)) {
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      p.days.forEach((d) => upsertDay_(d, String(p.name || '')));
    } finally {
      lock.releaseLock();
    }
  }
  if (p.test) sendReport_(true);
  return text_('ok');
}

/** Opening the web app address in a browser shows that it is running. */
function doGet() {
  return text_('Anshi German Learning App – Bericht-Skript läuft · report script is running');
}

/** Called by the daily trigger. */
function sendDailyReport() {
  sendReport_(false);
}

// ---------------------------------------------------------------------------

function getSheet_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('SHEET_ID');
  if (id) {
    try {
      return SpreadsheetApp.openById(id).getSheets()[0];
    } catch (err) { /* deleted: create a new one */ }
  }
  const ss = SpreadsheetApp.create(CONFIG.SHEET_NAME);
  const sheet = ss.getSheets()[0];
  sheet.setName('Tage');
  sheet.appendRow(HEADERS);
  sheet.setFrozenRows(1);
  sheet.getRange('A:A').setNumberFormat('@'); // keep dates as text (yyyy-MM-dd)
  props.setProperty('SHEET_ID', ss.getId());
  return sheet;
}

function upsertDay_(d, name) {
  if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(d.date)) return;
  const sheet = getSheet_();
  const row = [
    d.date, name,
    num_(d.game && d.game.n), num_(d.game && d.game.c),
    num_(d.cases && d.cases.n), num_(d.cases && d.cases.c),
    num_(d.ms), JSON.stringify(d.mistakes || {}), new Date(),
  ];
  const last = sheet.getLastRow();
  if (last > 1) {
    const dates = sheet.getRange(2, 1, last - 1, 1).getDisplayValues();
    for (let i = 0; i < dates.length; i++) {
      if (dates[i][0] === d.date) {
        sheet.getRange(i + 2, 1, 1, row.length).setValues([row]);
        return;
      }
    }
  }
  sheet.appendRow(row);
}

function readDays_() {
  const sheet = getSheet_();
  const last = sheet.getLastRow();
  const days = {};
  if (last < 2) return days;
  sheet.getRange(2, 1, last - 1, HEADERS.length).getDisplayValues().forEach((r) => {
    let mistakes = {};
    try { mistakes = JSON.parse(r[7] || '{}'); } catch (err) { /* ignore */ }
    days[r[0]] = { name: r[1], game: { n: +r[2] || 0, c: +r[3] || 0 }, cases: { n: +r[4] || 0, c: +r[5] || 0 }, ms: +r[6] || 0, mistakes };
  });
  return days;
}

function sendReport_(isTest) {
  const tz = Session.getScriptTimeZone();
  const days = readDays_();
  const keyOf = (offset) => Utilities.formatDate(new Date(Date.now() - offset * 86400000), tz, 'yyyy-MM-dd');
  const todayKey = keyOf(0);
  const today = summary_([days[todayKey]]);
  const week = summary_([0, 1, 2, 3, 4, 5, 6].map((i) => days[keyOf(i)]));
  if (!today.n && !CONFIG.SEND_WHEN_NO_PRACTICE && !isTest) return;

  const names = Object.keys(days).sort().map((k) => days[k].name).filter(Boolean);
  const name = PropertiesService.getScriptProperties().getProperty('NAME') || (names.length ? names[names.length - 1] : 'Mein Kind');
  const longDate = germanDate_(todayKey);
  const L = [];
  if (isTest) L.push('✅ Test: Die automatische E-Mail ist eingerichtet. · The automatic email is set up.', '');
  L.push(name + ' – Deutsch-Bericht für ' + longDate, '');
  if (!today.n) {
    L.push('Heute nicht geübt. · No practice today.');
  } else {
    const m = minutes_(today.ms);
    L.push('Geübt · practised: ' + today.n + ' Wörter/Sätze in ' + m + (m === 1 ? ' Minute' : ' Minuten'));
    L.push('Richtig · correct: ' + today.c + ' von ' + today.n + ' (' + pct_(today.c, today.n) + ' %)');
    if (today.game.n) L.push('  • Artikel-Spiel · article game: ' + today.game.n + ' Wörter, ' + pct_(today.game.c, today.game.n) + ' % richtig');
    if (today.cases.n) L.push('  • Fälle · cases: ' + today.cases.n + ' Sätze, ' + pct_(today.cases.c, today.cases.n) + ' % richtig');
    if (today.top.length) {
      L.push('', 'Häufigste Fehler · most frequent mistakes:');
      today.top.slice(0, 6).forEach((t) => L.push('  • ' + t[0] + (t[1] > 1 ? ' (' + t[1] + '×)' : '')));
    }
  }
  L.push('', 'Letzte 7 Tage · last 7 days: ' + week.days + ' Tage geübt, ' + week.n + ' Wörter/Sätze' +
    (week.n ? ', ' + pct_(week.c, week.n) + ' % richtig, ' + minutes_(week.ms) + ' Minuten' : ''));
  let streak = 0;
  for (let i = today.n ? 0 : 1; ; i++) {
    const d = days[keyOf(i)];
    if (d && d.game.n + d.cases.n > 0) streak++; else break;
  }
  if (streak > 1) L.push('🔥 ' + streak + ' Tage in Folge geübt · ' + streak + ' days in a row');
  L.push('', '— Anshi German Learning App (automatische E-Mail · automatic email)');

  MailApp.sendEmail({
    to: recipient_(),
    subject: (isTest ? '[Test] ' : '') + name + ' – Deutsch-Bericht · German report – ' + longDate,
    body: L.join('\n'),
  });
  PropertiesService.getScriptProperties().setProperty('LAST_SENT', new Date().toISOString());
}

function summary_(list) {
  const s = { days: 0, n: 0, c: 0, ms: 0, game: { n: 0, c: 0 }, cases: { n: 0, c: 0 }, mistakes: {} };
  list.forEach((d) => {
    if (!d) return;
    const n = d.game.n + d.cases.n;
    if (!n) return;
    s.days++; s.n += n; s.c += d.game.c + d.cases.c; s.ms += d.ms;
    s.game.n += d.game.n; s.game.c += d.game.c; s.cases.n += d.cases.n; s.cases.c += d.cases.c;
    Object.keys(d.mistakes).forEach((k) => { s.mistakes[k] = (s.mistakes[k] || 0) + d.mistakes[k]; });
  });
  s.top = Object.keys(s.mistakes).map((k) => [k, s.mistakes[k]]).sort((a, b) => b[1] - a[1]);
  return s;
}

function germanDate_(key) {
  const p = key.split('-').map(Number);
  const d = new Date(p[0], p[1] - 1, p[2], 12);
  return WEEKDAYS[d.getDay()] + ', ' + p[2] + '. ' + MONTHS[p[1] - 1] + ' ' + p[0];
}
function recipient_() { return CONFIG.EMAIL || Session.getEffectiveUser().getEmail(); }
function pct_(c, n) { return n ? Math.round((c / n) * 100) : 0; }
function minutes_(ms) { return Math.max(ms ? 1 : 0, Math.round(ms / 60000)); }
function num_(v) { return Number(v) || 0; }
function text_(s) { return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.TEXT); }

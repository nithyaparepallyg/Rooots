/**
 * Rooots — free demo registration backend (Google Apps Script + Google Sheet).
 * Paste this whole file into Extensions → Apps Script of your Google Sheet. Setup steps are in the README.
 *
 * Admin password: Project Settings (gear icon) → Script properties → add
 *   Property: ADMIN_PASSWORD    Value: <your password>
 * It stays inside your Google account and is never in the public website code.
 */

const CAPACITY = 30;                                       // total kids' seats
const EVENT_START = new Date('2026-11-29T18:30:00+05:30'); // registrations close at this time
const MAX_KIDS_PER_FAMILY = 3;
const SHEET_NAME = 'Registrations';
const HEADER = ['Ticket', 'Registered at', 'Parent name', 'WhatsApp number', 'Instagram',
                'Kids', 'Children (age)', 'Says they follow', 'Instagram verified', 'Checked in'];
const COL = { ticket: 1, kids: 6, verified: 9, checkedIn: 10 };

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADER);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADER.length).setFontWeight('bold');
  }
  return sh;
}

function rows_(sh) {
  const n = sh.getLastRow() - 1;
  return n < 1 ? [] : sh.getRange(2, 1, n, HEADER.length).getDisplayValues();
}

function taken_(rows) {
  return rows.reduce(function (sum, r) { return sum + (Number(r[COL.kids - 1]) || 0); }, 0);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function status_(rows) {
  const taken = taken_(rows);
  return { capacity: CAPACITY, taken: taken, left: Math.max(0, CAPACITY - taken), open: new Date() < EVENT_START };
}

function isAdmin_(password) {
  const real = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD');
  return !!real && String(password || '') === real;
}

function ticketFromRow_(r) {
  return { id: r[0], parent: r[2], instagram: r[4], kids: Number(r[5]) || 0, children: r[6] };
}

function clean_(s, max) { return String(s == null ? '' : s).replace(/[\r\n\t]+/g, ' ').trim().slice(0, max); }

// A value starting with = + - @ could run as a formula in Sheets; neutralise it.
function safe_(s) { return /^[=+\-@]/.test(s) ? "'" + s : s; }

/** GET → live seat count (public). */
function doGet() {
  return json_(Object.assign({ ok: true }, status_(rows_(sheet_()))));
}

/** POST → register | admin_list | admin_toggle */
function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'bad_request' }); }

  if (d.action === 'admin_list' || d.action === 'admin_toggle' || d.action === 'admin_delete') {
    if (!isAdmin_(d.password)) return json_({ ok: false, error: 'wrong_password' });
    const sh = sheet_();
    if (d.action === 'admin_delete') {
      const lock = LockService.getScriptLock();
      lock.waitLock(20000);
      try {
        const i = rows_(sh).findIndex(function (r) { return r[0] === d.ticket; });
        if (i < 0) return json_({ ok: false, error: 'not_found' });
        sh.deleteRow(i + 2); // the seats go back into the pool straight away
      } finally { lock.releaseLock(); }
    }
    if (d.action === 'admin_toggle') {
      const col = d.field === 'verified' ? COL.verified : d.field === 'checkedIn' ? COL.checkedIn : 0;
      const rows = rows_(sh);
      const i = rows.findIndex(function (r) { return r[0] === d.ticket; });
      if (!col || i < 0) return json_({ ok: false, error: 'not_found' });
      sh.getRange(i + 2, col).setValue(d.value ? 'Yes' : '');
    }
    const rows = rows_(sh);
    return json_(Object.assign({ ok: true, header: HEADER, rows: rows }, status_(rows)));
  }

  // ---- register ----
  if (new Date() >= EVENT_START) return json_({ ok: false, error: 'closed' });

  const parent = clean_(d.parent, 80);
  const phone = String(d.phone || '').replace(/\D/g, '').slice(-10);
  const insta = String(d.instagram || '').trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '').replace(/[/?#].*$/, '');
  const kids = Array.isArray(d.children) ? d.children.slice(0, MAX_KIDS_PER_FAMILY) : [];
  const kidsOk = kids.length > 0 && kids.every(function (k) {
    const age = Number(k.age); return clean_(k.name, 40) && age >= 4 && age <= 12;
  });

  if (!parent || phone.length !== 10 || !/^[A-Za-z0-9._]{1,30}$/.test(insta) || !kidsOk || d.follows !== true) {
    return json_({ ok: false, error: 'invalid' });
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = sheet_();
    let rows = rows_(sh);

    const dup = rows.find(function (r) { return String(r[3]).replace(/\D/g, '').slice(-10) === phone; });
    if (dup) return json_(Object.assign({ ok: true, duplicate: true, ticket: ticketFromRow_(dup) }, status_(rows)));

    const taken = taken_(rows);
    if (taken + kids.length > CAPACITY) {
      return json_(Object.assign({ ok: false, error: 'full' }, status_(rows)));
    }

    // Ticket numbers keep counting up even after a deletion, so a number is never reused.
    const props = PropertiesService.getScriptProperties();
    const next = Number(props.getProperty('NEXT_TICKET') || rows.length + 1);
    props.setProperty('NEXT_TICKET', String(next + 1));
    const id = 'RT-' + String(next).padStart(3, '0');
    const children = kids.map(function (k) { return clean_(k.name, 40) + ' (' + Number(k.age) + ')'; }).join(', ');
    sh.appendRow([id, new Date(), safe_(parent), "'" + phone, "'@" + insta, kids.length, safe_(children), 'Yes', '', '']);
    SpreadsheetApp.flush();

    rows = rows_(sh);
    return json_(Object.assign({ ok: true, ticket: ticketFromRow_(rows[rows.length - 1]) }, status_(rows)));
  } finally {
    lock.releaseLock();
  }
}

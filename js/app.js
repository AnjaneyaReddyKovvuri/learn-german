/* Anshi German Learning App – der / die / das practice tool */
(() => {
  "use strict";

  const ARTICLES = ["der", "die", "das"];
  const CUSTOM_KEY = "artikel.custom";
  const MISTAKES_KEY = "artikel.mistakes";
  const BEST_KEY = "artikel.best";
  const SETTINGS_KEY = "artikel.settings";
  const DEFAULT_CUSTOM_CATEGORY = "Meine Wörter";
  const CUSTOM_ICON = "⭐";

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); }
      catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
    },
  };

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const keyOf = (e) => `${e.article} ${e.noun}`;
  const collator = new Intl.Collator("de");
  // Keyboard shortcuts are ignored while typing in these (checkboxes don't block them).
  const TEXT_INPUT = 'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]), select, textarea';
  // Show the share of correct answers ("85 %"), coloured green / orange / red.
  function showPct(node, correct, wrong) {
    const total = correct + wrong;
    const pct = total ? Math.round((correct / total) * 100) : null;
    node.textContent = pct == null ? "–" : `${pct} %`;
    node.className = "pct" + (pct == null ? "" : pct >= 80 ? " good" : pct >= 50 ? " ok" : " low");
    node.title = total ? `${correct} von ${total} richtig · ${correct} of ${total} correct` : "";
  }
  // English search: match at word starts; a phrase like "to go" must end on a word boundary ("to go" ≠ "to govern").
  const enMatch = (en, q) => {
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z])${safe}${q.includes(" ") ? "(?![a-z])" : ""}`).test(en);
  };

  function toast(msg, ms = 2500) {
    const t = $("#toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { t.hidden = true; }, ms);
  }

  /* ------------------------------------------------------------------ */
  /* Data                                                                */
  /* ------------------------------------------------------------------ */

  const LINE_RE = /^(der|die|das)\s+(.+?)\s*,\s*(.*)$/;

  function parseBaseData() {
    const entries = [];
    const categories = [];
    for (const block of window.NOUN_DATA || []) {
      categories.push({ name: block.category, icon: block.icon, extended: !!block.extended, pinned: !!block.pinned });
      const seenInCat = new Set();
      for (const raw of block.words.split("\n")) {
        const m = raw.trim().match(LINE_RE);
        if (!m) continue;
        const entry = { article: m[1], noun: m[2], english: m[3], category: block.category, custom: false };
        if (seenInCat.has(keyOf(entry))) continue;
        seenInCat.add(keyOf(entry));
        entries.push(entry);
      }
    }
    return { entries, categories };
  }

  const base = parseBaseData();
  let custom = store.get(CUSTOM_KEY, []);

  // Derived state, rebuilt whenever custom words change.
  let allEntries = [];     // every (word, category) membership
  let gameWords = [];      // unique words for the game's "all categories" (without the extended vocabulary)
  let categories = [];     // [{name, icon}]
  let uniqueWords = [];    // one entry per "article noun" – used by the game
  let articlesByNoun = new Map(); // noun(lowercase) -> Set of articles

  function rebuild() {
    allEntries = base.entries.concat(custom.map((c) => ({ ...c, custom: true })));
    // Pinned categories (Grundschule) first, the rest in their original order.
    categories = base.categories.slice().sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    const known = new Set(categories.map((c) => c.name));
    for (const c of custom) {
      if (!known.has(c.category)) { categories.push({ name: c.category, icon: CUSTOM_ICON }); known.add(c.category); }
    }
    const seen = new Map();
    articlesByNoun = new Map();
    for (const e of allEntries) {
      if (!seen.has(keyOf(e))) seen.set(keyOf(e), e);
      const n = e.noun.toLowerCase();
      if (!articlesByNoun.has(n)) articlesByNoun.set(n, new Set());
      articlesByNoun.get(n).add(e.article);
    }
    uniqueWords = Array.from(seen.values());
    const extendedCats = new Set(categories.filter((c) => c.extended).map((c) => c.name));
    gameWords = uniqueWords.filter((e) => !extendedCats.has(e.category));
  }

  // Plural ("Hunde") for a noun entry; "" = no plural, undefined = unknown.
  const PLURALS = window.NOUN_PLURALS || {};
  const pluralOf = (e) => (e.plural != null && e.plural !== "" ? e.plural : PLURALS[keyOf(e)]);
  const pluralText = (e) => {
    const p = pluralOf(e);
    return p ? `die ${p}` : p === "" ? "kein Plural · no plural" : "";
  };

  // Emoji pictures: keys are "article noun" (for nouns whose meaning depends on the article) or just "noun".
  const PICTURES = new Map();
  for (const line of (window.NOUN_PICTURES || "").split("\n")) {
    const s = line.trim();
    const i = s.lastIndexOf(" ");
    if (i > 0) PICTURES.set(s.slice(0, i), s.slice(i + 1));
  }
  const pictureOf = (e) => e.picture || PICTURES.get(keyOf(e)) || PICTURES.get(e.noun) || "";
  const isImageUrl = (p) => /^(https?:|data:image\/)/i.test(p);
  function picHtml(p, cls) {
    if (!p) return "";
    return isImageUrl(p)
      ? `<img class="${cls}" src="${esc(p)}" alt="" loading="lazy" referrerpolicy="no-referrer">`
      : `<span class="${cls}">${esc(p)}</span>`;
  }

  const iconOf = (cat) => (categories.find((c) => c.name === cat) || {}).icon || CUSTOM_ICON;
  const hasSeveralArticles = (noun) => (articlesByNoun.get(noun.toLowerCase()) || new Set()).size > 1;


  /* ------------------------------------------------------------------ */
  /* Syllables (Silbenbögen)                                            */
  /* ------------------------------------------------------------------ */

  // Precomputed syllables ("A·bend") for dictionary words; TeX hyphenation patterns as fallback.
  const SYLLABLES = window.SYLLABLES || {};
  const hyph = (() => {
    const trie = {};
    for (const pat of (window.HYPH_DE_PATTERNS || "").split(" ")) {
      if (!pat) continue;
      const letters = pat.replace(/\d/g, "");
      const points = [];
      let i = 0;
      for (const ch of pat) { if (/\d/.test(ch)) points[i] = Number(ch); else i++; }
      let node = trie;
      for (const ch of letters) node = node[ch] || (node[ch] = {});
      node.$ = points;
    }
    // Liang's algorithm with a minimum of 1 letter before and 2 after a break.
    return (word) => {
      const w = "." + word.toLowerCase() + ".";
      const pts = new Array(w.length + 1).fill(0);
      for (let i = 0; i < w.length; i++) {
        let node = trie;
        for (let j = i; j < w.length && (node = node[w[j]]); j++) {
          if (node.$) node.$.forEach((v, k) => { if (v > (pts[i + k] || 0)) pts[i + k] = v; });
        }
      }
      const parts = [];
      let start = 0;
      for (let i = 1; i < word.length - 1; i++) {
        if (pts[i + 1] % 2 === 1) { parts.push(word.slice(start, i)); start = i; }
      }
      parts.push(word.slice(start));
      return parts;
    };
  })();
  const VOWEL = /[aeiouyäöü]/i;
  // Every syllable needs a vowel ("A-ben-d" → "A-bend").
  function fixSyllables(parts) {
    const out = [];
    for (const p of parts) {
      if (out.length && !VOWEL.test(p)) out[out.length - 1] += p;
      else if (out.length && !VOWEL.test(out[out.length - 1])) out[out.length - 1] += p;
      else out.push(p);
    }
    return out;
  }
  function syllablesOf(word) {
    const known = SYLLABLES[word] || SYLLABLES[word.toLowerCase()];
    if (known) return known.split("·");
    if (word.includes("-")) {
      // "E-Mail" → "E-" + "Mail" (no regex lookbehind, for older Safari)
      const bits = word.split("-");
      return bits.flatMap((bit, i) => { const sy = bit ? syllablesOf(bit) : [""]; if (i < bits.length - 1) sy[sy.length - 1] += "-"; return sy; }).filter(Boolean);
    }
    if (word.length <= 2 || !VOWEL.test(word)) return [word];
    return fixSyllables(hyph(word));
  }
  // Wrap each syllable of every word in the text; arcs are drawn by CSS when syllables are switched on.
  function sylHtml(text) {
    let n = 0;
    return String(text).split(/([A-Za-zÄÖÜäöüßẞ\-]+)/).map((chunk, i) => {
      if (i % 2 === 0) return esc(chunk);
      return syllablesOf(chunk).map((sy) => `<span class="syl s${(n++ % 2) + 1}">${esc(sy)}</span>`).join("");
    }).join("");
  }
  window.__syl = { syllablesOf, hyph };

  const SYL_KEY = "artikel.syllables";
  const sylToggle = $("#sylToggle");
  sylToggle.checked = store.get(SYL_KEY, true); // on by default
  const applySyl = () => document.body.classList.toggle("syl-on", sylToggle.checked);
  sylToggle.addEventListener("change", () => { store.set(SYL_KEY, sylToggle.checked); applySyl(); });
  applySyl();

  /* ------------------------------------------------------------------ */
  /* Speech                                                              */
  /* ------------------------------------------------------------------ */

  const VOICE_KEY = "artikel.voice";
  const SLOW_KEY = "artikel.slow";
  const hasSpeech = "speechSynthesis" in window;
  const voiceSelect = $("#voiceSelect");
  const slowToggle = $("#voiceSlow");
  let germanVoices = [];
  let speakingEl = null;
  let warnedNoVoice = false;

  // Natural / online voices sound far better than the old robotic system voices.
  const voiceScore = (v) =>
    (/natural|neural|online|google|premium|enhanced|siri/i.test(v.name) ? 10 : 0) +
    (v.lang.replace("_", "-").toLowerCase() === "de-de" ? 2 : 0) + (v.localService ? 0 : 1);

  function loadVoices() {
    if (!hasSpeech) return;
    germanVoices = speechSynthesis.getVoices()
      .filter((v) => v.lang && v.lang.toLowerCase().startsWith("de"))
      .sort((a, b) => voiceScore(b) - voiceScore(a));
    const saved = store.get(VOICE_KEY, "");
    voiceSelect.innerHTML = germanVoices.length
      ? germanVoices.map((v) => `<option value="${esc(v.name)}">${esc(v.name.replace(/^Microsoft |^Google /, ""))} (${esc(v.lang)})</option>`).join("")
      : `<option value="">Standard · default</option>`;
    if (germanVoices.some((v) => v.name === saved)) voiceSelect.value = saved;
  }

  function currentVoice() {
    return germanVoices.find((v) => v.name === voiceSelect.value) || germanVoices[0] || null;
  }

  function markSpeaking(el) {
    if (speakingEl) speakingEl.classList.remove("speaking");
    speakingEl = el || null;
    if (speakingEl) speakingEl.classList.add("speaking");
  }

  const MODE_KEY = "artikel.voiceMode";
  const voiceMode = $("#voiceMode");
  let speakToken = 0; // a newer speak() call stops a running syllable sequence

  function makeUtterance(text) {
    const u = new SpeechSynthesisUtterance(text);
    const voice = currentVoice();
    u.lang = voice ? voice.lang : "de-DE";
    if (voice) u.voice = voice;
    u.rate = slowToggle.checked ? 0.6 : 0.9;
    return u;
  }

  function checkVoices() {
    if (!hasSpeech) { toast("Vorlesen wird nicht unterstützt. · Read-aloud is not supported in this browser.", 4000); return false; }
    if (!germanVoices.length) loadVoices();
    if (!germanVoices.length && !warnedNoVoice) {
      warnedNoVoice = true;
      toast("Keine deutsche Stimme gefunden. · No German voice found – install one in your system's speech settings, or use Chrome / Edge.", 7000);
    }
    return true;
  }

  // Speak German text. `el` (optional) gets a "speaking" highlight while the voice plays.
  // opts.syllables forces syllable mode; opts.sentence keeps whole-word speech (example sentences).
  function speak(text, el, opts = {}) {
    if (!checkVoices()) return;
    const bySyllables = opts.syllables ?? (voiceMode.value === "syl" && !opts.sentence && text.trim().split(/\s+/).length <= 4);
    if (bySyllables) { speakSyllables(text, el); return; }
    speakToken++;
    speechSynthesis.cancel();
    const u = makeUtterance(text);
    u.onstart = () => markSpeaking(el);
    u.onend = u.onerror = () => { if (speakingEl === el) markSpeaking(null); };
    speechSynthesis.speak(u);
  }

  // One utterance as a promise (with a safety timeout – some browsers skip onend).
  function utter(text, rate) {
    return new Promise((resolve) => {
      const u = makeUtterance(text);
      u.rate = rate;
      const timer = setTimeout(resolve, 1500 + text.length * 250);
      u.onend = u.onerror = () => { clearTimeout(timer); resolve(); };
      speechSynthesis.speak(u);
    });
  }
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // "Schmet … ter … ling … Schmetterling": each syllable with a pause, then the whole word(s).
  async function speakSyllables(text, el) {
    if (!checkVoices()) return;
    const token = ++speakToken;
    speechSynthesis.cancel();
    const slow = slowToggle.checked;
    const gap = slow ? 700 : 400;
    const items = [];
    let multi = false;
    for (const word of text.replace(/[!?.,;:]/g, " ").trim().split(/\s+/)) {
      const clean = word.replace(/[^A-Za-zÄÖÜäöüßẞ\-]/g, "");
      if (!clean) continue;
      const parts = syllablesOf(clean).map((p) => p.replace(/-$/, "")).filter(Boolean);
      if (parts.length > 1) multi = true;
      // Later syllables in lower case, so the voice doesn't read them like an abbreviation.
      parts.forEach((p, i) => items.push({ t: i ? p.toLowerCase() : p, pause: i < parts.length - 1 ? gap : gap * 1.6 }));
    }
    markSpeaking(el);
    for (const it of items) {
      await utter(it.t, slow ? 0.55 : 0.8);
      if (token !== speakToken) return;
      await sleep(it.pause);
      if (token !== speakToken) return;
    }
    if (multi) await utter(text, slow ? 0.6 : 0.9); // the whole word at the end
    if (token === speakToken && speakingEl === el) markSpeaking(null);
  }

  if (hasSpeech) {
    loadVoices();
    speechSynthesis.addEventListener("voiceschanged", loadVoices);
    slowToggle.checked = store.get(SLOW_KEY, false);
    voiceSelect.addEventListener("change", () => { store.set(VOICE_KEY, voiceSelect.value); speak("der Hund, die Katze, das Pferd"); });
    slowToggle.addEventListener("change", () => store.set(SLOW_KEY, slowToggle.checked));
    voiceMode.value = store.get(MODE_KEY, "normal") === "syl" ? "syl" : "normal";
    voiceMode.addEventListener("change", () => { store.set(MODE_KEY, voiceMode.value); speak("Schmetterling"); });
  } else {
    $("#voiceBar").hidden = true;
  }

  /* ------------------------------------------------------------------ */
  /* Progress (saved per day on this device) and reports                 */
  /* ------------------------------------------------------------------ */

  const progress = (() => {
    const KEY = "artikel.progress";      // { "2026-10-04": { game: {n, c}, cases: {n, c}, sent: {n, c}, ms, mistakes: {label: count} } }
    const KINDS = ["game", "cases", "sent"]; // article game, cases practice, sentences (days saved by older versions have no "sent")
    const PROFILE_KEY = "artikel.reportProfile";
    const KEEP_DAYS = 90;
    const MAX_GAP = 60 * 1000;           // gaps longer than a minute don't count as practice time
    let data = store.get(KEY, {});
    let lastActivity = 0;

    const pad = (n) => String(n).padStart(2, "0");
    const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const daysBack = (n) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - n); return d; };
    const fmtDate = (key, opts = { weekday: "short", day: "numeric", month: "short" }) =>
      new Date(key + "T12:00:00").toLocaleDateString("de-DE", opts);
    const pctOf = (c, n) => (n ? Math.round((c / n) * 100) : null);
    const kindOf = (d, kind) => (d && d[kind]) || { n: 0, c: 0 };
    const dayN = (d) => KINDS.reduce((t, kind) => t + kindOf(d, kind).n, 0);
    const dayC = (d) => KINDS.reduce((t, kind) => t + kindOf(d, kind).c, 0);

    function prune() {
      const oldest = dayKey(daysBack(KEEP_DAYS));
      for (const k of Object.keys(data)) if (k < oldest) delete data[k];
    }

    // Called for every answer in the article game ("game"), the cases practice ("cases") and the sentences ("sent").
    function record(kind, ok, mistake) {
      const k = dayKey();
      const d = data[k] || (data[k] = { game: { n: 0, c: 0 }, cases: { n: 0, c: 0 }, sent: { n: 0, c: 0 }, ms: 0, mistakes: {} });
      if (!d[kind]) d[kind] = { n: 0, c: 0 };
      d[kind].n++;
      if (ok) d[kind].c++;
      else if (mistake) d.mistakes[mistake] = (d.mistakes[mistake] || 0) + 1;
      const now = Date.now();
      if (lastActivity) d.ms += Math.min(now - lastActivity, MAX_GAP);
      lastActivity = now;
      prune();
      store.set(KEY, data);
      autoSync.schedule();
    }
    // The first answer after a pause counts from when the question was shown.
    const touch = () => { if (!lastActivity || Date.now() - lastActivity > MAX_GAP) lastActivity = Date.now(); };

    function summarize(days) {
      const keys = Array.from({ length: days }, (_, i) => dayKey(daysBack(i)));
      const s = { days: 0, n: 0, c: 0, ms: 0, game: { n: 0, c: 0 }, cases: { n: 0, c: 0 }, sent: { n: 0, c: 0 }, mistakes: {}, perDay: [] };
      for (const k of keys) {
        const d = data[k];
        const n = dayN(d);
        s.perDay.push({ k, d, n });
        if (!d || !n) continue;
        s.days++;
        s.n += n; s.c += dayC(d); s.ms += d.ms;
        for (const kind of KINDS) { s[kind].n += kindOf(d, kind).n; s[kind].c += kindOf(d, kind).c; }
        for (const [m, cnt] of Object.entries(d.mistakes)) s.mistakes[m] = (s.mistakes[m] || 0) + cnt;
      }
      s.top = Object.entries(s.mistakes).sort((a, b) => b[1] - a[1]).slice(0, 8);
      return s;
    }

    function streakDays() {
      let n = 0;
      for (let i = data[dayKey()] ? 0 : 1; ; i++) {
        const d = data[dayKey(daysBack(i))];
        if (dayN(d) > 0) n++; else break;
      }
      return n;
    }

    const minutes = (ms) => Math.max(ms ? 1 : 0, Math.round(ms / 60000));

    // ---------- UI ----------
    const el = {
      summary: $("#progSummary"), days: $("#progDays"), mistakes: $("#progMistakes"), report: $("#progReport"),
      range: $("#progRange"), name: $("#progName"), email: $("#progEmail"),
    };
    const profile = store.get(PROFILE_KEY, { name: "Anshi", email: "" });
    el.name.value = profile.name || "";
    el.email.value = profile.email || "";
    const saveProfile = () => store.set(PROFILE_KEY, { name: el.name.value.trim(), email: el.email.value.trim() });

    function reportText() {
      const days = Number(el.range.value);
      const s = summarize(days);
      const name = el.name.value.trim() || "Mein Kind";
      const period = days === 1 ? fmtDate(dayKey(), { weekday: "long", day: "numeric", month: "long", year: "numeric" })
        : `${fmtDate(dayKey(daysBack(days - 1)), { day: "numeric", month: "long" })} – ${fmtDate(dayKey(), { day: "numeric", month: "long", year: "numeric" })}`;
      const subject = `${name} – Deutsch-Bericht · German report – ${period}`;
      const L = [`${name} – Deutsch-Bericht für ${period}`, ""];
      if (!s.n) {
        L.push(days === 1 ? "Heute noch nicht geübt. · No practice yet today." : "In diesem Zeitraum nicht geübt. · No practice in this period.");
      } else {
        if (days > 1) L.push(`Übungstage · days practised: ${s.days} von ${days}`);
        const m = minutes(s.ms);
        L.push(`Geübt · practised: ${s.n} Wörter/Sätze in ${m} ${m === 1 ? "Minute" : "Minuten"}`);
        L.push(`Richtig · correct: ${s.c} von ${s.n} (${pctOf(s.c, s.n)} %)`);
        if (s.game.n) L.push(`  • Artikel-Spiel · article game: ${s.game.n} Wörter, ${pctOf(s.game.c, s.game.n)} % richtig`);
        if (s.cases.n) L.push(`  • Fälle · cases: ${s.cases.n} Sätze, ${pctOf(s.cases.c, s.cases.n)} % richtig`);
        if (s.sent.n) L.push(`  • Lückensätze · sentences: ${s.sent.n} Sätze, ${pctOf(s.sent.c, s.sent.n)} % richtig`);
        if (s.top.length) L.push("", "Häufigste Fehler · most frequent mistakes:", ...s.top.slice(0, 6).map(([m, c]) => `  • ${m}${c > 1 ? ` (${c}×)` : ""}`));
        if (days > 1) {
          L.push("", "Pro Tag · per day:");
          for (const p of s.perDay.slice().reverse()) if (p.n) {
            const c = dayC(p.d);
            L.push(`  ${fmtDate(p.k)}: ${p.n} geübt, ${pctOf(c, p.n)} %, ${minutes(p.d.ms)} Min.`);
          }
        }
      }
      const st = streakDays();
      if (st > 1) L.push("", `🔥 ${st} Tage in Folge geübt · ${st} days in a row`);
      L.push("", "— Anshi German Learning App");
      return { subject, body: L.join("\n") };
    }


    // ---------- automatic daily email (Google Apps Script in the parent's account) ----------
    const autoSync = (() => {
      const AKEY = "artikel.autoReport"; // { url, key, synced: {date: signature}, last }
      let cfg = store.get(AKEY, { url: "", key: "", synced: {}, last: 0 });
      let timer = null;
      const valid = (u) => /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(u);
      const save = () => store.set(AKEY, cfg);
      const sig = (d) => JSON.stringify(d);

      function dirtyDays() {
        const out = [];
        for (let i = 0; i < 14; i++) {
          const k = dayKey(daysBack(i)), d = data[k];
          if (d && sig(d) !== cfg.synced[k]) out.push({ date: k, game: d.game, cases: d.cases, sent: kindOf(d, "sent"), ms: d.ms, mistakes: d.mistakes });
        }
        return out;
      }
      function payload(days, test) {
        return JSON.stringify({ secret: cfg.key, name: (el.name.value || "").trim(), days, test: !!test });
      }
      function markSynced(days) {
        for (const d of days) cfg.synced[d.date] = sig(data[d.date]);
        cfg.last = Date.now();
        save();
        status();
      }
      // Fire-and-forget: Apps Script doesn't allow reading the reply from another site, so we can't confirm it.
      async function send(test = false) {
        if (!cfg.url || !cfg.key) return false;
        const days = dirtyDays();
        if (!days.length && !test) return true;
        if (!navigator.onLine) { status("offline"); return false; }
        try {
          await fetch(cfg.url, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: payload(days, test) });
          markSynced(days);
          return true;
        } catch (err) {
          status("offline");
          return false;
        }
      }
      // When the app is closed or put away, a beacon still gets the data out.
      function flushOnHide() {
        if (!cfg.url || !cfg.key || !navigator.sendBeacon) return;
        const days = dirtyDays();
        if (days.length && navigator.sendBeacon(cfg.url, new Blob([payload(days, false)], { type: "text/plain" }))) markSynced(days);
      }
      function status(state) {
        const node = $("#autoStatus");
        if (!node) return;
        if (!cfg.url) { node.textContent = "Nicht eingerichtet. · Not set up."; return; }
        const last = cfg.last ? new Date(cfg.last).toLocaleString("de-DE", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "–";
        node.textContent = (state === "offline" ? "📴 Offline – wird später gesendet. · Offline – will be sent later. " : "✅ Eingeschaltet · On. ") +
          `Zuletzt übertragen · last sent: ${last}`;
      }
      const schedule = () => { clearTimeout(timer); timer = setTimeout(() => send(), 4000); };

      // UI
      const url = $("#autoUrl"), key = $("#autoKey");
      url.value = cfg.url; key.value = cfg.key;
      $("#autoSave").addEventListener("click", async () => {
        const u = url.value.trim(), k = key.value.trim();
        if (!valid(u)) { toast("Bitte die Web-App-Adresse prüfen (…/exec). · Please check the web app URL.", 5000); return; }
        if (!k) { toast("Bitte den Schlüssel eingeben. · Please enter the key.", 4000); return; }
        if (u !== cfg.url || k !== cfg.key) cfg = { url: u, key: k, synced: {}, last: 0 }; // new script: send everything again
        save();
        const ok = await send(true);
        toast(ok ? "Gesendet – in etwa einer Minute kommt eine Test-E-Mail. · Sent – a test email should arrive within a minute. 📧"
                 : "Gerade offline – bitte später erneut versuchen. · Offline right now – please try again later.", 6000);
      });
      $("#autoOff").addEventListener("click", () => {
        cfg = { url: "", key: "", synced: {}, last: 0 }; save(); url.value = ""; key.value = ""; status();
        toast("Automatische E-Mail ausgeschaltet. · Automatic email turned off.");
      });
      $("#autoCopyScript").addEventListener("click", async () => {
        try {
          const code = await (await fetch("scripts/auto-email/Code.gs", { cache: "no-store" })).text();
          await navigator.clipboard.writeText(code);
          toast("Skript kopiert – jetzt in script.google.com einfügen. · Script copied – paste it into script.google.com.", 5000);
        } catch (err) {
          window.open("https://github.com/AnjaneyaReddyKovvuri/learn-german/blob/main/scripts/auto-email/Code.gs", "_blank", "noopener");
        }
      });
      window.addEventListener("online", () => send());
      document.addEventListener("visibilitychange", () => { if (document.hidden) flushOnHide(); });
      window.addEventListener("pagehide", flushOnHide);
      setTimeout(() => send(), 3000); // anything left from last time
      status();
      return { schedule, status };
    })();

    function render() {
      const today = summarize(1), week = summarize(7);
      const card = (big, label, cls = "") => `<div class="score"><span class="${cls}">${big}</span><small>${label}</small></div>`;
      const tp = pctOf(today.c, today.n);
      const wp = pctOf(week.c, week.n);
      const cls = (p) => (p == null ? "pct" : p >= 80 ? "pct good" : p >= 50 ? "pct ok" : "pct low");
      el.summary.innerHTML = `<div class="scoreboard prog-cards">
        ${card(today.n, "heute geübt · practised today")}
        ${card(tp == null ? "–" : tp + " %", "heute richtig · correct today", cls(tp))}
        ${card(minutes(today.ms) + " min", "heute · today")}
        ${card(week.n, "letzte 7 Tage · last 7 days")}
        ${card(wp == null ? "–" : wp + " %", "7 Tage richtig · correct", cls(wp))}
        ${card("🔥 " + streakDays(), "Tage in Folge · days in a row")}
      </div>`;
      el.days.innerHTML = `<tr><th>Tag · day</th><th>Geübt · practised</th><th>Richtig · correct</th><th>Spiel · game</th><th>Fälle · cases</th><th>Sätze · sentences</th><th>Minuten</th></tr>` +
        summarize(14).perDay.map(({ k, d, n }) => {
          if (!n) return `<tr class="muted"><td>${esc(fmtDate(k))}</td><td colspan="6">–</td></tr>`;
          const c = dayC(d), p = pctOf(c, n);
          const part = (x) => (x.n ? `${x.n} · ${pctOf(x.c, x.n)} %` : "–");
          return `<tr><td>${esc(fmtDate(k))}</td><td>${n}</td><td class="${cls(p)}">${p} %</td><td>${part(d.game)}</td><td>${part(d.cases)}</td><td>${part(kindOf(d, "sent"))}</td><td>${minutes(d.ms)}</td></tr>`;
        }).join("");
      el.mistakes.innerHTML = week.top.length
        ? `<div class="contractions">${week.top.map(([m, c]) => `<span data-say="${esc(m.replace(/ \(.*\)$/, ""))}" class="sayable">${esc(m)} <b>${c}×</b></span>`).join("")}</div>`
        : `<p class="muted">Noch keine Fehler in den letzten 7 Tagen. · No mistakes in the last 7 days. 🎉</p>`;
      el.report.textContent = reportText().body;
      autoSync.status();
    }

    el.range.addEventListener("change", render);
    [el.name, el.email].forEach((x) => x.addEventListener("input", () => { saveProfile(); el.report.textContent = reportText().body; }));
    el.mistakes.addEventListener("click", (ev) => { const s = ev.target.closest("[data-say]"); if (s) speak(s.dataset.say, s); });
    $("#progShare").addEventListener("click", async () => {
      const { subject, body } = reportText();
      if (navigator.share) {
        try { await navigator.share({ title: subject, text: body }); } catch { /* cancelled */ }
      } else {
        $("#progMail").click();
      }
    });
    $("#progMail").addEventListener("click", () => {
      const { subject, body } = reportText();
      const to = encodeURIComponent(el.email.value.trim());
      location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
    $("#progCopy").addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(reportText().body); toast("Bericht kopiert · Report copied 📋"); }
      catch { toast("Kopieren nicht möglich · Copy not available"); }
    });
    $("#progReset").addEventListener("click", () => {
      if (!confirm("Wirklich den gesamten Fortschritt auf diesem Gerät löschen? · Really delete all progress on this device?")) return;
      data = {}; store.set(KEY, data); render();
    });

    return { record, touch, render };
  })();

  /* ------------------------------------------------------------------ */
  /* Tabs                                                                */
  /* ------------------------------------------------------------------ */

  function showTab(name) {
    $$(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
    $$(".panel").forEach((p) => p.classList.toggle("active", p.id === `tab-${name}`));
    if (name !== "game") game.pause();
    if (name === "cursive") renderCursive();
    if (name === "progress") progress.render();
    if (name === "sentences") sentences.show();
  }
  $$(".tab").forEach((t) => t.addEventListener("click", () => showTab(t.dataset.tab)));

  /* ------------------------------------------------------------------ */
  /* Game                                                                */
  /* ------------------------------------------------------------------ */

  const game = (() => {
    const el = {
      category: $("#gameCategory"), seconds: $("#gameSeconds"), hint: $("#gameHint"),
      auto: $("#gameAuto"), mistakesOnly: $("#gameMistakes"), autoSpeak: $("#gameAutoSpeak"),
      card: $("#gameCard"), verdict: $("#gameVerdict"), cat: $("#gameCat"), article: $("#gameArticle"), word: $("#gameWord"),
      hintText: $("#gameHintText"), pic: $("#gamePic"), pics: $("#gamePics"), bar: $("#timerBar"), feedback: $("#gameFeedback"),
      start: $("#gameStart"), next: $("#gameNext"), speakBtn: $("#gameSpeak"),
      answers: $$(".ans"),
      correct: $("#scCorrect"), wrong: $("#scWrong"), streak: $("#scStreak"), best: $("#scBest"),
    };

    const stats = { correct: 0, wrong: 0, streak: 0, best: store.get(BEST_KEY, 0) };
    let mistakes = store.get(MISTAKES_KEY, {}); // "der Hund" -> miss count
    let current = null;
    let answered = true;
    let timeoutId = null;
    let advanceId = null;
    let running = false;
    let paused = false;
    let timerEnd = 0;        // when the current question's time runs out (ms timestamp)
    let remainingMs = 0;     // time left when paused
    let pausedFeedback = null;
    const pauseBtn = $("#gamePause");

    const settings = store.get(SETTINGS_KEY, {});
    // Only restore a saved time that is still offered (older versions had 3/8/12 s).
    if ([...el.seconds.options].some((o) => o.value === String(settings.seconds))) el.seconds.value = settings.seconds;
    el.hint.checked = settings.showEnglish !== false; // on by default
    el.auto.checked = settings.auto !== false;
    el.pics.checked = settings.pics !== false;
    // Default category: the pinned one (Grundschule), unless the child picked another one before.
    let wantedCategory = settings.category ?? ((window.NOUN_DATA || []).find((b) => b.pinned) || {}).category ?? "";
    el.autoSpeak.checked = settings.autoSpeak !== false;

    function saveSettings() {
      store.set(SETTINGS_KEY, { category: el.category.value, seconds: el.seconds.value, showEnglish: el.hint.checked, auto: el.auto.checked, pics: el.pics.checked, autoSpeak: el.autoSpeak.checked });
    }
    [el.seconds, el.hint, el.auto, el.pics, el.autoSpeak].forEach((x) => x.addEventListener("change", () => {
      saveSettings();
      if (x === el.hint && current) renderHint();
      if (x === el.pics) renderPic();
    }));

    function renderPic() {
      el.pic.innerHTML = current && el.pics.checked ? picHtml(pictureOf(current), "pic") : "";
    }

    function fillCategories() {
      const prev = el.category.value;
      el.category.innerHTML = `<option value="">🌈 Alle Kategorien · All (${gameWords.length})</option>` +
        categories.map((c) => {
          const n = allEntries.filter((e) => e.category === c.name).length;
          return `<option value="${esc(c.name)}">${c.icon} ${esc(c.name)} (${n})</option>`;
        }).join("");
      const want = prev || wantedCategory;
      if (want && categories.some((c) => c.name === want)) el.category.value = want;
      wantedCategory = "";
    }

    function updateScore() {
      el.correct.textContent = stats.correct;
      el.wrong.textContent = stats.wrong;
      el.streak.textContent = stats.streak;
      el.best.textContent = stats.best;
      showPct($("#scPct"), stats.correct, stats.wrong);
    }

    function pool() {
      const cat = el.category.value;
      let words = cat ? allEntries.filter((e) => e.category === cat) : gameWords;
      if (el.mistakesOnly.checked) {
        const onlyMistakes = words.filter((w) => mistakes[keyOf(w)] > 0);
        if (onlyMistakes.length) return onlyMistakes;
        toast("Super! Keine Fehler mehr – weiter mit allen Wörtern. · No mistakes left – continuing with all words. 🎉", 4000);
        el.mistakesOnly.checked = false;
      }
      return words;
    }

    function pick(words) {
      // Now and then bring back a word that was answered wrong before.
      const missed = words.filter((w) => mistakes[keyOf(w)] > 0 && w !== current);
      if (missed.length && Math.random() < 0.25) return missed[Math.floor(Math.random() * missed.length)];
      if (words.length === 1) return words[0];
      let w;
      do { w = words[Math.floor(Math.random() * words.length)]; } while (w === current);
      return w;
    }

    function renderHint() {
      if (!current) return;
      // Words like "See" (der See / die See) need their meaning to be answerable.
      const ambiguous = hasSeveralArticles(current.noun);
      const show = (el.hint.checked || ambiguous || answered) && current.english;
      el.hintText.textContent = show ? `(${current.english})` : "";
      if (ambiguous && !answered) el.hintText.textContent += " – Achtung: Artikel hängt von der Bedeutung ab! · The article depends on the meaning!";
    }

    function clearTimers() {
      clearTimeout(timeoutId);
      clearTimeout(advanceId);
    }

    // Run the timer bar from `fromScale` (1 = full) down to 0 over `ms`.
    function startTimer(ms = Number(el.seconds.value) * 1000, fromScale = 1) {
      el.bar.style.transition = "none";
      el.bar.style.transform = `scaleX(${fromScale})`;
      void el.bar.offsetWidth; // restart the transition
      el.bar.style.transition = `transform ${ms / 1000}s linear`;
      el.bar.style.transform = "scaleX(0)";
      timerEnd = Date.now() + ms;
      timeoutId = setTimeout(() => finish(null), ms);
    }

    function stopTimerBar() {
      const t = getComputedStyle(el.bar).transform;
      el.bar.style.transition = "none";
      el.bar.style.transform = t === "none" ? "scaleX(1)" : t;
    }

    function next() {
      clearTimers();
      progress.touch();
      if (paused) clearPauseState();
      const words = pool();
      if (!words.length) { toast("Keine Wörter in dieser Kategorie. · No words in this category."); return; }
      running = true;
      current = pick(words);
      answered = false;
      el.card.className = "game-card card";
      el.cat.textContent = `${iconOf(current.category)} ${current.category}`;
      el.article.textContent = "?";
      el.article.className = "game-article";
      el.word.innerHTML = sylHtml(current.noun);
      el.verdict.textContent = "";
      el.verdict.className = "verdict";
      el.feedback.textContent = "Welcher Artikel passt? · Which article fits?";
      el.feedback.style.color = "";
      el.answers.forEach((b) => { b.disabled = false; b.classList.remove("correct", "wrong"); });
      el.start.hidden = true;
      el.next.hidden = true;
      pauseBtn.hidden = false;
      renderHint();
      renderPic();
      startTimer();
    }

    function finish(choice) {
      if (answered || paused) return;
      answered = true;
      clearTimers();
      stopTimerBar();
      const art = current.article;
      const ok = choice === art;
      const k = keyOf(current);

      if (ok) {
        stats.correct++; stats.streak++;
        if (mistakes[k]) { mistakes[k]--; if (!mistakes[k]) delete mistakes[k]; }
        if (stats.streak > stats.best) { stats.best = stats.streak; store.set(BEST_KEY, stats.best); }
      } else {
        stats.wrong++; stats.streak = 0;
        mistakes[k] = (mistakes[k] || 0) + 1;
      }
      store.set(MISTAKES_KEY, mistakes);
      progress.record("game", ok, ok ? null : `${art} ${current.noun}`);
      updateScore();

      el.article.textContent = art;
      el.article.className = `game-article c-${art} reveal`;
      el.card.classList.add(`flash-${art}`);
      const pl = pluralText(current);
      el.hintText.textContent = [current.english ? `(${current.english})` : "", pl ? `Plural: ${pl}` : ""].filter(Boolean).join(" · ");
      el.answers.forEach((b) => {
        b.disabled = true;
        if (b.dataset.art === art) b.classList.add("correct");
        else if (b.dataset.art === choice) b.classList.add("wrong");
      });

      // Big ✓ / ✗ / ⏰ right next to the word; the article in front already shows the right answer.
      el.verdict.textContent = ok ? "✓" : choice ? "✗" : "⏰";
      el.verdict.className = `verdict show ${ok ? "ok" : choice ? "bad" : "time"}`;
      el.verdict.title = ok ? "Richtig · Correct" : choice ? `Falsch – richtig ist „${art}“ · Wrong – it's "${art}"` : "Zeit abgelaufen · Time's up";
      el.feedback.textContent = ok && stats.streak >= 5 && stats.streak % 5 === 0 ? `${stats.streak} richtig in Folge! · ${stats.streak} in a row! 🔥`
        : !ok && !choice ? "⏰ Zeit abgelaufen · Time's up" : "";
      el.feedback.style.color = ok ? "var(--das)" : "var(--muted)";

      el.next.hidden = false;
      if (el.autoSpeak.checked) speak(`${art} ${current.noun}`, el.speakBtn);
      // Leave time to hear the word before moving on.
      if (el.auto.checked) advanceId = setTimeout(next, (ok ? 1800 : 3200) + (el.autoSpeak.checked ? 600 : 0));
    }

    // Pause: freeze the timer (or the auto-advance) and hide the word; resume continues where it stopped.
    function pause() {
      if (!running || paused) return;
      paused = true;
      if (hasSpeech) { speakToken++; speechSynthesis.cancel(); }
      clearTimers();
      if (!answered) {
        remainingMs = Math.max(0, timerEnd - Date.now());
        stopTimerBar();
        el.answers.forEach((b) => { b.disabled = true; });
      }
      pausedFeedback = { text: el.feedback.textContent, color: el.feedback.style.color };
      el.feedback.textContent = "⏸ Pausiert – drücke „Weiter“ · Paused – press Resume";
      el.feedback.style.color = "var(--muted)";
      el.card.classList.add("paused");
      pauseBtn.textContent = "▶ Weiter · Resume";
      pauseBtn.classList.add("primary");
    }

    function clearPauseState() {
      paused = false;
      el.card.classList.remove("paused");
      pauseBtn.textContent = "⏸ Pause";
      pauseBtn.classList.remove("primary");
    }

    function resume() {
      if (!paused) return;
      clearPauseState();
      if (pausedFeedback) { el.feedback.textContent = pausedFeedback.text; el.feedback.style.color = pausedFeedback.color; }
      if (!answered) {
        el.answers.forEach((b) => { b.disabled = false; });
        const m = getComputedStyle(el.bar).transform.match(/matrix\(([^,]+)/);
        startTimer(remainingMs, m ? Number(m[1]) : 1);
      } else if (el.auto.checked) {
        advanceId = setTimeout(next, 1200);
      }
    }
    const togglePause = () => (paused ? resume() : pause());

    function startWith(category) {
      el.category.value = category || "";
      showTab("game");
      next();
    }

    el.start.addEventListener("click", next);
    pauseBtn.addEventListener("click", togglePause);
    // Pause automatically when the app goes to the background (other app, screen off).
    document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); });
    el.next.addEventListener("click", next);
    el.answers.forEach((b) => b.addEventListener("click", () => finish(b.dataset.art)));
    // Before answering only the noun is spoken, so the article isn't given away.
    const sayCurrent = () => {
      if (!current) return;
      speak(answered ? `${current.article} ${current.noun}` : current.noun, el.speakBtn);
    };
    el.speakBtn.addEventListener("click", sayCurrent);
    $("#gameSpeakSyl").addEventListener("click", (ev) => {
      if (!current) return;
      speak(answered ? `${current.article} ${current.noun}` : current.noun, ev.currentTarget, { syllables: true });
    });
    el.word.addEventListener("click", sayCurrent);
    el.category.addEventListener("change", () => { saveSettings(); if (running) next(); });
    el.mistakesOnly.addEventListener("change", () => { if (running) next(); });

    document.addEventListener("keydown", (ev) => {
      if (!$("#tab-game").classList.contains("active")) return;
      if (ev.target.matches(TEXT_INPUT)) return;
      if (ev.key === "p" || ev.key === "P") { if (running) { togglePause(); ev.preventDefault(); } return; }
      if (paused) { if (ev.key === "Enter" || ev.key === " ") { resume(); ev.preventDefault(); } return; }
      if (["1", "2", "3"].includes(ev.key) && !answered) { finish(ARTICLES[Number(ev.key) - 1]); ev.preventDefault(); }
      else if (ev.key === "Enter" || ev.key === " ") {
        if (answered) { next(); ev.preventDefault(); }
      }
    });

    updateScore();
    return { fillCategories, pause, startWith };
  })();

  /* ------------------------------------------------------------------ */
  /* Browse                                                              */
  /* ------------------------------------------------------------------ */

  const browse = (() => {
    const el = {
      search: $("#browseSearch"), cats: $("#browseCategories"), list: $("#browseList"),
      title: $("#browseTitle"), count: $("#browseCount"), words: $("#browseWords"),
      back: $("#browseBack"), practice: $("#browsePractice"),
    };
    let currentCat = null;
    let articleFilter = "";

    function renderCategories() {
      el.cats.innerHTML = categories.map((c) => {
        const words = allEntries.filter((e) => e.category === c.name);
        const n = { der: 0, die: 0, das: 0 };
        words.forEach((w) => n[w.article]++);
        const total = words.length || 1;
        return `<button class="cat-card" data-cat="${esc(c.name)}">
          <div class="cat-icon">${c.icon}</div>
          <div class="cat-name">${esc(c.name)}</div>
          <div class="cat-count">${words.length} Wörter · words</div>
          <div class="cat-bar" title="der ${n.der} · die ${n.die} · das ${n.das}">
            <i style="width:${n.der / total * 100}%;background:var(--der)"></i>
            <i style="width:${n.die / total * 100}%;background:var(--die)"></i>
            <i style="width:${n.das / total * 100}%;background:var(--das)"></i>
          </div>
        </button>`;
      }).join("");
    }

    function wordCard(e, showCat) {
      const pic = pictureOf(e);
      return `<div class="word a-${e.article}${pic ? " has-pic" : ""}" data-say="${esc(e.article + " " + e.noun)}" title="Klicken zum Vorlesen · Click to hear it">
        ${picHtml(pic, "w-pic")}
        <button class="w-say" title="Anhören · Listen" aria-label="Anhören · Listen">🔊</button>
        <div class="w-main"><span class="w-art c-${e.article}">${e.article}</span> ${sylHtml(e.noun)}${e.custom ? '<span class="badge">neu</span>' : ""}</div>
        ${e.english ? `<div class="w-en">${esc(e.english)}</div>` : ""}
        ${pluralText(e) ? `<div class="w-pl">Pl.: ${pluralOf(e) ? "die " + sylHtml(pluralOf(e)) : esc(pluralText(e))}</div>` : ""}
        ${showCat ? `<div class="w-cat">${iconOf(e.category)} ${esc(e.category)}</div>` : ""}
      </div>`;
    }

    function render() {
      const raw = el.search.value.trim();
      const q = raw.toLowerCase();
      if (!q && !currentCat && !articleFilter) {
        el.cats.hidden = false;
        el.list.hidden = true;
        return;
      }
      el.cats.hidden = true;
      el.list.hidden = false;

      let words = currentCat ? allEntries.filter((e) => e.category === currentCat) : uniqueWords;
      if (q) words = words.filter((e) => e.noun.toLowerCase().includes(q) || (e.english || "").toLowerCase().includes(q));
      if (articleFilter) words = words.filter((e) => e.article === articleFilter);

      const parts = [];
      if (currentCat) parts.push(`${iconOf(currentCat)} ${currentCat}`);
      if (q) parts.push(`🔎 „${raw}“`);
      if (!parts.length) parts.push("Alle Wörter · All words");
      if (articleFilter) parts.push(articleFilter);
      el.title.textContent = parts.join(" · ");
      words = words.slice().sort((a, b) => collator.compare(a.noun, b.noun));

      el.count.textContent = `${words.length} Wörter · words`;
      el.practice.hidden = !currentCat;
      el.words.innerHTML = words.length
        ? words.map((e) => wordCard(e, !currentCat)).join("")
        : `<div class="empty">Keine Wörter gefunden. · No words found.</div>`;
    }

    el.cats.addEventListener("click", (ev) => {
      const card = ev.target.closest(".cat-card");
      if (!card) return;
      currentCat = card.dataset.cat;
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    el.back.addEventListener("click", () => {
      currentCat = null;
      el.search.value = "";
      articleFilter = "";
      $$("#articleFilter .chip").forEach((c) => c.classList.toggle("active", c.dataset.art === ""));
      render();
    });
    el.search.addEventListener("input", render);
    el.words.addEventListener("click", (ev) => {
      const w = ev.target.closest(".word");
      if (w) speak(w.dataset.say, w);
    });
    el.practice.addEventListener("click", () => game.startWith(currentCat));
    $$("#articleFilter .chip").forEach((chip) => chip.addEventListener("click", () => {
      articleFilter = chip.dataset.art;
      $$("#articleFilter .chip").forEach((c) => c.classList.toggle("active", c === chip));
      render();
    }));

    return { refresh() { renderCategories(); render(); } };
  })();

  /* ------------------------------------------------------------------ */
  /* Verbs                                                               */
  /* ------------------------------------------------------------------ */

  const PERSONS = ["ich", "du", "er/sie/es", "wir", "ihr", "sie/Sie"];
  const REFLEXIVE = ["mich", "dich", "sich", "uns", "euch", "sich"];
  const AUX = {
    haben: { pres: ["habe", "hast", "hat", "haben", "habt", "haben"], past: ["hatte", "hattest", "hatte", "hatten", "hattet", "hatten"] },
    sein: { pres: ["bin", "bist", "ist", "sind", "seid", "sind"], past: ["war", "warst", "war", "waren", "wart", "waren"] },
  };
  const WERDEN = ["werde", "wirst", "wird", "werden", "werdet", "werden"];
  const WUERDE = ["würde", "würdest", "würde", "würden", "würdet", "würden"];
  const MODALS = new Set(["können", "dürfen", "müssen", "sollen", "wollen", "mögen"]);

  // Stem of an infinitive: sammeln → sammel, gehen → geh, tun → tu.
  const verbStem = (inf) =>
    /e[lr]n$/.test(inf) || /[^e]ien$/.test(inf) ? inf.slice(0, -1) : inf.replace(/e?n$/, ""); // knien → knie
  // Stems like arbeit-, find-, atm-, rechn- take an extra "e": ihr arbeitet, er atmet.
  const needsE = (stem) => /[dt]$/.test(stem) || /(chn|[^aeiouäöülrhmn][mn])$/.test(stem);

  function conjugate(row) {
    const [infFull, en, ich, du, er, prat, p2, k2, impSg, auxName] = row;
    const reflexive = infFull.startsWith("sich ");
    const inf = infFull.replace(/^sich /, "");
    const impersonal = ich === "—";
    // Separable verbs are stored as "stehe auf" – the prefix is the last word.
    const prefix = er.includes(" ") ? er.split(" ").pop() : "";
    const strip = (f) => (prefix && f.endsWith(" " + prefix) ? f.slice(0, -prefix.length - 1) : f);
    const mainInf = prefix && inf.startsWith(prefix) ? inf.slice(prefix.length) : inf;
    const stem = verbStem(mainInf);
    const pm = strip(prat);
    const km = strip(k2);
    const isSein = inf === "sein";

    // Build "stelle mich vor" from main form, person index and prefix.
    const form = (main, i) => [main, reflexive ? REFLEXIVE[i] : "", prefix].filter(Boolean).join(" ");
    const compound = (aux, i, tail) => [aux, reflexive ? REFLEXIVE[i] : "", tail].filter(Boolean).join(" ");

    const ihr = isSein ? "seid" : stem + (needsE(stem) ? "et" : "t");
    const presMain = isSein
      ? ["bin", "bist", "ist", "sind", "seid", "sind"]
      : [strip(ich), strip(du), strip(er), mainInf, ihr, mainInf];

    let pratMain;
    if (/te$/.test(pm)) pratMain = [pm, pm + "st", pm, pm + "n", pm + "t", pm + "n"];
    else if (/e$/.test(pm)) pratMain = [pm, pm + "st", pm, pm + "n", pm + "t", pm + "n"];
    else if (/[dt]$/.test(pm)) pratMain = [pm, pm + "est", pm, pm + "en", pm + "et", pm + "en"];
    else if (/[sßzx]$/.test(pm)) pratMain = [pm, pm + "est", pm, pm + "en", pm + "t", pm + "en"];
    else pratMain = [pm, pm + "st", pm, pm + "en", pm + "t", pm + "en"];

    const k2Main = /e$/.test(km) ? [km, km + "st", km, km + "n", km + "t", km + "n"] : null;
    const aux = AUX[auxName] || AUX.haben;

    // Irregular = not stem+te in the past, or a vowel change in du/er.
    const weakPast = pm === stem + "te" || pm === stem + "ete";
    const regDu = stem + (needsE(stem) ? "est" : /[sßzx]$/.test(stem) ? "t" : "st");
    const regEr = stem + (needsE(stem) ? "et" : "t");
    const regIch = /eln$/.test(mainInf) ? strip(ich) : stem.endsWith("e") ? stem : stem + "e"; // "ich sammle", "ich knie" are regular
    const irrPres = [strip(ich) !== regIch, strip(du) !== regDu, strip(er) !== regEr, false, false, false]
      .map((x) => !impersonal && (x || isSein));
    const irregular = isSein || !weakPast || irrPres.some(Boolean);

    const persons = impersonal ? [2] : [0, 1, 2, 3, 4, 5];
    const rows = (fn, irr = []) => persons.map((i) => ({ p: impersonal ? "es" : PERSONS[i], f: fn(i), irr: !!irr[i] }));

    const tables = [
      { name: "Präsens", en: "present", rows: rows((i) => form(presMain[i], i), irrPres) },
      { name: "Präteritum", en: "simple past", rows: rows((i) => form(pratMain[i], i), weakPast ? [] : [1, 1, 1, 1, 1, 1]) },
      { name: "Perfekt", en: "present perfect", rows: rows((i) => compound(aux.pres[i], i, p2)) },
      { name: "Plusquamperfekt", en: "past perfect", rows: rows((i) => compound(aux.past[i], i, p2)) },
      { name: "Futur I", en: "future", rows: rows((i) => compound(WERDEN[i], i, inf)) },
    ];
    if (k2Main && km !== pm) tables.push({ name: "Konjunktiv II", en: "subjunctive", rows: rows((i) => form(k2Main[i], i), [1, 1, 1, 1, 1, 1]) });
    tables.push({ name: "würde + Infinitiv", en: "would …", rows: rows((i) => compound(WUERDE[i], i, inf)) });

    if (!impersonal && impSg !== "—" && !MODALS.has(inf)) {
      const sie = isSein ? "seien" : mainInf;
      // "red!" → "rede!", "verabschied dich!" → "verabschiede dich!" (no change for "tritt!", "lies!")
      const impMain = strip(impSg) === stem && needsE(stem) ? stem + "e" : strip(impSg);
      tables.push({
        name: "Imperativ", en: "commands", imperative: true,
        rows: [
          { p: "(du)", f: [impMain, reflexive ? "dich" : "", prefix].filter(Boolean).join(" ") + "!" },
          { p: "(ihr)", f: [presMain[4], reflexive ? "euch" : "", prefix].filter(Boolean).join(" ") + "!" },
          { p: "(Sie)", f: [sie, "Sie", reflexive ? "sich" : "", prefix].filter(Boolean).join(" ") + "!" },
        ],
      });
    }

    const tags = [];
    if (irregular) tags.push(["irregular", "⚡ unregelmäßig · irregular"]);
    if (prefix) tags.push(["separable", `✂️ trennbar (${prefix}-) · separable`]);
    if (reflexive) tags.push(["reflexive", "🪞 reflexiv · reflexive"]);
    if (MODALS.has(inf)) tags.push(["modal", "🔑 Modalverb · modal"]);
    if (auxName === "sein") tags.push(["sein", "🚶 Perfekt mit „sein“"]);
    if (impersonal) tags.push(["impersonal", "☁️ nur „es“ · impersonal"]);

    const parts = impersonal
      ? `es ${er} – es ${prat} – es ${aux.pres[2]} ${p2}`
      : `${infFull} – er ${form(presMain[2], 2)} – er ${form(pratMain[2], 2)} – er ${compound(aux.pres[2], 2, p2)}`;
    return { inf: infFull, en, tables, tags, parts, reflexive };
  }

  const verbs = (() => {
    const data = (window.VERB_DATA || []).map((row, i) => {
      const c = conjugate(row);
      return { row, rank: i + 1, inf: c.inf, en: c.en, tags: new Set(c.tags.map((t) => t[0])), tagLabels: c.tags };
    });
    const el = {
      search: $("#verbSearch"), list: $("#verbList"), count: $("#verbCount"),
      dialog: $("#verbDialog"), inf: $("#vdInf"), en: $("#vdEn"), tags: $("#vdTags"), parts: $("#vdParts"),
      tables: $("#vdTables"), prev: $("#vdPrev"), next: $("#vdNext"), speakBtn: $("#vdSpeak"), close: $("#vdClose"),
    };
    let rankFilter = 0;
    const tagFilter = new Set();
    let visible = [];
    let current = null;

    const RANK_BANDS = { 100: [1, 100], 200: [101, 200], 300: [201, 300], 500: [301, 500], 1000: [501, 1000], 9999: [1001, Infinity] };

    function render() {
      const q = el.search.value.trim().toLowerCase();
      visible = data.filter((v) => {
        if (rankFilter) { const [a, b] = RANK_BANDS[rankFilter]; if (v.rank < a || v.rank > b) return false; }
        for (const t of tagFilter) if (!v.tags.has(t)) return false;
        // English matches at word starts, so "to go" doesn't find "to govern".
        return !q || v.inf.toLowerCase().includes(q) || enMatch(v.en.toLowerCase(), q);
      });
      el.count.textContent = `${visible.length} Verben · verbs (sortiert nach Häufigkeit · sorted by frequency)`;
      el.list.innerHTML = visible.length ? visible.map((v, i) => `
        <div class="word verb" data-i="${i}" title="Konjugation anzeigen · Show conjugation">
          <button class="w-say" data-say="${esc(v.inf)}" title="Anhören · Listen" aria-label="Anhören · Listen">🔊</button>
          <div class="v-inf"><span class="v-rank">#${v.rank}</span>${esc(v.inf)}</div>
          <div class="w-en">${esc(v.en)}</div>
          <div class="v-tags">${v.tagLabels.map((t) => t[1].split(" ")[0]).join(" ")}</div>
        </div>`).join("") : `<div class="empty">Keine Verben gefunden. · No verbs found.</div>`;
    }

    function open(i) {
      current = i;
      const v = visible[i];
      const c = conjugate(v.row);
      el.inf.innerHTML = sylHtml(c.inf);
      el.en.textContent = `#${v.rank} · ${c.en}`;
      el.tags.innerHTML = c.tags.map((t) => `<span class="tag">${esc(t[1])}</span>`).join("");
      el.parts.innerHTML = `Stammformen · principal parts: <b>${esc(c.parts)}</b>`;
      el.tables.innerHTML = c.tables.map((t) => `
        <div class="conj">
          <h3>${esc(t.name)} <small>· ${esc(t.en)}</small></h3>
          <table>${t.rows.map((r) => {
            const say = t.imperative ? r.f.replace(/!$/, "") : `${r.p.split("/")[0]} ${r.f}`;
            return `<tr data-say="${esc(say)}"><td class="pr">${esc(r.p)}</td><td class="${r.irr ? "irr" : ""}">${esc(r.f)}</td></tr>`;
          }).join("")}</table>
        </div>`).join("");
      el.prev.disabled = i <= 0;
      el.next.disabled = i >= visible.length - 1;
      if (!el.dialog.open) el.dialog.showModal();
      el.tables.scrollTop = 0;
    }

    el.list.addEventListener("click", (ev) => {
      const say = ev.target.closest(".w-say");
      if (say) { speak(say.dataset.say, say.closest(".verb")); return; }
      const card = ev.target.closest(".verb");
      if (card) open(Number(card.dataset.i));
    });
    el.tables.addEventListener("click", (ev) => {
      const tr = ev.target.closest("tr[data-say]");
      if (tr) speak(tr.dataset.say, tr);
    });
    el.prev.addEventListener("click", () => current > 0 && open(current - 1));
    el.next.addEventListener("click", () => current < visible.length - 1 && open(current + 1));
    el.speakBtn.addEventListener("click", () => current != null && speak(visible[current].inf, el.speakBtn));
    $("#vdSpeakSyl").addEventListener("click", (ev) => current != null && speak(visible[current].inf, ev.currentTarget, { syllables: true }));
    el.inf.addEventListener("click", () => current != null && speak(visible[current].inf, el.inf));
    el.close.addEventListener("click", () => el.dialog.close());
    // Opened from the dictionary: navigate the full list, restore the filtered list afterwards.
    let openedExternally = false;
    function openByInf(inf) {
      const i = data.findIndex((v) => v.inf === inf);
      if (i < 0) return;
      visible = data;
      openedExternally = true;
      open(i);
    }
    el.dialog.addEventListener("close", () => { if (openedExternally) { openedExternally = false; render(); } });
    el.dialog.addEventListener("click", (ev) => { if (ev.target === el.dialog) el.dialog.close(); }); // backdrop
    el.dialog.addEventListener("keydown", (ev) => {
      if (ev.key === "ArrowLeft") el.prev.click();
      if (ev.key === "ArrowRight") el.next.click();
    });
    el.search.addEventListener("input", render);
    $$("#verbRank .chip").forEach((chip) => chip.addEventListener("click", () => {
      rankFilter = Number(chip.dataset.rank) || 0;
      $$("#verbRank .chip").forEach((c) => c.classList.toggle("active", c === chip));
      render();
    }));
    $$("#verbTags .chip").forEach((chip) => chip.addEventListener("click", () => {
      const t = chip.dataset.tag;
      if (tagFilter.has(t)) tagFilter.delete(t); else tagFilter.add(t);
      chip.classList.toggle("active", tagFilter.has(t));
      render();
    }));

    render();
    return { data, conjugate, openByInf };
  })();
  window.__verbs = verbs; // handy for debugging in the console

  /* ------------------------------------------------------------------ */
  /* Dictionary                                                          */
  /* ------------------------------------------------------------------ */

  const WORD_TYPES = {
    pron: "Pronomen · pronoun", art: "Artikel · article", det: "Begleiter · determiner", prep: "Präposition · preposition",
    conj: "Konjunktion · conjunction", adv: "Adverb · adverb", intj: "Ausruf · interjection", num: "Zahlwort · number",
    adj: "Adjektiv · adjective", part: "Partikel · particle",
  };
  const SMALL_TYPES = new Set(["pron", "art", "det", "prep", "conj", "intj", "num", "part"]);
  const RANKS = window.WORD_RANK || {};
  const EXAMPLE_DATA = window.EXAMPLES || {};

  const dict = (() => {
    const el = {
      search: $("#dictSearch"), sort: $("#dictSort"), types: $$("#dictTypes .chip[data-type]"), top: $("#dictTop"),
      az: $("#dictAZ"), count: $("#dictCount"), list: $("#dictList"), more: $("#dictMore"),
      dialog: $("#dictDialog"), pic: $("#ddPic"), word: $("#ddWord"), en: $("#ddEn"), tags: $("#ddTags"),
      body: $("#ddBody"), examples: $("#ddExamples"), speakBtn: $("#ddSpeak"), close: $("#ddClose"),
    };
    const PAGE = 150;
    let entries = [];
    let filtered = [];
    let shown = PAGE;
    let typeFilter = "";
    let letter = "";
    let current = null;
    let formIndex = new Map();

    function build() {
      const seen = new Set();
      const list = [];
      for (const e of uniqueWords) {
        const key = "n:" + keyOf(e);
        if (seen.has(key)) continue;
        seen.add(key);
        list.push({ key, t: "n", lemma: e.noun, display: keyOf(e), en: e.english || "", noun: e, rank: RANKS[key] });
      }
      for (const v of verbs.data) {
        const key = "v:" + v.inf;
        list.push({ key, t: "v", lemma: v.inf.replace(/^sich /, ""), display: v.inf, en: v.en, verb: v, rank: RANKS[key] });
      }
      for (const [w, types, en, comp, sup] of window.WORD_DATA || []) {
        const key = "w:" + w;
        list.push({ key, t: "w", lemma: w, display: w, en, types: types.split(","), comp, sup, rank: RANKS[key] });
      }
      for (const x of list) {
        x.sortKey = x.lemma.toLowerCase();
        x.first = x.sortKey.charAt(0).toLocaleUpperCase("de").replace("Ä", "A").replace("Ö", "O").replace("Ü", "U");
        x.enLow = x.en.toLowerCase();
        x.plural = x.t === "n" ? (pluralOf(x.noun) || "").toLowerCase() : "";
        x.enFirst = x.enLow.split(/\s*[\/,;]\s*/)[0].replace(/^to /, "");
      }
      // All conjugated verb forms → verb, so searching "ging" finds "gehen".
      formIndex = new Map();
      for (const x of list) {
        if (x.t !== "v") continue;
        for (const t of verbs.conjugate(x.verb.row).tables) {
          for (const r of t.rows) {
            for (const tok of r.f.toLowerCase().replace(/!$/, "").split(" ")) {
              if (!formIndex.has(tok)) formIndex.set(tok, new Set());
              formIndex.get(tok).add(x);
            }
          }
        }
      }
      list.sort((a, b) => collator.compare(a.sortKey, b.sortKey) || a.t.localeCompare(b.t));
      entries = list;
      el.az.innerHTML = `<button class="active" data-l="">alle</button>` +
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => `<button data-l="${l}">${l}</button>`).join("");
    }

    const matchesType = (x) => {
      if (!typeFilter) return true;
      if (typeFilter === "n" || typeFilter === "v") return x.t === typeFilter;
      if (x.t !== "w") return false;
      if (typeFilter === "small") return x.types.some((t) => SMALL_TYPES.has(t));
      return x.types.includes(typeFilter);
    };

    function typeLabel(x) {
      if (x.t === "n") return "Nomen · noun";
      if (x.t === "v") return "Verb · verb";
      if (x.types.length === 1) return WORD_TYPES[x.types[0]] || x.types[0];
      return x.types.map((t) => (WORD_TYPES[t] || t).split(" · ")[0]).join(" · ");
    }

    function render() {
      const q = el.search.value.trim().toLowerCase();
      const topOnly = el.top.classList.contains("active");
      const formHits = q ? formIndex.get(q) || new Set() : new Set();
      filtered = entries.filter((x) => {
        if (!matchesType(x)) return false;
        if (topOnly && !(x.rank <= 5000)) return false;
        if (letter && x.first !== letter) return false;
        if (!q) return true;
        return x.sortKey.includes(q) || x.display.toLowerCase().includes(q) || (x.plural && x.plural.includes(q)) ||
          enMatch(x.enLow, q) || (x.t === "v" && formHits.has(x));
      });
      if (q) {
        // Exact word, plural or verb form first, then exact English meaning, then prefix matches.
        const score = (x) =>
          x.sortKey === q ? 0 : x.plural === q || (x.t === "v" && formHits.has(x)) ? 0.5 :
          x.enFirst === q.replace(/^to /, "") ? 0.8 : x.sortKey.startsWith(q) ? 1 : enMatch(x.enLow, q) ? 1.5 : x.sortKey.includes(q) ? 2 : 3;
        filtered.sort((a, b) => score(a) - score(b) || (a.rank || 1e9) - (b.rank || 1e9));
      } else if (el.sort.value === "freq") {
        filtered = filtered.slice().sort((a, b) => (a.rank || 1e9) - (b.rank || 1e9));
      }
      shown = PAGE;
      draw();
    }

    function card(x, i) {
      const star = x.rank <= 5000 ? `<span class="star" title="Top 5000 (#${x.rank})">⭐</span>` : "";
      let main;
      if (x.t === "n") main = `<span class="w-art c-${x.noun.article}">${x.noun.article}</span> ${sylHtml(x.lemma)}`;
      else main = x.display.startsWith("sich ") ? "sich " + sylHtml(x.lemma) : sylHtml(x.display);
      const pic = x.t === "n" ? pictureOf(x.noun) : "";
      const pl = x.t === "n" && pluralText(x.noun) ? `<div class="w-pl">Pl.: ${pluralOf(x.noun) ? "die " + sylHtml(pluralOf(x.noun)) : esc(pluralText(x.noun))}</div>` : "";
      return `<div class="word dict-entry t-${x.t}${x.t === "n" ? " a-" + x.noun.article : ""}${pic ? " has-pic" : ""}" data-i="${i}">
        ${picHtml(pic, "w-pic")}
        <button class="w-say" data-say="${esc(x.display)}" title="Anhören · Listen" aria-label="Anhören · Listen">🔊</button>
        <div class="w-main">${main}${star}</div>
        <div class="d-type">${esc(typeLabel(x))}</div>
        <div class="w-en">${esc(x.en)}</div>
        ${pl}
      </div>`;
    }

    function draw() {
      const n = filtered.length;
      el.count.textContent = `${n.toLocaleString("de-DE")} Wörter · words` + (n > shown ? ` – ${shown} angezeigt · shown` : "");
      el.list.innerHTML = n ? filtered.slice(0, shown).map(card).join("") : `<div class="empty">Keine Wörter gefunden. · No words found.</div>`;
      el.more.hidden = n <= shown;
    }

    function exampleHtml(key) {
      const ex = EXAMPLE_DATA[key];
      if (!ex || !ex.length) return "";
      return `<div class="dd-section"><h3>Beispiel${ex.length > 1 ? "e" : ""} · Example${ex.length > 1 ? "s" : ""}</h3>` +
        ex.map(([de, en, id]) => `<div class="ex">
          <div class="ex-de" data-say="${esc(de)}" title="Anhören · Listen">🔊 ${esc(de)}</div>
          <div class="ex-en">${esc(en)}</div>
          <div class="ex-src"><a href="https://tatoeba.org/de/sentences/show/${id}" target="_blank" rel="noopener">Tatoeba #${id}</a></div>
        </div>`).join("") + `</div>`;
    }

    function open(x) {
      current = x;
      const tags = [`<span class="tag">${esc(typeLabel(x))}</span>`];
      if (x.rank) tags.push(`<span class="tag">${x.rank <= 5000 ? "⭐ Top 5000 · " : ""}Häufigkeit · frequency #${x.rank.toLocaleString("de-DE")}</span>`);
      let body = "";
      el.pic.innerHTML = "";
      if (x.t === "n") {
        const e = x.noun;
        el.word.innerHTML = `<span class="c-${e.article}">${e.article}</span> ${sylHtml(e.noun)}`;
        el.pic.innerHTML = picHtml(pictureOf(e), "");
        tags.push(`<span class="tag">${iconOf(e.category)} ${esc(e.category)}</span>`);
        const p = pluralOf(e);
        body = `<div class="dd-section"><h3>Singular · Plural</h3>
          <div class="dd-big"><span class="c-${e.article}">${e.article}</span> ${sylHtml(e.noun)} → ${p ? `<span class="c-die">die</span> ${sylHtml(p)}` : p === "" ? `<span class="muted">kein Plural · no plural</span>` : `<span class="muted">?</span>`}</div></div>`;
      } else if (x.t === "v") {
        el.word.innerHTML = sylHtml(x.display);
        const c = verbs.conjugate(x.verb.row);
        c.tags.forEach((t) => tags.push(`<span class="tag">${esc(t[1])}</span>`));
        body = `<div class="dd-section"><h3>Stammformen · principal parts</h3><div class="dd-big">${esc(c.parts)}</div>
          <p><button class="btn primary" id="ddConj">📋 Konjugation anzeigen · Show conjugation</button></p></div>`;
      } else {
        el.word.innerHTML = sylHtml(x.display);
        if (x.comp) {
          body = `<div class="dd-section"><h3>Steigerung · comparison</h3><div class="dd-big">${esc(x.lemma)} → ${esc(x.comp)} → ${esc(x.sup || "")}</div></div>`;
        }
      }
      el.en.textContent = x.en;
      el.tags.innerHTML = tags.join("");
      el.body.innerHTML = body;
      el.examples.innerHTML = exampleHtml(x.key) || `<p class="muted center">Noch kein Beispielsatz · no example sentence yet.</p>`;
      if (!el.dialog.open) el.dialog.showModal();
    }

    el.list.addEventListener("click", (ev) => {
      const say = ev.target.closest(".w-say");
      if (say) { speak(say.dataset.say, say.closest(".word")); return; }
      const c = ev.target.closest(".dict-entry");
      if (c) open(filtered[Number(c.dataset.i)]);
    });
    el.more.addEventListener("click", () => { shown += PAGE * 2; draw(); });
    el.search.addEventListener("input", render);
    el.sort.addEventListener("change", render);
    el.types.forEach((chip) => chip.addEventListener("click", () => {
      typeFilter = chip.dataset.type;
      el.types.forEach((c) => c.classList.toggle("active", c === chip));
      render();
    }));
    el.top.addEventListener("click", () => { el.top.classList.toggle("active"); render(); });
    el.az.addEventListener("click", (ev) => {
      const b = ev.target.closest("button");
      if (!b) return;
      letter = b.dataset.l;
      $$("#dictAZ button").forEach((x) => x.classList.toggle("active", x === b));
      render();
    });
    el.body.addEventListener("click", (ev) => {
      if (ev.target.closest("#ddConj") && current) { el.dialog.close(); verbs.openByInf(current.verb.inf); }
    });
    el.examples.addEventListener("click", (ev) => {
      const d = ev.target.closest(".ex-de");
      if (d) speak(d.dataset.say, d, { sentence: true });
    });
    el.speakBtn.addEventListener("click", () => current && speak(current.display, el.speakBtn));
    $("#ddSpeakSyl").addEventListener("click", (ev) => current && speak(current.display, ev.currentTarget, { syllables: true }));
    el.word.addEventListener("click", () => current && speak(current.display, el.word));
    el.close.addEventListener("click", () => el.dialog.close());
    el.dialog.addEventListener("click", (ev) => { if (ev.target === el.dialog) el.dialog.close(); });

    return { refresh() { build(); render(); } };
  })();

  /* ------------------------------------------------------------------ */
  /* Cases (Fälle)                                                       */
  /* ------------------------------------------------------------------ */

  const cases = (() => {
    const CASE_NAMES = { nom: "Nominativ", akk: "Akkusativ", dat: "Dativ", gen: "Genitiv" };
    const CASE_Q = { nom: "Wer oder was?", akk: "Wen oder was?", dat: "Wem?", gen: "Wessen?" };
    const G = { der: "m", die: "f", das: "n" };
    const GENDER_NAMES = { m: "maskulin", f: "feminin", n: "neutrum", pl: "Plural" };
    const ORDER = ["nom", "akk", "dat", "gen"];
    const ART = {
      def: { nom: { m: "der", f: "die", n: "das", pl: "die" }, akk: { m: "den", f: "die", n: "das", pl: "die" },
             dat: { m: "dem", f: "der", n: "dem", pl: "den" }, gen: { m: "des", f: "der", n: "des", pl: "der" } },
      indef: { nom: { m: "ein", f: "eine", n: "ein", pl: "—" }, akk: { m: "einen", f: "eine", n: "ein", pl: "—" },
               dat: { m: "einem", f: "einer", n: "einem", pl: "—" }, gen: { m: "eines", f: "einer", n: "eines", pl: "—" } },
      kein: { nom: { m: "kein", f: "keine", n: "kein", pl: "keine" }, akk: { m: "keinen", f: "keine", n: "kein", pl: "keine" },
              dat: { m: "keinem", f: "keiner", n: "keinem", pl: "keinen" }, gen: { m: "keines", f: "keiner", n: "keines", pl: "keiner" } },
      mein: { nom: { m: "mein", f: "meine", n: "mein", pl: "meine" }, akk: { m: "meinen", f: "meine", n: "mein", pl: "meine" },
              dat: { m: "meinem", f: "meiner", n: "meinem", pl: "meinen" }, gen: { m: "meines", f: "meiner", n: "meines", pl: "meiner" } },
    };
    // [class, article, nom, gen, dat, akk, plural, dative plural, English]
    const NOUNS = (window.CASE_NOUNS || []).map(([cls, art, nom, gen, dat, akk, pl, pld, en]) =>
      ({ cls, art, g: G[art], sg: { nom, akk, dat, gen }, pl: pl ? { nom: pl, akk: pl, dat: pld || pl, gen: pl } : null, en }));

    // Sentence templates. cls: which nouns fit (p person, a animal, b small thing, o big thing); only: "def"/"indef".
    const T = [
      { c: "nom", t: "{NP} ist hier.", tp: "{NP} sind hier.", why: "Subjekt: Wer oder was ist hier?", en: "Subject" },
      { c: "nom", t: "Wo ist {NP}?", tp: "Wo sind {NP}?", why: "Subjekt: Wer oder was ist wo?", en: "Subject", only: "def" },
      { c: "nom", t: "Da kommt {NP}.", tp: "Da kommen {NP}.", why: "Subjekt: Wer kommt?", en: "Subject", cls: "pa" },
      { c: "nom", t: "Das ist {NP}.", why: "nach „sein“ steht der Nominativ: Wer oder was ist das?", en: "after “sein”", only: "indef" },
      { c: "akk", t: "Ich sehe {NP}.", why: "sehen + Akkusativ: Wen oder was sehe ich?", en: "direct object" },
      { c: "akk", t: "Wir malen {NP}.", why: "malen + Akkusativ: Wen oder was malen wir?", en: "direct object" },
      { c: "akk", t: "Ich suche {NP}.", why: "suchen + Akkusativ: Wen oder was suche ich?", en: "direct object" },
      { c: "akk", t: "Ich kaufe {NP}.", why: "kaufen + Akkusativ: Was kaufe ich?", en: "direct object", cls: "b" },
      { c: "akk", t: "Das Geschenk ist für {NP}.", why: "für + Akkusativ", en: "“für” takes the accusative", cls: "pa" },
      { c: "akk", t: "Ich gehe ohne {NP}.", why: "ohne + Akkusativ", en: "“ohne” takes the accusative", cls: "pa" },
      { c: "akk", t: "Ich stelle mich neben {NP}.", why: "neben + Wohin? → Akkusativ", en: "two-way preposition, direction", cls: "pao" },
      { c: "dat", t: "Ich stehe neben {NP}.", why: "neben + Wo? → Dativ", en: "two-way preposition, place", cls: "pao" },
      { c: "dat", t: "Ich sitze hinter {NP}.", why: "hinter + Wo? → Dativ", en: "two-way preposition, place", cls: "pao" },
      { c: "dat", t: "Ich helfe {NP}.", why: "helfen + Dativ: Wem helfe ich?", en: "“helfen” takes the dative", cls: "pa" },
      { c: "dat", t: "Ich spiele mit {NP}.", why: "mit + Dativ", en: "“mit” takes the dative", cls: "pa" },
      { c: "dat", t: "Das gehört {NP}.", why: "gehören + Dativ: Wem gehört das?", en: "“gehören” takes the dative", cls: "p" },
      { c: "gen", t: "Das ist ein Bild {NP}.", why: "Wessen Bild? → Genitiv", en: "possession" },
      { c: "gen", t: "Das ist die Farbe {NP}.", why: "Wessen Farbe? → Genitiv", en: "possession", cls: "aob" },
      { c: "gen", t: "Das ist das Zimmer {NP}.", why: "Wessen Zimmer? → Genitiv", en: "possession", cls: "p" },
    ];

    const el = {
      nav: $$("#caseNav .chip"), mode: $("#cqMode"), caseChips: $$("#cqCases .chip"), plural: $("#cqPlural"), speakOn: $("#cqSpeak"),
      card: $("#cqCard"), badge: $("#cqBadge"), pic: $("#cqPic"), sentence: $("#cqSentence"), hint: $("#cqHint"),
      feedback: $("#cqFeedback"), answers: $("#cqAnswers"), explain: $("#cqExplain"), next: $("#cqNext"), say: $("#cqSay"),
      correct: $("#cqCorrect"), wrong: $("#cqWrong"), streak: $("#cqStreak"),
    };
    const stats = { correct: 0, wrong: 0, streak: 0 };
    let q = null;

    // ---------- sub-pages ----------
    function showSub(name) {
      el.nav.forEach((c) => c.classList.toggle("active", c.dataset.sub === name));
      $$("#tab-cases .case-sub").forEach((d) => { d.hidden = d.id !== `case-${name}`; });
      if (name === "practice" && !q) newQuestion();
    }
    el.nav.forEach((c) => c.addEventListener("click", () => showSub(c.dataset.sub)));

    // Speak any example marked with data-say.
    $("#tab-cases").addEventListener("click", (ev) => {
      const s = ev.target.closest("[data-say]");
      if (s && s.dataset.say && !s.closest("#cqAnswers")) speak(s.dataset.say, s, { sentence: s.dataset.say.includes(" ") });
    });

    // ---------- tables ----------
    function articleTable(kind) {
      const cols = ["m", "f", "n", "pl"];
      return `<table class="data-table case-table"><tr><th></th>${cols.map((g) => `<th>${GENDER_NAMES[g]}</th>`).join("")}</tr>` +
        ORDER.map((c) => `<tr class="row-${c}"><th class="k-${c}">${CASE_NAMES[c]}</th>${cols.map((g) => {
          const v = ART[kind][c][g];
          const changed = c !== "nom" && v !== ART[kind].nom[g] && v !== "—";
          return `<td class="${changed ? "chg" : ""}" data-say="${esc(v === "—" ? "" : v)}">${esc(v)}</td>`;
        }).join("")}</tr>`).join("") + `</table>`;
    }
    function nounTable() {
      const pick = (w) => NOUNS.find((n) => n.sg.nom === w);
      const cols = [pick("Hund"), pick("Katze"), pick("Pferd"), pick("Kind")].filter(Boolean);
      const head = cols.map((n, i) => `<th>${i === 3 ? "Plural" : GENDER_NAMES[n.g]}</th>`).join("");
      return `<table class="data-table case-table"><tr><th></th>${head}</tr>` + ORDER.map((c) => `<tr><th class="k-${c}">${CASE_NAMES[c]}</th>${cols.map((n, i) => {
        const pl = i === 3;
        const g = pl ? "pl" : n.g;
        const txt = `${ART.def[c][g]} ${(pl ? n.pl : n.sg)[c]}`;
        return `<td data-say="${esc(txt)}">${esc(ART.def[c][g])} <b>${esc((pl ? n.pl : n.sg)[c])}</b></td>`;
      }).join("")}</tr>`).join("") + `</table>`;
    }
    function pronounTable() {
      const P = { nom: ["ich", "du", "er", "sie", "es", "wir", "ihr", "sie / Sie"], akk: ["mich", "dich", "ihn", "sie", "es", "uns", "euch", "sie / Sie"],
                  dat: ["mir", "dir", "ihm", "ihr", "ihm", "uns", "euch", "ihnen / Ihnen"] };
      return `<table class="data-table case-table">` + ["nom", "akk", "dat"].map((c) =>
        `<tr><th class="k-${c}">${CASE_NAMES[c]}</th>${P[c].map((w, i) => `<td class="${c !== "nom" && w !== P.nom[i] ? "chg" : ""}" data-say="${esc(w.split(" ")[0])}">${esc(w)}</td>`).join("")}</tr>`).join("") + `</table>`;
    }
    $("#tblDef").innerHTML = articleTable("def");
    $("#tblIndef").innerHTML = articleTable("indef");
    $("#tblKein").innerHTML = articleTable("kein");
    $("#tblMein").innerHTML = articleTable("mein");
    $("#tblNouns").innerHTML = nounTable();
    $("#tblPron").innerHTML = pronounTable();

    // ---------- dative verbs ----------
    const DV = [
      ["helfen", "to help", "Ich helfe dem Kind."], ["danken", "to thank", "Ich danke der Lehrerin."],
      ["gefallen", "to please / to like", "Das Bild gefällt mir."], ["gehören", "to belong to", "Das Buch gehört dem Mädchen."],
      ["antworten", "to answer", "Ich antworte der Oma."], ["folgen", "to follow", "Der Hund folgt dem Jungen."],
      ["gratulieren", "to congratulate", "Wir gratulieren der Mama."], ["schmecken", "to taste (good)", "Die Suppe schmeckt dem Papa."],
      ["passen", "to fit / to suit", "Die Jacke passt mir."], ["glauben", "to believe (someone)", "Ich glaube dir."],
      ["vertrauen", "to trust", "Ich vertraue meinem Freund."], ["zuhören", "to listen to", "Wir hören der Lehrerin zu."],
      ["fehlen", "to be missed", "Du fehlst mir."], ["wehtun", "to hurt", "Der Fuß tut mir weh."],
      ["zeigen", "to show (to someone)", "Ich zeige dem Opa mein Bild."], ["schenken", "to give (as a present)", "Ich schenke der Oma Blumen."],
    ];
    $("#dativeVerbs").innerHTML = DV.map(([v, en, ex]) => `
      <div class="word verb dv-card" data-verb="${esc(v)}" title="Konjugation anzeigen · Show conjugation">
        <button class="w-say" data-say="${esc(ex)}" title="Beispiel anhören · Hear the example">🔊</button>
        <div class="v-inf">${esc(v)}</div>
        <div class="w-en">${esc(en)}</div>
        <div class="dv-ex">${esc(ex)}</div>
      </div>`).join("");
    $("#dativeVerbs").addEventListener("click", (ev) => {
      if (ev.target.closest(".w-say")) return; // handled by the data-say listener
      const c = ev.target.closest(".dv-card");
      if (c) verbs.openByInf(c.dataset.verb);
    });

    // ---------- practice ----------
    const rand = (a) => a[Math.floor(Math.random() * a.length)];
    const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
    const activeCases = () => el.caseChips.filter((c) => c.classList.contains("active")).map((c) => c.dataset.case);

    function newQuestion() {
      progress.touch();
      const mode = el.mode.value;
      const artKind = mode === "case" ? (Math.random() < 0.7 ? "def" : "indef") : mode;
      const allowed = activeCases();
      const temps = T.filter((t) => allowed.includes(t.c) && (!t.only || t.only === artKind));
      if (!temps.length) { toast("Wähle mindestens einen Fall. · Choose at least one case."); return; }
      const t = rand(temps);
      const nouns = NOUNS.filter((n) => (t.cls || "paob").includes(n.cls));
      const n = rand(nouns);
      // Plural only with the definite article, and for subject sentences only where a plural verb form exists.
      const canPlural = artKind === "def" && el.plural.checked && n.pl && (t.c !== "nom" || t.tp);
      const plural = !!canPlural && Math.random() < 0.3;
      const g = plural ? "pl" : n.g;
      const article = ART[artKind][t.c][g];
      const noun = (plural ? n.pl : n.sg)[t.c];
      const template = plural && t.tp ? t.tp : t.t;
      const start = template.startsWith("{NP}");
      const full = template.replace("{NP}", `${start ? cap(article) : article} ${noun}`);
      q = { t, n, g, plural, article, noun, template, start, full, artKind, mode, answered: false };
      el.card.className = "card game-card cq-card";
      el.badge.innerHTML = "&nbsp;";
      el.pic.innerHTML = picHtml(pictureOf({ article: n.art, noun: n.sg.nom }), "pic");
      el.hint.textContent = `(${plural ? "Plural · " : ""}${n.en})`;
      el.explain.hidden = true;
      if (mode === "case") {
        el.sentence.innerHTML = esc(template).replace("{NP}", `<span class="cq-np">${esc(start ? cap(article) : article)} ${esc(noun)}</span>`);
        el.feedback.textContent = "Welcher Fall ist das? · Which case is this?";
        el.answers.innerHTML = ORDER.map((c, i) => `<button class="ans cq-ans k-${c}-btn" data-a="${c}">${CASE_NAMES[c]} <kbd>${i + 1}</kbd></button>`).join("");
      } else {
        el.sentence.innerHTML = esc(template).replace("{NP}", `<span class="cq-blank">___</span> ${esc(noun)}`);
        el.feedback.textContent = "Welches Wort passt? · Which word fits?";
        const opts = artKind === "def" ? ["der", "die", "das", "den", "dem", "des"] : ["ein", "eine", "einen", "einem", "einer", "eines"];
        el.answers.innerHTML = opts.map((o, i) => `<button class="ans cq-ans" data-a="${o}">${o} <kbd>${i + 1}</kbd></button>`).join("");
      }
      el.feedback.style.color = "";
    }

    function answer(a) {
      if (!q || q.answered) return;
      q.answered = true;
      const right = q.mode === "case" ? q.t.c : q.article;
      const ok = a === right;
      if (ok) { stats.correct++; stats.streak++; } else { stats.wrong++; stats.streak = 0; }
      progress.record("cases", ok, ok ? null : `${q.article} ${q.noun} (${CASE_NAMES[q.t.c]})`);
      el.correct.textContent = stats.correct; el.wrong.textContent = stats.wrong; el.streak.textContent = stats.streak;
      showPct($("#cqPct"), stats.correct, stats.wrong);
      $$("#cqAnswers .ans").forEach((b) => {
        b.disabled = true;
        if (b.dataset.a === right) b.classList.add("correct", "cq-right");
        else if (b.dataset.a === a) b.classList.add("wrong");
      });
      const c = q.t.c;
      el.card.classList.add(`cq-${c}`);
      el.badge.innerHTML = `<span class="case-badge k-${c}-bg">${CASE_NAMES[c]}</span>`;
      el.sentence.innerHTML = esc(q.template).replace("{NP}", `<span class="k-${c}">${esc(q.start ? cap(q.article) : q.article)} ${esc(q.noun)}</span>`);
      el.feedback.textContent = ok ? rand(["Super! · Great! 🎉", "Richtig! · Correct! ⭐", "Toll! · Well done! 👏"]) : `Leider falsch · Not quite – richtig: „${q.mode === "case" ? CASE_NAMES[right] : right}“`;
      el.feedback.style.color = ok ? "var(--das)" : "var(--die)";
      // Explanation: why this case, and the article row with the right cell marked.
      const row = ["m", "f", "n", "pl"].map((g) => {
        const v = ART[q.artKind][c][g];
        return `<span class="${g === q.g ? "cq-cell on" : "cq-cell"}"><small>${GENDER_NAMES[g]}</small>${esc(v)}</span>`;
      }).join("");
      el.explain.innerHTML = `<p><b class="k-${c}">${CASE_NAMES[c]}</b> – ${esc(q.t.why)} <small class="muted">(${esc(q.t.en)})</small></p>
        <p class="muted">Fragewort: <b>${CASE_Q[c]}</b> · ${GENDER_NAMES[q.g]}${q.plural ? "" : ` (${q.n.art} ${esc(q.n.sg.nom)})`}</p>
        <div class="cq-row">${row}</div>`;
      el.explain.hidden = false;
      if (el.speakOn.checked) speak(q.full, el.sentence, { sentence: true });
    }

    el.answers.addEventListener("click", (ev) => { const b = ev.target.closest(".ans"); if (b) answer(b.dataset.a); });
    el.next.addEventListener("click", newQuestion);
    el.say.addEventListener("click", () => q && speak(q.answered ? q.full : q.template.replace("{NP}", "…"), el.say, { sentence: true }));
    el.mode.addEventListener("change", newQuestion);
    el.plural.addEventListener("change", newQuestion);
    el.caseChips.forEach((chip) => chip.addEventListener("click", () => {
      chip.classList.toggle("active");
      if (!activeCases().length) chip.classList.add("active"); // keep at least one
      newQuestion();
    }));
    document.addEventListener("keydown", (ev) => {
      if (!$("#tab-cases").classList.contains("active") || $("#case-practice").hidden) return;
      if (ev.target.matches(TEXT_INPUT)) return;
      const btns = $$("#cqAnswers .ans");
      const i = Number(ev.key) - 1;
      if (q && !q.answered && i >= 0 && i < btns.length) { answer(btns[i].dataset.a); ev.preventDefault(); }
      else if ((ev.key === "Enter" || ev.key === " ") && q && q.answered) { newQuestion(); ev.preventDefault(); }
    });

    return { showSub, newQuestion };
  })();
  window.__cases = cases;

  /* ------------------------------------------------------------------ */
  /* Sentences: fill the gaps, three levels                              */
  /* ------------------------------------------------------------------ */

  const sentences = (() => {
    const KEY = "artikel.sentences";
    const NONE = "∅"; // punctuation option: no mark at this place
    const TYPES = { n: "Nomen", p: "Pronomen", v: "Verb", a: "Adjektiv", d: "Adverb", z: "Satzzeichen" };
    const LEVELS = { A: "A1/A2", B: "B1/B2", C: "C1/C2" };

    // One sentence per line: text with gaps {type:right|wrong|wrong|wrong} # English # tip (see js/data/sentences.js).
    function parse(line) {
      const [text, en = "", tip = ""] = line.split(" # ").map((x) => x.trim());
      const parts = [], gaps = [];
      let last = 0;
      for (const m of text.matchAll(/\{([npvadz]):([^}]+)\}/g)) {
        const [answer, ...wrong] = m[2].split("|");
        parts.push(text.slice(last, m.index));
        gaps.push({ type: m[1], answer, wrong });
        last = m.index + m[0].length;
      }
      parts.push(text.slice(last));
      return { parts, gaps, en, tip };
    }
    const DATA = {};
    for (const [lvl, block] of Object.entries(window.SENTENCE_DATA || {})) {
      DATA[lvl] = block.split("\n").map((l) => l.trim()).filter(Boolean).map(parse).filter((s) => s.gaps.length);
    }

    const el = {
      levels: $$("#sfLevels .chip"), types: $$("#sfTypes .chip"), mode: $("#sfMode"), english: $("#sfEnglish"), speakOn: $("#sfSpeak"),
      card: $("#sfCard"), badge: $("#sfBadge"), sentence: $("#sfSentence"), hint: $("#sfHint"), feedback: $("#sfFeedback"),
      answers: $("#sfAnswers"), pool: $("#sfPool"), explain: $("#sfExplain"), check: $("#sfCheck"), next: $("#sfNext"), say: $("#sfSay"),
      correct: $("#sfCorrect"), wrong: $("#sfWrong"), streak: $("#sfStreak"),
    };
    const stats = { correct: 0, wrong: 0, streak: 0 };
    let level = "A";
    let deck = [];  // sentences still to come, in random order
    let q = null;   // { s, open: [gap index], multi, chips, fill: {gap index: chip id}, given, answered }
    let drag = null;
    const again = new Set(); // sentences waiting for their second try

    const settings = store.get(KEY, {});
    if (DATA[settings.level]) level = settings.level;
    if ([...el.mode.options].some((o) => o.value === settings.mode)) el.mode.value = settings.mode;
    el.english.checked = settings.english !== false;
    el.speakOn.checked = settings.speak !== false;
    if (Array.isArray(settings.types) && settings.types.some((t) => TYPES[t])) {
      el.types.forEach((c) => c.classList.toggle("active", settings.types.includes(c.dataset.type)));
    }
    el.levels.forEach((c) => c.classList.toggle("active", c.dataset.level === level));

    const rand = (a) => a[Math.floor(Math.random() * a.length)];
    const shuffle = (a) => {
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      return a;
    };
    const activeTypes = () => el.types.filter((c) => c.classList.contains("active")).map((c) => c.dataset.type);
    // The gaps of a sentence that may be asked with the chosen word types.
    const askable = (s, types) => s.gaps.map((g, i) => (types.includes(g.type) ? i : -1)).filter((i) => i >= 0);
    const optionHtml = (t) => (t === NONE ? `${NONE} <small>nichts · nothing</small>` : esc(t));
    const chipHtml = (c) => `<button type="button" class="sf-chip" data-chip="${c.id}">${optionHtml(c.text)}</button>`;
    const fullText = (s) => s.parts.map((part, i) => part + (i < s.gaps.length && s.gaps[i].answer !== NONE ? s.gaps[i].answer : "")).join("");
    const gapOf = (id) => q.open.find((i) => q.fill[i] === id);
    const saveSettings = () => store.set(KEY, { level, mode: el.mode.value, types: activeTypes(), english: el.english.checked, speak: el.speakOn.checked });

    function refill() {
      const types = activeTypes();
      let list = (DATA[level] || []).filter((s) => askable(s, types).length);
      if (el.mode.value === "multi") {
        const several = list.filter((s) => askable(s, types).length > 1);
        if (several.length) list = several;
      }
      deck = shuffle(list.slice());
    }

    function gapHtml(i) {
      const g = q.s.gaps[i];
      if (!q.open.includes(i)) return g.answer === NONE ? "" : esc(g.answer);
      if (q.answered) {
        const ok = q.given[i] === g.answer;
        return `<span class="sf-res ${ok ? "ok" : "bad"}">${ok ? "" : `<s>${esc(q.given[i])}</s> `}${esc(g.answer)}</span>`;
      }
      if (!q.multi) return `<span class="cq-blank">___</span>`;
      const chip = q.chips.find((c) => c.id === q.fill[i]);
      return `<span class="sf-gap${chip ? " filled" : ""}" data-gap="${i}">${chip ? chipHtml(chip) : "&nbsp;"}</span>`;
    }
    function render() {
      el.sentence.innerHTML = q.s.parts.map((part, i) => esc(part) + (i < q.s.gaps.length ? gapHtml(i) : "")).join("");
      if (!q.multi || q.answered) return;
      const used = Object.values(q.fill);
      el.pool.innerHTML = q.chips.filter((c) => !used.includes(c.id)).map(chipHtml).join("");
      el.check.disabled = q.open.some((i) => q.fill[i] == null);
    }

    function newQuestion() {
      progress.touch();
      if (!deck.length) refill();
      const types = activeTypes(), mode = el.mode.value;
      let at = deck.length - 1;
      let multi = mode === "multi";
      if (mode === "mix" && Math.random() < 0.4) {
        // Mixed: now and then look ahead for a sentence with several gaps.
        for (let i = deck.length - 1; i >= 0 && !multi; i--) if (askable(deck[i], types).length > 1) { at = i; multi = true; }
      }
      const s = deck.splice(at, 1)[0];
      if (!s) return;
      const can = askable(s, types);
      multi = multi && can.length > 1;
      q = { s, open: multi ? can : [rand(can)], multi, chips: [], fill: {}, given: {}, answered: false };
      if (multi) {
        // The right words plus a few wrong ones, mixed.
        const right = q.open.map((i) => s.gaps[i].answer);
        const extra = [];
        const addWrong = (i) => {
          const w = rand(s.gaps[i].wrong.filter((x) => !right.includes(x) && !extra.includes(x)));
          if (w) extra.push(w);
        };
        q.open.forEach(addWrong);
        if (q.open.length === 2) addWrong(rand(q.open));
        q.chips = shuffle([...right, ...extra]).map((text, id) => ({ id: String(id), text }));
        el.answers.innerHTML = "";
      } else {
        const g = s.gaps[q.open[0]];
        el.answers.innerHTML = shuffle([g.answer, ...g.wrong])
          .map((o, i) => `<button class="ans cq-ans" data-a="${esc(o)}">${optionHtml(o)} <kbd>${i + 1}</kbd></button>`).join("");
      }
      el.card.className = "card game-card sf-card";
      el.badge.textContent = `${LEVELS[level]} · ${[...new Set(q.open.map((i) => TYPES[s.gaps[i].type]))].join(" + ")}`;
      el.hint.textContent = el.english.checked && s.en ? `(${s.en})` : "";
      el.feedback.textContent = multi ? "Zieh die Wörter in die Lücken. · Drag the words into the gaps." : "Was passt in die Lücke? · What fits in the gap?";
      el.feedback.style.color = "";
      el.explain.hidden = true;
      el.answers.hidden = multi;
      el.pool.hidden = !multi;
      el.check.hidden = !multi;
      el.next.blur(); // so that Enter doesn't skip the new sentence
      render();
    }

    function finish(given) {
      if (!q || q.answered) return;
      q.answered = true;
      q.given = given;
      const { s } = q;
      const ok = q.open.every((i) => given[i] === s.gaps[i].answer);
      const full = fullText(s);
      if (ok) { stats.correct++; stats.streak++; } else { stats.wrong++; stats.streak = 0; }
      progress.record("sent", ok, ok ? null : full);
      // A wrong sentence comes back once, a few sentences later.
      if (!ok && !again.has(s) && deck.length > 4) { again.add(s); deck.splice(deck.length - 4, 0, s); } else again.delete(s);
      el.correct.textContent = stats.correct; el.wrong.textContent = stats.wrong; el.streak.textContent = stats.streak;
      showPct($("#sfPct"), stats.correct, stats.wrong);
      $$("#sfAnswers .ans").forEach((b) => {
        b.disabled = true;
        if (b.dataset.a === s.gaps[q.open[0]].answer) b.classList.add("correct", "cq-right");
        else if (b.dataset.a === given[q.open[0]]) b.classList.add("wrong");
      });
      el.pool.hidden = true;
      el.check.hidden = true;
      el.card.classList.add(ok ? "sf-ok" : "sf-bad");
      render();
      el.feedback.textContent = ok ? rand(["Super! · Great! 🎉", "Richtig! · Correct! ⭐", "Toll! · Well done! 👏"]) : "Leider falsch · Not quite – so ist es richtig:";
      el.feedback.style.color = ok ? "var(--das)" : "var(--die)";
      el.hint.textContent = "";
      el.explain.innerHTML = (s.en ? `<p class="muted">${esc(s.en)}</p>` : "") + (s.tip ? `<p>💡 ${esc(s.tip)}</p>` : "");
      el.explain.hidden = !s.en && !s.tip;
      if (el.speakOn.checked) speak(full, el.sentence, { sentence: true });
    }
    const check = () => { if (q && q.multi && !el.check.disabled) finish(Object.fromEntries(q.open.map((i) => [i, q.chips.find((c) => c.id === q.fill[i]).text]))); };

    // ---------- several gaps: drag a word into a gap (or tap it) ----------
    function place(id, gap) {
      const from = gapOf(id), there = q.fill[gap];
      if (from === gap) return;
      q.fill[gap] = id;
      if (from != null) { if (there != null) q.fill[from] = there; else delete q.fill[from]; } // from another gap: swap
      render();
    }
    function unplace(id) {
      const from = gapOf(id);
      if (from != null) { delete q.fill[from]; render(); }
    }
    // Tap: a word in the pool jumps into the first free gap, a word in a gap goes back.
    function tap(id) {
      if (gapOf(id) != null) { unplace(id); return; }
      const free = q.open.find((i) => q.fill[i] == null);
      if (free != null) place(id, free);
    }
    const gapAt = (x, y) => { const t = document.elementFromPoint(x, y); return t ? t.closest("#sfSentence .sf-gap") : null; };
    const markOver = (gap) => $$("#sfSentence .sf-gap").forEach((g) => g.classList.toggle("over", g === gap));

    el.card.addEventListener("pointerdown", (ev) => {
      const chip = ev.target.closest(".sf-chip");
      if (!chip || !q || q.answered || !q.multi || ev.button > 0) return;
      drag = { id: chip.dataset.chip, chip, x: ev.clientX, y: ev.clientY, ghost: null };
      try { chip.setPointerCapture(ev.pointerId); } catch { /* not supported */ }
    });
    el.card.addEventListener("pointermove", (ev) => {
      if (!drag) return;
      if (!drag.ghost) {
        if (Math.hypot(ev.clientX - drag.x, ev.clientY - drag.y) < 8) return; // still a tap
        const r = drag.chip.getBoundingClientRect();
        drag.dx = drag.x - r.left; drag.dy = drag.y - r.top;
        drag.ghost = drag.chip.cloneNode(true);
        drag.ghost.classList.add("sf-ghost");
        document.body.appendChild(drag.ghost);
        drag.chip.classList.add("dragging");
      }
      drag.ghost.style.left = `${ev.clientX - drag.dx}px`;
      drag.ghost.style.top = `${ev.clientY - drag.dy}px`;
      markOver(gapAt(ev.clientX, ev.clientY));
    });
    function endDrag(ev, cancelled) {
      if (!drag) return;
      const d = drag;
      drag = null;
      if (d.ghost) d.ghost.remove();
      d.chip.classList.remove("dragging");
      markOver(null);
      if (cancelled || !q || q.answered) return;
      if (!d.ghost) { tap(d.id); return; }
      const gap = gapAt(ev.clientX, ev.clientY);
      if (gap) place(d.id, Number(gap.dataset.gap)); else unplace(d.id); // dropped outside: back to the pool
    }
    el.card.addEventListener("pointerup", (ev) => endDrag(ev, false));
    el.card.addEventListener("pointercancel", (ev) => endDrag(ev, true));
    // Keyboard (Enter / Space on a focused word) – pointer taps are handled above.
    el.card.addEventListener("click", (ev) => {
      const chip = ev.target.closest(".sf-chip");
      if (chip && ev.detail === 0 && q && q.multi && !q.answered) tap(chip.dataset.chip);
    });

    // ---------- controls ----------
    el.answers.addEventListener("click", (ev) => { const b = ev.target.closest(".ans"); if (b && q) finish({ [q.open[0]]: b.dataset.a }); });
    el.check.addEventListener("click", check);
    el.next.addEventListener("click", newQuestion);
    el.say.addEventListener("click", () => {
      if (!q) return;
      const text = q.answered ? fullText(q.s) : q.s.parts.map((part, i) => part + (i >= q.s.gaps.length ? "" : q.open.includes(i) ? " … " : q.s.gaps[i].answer.replace(NONE, ""))).join("");
      speak(text, el.say, { sentence: true });
    });
    const restart = () => { saveSettings(); deck = []; newQuestion(); };
    el.levels.forEach((chip) => chip.addEventListener("click", () => {
      level = chip.dataset.level;
      el.levels.forEach((c) => c.classList.toggle("active", c === chip));
      restart();
    }));
    el.types.forEach((chip) => chip.addEventListener("click", () => {
      chip.classList.toggle("active");
      if (!activeTypes().length) chip.classList.add("active"); // keep at least one
      restart();
    }));
    el.mode.addEventListener("change", restart);
    el.speakOn.addEventListener("change", saveSettings);
    el.english.addEventListener("change", () => {
      saveSettings();
      if (q && !q.answered) el.hint.textContent = el.english.checked && q.s.en ? `(${q.s.en})` : "";
    });
    document.addEventListener("keydown", (ev) => {
      if (!$("#tab-sentences").classList.contains("active") || !q || ev.target.matches(TEXT_INPUT)) return;
      if (ev.key === "Enter") {
        if (q.answered) newQuestion(); else if (q.multi && !el.check.disabled) check(); else return;
        ev.preventDefault();
        return;
      }
      const btns = $$("#sfAnswers .ans");
      const i = Number(ev.key) - 1;
      if (!q.answered && !q.multi && i >= 0 && i < btns.length) { finish({ [q.open[0]]: btns[i].dataset.a }); ev.preventDefault(); }
    });

    return { show: () => { if (!q) newQuestion(); } };
  })();

  /* ------------------------------------------------------------------ */
  /* Excel upload                                                        */
  /* ------------------------------------------------------------------ */

  const upload = (() => {
    const el = {
      template: $("#downloadTemplate"), drop: $("#dropzone"), file: $("#fileInput"),
      preview: $("#uploadPreview"), summary: $("#uploadSummary"), table: $("#uploadTable"),
      confirm: $("#uploadConfirm"), cancel: $("#uploadCancel"),
      customTable: $("#customTable"), customCount: $("#customCount"),
      exportBtn: $("#exportCustom"), clearBtn: $("#clearCustom"),
    };
    let pending = [];

    const HEADERS = ["Article", "Noun", "English", "Category", "Picture", "Plural"];
    const COLUMN_PATTERNS = {
      article: /^(article|artikel|art\.?|genus|gender|geschlecht)$/i,
      noun: /^(noun|nomen|substantiv|wort|word|german|deutsch|name)$/i,
      english: /^(english|englisch|meaning|bedeutung|translation|übersetzung|uebersetzung)$/i,
      category: /^(category|kategorie|thema|topic|gruppe|group)$/i,
      picture: /^(picture|bild|emoji|image|foto|photo|icon)$/i,
      plural: /^(plural|mehrzahl|pl\.?)$/i,
    };
    const ARTICLE_ALIASES = {
      der: "der", m: "der", maskulin: "der", masculine: "der", r: "der",
      die: "die", f: "die", feminin: "die", feminine: "die", e: "die",
      das: "das", n: "das", neutrum: "das", neuter: "das", s: "das",
    };

    function checkLib() {
      if (window.XLSX) return true;
      toast("Excel library could not be loaded (vendor/xlsx.full.min.js missing).", 4000);
      return false;
    }

    function autoWidth(ws, rows) {
      ws["!cols"] = rows[0].map((_, i) => ({ wch: Math.min(60, Math.max(10, ...rows.map((r) => String(r[i] ?? "").length + 2))) }));
    }

    function downloadTemplate() {
      if (!checkLib()) return;
      const rows = [
        HEADERS,
        ["der", "Tintenkiller", "ink eraser", "Schule & Lernen", "🖊️", "Tintenkiller"],
        ["die", "Hängebrücke", "suspension bridge", DEFAULT_CUSTOM_CATEGORY, "🌉", "Hängebrücken"],
        ["das", "Fahrradschloss", "bike lock", "Verkehr & Fahrzeuge", "🔒", "Fahrradschlösser"],
      ];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(rows);
      autoWidth(ws, rows);
      XLSX.utils.book_append_sheet(wb, ws, "Nouns");

      const help = [
        ["Anleitung / Instructions"],
        [""],
        ["1. Fill in the 'Nouns' sheet – one noun per row. Replace or delete the example rows."],
        ["2. Article: der, die or das (m / f / n also accepted)."],
        ["3. Noun: the German noun without article, e.g. Hund. (\"der Hund\" in the Noun column also works.)"],
        ["4. English: optional meaning, shown as a hint in the game."],
        ["5. Category: optional. Use an existing category (see sheet 'Categories') or type a new one."],
        [`   Empty category → "${DEFAULT_CUSTOM_CATEGORY}".`],
        ["6. Picture: optional. An emoji (e.g. 🐶) or an image link starting with https://. Empty → built-in picture if there is one."],
        ["7. Plural: optional, e.g. Hunde (without \"die\"). Empty → built-in plural if the noun is known."],
        ["   Keep the header row (Article | Noun | English | Category | Picture | Plural)."],
        ["7. Save as .xlsx and upload it in the 'Hinzufügen' tab."],
      ];
      const wsHelp = XLSX.utils.aoa_to_sheet(help);
      wsHelp["!cols"] = [{ wch: 95 }];
      XLSX.utils.book_append_sheet(wb, wsHelp, "Instructions");

      const catRows = [["Category", "Words"], ...categories.map((c) => [c.name, allEntries.filter((e) => e.category === c.name).length])];
      const wsCats = XLSX.utils.aoa_to_sheet(catRows);
      autoWidth(wsCats, catRows);
      XLSX.utils.book_append_sheet(wb, wsCats, "Categories");

      XLSX.writeFile(wb, "artikel-vorlage.xlsx");
    }

    function detectColumns(rows) {
      for (let r = 0; r < Math.min(rows.length, 10); r++) {
        const cols = {};
        rows[r].forEach((cell, i) => {
          const v = String(cell).trim();
          for (const [field, re] of Object.entries(COLUMN_PATTERNS)) {
            if (cols[field] === undefined && re.test(v)) cols[field] = i;
          }
        });
        if (cols.noun !== undefined) return { headerRow: r, cols };
      }
      // No header found: assume template column order.
      return { headerRow: -1, cols: { article: 0, noun: 1, english: 2, category: 3, picture: 4, plural: 5 } };
    }

    function normalizeRow(row, cols) {
      const cell = (i) => (i === undefined ? "" : String(row[i] ?? "").trim());
      let article = cell(cols.article).toLowerCase();
      let noun = cell(cols.noun).replace(/\s+/g, " ");
      const english = cell(cols.english);
      const category = cell(cols.category) || DEFAULT_CUSTOM_CATEGORY;
      const picture = cell(cols.picture);
      const plural = cell(cols.plural).replace(/^die\s+/i, "");

      // Accept "der Hund" in the noun column.
      const m = noun.match(/^(der|die|das)\s+(.+)$/i);
      if (m) { if (!article) article = m[1].toLowerCase(); noun = m[2]; }
      article = ARTICLE_ALIASES[article.replace(/\.$/, "")] || article;
      if (noun) noun = noun.charAt(0).toLocaleUpperCase("de") + noun.slice(1);
      return { article, noun, english, category, picture, plural };
    }

    function analyze(rows) {
      const { headerRow, cols } = detectColumns(rows);
      const existing = new Set(allEntries.map((e) => `${keyOf(e)}|${e.category}`));
      const inFile = new Set();
      const result = [];
      rows.slice(headerRow + 1).forEach((row, i) => {
        if (!row.some((c) => String(c).trim())) return; // skip empty rows
        const e = normalizeRow(row, cols);
        const line = headerRow + 2 + i;
        let status = "new", note = "";
        if (!e.noun) { status = "err"; note = "Nomen fehlt · noun missing"; }
        else if (!ARTICLES.includes(e.article)) { status = "err"; note = e.article ? `Unbekannter Artikel · unknown article „${e.article}“` : "Artikel fehlt · article missing"; }
        else if (existing.has(`${keyOf(e)}|${e.category}`)) { status = "dup"; note = "Schon vorhanden · already there"; }
        else if (inFile.has(`${keyOf(e)}|${e.category}`)) { status = "dup"; note = "Doppelt in der Datei · twice in file"; }
        else {
          const other = articlesByNoun.get(e.noun.toLowerCase());
          if (other && !other.has(e.article)) note = `Hinweis · note: known as „${[...other].join("/")} ${e.noun}“`;
        }
        if (status === "new") inFile.add(`${keyOf(e)}|${e.category}`);
        result.push({ ...e, status, note, line });
      });
      return result;
    }

    function showPreview(list) {
      pending = list.filter((r) => r.status === "new");
      const counts = { new: 0, dup: 0, err: 0 };
      list.forEach((r) => counts[r.status]++);
      el.summary.innerHTML = `<b>${list.length}</b> rows read: <b class="c-das">${counts.new} new</b>, ${counts.dup} already there, <b class="c-die">${counts.err} with errors</b>.`;
      const label = { new: "✔ neu · new", dup: "• vorhanden · exists", err: "✖ Fehler · error" };
      el.table.innerHTML = `<tr><th>Row</th><th>Bild</th><th>Article</th><th>Noun</th><th>English</th><th>Category</th><th>Status</th></tr>` +
        list.map((r) => `<tr><td>${r.line}</td><td>${picHtml(pictureOf(r), "t-pic")}</td><td class="c-${esc(r.article)}"><b>${esc(r.article)}</b></td><td>${esc(r.noun)}</td>
          <td>${esc(r.english)}</td><td>${esc(r.category)}</td>
          <td class="st-${r.status}">${label[r.status]}${r.note ? ` – ${esc(r.note)}` : ""}</td></tr>`).join("");
      el.confirm.disabled = !pending.length;
      el.confirm.textContent = pending.length ? `✔ ${pending.length} Wörter hinzufügen · Add ${pending.length} words` : "Keine neuen Wörter · No new words";
      el.preview.hidden = false;
    }

    function readFile(file) {
      if (!file || !checkLib()) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const bytes = new Uint8Array(reader.result);
          let wb;
          if (/\.csv$/i.test(file.name)) {
            // Decode CSV ourselves so umlauts survive: UTF-8 first, else Excel's Windows-1252.
            let text;
            try { text = new TextDecoder("utf-8", { fatal: true }).decode(bytes); }
            catch { text = new TextDecoder("windows-1252").decode(bytes); }
            wb = XLSX.read(text.replace(/^﻿/, ""), { type: "string" });
          } else {
            wb = XLSX.read(bytes, { type: "array" });
          }
          const sheetName = wb.SheetNames.find((n) => /^(nouns|nomen|wörter|words)$/i.test(n)) || wb.SheetNames[0];
          const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: "", raw: false });
          if (!rows.length) { toast("Die Datei ist leer. · The file is empty."); return; }
          showPreview(analyze(rows));
        } catch (err) {
          console.error(err);
          toast("Datei konnte nicht gelesen werden. · Could not read the file – please use the template.", 4000);
        }
      };
      reader.readAsArrayBuffer(file);
    }

    function renderCustom() {
      el.customCount.textContent = custom.length ? `(${custom.length})` : "";
      el.exportBtn.disabled = el.clearBtn.disabled = !custom.length;
      el.customTable.innerHTML = custom.length
        ? `<tr><th>Bild</th><th>Article</th><th>Noun</th><th>English</th><th>Category</th><th></th></tr>` +
          custom.map((c, i) => `<tr><td>${picHtml(pictureOf(c), "t-pic")}</td><td class="c-${c.article}"><b>${c.article}</b></td><td>${esc(c.noun)}</td><td>${esc(c.english)}</td>
            <td>${esc(c.category)}</td><td><button data-del="${i}" title="Löschen · Delete">🗑</button></td></tr>`).join("")
        : `<tr><td class="muted">Noch keine eigenen Wörter. · No words added yet – upload an Excel file!</td></tr>`;
    }

    function exportCustom() {
      if (!checkLib() || !custom.length) return;
      const rows = [HEADERS, ...custom.map((c) => [c.article, c.noun, c.english, c.category, c.picture || "", c.plural || ""])];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(rows);
      autoWidth(ws, rows);
      XLSX.utils.book_append_sheet(wb, ws, "Nouns");
      XLSX.writeFile(wb, "meine-woerter.xlsx");
    }

    function afterChange() {
      store.set(CUSTOM_KEY, custom);
      refreshAll();
    }

    el.template.addEventListener("click", downloadTemplate);
    el.file.addEventListener("change", () => { readFile(el.file.files[0]); el.file.value = ""; });
    ["dragenter", "dragover"].forEach((t) => el.drop.addEventListener(t, (ev) => { ev.preventDefault(); el.drop.classList.add("over"); }));
    ["dragleave", "drop"].forEach((t) => el.drop.addEventListener(t, () => el.drop.classList.remove("over")));
    el.drop.addEventListener("drop", (ev) => { ev.preventDefault(); readFile(ev.dataTransfer.files[0]); });
    el.confirm.addEventListener("click", () => {
      custom = custom.concat(pending.map(({ article, noun, english, category, picture, plural }) => ({ article, noun, english, category, picture, plural })));
      toast(`${pending.length} Wörter hinzugefügt! · ${pending.length} words added! 🎉`);
      pending = [];
      el.preview.hidden = true;
      afterChange();
    });
    el.cancel.addEventListener("click", () => { pending = []; el.preview.hidden = true; });
    el.customTable.addEventListener("click", (ev) => {
      const btn = ev.target.closest("[data-del]");
      if (!btn) return;
      custom.splice(Number(btn.dataset.del), 1);
      afterChange();
    });
    el.exportBtn.addEventListener("click", exportCustom);
    el.clearBtn.addEventListener("click", () => {
      if (!confirm(`Wirklich alle ${custom.length} eigenen Wörter löschen? · Really delete all ${custom.length} added words?`)) return;
      custom = [];
      afterChange();
    });

    return { renderCustom };
  })();

  /* ------------------------------------------------------------------ */
  /* Cursive                                                             */
  /* ------------------------------------------------------------------ */

  const cursiveEl = {
    input: $("#cursiveInput"), font: $("#cursiveFont"), size: $("#cursiveSize"),
    article: $("#cursiveArticle"), lines: $("#cursiveLines"), trace: $("#cursiveTrace"),
    out: $("#cursiveOut"), print: $("#printView"),
  };

  function cursiveText() {
    const text = cursiveEl.input.value.trim();
    if (!text) return { html: "", plain: "", printHtml: "" };
    const alreadyHasArticle = /^(der|die|das)\s/i.test(text);
    const arts = articlesByNoun.get(text.toLowerCase());
    if (cursiveEl.article.checked && !alreadyHasArticle && arts) {
      // Use the spelling from the word list (correct capitalisation).
      const known = allEntries.find((e) => e.noun.toLowerCase() === text.toLowerCase());
      const noun = known ? known.noun : text;
      const list = [...arts];
      const html = list.map((a) => `<span class="art a-${a}">${a}</span> ${sylHtml(noun)}`).join(" / ");
      return { html, plain: list.map((a) => `${a} ${noun}`).join(", "), printHtml: html, picture: known ? pictureOf(known) : "" };
    }
    return { html: sylHtml(text), plain: text, printHtml: sylHtml(text) };
  }

  function renderCursive() {
    const { html, printHtml, picture } = cursiveText();
    const out = cursiveEl.out;
    out.style.fontFamily = `"${cursiveEl.font.value}", cursive`;
    out.style.setProperty("--size", `${cursiveEl.size.value}px`);
    out.classList.toggle("lines", cursiveEl.lines.checked);
    out.classList.add("colored");
    cursiveEl.print.innerHTML = printHtml ? `${picHtml(picture, "print-pic")} Druckschrift · print: ${printHtml}` : "";
    if (!html) { out.innerHTML = `<span class="cursive-line muted" style="font-size:1rem">Gib oben ein Wort ein. · Type a word above.</span>`; return; }
    let lines = `<span class="cursive-line">${html}</span>`;
    if (cursiveEl.trace.checked) {
      lines += `<span class="cursive-line trace">${html}</span>`.repeat(4) + `<span class="cursive-line">&nbsp;</span>`.repeat(2);
    }
    out.innerHTML = lines;
  }

  [cursiveEl.input, cursiveEl.font, cursiveEl.size, cursiveEl.article, cursiveEl.lines, cursiveEl.trace]
    .forEach((x) => x.addEventListener("input", renderCursive));
  $$(".umlauts button").forEach((b) => b.addEventListener("click", () => {
    const inp = cursiveEl.input;
    const s = inp.selectionStart ?? inp.value.length, e = inp.selectionEnd ?? inp.value.length;
    inp.value = inp.value.slice(0, s) + b.dataset.ch + inp.value.slice(e);
    inp.focus();
    inp.setSelectionRange(s + 1, s + 1);
    renderCursive();
  }));
  $("#cursiveSpeak").addEventListener("click", (ev) => { const t = cursiveText().plain; if (t) speak(t, ev.currentTarget, { sentence: true }); });
  $("#cursiveSpeakSyl").addEventListener("click", (ev) => { const t = cursiveText().plain; if (t) speak(t.split(",")[0], ev.currentTarget, { syllables: true }); });
  $("#cursivePrint").addEventListener("click", () => window.print());

  /* ------------------------------------------------------------------ */
  /* Init                                                                */
  /* ------------------------------------------------------------------ */

  function refreshAll() {
    rebuild();
    game.fillCategories();
    browse.refresh();
    dict.refresh();
    upload.renderCustom();
    renderCursive();
  }

  refreshAll();

  /* ------------------------------------------------------------------ */
  /* Donation (behind a simple parent check)                             */
  /* ------------------------------------------------------------------ */

  // Your PayPal.me link. Leave empty to hide the donation button.
  const DONATION_URL = "";

  (() => {
    const btns = [$("#supportBtn"), $("#supportLink")];
    if (!DONATION_URL) return; // not configured yet: keep everything hidden
    btns.forEach((b) => { b.hidden = false; });
    const dlg = $("#supportDialog");
    const q = $("#supportQ"), a = $("#supportA"), msg = $("#supportMsg");
    let answer = 0;
    function open() {
      // A sum that young children can't easily solve, so they don't land on a payment page by accident.
      const x = 6 + Math.floor(Math.random() * 4), y = 6 + Math.floor(Math.random() * 4);
      answer = x * y;
      q.textContent = `${x} × ${y} = ?`;
      a.value = ""; msg.textContent = "";
      $("#supportGate").hidden = false; $("#supportOpen").hidden = true;
      $("#supportPaypal").href = DONATION_URL;
      dlg.showModal();
      a.focus();
    }
    function check() {
      if (Number(a.value.trim()) === answer) { $("#supportGate").hidden = true; $("#supportOpen").hidden = false; }
      else { msg.textContent = "Leider nicht richtig. · Not quite – please ask an adult."; a.select(); }
    }
    btns.forEach((b) => b.addEventListener("click", open));
    $("#supportCheck").addEventListener("click", check);
    a.addEventListener("keydown", (ev) => { if (ev.key === "Enter") check(); });
    $("#supportClose").addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", (ev) => { if (ev.target === dlg) dlg.close(); });
  })();

  /* ------------------------------------------------------------------ */
  /* Installable app (PWA)                                               */
  /* ------------------------------------------------------------------ */

  // Offline support: only when served over http(s) – opening index.html as a file still works without it.
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register("sw.js").then((reg) => {
      reg.addEventListener("updatefound", () => {
        const sw = reg.installing;
        if (!sw) return;
        sw.addEventListener("statechange", () => {
          // A newer version was downloaded while an older one is running.
          if (sw.state === "activated" && navigator.serviceWorker.controller) {
            toast("Update geladen – beim nächsten Öffnen aktiv · Update ready – active next time you open the app", 6000);
          }
        });
      });
    }).catch((err) => console.warn("Service worker not registered:", err));
  }

  // Chrome on Android offers installing; show our own button for it.
  const installBtn = $("#installBtn");
  let installPrompt = null;
  window.addEventListener("beforeinstallprompt", (ev) => {
    ev.preventDefault();
    installPrompt = ev;
    installBtn.hidden = false;
  });
  installBtn.addEventListener("click", async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    installBtn.hidden = true;
  });
  window.addEventListener("appinstalled", () => { installBtn.hidden = true; toast("App installiert! 🎉 · App installed!"); });
})();

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
      categories.push({ name: block.category, icon: block.icon, extended: !!block.extended });
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
    categories = base.categories.slice();
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
  /* Tabs                                                                */
  /* ------------------------------------------------------------------ */

  function showTab(name) {
    $$(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
    $$(".panel").forEach((p) => p.classList.toggle("active", p.id === `tab-${name}`));
    if (name !== "game") game.pause();
    if (name === "cursive") renderCursive();
  }
  $$(".tab").forEach((t) => t.addEventListener("click", () => showTab(t.dataset.tab)));

  /* ------------------------------------------------------------------ */
  /* Game                                                                */
  /* ------------------------------------------------------------------ */

  const game = (() => {
    const el = {
      category: $("#gameCategory"), seconds: $("#gameSeconds"), hint: $("#gameHint"),
      auto: $("#gameAuto"), mistakesOnly: $("#gameMistakes"), autoSpeak: $("#gameAutoSpeak"),
      card: $("#gameCard"), cat: $("#gameCat"), article: $("#gameArticle"), word: $("#gameWord"),
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

    const settings = store.get(SETTINGS_KEY, {});
    // Only restore a saved time that is still offered (older versions had 3/8/12 s).
    if ([...el.seconds.options].some((o) => o.value === String(settings.seconds))) el.seconds.value = settings.seconds;
    el.hint.checked = !!settings.hint;
    el.auto.checked = settings.auto !== false;
    el.pics.checked = settings.pics !== false;
    el.autoSpeak.checked = settings.autoSpeak !== false;

    function saveSettings() {
      store.set(SETTINGS_KEY, { seconds: el.seconds.value, hint: el.hint.checked, auto: el.auto.checked, pics: el.pics.checked, autoSpeak: el.autoSpeak.checked });
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
      if (prev && categories.some((c) => c.name === prev)) el.category.value = prev;
    }

    function updateScore() {
      el.correct.textContent = stats.correct;
      el.wrong.textContent = stats.wrong;
      el.streak.textContent = stats.streak;
      el.best.textContent = stats.best;
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

    function startTimer() {
      const secs = Number(el.seconds.value);
      el.bar.style.transition = "none";
      el.bar.style.transform = "scaleX(1)";
      void el.bar.offsetWidth; // restart the transition
      el.bar.style.transition = `transform ${secs}s linear`;
      el.bar.style.transform = "scaleX(0)";
      timeoutId = setTimeout(() => finish(null), secs * 1000);
    }

    function stopTimerBar() {
      const t = getComputedStyle(el.bar).transform;
      el.bar.style.transition = "none";
      el.bar.style.transform = t === "none" ? "scaleX(1)" : t;
    }

    function next() {
      clearTimers();
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
      el.feedback.textContent = "Welcher Artikel passt? · Which article fits?";
      el.feedback.style.color = "";
      el.answers.forEach((b) => { b.disabled = false; b.classList.remove("correct", "wrong"); });
      el.start.hidden = true;
      el.next.hidden = true;
      renderHint();
      renderPic();
      startTimer();
    }

    function finish(choice) {
      if (answered) return;
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

      const praise = ["Super! · Great! 🎉", "Richtig! · Correct! ⭐", "Toll gemacht! · Well done! 👏", "Klasse! · Awesome! 🚀", "Prima! · Brilliant! 😊"];
      if (ok) {
        el.feedback.textContent = stats.streak >= 5 && stats.streak % 5 === 0
          ? `${stats.streak} richtig in Folge! · ${stats.streak} in a row! 🔥` : praise[Math.floor(Math.random() * praise.length)];
        el.feedback.style.color = "var(--das)";
      } else if (choice) {
        el.feedback.textContent = `Leider falsch – es heißt „${art} ${current.noun}“. · Wrong – it's "${art} ${current.noun}".`;
        el.feedback.style.color = "var(--die)";
      } else {
        el.feedback.textContent = `⏰ Zeit abgelaufen – es heißt „${art} ${current.noun}“. · Time's up – it's "${art} ${current.noun}".`;
        el.feedback.style.color = "var(--muted)";
      }

      el.next.hidden = false;
      if (el.autoSpeak.checked) speak(`${art} ${current.noun}`, el.speakBtn);
      // Leave time to hear the word before moving on.
      if (el.auto.checked) advanceId = setTimeout(next, (ok ? 1800 : 3200) + (el.autoSpeak.checked ? 600 : 0));
    }

    function pause() {
      if (!running) return;
      clearTimers();
      if (!answered) {
        stopTimerBar();
        answered = true;
        el.answers.forEach((b) => { b.disabled = true; });
        el.feedback.textContent = "Pause – drücke „Weiter“. · Paused – press Next.";
      }
      el.next.hidden = false;
    }

    function startWith(category) {
      el.category.value = category || "";
      showTab("game");
      next();
    }

    el.start.addEventListener("click", next);
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
    el.category.addEventListener("change", () => { if (running) next(); });
    el.mistakesOnly.addEventListener("change", () => { if (running) next(); });

    document.addEventListener("keydown", (ev) => {
      if (!$("#tab-game").classList.contains("active")) return;
      if (ev.target.matches("input, select, textarea")) return;
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

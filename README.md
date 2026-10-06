# Anshi German Learning App (der / die / das)

A browser tool for school kids to practise German noun articles. No install and no server needed. Every label has its English meaning next to the German. The dictionary has **15,400+ words**: 7,900 nouns (with plurals), 2,100 verbs (with full conjugation) and 5,400 adjectives, adverbs and small words, plus 17,000 example sentences.

## Start
Open `index.html` in a browser (double-click it). Everything, the fonts included, is in the folder, so no internet is needed.

**Phone and tablet:** the app is an installable web app (PWA) that works offline. See **[DEPLOY.md](DEPLOY.md)** for putting it online for free and installing it on Android. After changing files, run `python3 scripts/update_version.py` so installed apps pick up the update.

To reach it from other devices on your network, run `python3 -m http.server 8000` in this folder and open `http://<your-ip>:8000`.

## Tabs
- **🎮 Spiel**: a noun is shown and you pick der / die / das (buttons or keys 1/2/3). After the time runs out (3–12 s) the correct article is shown. You can choose a category, show the English hint, and practise only your mistakes. Nouns you get wrong come back more often.
- **📚 Nomen Wörter**: 7,900 nouns in 35 categories. The first one, **🎒 Grundschule (Klasse 1–4)**, holds 457 core nouns for primary school (in the spirit of the states' *Grundwortschatz* lists) and is the default in the game. Each noun comes with its plural. Click a category to see its nouns with articles (colour-coded: der blue, die red, das green). You can search in German or English and filter by article. Click a noun to hear it read aloud.
- **📖 Wörterbuch (Dictionary)**: every word in one place, including nouns, verbs, adjectives, adverbs and small words like *weil* or *trotzdem*. You can search in German or English; plurals and verb forms also work, so *hunde* finds *der Hund* and *ging* finds *gehen*. Filter by word type, ⭐ Top 5000 (most frequent words) or first letter, and sort A–Z or by frequency. Click a word to see its details: article and plural for nouns, conjugation for verbs, comparison for adjectives (*gut – besser – am besten*), and example sentences with English translations (click to hear them).
- **🔤 Verben (Verbs)**: 759 common verbs, sorted by frequency, each with its English meaning. You can filter by frequency band (Top 100, 101–200 …) and by type (irregular, separable, reflexive, modal, Perfekt with *sein*), and search in German or English. Click a verb to see its full conjugation: Präsens, Präteritum, Perfekt, Plusquamperfekt, Futur I, Konjunktiv II, the *würde* form and the Imperativ. Irregular forms are shown in orange, and clicking a row reads it aloud.
- **🧩 Fälle (Cases)**: learn Nominativ, Akkusativ, Dativ and Genitiv. **Überblick** covers question words and examples; **Tabellen** covers articles (der/ein/kein/mein), nouns and pronouns in every case; **Präpositionen** covers Akkusativ, Dativ, Genitiv and the two-way Wo?/Wohin? prepositions; **Verben mit Dativ** lists the verbs that take the dative. **Üben** is a practice game: fill in der/den/dem/des (or ein/einen/einem…), or pick the case of a phrase, with explanations. It uses 886 real nouns declined with Wiktionary forms (`js/data/cases.js`).
- **✏️ Sätze (Sentences)**: fill-the-gap sentences in three levels: **🌱 Basis** (A1/A2, for primary-school children), **🌿 Mittel** (B1/B2) and **🌳 Profi** (C1/C2: Konjunktiv I, fixed verb–noun phrases, idioms, comma rules). The missing word is a noun, pronoun, verb, adjective, adverb or a punctuation mark; the chips choose which of these are asked. A sentence comes either with **one gap and four answers** (buttons or keys 1–4) or with **several gaps**, where you drag the words into the gaps (or tap them) and press **Prüfen**. *Lücken* sets this to mixed, one gap only or several gaps only. After each answer the full sentence is shown and read aloud, with its English meaning and, for many sentences, a short grammar tip. Sentences you get wrong come back a little later. 581 sentences in `js/data/sentences.js`.
- **📈 Fortschritt (Progress)**: every answer in the article game, the cases practice and the sentences is saved per day on the device (words, % correct, active minutes, mistakes; 90 days kept). Shows today, the last 7 days, days in a row, a 14-day table and the most frequent mistakes. **Bericht senden** writes a report (today / 7 / 30 days) to send with **Teilen** (share sheet: Gmail, WhatsApp…), **E-Mail** (email app with your address filled in) or **Kopieren**. **⏰ Automatische E-Mail um 20 Uhr**: a Google Apps Script in your own Google account (`scripts/auto-email/Code.gs`, setup in [docs/AUTO-EMAIL.md](docs/AUTO-EMAIL.md)) receives each day's numbers from the app, keeps them in a Google Sheet and emails the report every evening.
- **📤 Hinzufügen**: download the Excel template (`Article | Noun | English | Category | Picture`; Picture is an emoji or an https:// image link), fill it in and upload it (.xlsx/.xls/.csv). You get a preview showing which rows are new, duplicates or invalid. Added nouns are saved in this browser (localStorage) and can be exported or deleted.
- **✍️ Schreibschrift**: type any German word to see it in German school cursive (Schulausgangsschrift, Vereinfachte / Lateinische Ausgangsschrift, Grundschrift) on school writing lines. It can add the article for known nouns, make a tracing practice sheet, and print.

## Silbenbögen (syllables)
The **◡◡ Silben** switch at the top right draws syllable arcs, alternating blue and red, under words in the game, the word lists, the dictionary and the cursive tab (*Schmet·ter·ling*). Syllables for all app words are precomputed in `js/data/syllables.js`: word parts come from Wiktionary or from splitting compounds, and syllables within each part from the LibreOffice hyphenation patterns. Any other word (typed text, uploads) is split in the browser with the TeX German patterns (`vendor/hyph-de-1996.js`, MIT licence).

**Pronunciation in syllables:** set the header's pronunciation menu to **◡ in Silben** to make every 🔊 for a word speak it syllable by syllable, with a pause between syllables, followed by the whole word (*Schmet … ter … ling … Schmetterling*). Example sentences are always spoken normally. The **◡ Silben** buttons in the game, dictionary, conjugation panel and cursive tab do this for one word, whatever the setting. 🐢 slow mode makes the pauses longer.

## Files
- `js/data/*.js`: the built-in noun lists, one line per noun: `der Hund, dog`. Edit these to change the base list.
- `js/data/pictures.js`: pictures (emoji) for nouns, one per line: `Hund 🐕`. Put the article first (`die See 🌊`) when a noun's meaning depends on its article.
- `js/data/verbs.js`: verbs with their key forms (from Wiktionary, via github.com/viorelsfetea/german-verbs-database, CC BY-SA). The full tables are generated from these forms in `app.js`.
- `js/data/09-extended-nouns.js`: about 3,900 more frequent nouns ("Erweiterter Wortschatz"), with English from Wiktionary. They're in the dictionary and the word list; the game's "all categories" leaves them out, but you can pick them as a category.
- `js/data/sentences.js`: the gap sentences, one per line: `Der Hund {v:bellt|bellen|bellst|belle} laut. # The dog barks loudly. # optional tip`. The first option in a gap is the right one; `v` is the word type (n noun, p pronoun, v verb, a adjective, d adverb, z punctuation, where `∅` means "no mark here"). Add your own lines under level `A`, `B` or `C`.
- `js/data/plurals.js`: noun plurals (Wiktionary; compounds use the plural of their last part).
- `js/data/words.js`: adjectives, adverbs and small words. The ~430 most common small words have hand-written English; the rest come from Wiktionary.
- `js/data/examples.js`: example sentences from [Tatoeba](https://tatoeba.org) (CC BY 2.0 FR), chosen automatically: short, simple, preferably written by native speakers, and passed through a kid-safety filter.
- `js/data/ranks.js`: frequency rank of every word (from German written and spoken frequency lists).
- `js/app.js`: application logic
- `css/style.css`: styles
- `vendor/xlsx.full.min.js`: SheetJS, used for reading and writing Excel files
- `manifest.webmanifest`, `sw.js`, `icons/`: installable app (name, icons, offline cache); `scripts/update_version.py` refreshes the cache version
- `fonts/`, `css/fonts.css`: the handwriting fonts and Nunito, bundled (SIL Open Font License, see `fonts/OFL-*.txt`)

## Docs
- `docs/Artikel-Trainer-Licensing-and-Mobile-App.pptx`: slide deck on publishing (licences for each part) and on turning the tool into a mobile app.
- `docs/make_pptx.py`: rebuilds that deck (`pip install python-pptx`, then `python docs/make_pptx.py`).

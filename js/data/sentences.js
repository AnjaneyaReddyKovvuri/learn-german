// Sentences for the "Sätze" tab (fill the gaps), in three levels: A = A1/A2, B = B1/B2, C = C1/C2.
// One sentence per line:   German text with gaps # English # tip (optional)
// A gap is {type:right|wrong|wrong|wrong} – the FIRST option is the right one, the others must be clearly wrong.
// Types: n noun, p pronoun, v verb, a adjective, d adverb, z punctuation (∅ = no punctuation mark here).
// A sentence may have several gaps. Don't use two gaps whose answers could be swapped or combined differently.
window.SENTENCE_DATA = {

/* ------------------------------ A1 / A2 ------------------------------ */
A: `
Ich {v:heiße|heißt|heißen|heiß} Anna und {v:bin|bist|ist|sind} sieben Jahre alt. # My name is Anna and I am seven years old.
Das ist mein Bruder. {p:Er|Sie|Es|Wir} ist zehn Jahre alt. # This is my brother. He is ten years old.
Das ist meine Oma. {p:Sie|Er|Es|Du} wohnt in Hamburg. # This is my grandma. She lives in Hamburg.
Wie {v:heißt|heiße|heißen|geheißen} du{z:?|.|,|:} # What is your name?
Die {n:Katze|Hund|Pferd|Vogel} {v:schläft|schlafen|schläfst|schlafe} auf dem Sofa. # The cat is sleeping on the sofa.
Der Hund {v:bellt|bellen|bellst|belle} sehr {a:laut|rund|eckig|gelb}. # The dog barks very loudly.
Ich trinke ein Glas {n:Wasser|Brot|Käse|Reis}. # I drink a glass of water.
Der Schnee ist {a:weiß|schwarz|grün|rot}{z:.|?|,|:} # Snow is white.
Eis ist {a:kalt|heiß|warm|trocken}, aber Feuer ist heiß. # Ice is cold, but fire is hot.
Du {v:bist|bin|ist|sind} mein {a:bester|beste|bestes|besten} Freund. # You are my best friend.
Wir {v:haben|habt|hat|habe} einen {a:kleinen|kleine|kleiner|kleines} Hund. # We have a small dog. # einen + -en: einen kleinen Hund (Akkusativ, der).
Ich {v:kann|kannst|können|könnt} schon {d:sehr|gern|wohin|woher} gut schwimmen. # I can already swim very well.
Mama {v:kocht|kochen|kochst|koche} heute {n:Nudeln|Stühle|Schuhe|Steine}. # Mum is cooking pasta today.
Die Kinder {v:spielen|spielt|spielst|spiele} auf dem {n:Spielplatz|Schule|Straße|Wiese}. # The children are playing in the playground.
Ich habe ein Eis {v:gegessen|essen|esse|isst}{z:.|?|,|:} # I ate an ice cream.
Wir {v:sind|haben|seid|hat} gestern in den Zoo {v:gegangen|gehen|geht|ging}. # We went to the zoo yesterday. # gehen → Perfekt mit „sein“: wir sind gegangen.
Ich {v:habe|bin|hat|ist} meine Hausaufgaben schon {v:gemacht|machen|macht|mache}. # I have already done my homework.
Ich stehe jeden Morgen um sieben Uhr {v:auf|ein|zu|mit}. # I get up at seven o'clock every morning. # aufstehen: ich stehe … auf.
Er {v:liest|lest|lesen|lese} ein {n:Buch|Zeitung|Brief|Geschichte}. # He is reading a book.
{v:Komm|Kommst|Kommen|Gekommen} bitte {d:hierher|hier|dort|wo}, Paul{z:!|?|,|:} # Please come here, Paul! # Wohin? → hierher. Wo? → hier.
Du {v:musst|muss|müssen|müsst} jetzt ins Bett {v:gehen|gehst|geht|gegangen}. # You have to go to bed now.
Was {v:möchtest|möchte|möchten|möchtet} du trinken{z:?|.|,|:} # What would you like to drink?
Der Vogel {v:fliegt|fliegen|fliegst|fliege} über das {n:Haus|Baum|Straße|Schule}. # The bird flies over the house.
Ich {v:esse|isst|esst|essen} {d:gern|sehr|woher|wohin} Äpfel. # I like eating apples.
Meine Schwester {v:fährt|fahre|fahren|fahrt} mit dem {n:Fahrrad|Straßenbahn|U-Bahn|Fähre} zur Schule. # My sister goes to school by bike.
Wir sind mit dem Zug nach Berlin {v:gefahren|fahren|gefahrt|fuhren}. # We went to Berlin by train.
{d:Gestern|Morgen|Bald|Übermorgen} war ich krank. # Yesterday I was ill.
Gestern {v:war|bin|ist|sein} ich im Zoo. # Yesterday I was at the zoo.
Ich {v:will|willst|wollen|wollt} später Ärztin {v:werden|wird|wirst|geworden}. # I want to become a doctor later.
{v:Hast|Hat|Habe|Haben} du einen Bruder{z:?|.|,|:} # Do you have a brother?
Morgen {v:gehen|geht|gehst|gehe} wir ins {n:Schwimmbad|Schule|Park|Stadt}. # Tomorrow we are going to the swimming pool.
Es {v:regnet|regnen|regnest|regne} schon den ganzen {n:Tag|Nacht|Woche|Stunde}. # It has been raining all day.
Papa {v:kauft|kaufen|kaufst|kaufe} im Supermarkt {n:Brot|Stuhl|Schnee|Regen}. # Dad buys bread at the supermarket.
Ich {v:rufe|ruft|rufen|rufst} heute meine Oma {v:an|ein|unter|mit}. # I am calling my grandma today. # anrufen: ich rufe … an.
Darf ich bitte auf die Toilette {v:gehen|gehe|geht|gegangen}{z:?|.|,|:} # May I go to the toilet, please?
Ich {v:mache|machst|macht|machen} das Fenster {v:zu|bei|von|mit}. # I close the window. # zumachen: ich mache … zu.
Wir {v:sehen|seht|sieht|siehst} am Abend zusammen {v:fern|weit|nah|hoch}. # We watch TV together in the evening. # fernsehen: wir sehen … fern.
Lena {v:hat|ist|haben|sind} heute Geburtstag. # It is Lena's birthday today.
Mein Vater {v:arbeitet|arbeiten|arbeitest|arbeite} in einem {n:Büro|Schule|Fabrik|Bank}. # My father works in an office.
Die Lehrerin {v:schreibt|schreiben|schreibst|schreibe} ein Wort an die {n:Tafel|Heft|Buch|Tisch}. # The teacher writes a word on the board.
Ich habe gestern einen Film {v:gesehen|sehen|sehe|gesieht}. # I watched a film yesterday.
Hast du gut {v:geschlafen|schlafen|schläfst|geschlaft}{z:?|.|,|:} # Did you sleep well?
Er ist sehr schnell {v:gelaufen|laufen|läuft|gelauft}. # He ran very fast.
{v:Gib|Gibst|Geben|Gegeben} {p:mir|mich|ich|mein} bitte den Ball! # Please give me the ball!
{v:Mach|Machst|Machen|Gemacht} bitte die Tür zu{z:!|?|,|:} # Please close the door!
Kannst du {p:mir|mich|ich|mein} bitte {v:helfen|hilfst|hilft|geholfen}? # Can you help me, please? # helfen + Dativ: mir.
Ich liebe {p:dich|dir|du|dein}, Mama{z:!|?|:|;} # I love you, Mum!
Das ist {p:mein|meine|meinen|meinem} Hund. Er heißt Bello. # This is my dog. His name is Bello.
Das ist {p:meine|mein|meinen|meinem} Katze. Sie heißt Mimi. # This is my cat. Her name is Mimi.
Ich sehe {p:ihn|ihm|er|sein} jeden Tag in der {n:Schule|Haus|Garten|Zimmer}. # I see him every day at school.
Wo ist Lena? Ich suche {p:sie|ihr|er|ihn}. # Where is Lena? I am looking for her.
Das Buch gehört {p:mir|mich|ich|mein}. # The book belongs to me. # gehören + Dativ: mir.
Wie geht es {p:dir|dich|du|dein}{z:?|.|,|:} # How are you?
{p:Wer|Wen|Wem|Wessen} ist das? – Das ist mein Lehrer. # Who is that? – That is my teacher.
{p:Was|Wer|Wen|Wem} isst du gern? – Ich esse gern Pizza. # What do you like to eat? – I like pizza.
Wir waschen {p:uns|sich|mich|dich} vor dem Essen die {n:Hände|Hals|Kopf|Bauch}. # We wash our hands before eating.
Er freut {p:sich|mich|dich|uns} auf die {n:Ferien|Urlaub|Geburtstag|Wochenende}. # He is looking forward to the holidays.
Ist das {p:dein|deine|deinen|dich} Fahrrad{z:?|.|,|:} # Is that your bike?
{p:Ihr|Wir|Er|Ich} seid heute sehr laut. # You (all) are very loud today.
Meine Eltern sind nett. Ich mag {p:sie|ihnen|ihn|es} sehr. # My parents are nice. I like them a lot.
{p:Wir|Ich|Du|Er} spielen zusammen im {n:Garten|Küche|Schule|Straße}. # We play together in the garden.
Das ist unser Lehrer. {p:Wir|Ihn|Uns|Ihm} mögen {p:ihn|er|ihm|sein}. # This is our teacher. We like him.
Oma liest {p:uns|wir|unser|sich} eine {n:Geschichte|Buch|Märchen|Brief} vor. # Grandma reads us a story.
Ich habe einen Hund. {p:Er|Sie|Es|Ihn} heißt Rex. # I have a dog. His name is Rex.
Wem gehört die Tasche? – Sie gehört {p:ihm|ihn|er|sein}. # Whose bag is it? – It belongs to him.
Wir besuchen {p:unsere|unser|unseren|unserem} Großeltern am {n:Wochenende|Woche|Ferien|Zeit}. # We visit our grandparents at the weekend.
Kommt {p:ihr|wir|ich|du} heute mit ins Kino? # Are you (all) coming to the cinema today?
Eine Woche hat sieben {n:Tage|Stunden|Monate|Jahre}. # A week has seven days.
Ein Jahr hat zwölf {n:Monate|Wochen|Tage|Stunden}. # A year has twelve months.
Nach dem Montag kommt der {n:Dienstag|Mittwoch|Sonntag|Freitag}. # After Monday comes Tuesday.
Ich schreibe mit dem {n:Stift|Schere|Brille|Gabel} in mein {n:Heft|Tasche|Tafel|Mappe}. # I write with the pen in my exercise book.
Wir essen in der {n:Küche|Bad|Garten|Flur} zu Mittag. # We have lunch in the kitchen.
Das {n:Baby|Mutter|Vater|Oma} weint, weil es Hunger {v:hat|ist|haben|bin}. # The baby is crying because it is hungry.
Mein {n:Bruder|Schwester|Mutter|Tante} heißt Paul. # My brother's name is Paul.
Meine {n:Schwester|Bruder|Vater|Onkel} heißt Lena. # My sister's name is Lena.
Der {n:Lehrer|Lehrerin|Mädchen|Kind} erklärt die Aufgabe. # The teacher explains the exercise.
Mit den {n:Augen|Ohren|Füßen|Händen} kann ich {v:sehen|sehe|sieht|gesehen}. # I can see with my eyes.
Mit den {n:Ohren|Augen|Beinen|Haaren} kann ich {v:hören|höre|hört|gehört}. # I can hear with my ears.
Die Kuh gibt {n:Milch|Saft|Honig|Wolle}. # The cow gives milk.
Die Biene macht {n:Honig|Milch|Käse|Eier}. # The bee makes honey.
Das Huhn legt ein {n:Ei|Apfel|Kuh|Milch}. # The hen lays an egg.
Zum Geburtstag bekomme ich ein {n:Geschenk|Kuchen|Torte|Karte}. # I get a present for my birthday.
Heute scheint die {n:Sonne|Mond|Stern|Regen}. # The sun is shining today.
In der Nacht scheint der {n:Mond|Sonne|Wolke|Lampe}. # At night the moon shines.
Im Klassenzimmer sitzen viele {n:Kinder|Kind|Kindes|Kindern}. # Many children are sitting in the classroom.
Ich habe zwei {n:Brüder|Bruder|Bruders|Brüdern} und eine Schwester. # I have two brothers and one sister.
Auf dem Baum sitzen drei {n:Vögel|Vogel|Vogels|Vögeln}. # Three birds are sitting in the tree.
Im Korb liegen fünf {n:Äpfel|Apfel|Apfels|Äpfeln}. # There are five apples in the basket.
Ich wohne in einem großen {n:Haus|Wohnung|Stadt|Straße}. # I live in a big house.
Zum Frühstück esse ich {n:Brot|Stuhl|Tisch|Löffel} mit Butter. # For breakfast I eat bread with butter.
Ich putze mir jeden Abend die {n:Zähne|Zahn|Zahns|Zähnen}. # I brush my teeth every evening.
Der Bäcker backt {n:Brot|Milch|Wurst|Fisch}. # The baker bakes bread.
Am {n:Sonntag|Woche|Nacht|Jahr} haben wir keine Schule. # On Sunday we have no school.
Im {n:Winter|Sonne|Wolke|Woche} kann man einen Schneemann bauen. # In winter you can build a snowman.
Ich brauche einen {n:Regenschirm|Jacke|Mütze|Brille}, weil es regnet. # I need an umbrella because it is raining.
Die Zitrone schmeckt {a:sauer|süß|salzig|scharf}. # The lemon tastes sour.
Der Elefant ist sehr {a:groß|klein|leicht|dünn}. # The elephant is very big.
Ich bin so {a:müde|hungrig|durstig|schnell}, ich möchte {v:schlafen|schlafe|schläft|geschlafen}. # I am so tired, I would like to sleep.
Ich bin {a:durstig|müde|satt|laut}. Ich möchte Wasser {v:trinken|trinke|trinkt|getrunken}. # I am thirsty. I would like to drink water.
Das ist ein {a:kleines|kleiner|kleine|kleinen} Haus. # That is a small house. # ein + das-Wort: ein kleines Haus.
Ich habe einen {a:neuen|neue|neuer|neues} Rucksack. # I have a new backpack.
Das ist eine {a:schöne|schöner|schönes|schönen} Blume. # That is a beautiful flower.
Der {a:alte|alter|altes|alten} Mann sitzt auf der {n:Bank|Stuhl|Sofa|Bett}. # The old man is sitting on the bench.
Mein Bruder ist {a:älter|alt|am ältesten|ältere} als ich. # My brother is older than me. # Vergleich: älter als …
Die Maus ist {a:kleiner|klein|kleinste|am kleinsten} als die Katze. # The mouse is smaller than the cat.
Der Gepard ist das {a:schnellste|schneller|schnell|schnellsten} Tier der Welt. # The cheetah is the fastest animal in the world.
Gras ist {a:grün|blau|rot|lila}. # Grass is green.
Die Banane ist {a:gelb|blau|grau|schwarz} und schmeckt {a:süß|sauer|salzig|bitter}. # The banana is yellow and tastes sweet.
Ich esse gern {a:frisches|frischer|frische|frischen} Brot. # I like eating fresh bread.
Mein Zimmer ist nicht schmutzig, es ist {a:sauber|dreckig|nass|kaputt}. # My room is not dirty, it is clean.
Die Giraffe hat einen {a:langen|lange|langer|langes} Hals. # The giraffe has a long neck.
Nachts ist es {a:dunkel|hell|bunt|gelb}. # At night it is dark.
Das Kind trägt eine {a:rote|roter|rotes|roten} Mütze. # The child is wearing a red hat.
Wir haben ein {a:neues|neuer|neue|neuen} Auto gekauft. # We bought a new car.
Ich mag den {a:kleinen|kleine|kleiner|kleines} Hund. # I like the small dog.
Die Schnecke ist {a:langsam|schnell|laut|hoch}. # The snail is slow.
Das ist die {a:beste|besten|bester|bestes} Pizza der Stadt. # That is the best pizza in town.
Ein Stein ist {a:hart|weich|flüssig|süß}. # A stone is hard.
{d:Wo|Wann|Warum|Wie} wohnst du? – Ich wohne in Berlin. # Where do you live? – I live in Berlin.
{d:Wie|Wo|Wann|Wohin} alt bist du? – Ich bin acht. # How old are you? – I am eight.
{d:Wohin|Wo|Woher|Wann} gehst du? – Ich gehe in die Schule. # Where are you going? – I am going to school. # Wohin? = Richtung (to where).
{d:Woher|Wohin|Wo|Wann} kommst du? – Ich komme aus Indien. # Where are you from? – I come from India. # Woher? = from where.
{d:Wann|Wo|Wohin|Wie} beginnt die Schule? – Um acht Uhr. # When does school start? – At eight o'clock.
{d:Warum|Wo|Wann|Wohin} weinst du? – Weil ich traurig bin. # Why are you crying? – Because I am sad.
Ich spiele {d:gern|sehr|woher|wohin} Fußball. # I like playing football.
Das Eis schmeckt {d:sehr|gern|wohin|woher} gut. # The ice cream tastes very good.
{d:Morgen|Gestern|Vorgestern|Neulich} werde ich acht Jahre alt. # Tomorrow I will be eight years old.
Ich bin {d:gestern|morgen|übermorgen|bald} ins Kino gegangen. # I went to the cinema yesterday.
Ich kann {d:nicht|kein|keine|nichts} schwimmen. # I cannot swim. # Verben verneint man mit „nicht“.
Der Ball liegt {d:dort|dorthin|wohin|woher}. # The ball is over there.
Zuerst frühstücke ich, {d:dann|gestern|sehr|gern} putze ich die Zähne. # First I have breakfast, then I brush my teeth.
Ich habe Hunger, {d:deshalb|trotzdem|gestern|sehr} esse ich ein Brot. # I am hungry, so I eat a sandwich.
Ich war noch {d:nie|sehr|gern|bald} in Paris. # I have never been to Paris.
{d:Heute|Gestern|Vorgestern|Neulich} ist Montag, morgen ist Dienstag. # Today is Monday, tomorrow is Tuesday.
Heute ist Montag, {d:morgen|gestern|vorgestern|neulich} ist Dienstag. # Today is Monday, tomorrow is Tuesday.
Heute ist Montag, {d:gestern|morgen|übermorgen|bald} war Sonntag. # Today is Monday, yesterday was Sunday.
Der Vogel sitzt {d:oben|nach oben|wohin|hinauf} auf dem Dach. # The bird is sitting up on the roof.
Ich bin {d:sehr|gern|viel|wohin} müde. # I am very tired.
Die Katze schläft {d:gern|sehr|woher|wohin} auf meinem Bett. # The cat likes sleeping on my bed.
{d:Wie|Wo|Wer|Wann} viele Geschwister hast du? # How many brothers and sisters do you have?
{d:Wie|Was|Wer|Wo} geht es dir? – Danke, gut! # How are you? – Fine, thanks!
Das ist {d:nicht|kein|keine|nichts} richtig. # That is not right.
Ich habe einen Hund{z:.|?|,|:} # I have a dog.
Hilfe{z:!|?|,|:} Das Haus brennt! # Help! The house is on fire!
Ich mag Äpfel{z:,|.|?|!} Birnen und Bananen. # I like apples, pears and bananas. # Aufzählung: Komma zwischen den Wörtern, aber nicht vor „und“.
Ich bleibe zu Hause{z:,|.|?|:} weil ich krank {v:bin|bist|ist|sein}. # I am staying at home because I am ill. # Vor „weil“ steht ein Komma; das Verb steht am Ende.
Mama sagt{z::|,|.|?} „Komm bitte zum Essen!“ # Mum says: “Please come and eat!” # Vor der wörtlichen Rede steht ein Doppelpunkt.
Kommst du heute zu mir{z:?|.|,|:} # Are you coming to my place today?
Pass auf{z:!|?|,|:} Da kommt ein Auto! # Watch out! A car is coming!
Wo ist mein Ball{z:?|.|!|,} # Where is my ball?
Ich glaube{z:,|.|:|?} dass es morgen {v:regnet|regnen|regnest|geregnet}. # I think that it will rain tomorrow. # Vor „dass“ steht ein Komma.
Wenn es regnet{z:,|.|?|!} nehme ich einen {n:Regenschirm|Sonnenbrille|Badehose|Mütze}. # When it rains, I take an umbrella.
Ich habe einen Bruder und eine Schwester{z:.|,|?|:} # I have a brother and a sister.
Ich mag Hunde{z:∅|,|.|:} und Katzen. # I like dogs and cats. # Vor „und“ steht hier kein Komma.
Guten Morgen{z:,|?|:|;} Frau Müller! # Good morning, Mrs Müller!
Im Zoo sehen wir Löwen{z:,|.|?|!} Affen{z:∅|,|.|?} und Elefanten. # At the zoo we see lions, monkeys and elephants.
Wie spät ist es{z:?|.|,|!} # What time is it?
Ich komme nicht mit{z:,|.|?|:} denn ich bin müde. # I am not coming along because I am tired.
Er fragt{z::|,|.|!} „Wie heißt du?“ # He asks: “What is your name?”
Ich esse gern Eis{z:,|.|?|:} aber ich mag keine Schokolade. # I like ice cream, but I don't like chocolate. # Vor „aber“ steht ein Komma.
Heute ist Montag{z:.|?|,|:} Morgen ist Dienstag. # Today is Monday. Tomorrow is Tuesday.
Lisa{z:,|.|?|:} komm bitte her! # Lisa, please come here!
Weißt du{z:,|.|:|!} wo meine Schuhe sind{z:?|.|,|:} # Do you know where my shoes are?
Ich bin müde{z:,|:|?|∅} weil ich schlecht geschlafen habe. # I am tired because I slept badly.
`,

/* ------------------------------ B1 / B2 ------------------------------ */
B: `
Wenn ich mehr Zeit {v:hätte|hatte|haben|gehabt}, {v:würde|werde|wurde|wird} ich öfter Sport treiben. # If I had more time, I would do sport more often. # Konjunktiv II für irreale Bedingungen: hätte … würde.
Das Haus {v:wurde|werde|hat|worden} 1890 {v:gebaut|bauen|baute|bauend}. # The house was built in 1890. # Passiv Präteritum: wurde + Partizip II.
Obwohl er krank {v:war|wäre|sein|gewesen}, {v:ging|gehen|gegangen|gehe} er zur Arbeit. # Although he was ill, he went to work.
Als wir ankamen, {v:hatte|war|habe|hätte} der Film schon {v:begonnen|beginnen|begann|beginnt}. # When we arrived, the film had already started. # Plusquamperfekt: hatte + Partizip II (was vorher passiert ist).
Die Aufgaben müssen bis morgen {v:erledigt|erledigen|erledigte|erledigend} werden. # The tasks must be done by tomorrow. # Passiv mit Modalverb: müssen + Partizip II + werden.
Ich lasse mein Fahrrad {v:reparieren|repariert|reparierte|zu reparieren}. # I am having my bike repaired. # lassen + Infinitiv (ohne „zu“).
Er tut so, als ob er nichts {v:wüsste|wissen|gewusst|wusstet}. # He acts as if he knew nothing. # als ob + Konjunktiv II.
Ich habe vergessen, die Tür {v:abzuschließen|abschließen|zu abschließen|abgeschlossen}. # I forgot to lock the door. # Trennbare Verben: „zu“ steht in der Mitte – abzuschließen.
Statt zu lernen, {v:sah|sehen|gesehen|sieh} er den ganzen Abend {v:fern|weit|lang|vor}. # Instead of studying, he watched TV all evening.
Nachdem wir gegessen {v:hatten|hätten|waren|hattet}, {v:gingen|gegangen|geht|gehst} wir spazieren. # After we had eaten, we went for a walk. # nachdem + Plusquamperfekt, Hauptsatz im Präteritum.
Könntest du mir bitte {v:helfen|hilfst|geholfen|half}{z:?|;|,|:} # Could you help me, please?
Ich wünschte, ich {v:könnte|kann|konnte|können} fliegen. # I wish I could fly.
An deiner Stelle {v:würde|würdest|wurde|wird} ich mit ihm {v:reden|rede|geredet|redete}. # If I were you, I would talk to him.
Der Brief ist gestern {v:abgeschickt|abschicken|abschickte|abzuschicken} worden. # The letter was sent yesterday. # Passiv Perfekt: ist + Partizip II + worden.
Sie {v:bat|bot|betete|bettete} mich um Hilfe. # She asked me for help. # bitten – bat – gebeten · bieten – bot · beten – betete.
Das Kind ist vom Fahrrad {v:gefallen|gefällt|gefallt|fiel}. # The child fell off the bike.
Wir haben uns lange nicht {v:gesehen|sehen|sahen|gesieht}. # We haven't seen each other for a long time.
Je mehr ich übe, desto besser {v:werde|wird|würden|geworden} ich. # The more I practise, the better I get.
Ich bin gestern früh {v:aufgestanden|aufstehen|aufgesteht|aufstand}, weil ich einen Termin {v:hatte|hätte|haben|gehabt}. # I got up early yesterday because I had an appointment.
Er {v:hat|ist|wird|war} sich beim Sport verletzt. # He injured himself doing sport. # Reflexive Verben bilden das Perfekt mit „haben“.
Wir {v:sind|haben|werden|hatten} gestern erst um Mitternacht eingeschlafen. # We only fell asleep at midnight yesterday. # einschlafen = Zustandsänderung → Perfekt mit „sein“.
Kannst du mir sagen, wann der Zug {v:abfährt|fährt ab|abfahren|abgefahren}? # Can you tell me when the train leaves? # Im Nebensatz steht das Verb am Ende und bleibt zusammen.
Ich weiß nicht, ob er morgen {v:kommt|kommen|kam|gekommen}. # I don't know whether he is coming tomorrow.
Es wäre schön, wenn du mich besuchen {v:würdest|wirst|würde|wurdest}. # It would be nice if you visited me.
Die Kinder durften gestern länger {v:aufbleiben|aufgeblieben|aufzubleiben|bleiben auf}. # The children were allowed to stay up longer yesterday.
Er behauptet, den Mann nie gesehen zu {v:haben|sein|hat|werden}. # He claims never to have seen the man.
Das Fenster {v:lässt|kann|wird|ist} sich nicht öffnen. # The window cannot be opened. # sich lassen + Infinitiv = kann gemacht werden.
Hier darf nicht geraucht {v:werden|sein|haben|worden}. # Smoking is not allowed here.
Sie {v:bewirbt|bewerbt|bewerbe|bewirbst} sich um eine {n:Stelle|Platz|Beruf|Job} in München. # She is applying for a job in Munich. # sich bewerben um: e → i (sie bewirbt sich).
Der Lehrer {v:empfiehlt|empfehlt|empfiehl|empfohlen} uns dieses Buch. # The teacher recommends this book to us.
{v:Nimm|Nehm|Nimmst|Nehme} dir ruhig noch ein Stück Kuchen! # Go ahead and take another piece of cake! # Imperativ: nehmen → nimm!
{v:Sei|Bist|Sein|Bin} bitte leise, das Baby schläft! # Please be quiet, the baby is sleeping! # Imperativ von „sein“: sei!
Ich hätte gestern mehr lernen {v:sollen|gesollt|sollte|sollen haben}. # I should have studied more yesterday. # Modalverb mit Infinitiv: hätte … lernen sollen.
Er ist in Berlin {v:aufgewachsen|aufwachsen|aufgewachst|aufwuchs}. # He grew up in Berlin.
Das ist der Mann, {p:dessen|deren|dem|den} Auto gestohlen {v:wurde|hat|haben|würde}. # That is the man whose car was stolen. # dessen = Genitiv (maskulin/neutrum): whose.
Die Frau, mit {p:der|dem|die|den} ich gesprochen habe, ist meine Nachbarin. # The woman I talked to is my neighbour. # mit + Dativ: mit der.
Ich kann {p:mir|mich|sich|mein} das nicht vorstellen. # I can't imagine that. # sich (Dativ) etwas vorstellen = to imagine.
Hast du {p:dich|dir|sich|dein} schon für den Kurs {v:angemeldet|anmelden|anmeldest|angemelden}? # Have you already registered for the course?
Das ist alles, {p:was|das|dass|welches} ich weiß. # That is all I know. # Nach alles, nichts, etwas, vieles: was.
Das ist das Beste, {p:was|das|dass|wer} mir je passiert ist. # That is the best thing that has ever happened to me. # Nach dem Superlativ (das Beste, das Schönste): was.
Die Stadt, in {p:der|dem|die|den} ich geboren bin, ist sehr klein. # The town where I was born is very small.
Die Kinder, {p:denen|die|deren|den} ich geholfen habe, haben sich bedankt. # The children I helped said thank you. # helfen + Dativ, Plural: denen.
{p:Wer|Wen|Wem|Wessen} zu spät kommt, muss draußen warten. # Whoever comes late has to wait outside.
Ich habe {p:ihm|ihn|er|sein} das Geld schon zurückgegeben. # I have already given him the money back.
Sie hat {p:ihrem|ihren|ihr|ihrer} Bruder ein Buch geschenkt. # She gave her brother a book. # Wem? → Dativ: ihrem Bruder.
Könnten Sie {p:mir|mich|ich|meiner} bitte sagen, wie spät es ist? # Could you please tell me what time it is?
Das geht {p:dich|dir|du|dein} nichts an. # That is none of your business. # jemanden (Akkusativ) etwas angehen.
Er wäscht {p:sich|sein|er|ihn} jeden Morgen die Haare. # He washes his hair every morning.
Der Film, {p:den|der|dem|dessen} wir gestern gesehen haben, war spannend. # The film we saw yesterday was exciting.
Wir haben {p:uns|sich|unser|wir} im Urlaub gut erholt. # We had a good rest on holiday.
Ist das dein Stift? – Nein, das ist nicht {p:meiner|mein|meinen|meinem}. # Is that your pen? – No, that isn't mine. # Ohne Nomen: meiner (der), meine (die), meins (das).
Ich brauche einen Stift. Hast du {p:einen|ein|eins|einer}? # I need a pen. Do you have one?
In Deutschland isst {p:man|Mann|jemand|einer} viel Brot. # In Germany people eat a lot of bread.
Worüber ärgerst du {p:dich|dir|sich|du}? # What are you annoyed about?
Das ist die Kollegin, von {p:der|die|dem|deren} ich dir erzählt habe. # That is the colleague I told you about.
Er hat zwei Söhne, {p:die|den|denen|deren} beide studieren. # He has two sons, who are both at university.
Wir müssen bald eine {n:Entscheidung|Bedeutung|Erfahrung|Meinung} treffen. # We have to make a decision soon. # eine Entscheidung treffen.
Sport spielt in meinem Leben eine große {n:Rolle|Stelle|Frage|Sache}. # Sport plays a big role in my life. # eine Rolle spielen.
Ich habe keine {n:Ahnung|Meinung|Bedeutung|Erfahrung}, wo mein Schlüssel ist. # I have no idea where my key is.
Kannst du mir einen {n:Gefallen|Wunsch|Rat|Vorschlag} tun? # Can you do me a favour? # jemandem einen Gefallen tun.
Ich habe mir große {n:Mühe|Sorge|Angst|Lust} gegeben. # I made a great effort. # sich Mühe geben.
Er hat den {n:Kunden|Kunde|Kundes|Kundin} freundlich begrüßt. # He greeted the customer in a friendly way. # n-Deklination: der Kunde → den Kunden.
Ich habe lange mit dem {n:Kollegen|Kollege|Kolleges|Kollegin} gesprochen. # I talked to the colleague for a long time. # n-Deklination: der Kollege → dem Kollegen.
Wegen des schlechten {n:Wetters|Wetter|Wettern|Wettere} bleiben wir zu Hause. # Because of the bad weather we are staying at home. # wegen + Genitiv: des Wetters.
Sie stellte dem Lehrer eine {n:Frage|Antwort|Meinung|Ahnung}. # She asked the teacher a question. # eine Frage stellen.
Er legt großen {n:Wert|Preis|Rang|Sinn} auf Pünktlichkeit. # He attaches great importance to punctuality. # Wert legen auf + Akkusativ.
Nimm bitte {n:Rücksicht|Vorsicht|Nachsicht|Aussicht} auf deine Nachbarn. # Please show consideration for your neighbours. # Rücksicht nehmen auf.
Das kommt nicht in {n:Frage|Antwort|Zweifel|Sache}. # That is out of the question.
Ich habe den {n:Eindruck|Ausdruck|Druck|Abdruck}, dass er nicht die Wahrheit sagt. # I have the impression that he is not telling the truth.
Im {n:Gegensatz|Gegenteil|Gegenstand|Gegner} zu mir ist er sehr sportlich. # Unlike me, he is very sporty. # im Gegensatz zu … · aber: „Im Gegenteil!“ steht allein.
Meiner {n:Meinung|Ahnung|Bedeutung|Entscheidung} nach ist das keine gute Idee. # In my opinion that is not a good idea.
Ich verstehe nur {n:Bahnhof|Flughafen|Hafen|Zug}. # It's all Greek to me. # Redewendung: nur Bahnhof verstehen = nichts verstehen.
Das Auto meines {n:Vaters|Vater|Vatern|Väter} ist kaputt. # My father's car is broken. # Genitiv: meines Vaters.
Ich habe einen {n:Termin|Datum|Verabredung|Uhrzeit} beim Zahnarzt. # I have an appointment at the dentist's.
Er hat die {n:Prüfung|Examen|Test|Zeugnis} bestanden. # He passed the exam.
Darf ich Ihnen einen {n:Vorschlag|Meinung|Idee|Frage} machen? # May I make a suggestion?
Mach dir keine {n:Sorgen|Zweifel|Angst|Lust}, alles wird gut! # Don't worry, everything will be fine! # sich Sorgen machen.
Ich habe keine {n:Lust|Laune|Freude|Wunsch}, heute auszugehen. # I don't feel like going out today. # Lust haben, etwas zu tun.
Zum {n:Glück|Pech|Freude|Spaß} ist niemand verletzt worden. # Luckily nobody was hurt.
Vielen Dank für Ihre {n:Hilfe|Helfen|Hilf|Helfer}! # Thank you very much for your help!
Auf jeden {n:Fall|Falle|Platz|Weg} komme ich morgen. # I am definitely coming tomorrow.
Das macht keinen {n:Sinn|Bedeutung|Verstand|Idee}. # That makes no sense.
Ich bin der gleichen {n:Meinung|Gedanke|Sinn|Kopf} wie du. # I am of the same opinion as you.
Trotz des {a:schlechten|schlechtes|schlechter|schlechtem} Wetters gingen wir spazieren. # In spite of the bad weather we went for a walk. # Nach dem Artikel im Genitiv: -en.
Ich trinke gern {a:kalten|kalter|kaltes|kaltem} Kaffee. # I like drinking cold coffee. # Ohne Artikel trägt das Adjektiv die Artikel-Endung: (den) kalten Kaffee.
Mit {a:großer|großen|großem|große} Freude habe ich deinen Brief gelesen. # I read your letter with great pleasure. # mit + Dativ, feminin, ohne Artikel: großer.
Sie trägt ein {a:rotes|roter|roten|rotem} Kleid und {a:schwarze|schwarzer|schwarzem|schwarzen} Schuhe. # She is wearing a red dress and black shoes.
Das ist der {a:beste|besten|bester|bestes} Film, {p:den|der|dem|dessen} ich je gesehen habe. # That is the best film I have ever seen.
Er ist sehr {a:stolz|froh|zufrieden|begeistert} auf seine Tochter. # He is very proud of his daughter. # stolz auf + Akkusativ.
Bist du mit deiner Note {a:zufrieden|stolz|interessiert|abhängig}? # Are you happy with your mark? # zufrieden mit + Dativ.
Der Preis ist {a:abhängig|zufrieden|stolz|reich} von der Größe. # The price depends on the size. # abhängig von + Dativ.
Je {a:älter|alt|ältesten|älteste} man wird, desto {a:vergesslicher|vergesslich|vergesslichsten|am vergesslichsten} wird man. # The older you get, the more forgetful you become. # je + Komparativ …, desto + Komparativ.
Das war die {a:schwierigste|schwieriger|schwierig|schwierigsten} Prüfung meines Lebens. # That was the hardest exam of my life.
Ich bin an Geschichte sehr {a:interessiert|interessant|interessierend|interesse}. # I am very interested in history. # Ich bin interessiert (Person) · Das Buch ist interessant (Sache).
Der Film war wirklich {a:langweilig|gelangweilt|langweilend|langweile}. # The film was really boring. # langweilig = boring · gelangweilt = bored.
Sie ist {a:verheiratet|geheiratet|heiratend|verheiraten} und hat zwei Kinder. # She is married and has two children.
Er wohnt in einem {a:kleinen|kleinem|kleines|kleiner} Dorf in der Nähe von Köln. # He lives in a small village near Cologne. # Nach „einem“ (Dativ): immer -en.
Wir suchen eine {a:größere|größer|größeren|größeres} Wohnung. # We are looking for a bigger flat.
Guten Appetit! Das Essen sieht {a:lecker|leckeres|leckere|leckeren} aus. # Enjoy your meal! The food looks delicious. # Nach dem Verb bleibt das Adjektiv ohne Endung.
Mein Bruder ist genauso {a:groß|größer|größte|am größten} wie ich. # My brother is just as tall as me. # genauso + Grundform + wie.
Sie ist für das Projekt {a:verantwortlich|verantwortet|antwortlich|verantwortend}. # She is responsible for the project.
Ich bin {a:gespannt|spannend|gespannend|spannt}, wie der Film endet. # I am curious to see how the film ends.
Viele {a:Deutsche|Deutschen|Deutscher|Deutsch} fahren im Sommer ans Meer. # Many Germans go to the seaside in summer. # Nominalisiertes Adjektiv: viele Deutsche, die Deutschen.
Ich interessiere mich sehr {d:dafür|darauf|daran|damit}, wie Flugzeuge fliegen. # I am very interested in how planes fly. # sich interessieren für → dafür.
Wir warten schon lange {d:darauf|dafür|daran|darüber}, dass der Zug kommt. # We have been waiting a long time for the train to come. # warten auf → darauf.
Ich denke oft {d:daran|darauf|dafür|damit}, wie schön der Urlaub war. # I often think about how lovely the holiday was. # denken an → daran.
Er hat sich {d:darüber|daran|damit|dazu} geärgert, dass niemand angerufen hat. # He was annoyed that nobody called. # sich ärgern über → darüber.
Es regnete stark; {d:trotzdem|deshalb|außerdem|nämlich} gingen wir spazieren. # It was raining hard; nevertheless we went for a walk.
Ich habe keine Zeit; {d:außerdem|trotzdem|dennoch|sonst} habe ich auch keine Lust. # I have no time; besides, I don't feel like it either.
Beeil dich, {d:sonst|deshalb|trotzdem|außerdem} verpassen wir den Bus! # Hurry up, otherwise we'll miss the bus!
Er war müde, {d:deshalb|trotzdem|sonst|dennoch} ging er früh ins Bett. # He was tired, so he went to bed early.
Er ist krank, {d:trotzdem|deshalb|darum|daher} geht er zur Arbeit. # He is ill; he goes to work anyway.
{d:Worüber|Worauf|Womit|Wofür} lachst du? – Über deinen Witz. # What are you laughing about? – About your joke.
{d:Worauf|Worüber|Wovon|Womit} wartest du noch? # What are you still waiting for?
{d:Womit|Worauf|Wofür|Worüber} fährst du zur Arbeit? – Mit dem Fahrrad. # How do you get to work? – By bike.
{d:Wovon|Worauf|Worin|Wozu} träumst du? # What do you dream of? # träumen von → wovon.
Stell die Tasche bitte {d:dorthin|dort|dorther|hier}. # Please put the bag over there. # Wohin? → dorthin.
Ich gehe heute {d:nirgendwohin|nirgendwo|irgendwo|überall}, ich bleibe zu Hause. # I am not going anywhere today, I am staying at home.
Vor zwei Jahren habe ich {d:dort|dorthin|wohin|daher} gewohnt. # Two years ago I lived there.
Zuerst kochen wir, {d:danach|davor|vorher|bisher} essen wir. # First we cook, afterwards we eat.
Er kommt aus dem Haus {d:heraus|hinein|herein|hinauf}. # He comes out of the house.
Ich lerne Deutsch{z:,|;|:|∅} um in Deutschland zu {v:studieren|studiere|studiert|studierte}. # I am learning German in order to study in Germany. # Vor „um … zu“ steht immer ein Komma.
Ich weiß nicht{z:,|:|;|∅} ob er heute kommt. # I don't know whether he is coming today.
Der Film{z:,|;|:|∅} den wir gestern gesehen haben{z:,|;|.|∅} war spannend. # The film that we saw yesterday was exciting. # Der Relativsatz steht zwischen zwei Kommas.
Sie fragte{z::|,|;|.} „Kommst du mit?“ # She asked: “Are you coming along?”
Er ist nicht nur klug{z:,|;|:|∅} sondern auch fleißig. # He is not only clever but also hard-working. # Vor „sondern“ steht immer ein Komma.
Sowohl mein Bruder{z:∅|,|;|:} als auch meine Schwester spielen Klavier. # Both my brother and my sister play the piano. # sowohl … als auch: kein Komma.
Ich komme später{z:,|:|∅|?} weil ich noch arbeiten {v:muss|müssen|musst|gemusst}. # I'll come later because I still have to work.
Er sagte{z:,|.|;|∅} dass er keine Zeit habe. # He said that he had no time.
Obwohl es regnete{z:,|;|:|∅} gingen wir spazieren. # Although it was raining, we went for a walk.
Wir brauchen Mehl{z:,|;|:|∅} Eier{z:∅|,|;|:} und Milch. # We need flour, eggs and milk.
„Ich habe keinen Hunger“{z:,|.|:|∅} sagte er. # “I am not hungry,” he said. # Nach der wörtlichen Rede steht ein Komma vor dem Begleitsatz.
Meine Schwester{z:,|;|:|∅} die in Berlin wohnt{z:,|;|:|∅} besucht uns morgen. # My sister, who lives in Berlin, is visiting us tomorrow.
Er kam nach Hause{z:,|:|.|∅} zog die Schuhe aus und setzte sich aufs Sofa. # He came home, took off his shoes and sat down on the sofa.
Ich möchte wissen{z:,|;|:|∅} warum du nicht angerufen hast{z:.|?|,|;} # I would like to know why you didn't call. # Indirekte Frage: Am Ende steht ein Punkt, kein Fragezeichen.
Einerseits möchte ich reisen{z:,|:|.|∅} andererseits muss ich sparen. # On the one hand I'd like to travel, on the other hand I have to save.
Je mehr du übst{z:,|;|:|∅} desto besser wirst du. # The more you practise, the better you get.
Bevor du gehst{z:,|;|:|∅} mach bitte das Licht aus{z:!|?|,|;} # Before you leave, please turn off the light!
`,

/* ------------------------------ C1 / C2 ------------------------------ */
C: `
Der Minister sagte, er {v:habe|haben|sei|gehabt} von dem Vorfall nichts {v:gewusst|wissen|wusste|geweißt}. # The minister said he had known nothing about the incident. # Indirekte Rede: Konjunktiv I – er habe gewusst.
Sie behauptete, sie {v:sei|seien|habe|gewesen} die ganze Zeit zu Hause gewesen. # She claimed she had been at home the whole time. # Konjunktiv I von „sein“: sie sei.
Hätte ich das {v:gewusst|wissen|wusste|gewisst}, {v:wäre|würde|hätte|war} ich nicht gekommen. # Had I known that, I would not have come. # Irrealer Bedingungssatz ohne „wenn“: Verb an erster Stelle.
Ohne deine Hilfe {v:hätte|wäre|würde|habe} ich es nicht geschafft. # Without your help I would not have made it.
Er tat, als {v:wäre|war|würde|hat} nichts geschehen. # He acted as if nothing had happened. # als + Konjunktiv II, Verb direkt nach „als“.
Wie dem auch {v:sei|ist|wäre|sein}, wir müssen weitermachen. # Be that as it may, we have to carry on. # Feste Wendung mit Konjunktiv I.
Ich komme nicht, es {v:sei|ist|wäre|war} denn, er entschuldigt sich. # I am not coming unless he apologises. # es sei denn = außer wenn.
Man {v:nehme|nimmst|nehmt|genommen} drei Eier und rühre sie schaumig. # Take three eggs and beat them until frothy. # Konjunktiv I als Aufforderung (Rezepte, Anleitungen).
Kaum {v:hatte|war|hat|hätte} er das Haus verlassen{z:,|∅|;|:} begann es zu regnen. # He had hardly left the house when it started to rain.
Es {v:bedarf|braucht|benötigt|bedürft} keiner {a:weiteren|weiterer|weitere|weiterem} Erklärung. # No further explanation is needed. # bedürfen + Genitiv.
Diese Behauptung {v:entbehrt|entzieht|enthält|entfällt} jeder Grundlage. # This claim is completely unfounded. # einer Sache (Genitiv) entbehren.
Er {v:pflegt|gewöhnt|nutzt|übt} nach dem Essen einen Spaziergang zu machen. # He is in the habit of going for a walk after meals. # pflegen + zu + Infinitiv = etwas gewöhnlich tun.
Die Unterlagen sind unverzüglich {v:einzureichen|einreichen|einreichend|zu einreichen}. # The documents are to be submitted without delay. # sein + zu + Infinitiv = müssen + Passiv.
Der Vertrag gilt als {v:abgeschlossen|abschließend|abzuschließen|abschloss}, sobald beide Seiten unterschrieben haben. # The contract is deemed concluded as soon as both parties have signed.
Sie {v:weigerte|verweigerte|wehrte|lehnte} sich, die Frage zu beantworten. # She refused to answer the question. # sich weigern, etwas zu tun · etwas verweigern / ablehnen (ohne „sich“).
Er wurde des Diebstahls {v:bezichtigt|verklagt|bestraft|angezeigt}. # He was accused of theft. # jemanden einer Sache (Genitiv) bezichtigen.
Die Regierung {v:sah|schaute|blickte|guckte} sich gezwungen, die Steuern zu erhöhen. # The government felt compelled to raise taxes.
Daraus {v:ergibt|gibt|begibt|vergibt} sich folgende Frage. # This gives rise to the following question.
Die These {v:beruht|bezieht|richtet|verlässt} auf einer falschen Annahme. # The thesis is based on a false assumption. # beruhen auf + Dativ.
Wir {v:gehen|kommen|laufen|fahren} davon aus{z:,|∅|;|:} dass die Preise weiter {v:steigen|steigern|gestiegen|steigt}. # We assume that prices will continue to rise. # Die Preise steigen (ohne Objekt) · jemand steigert etwas.
Es {v:handelt|geht|macht|stellt} sich hierbei um einen Irrtum. # This is a mistake. # es handelt sich um · es geht um (ohne „sich“).
Das Unternehmen hat Insolvenz {v:angemeldet|angeklagt|aufgegeben|eingeräumt}. # The company has filed for insolvency.
Der Skandal hat großes {n:Aufsehen|Ansehen|Aussehen|Absehen} {v:erregt|erhoben|erteilt|erstattet}. # The scandal caused a great stir. # Aufsehen erregen · Ansehen = reputation · Aussehen = appearance.
Er hat Anzeige gegen Unbekannt {v:erstattet|erteilt|erhoben|erregt}{z:,|∅|;|:} nachdem sein Auto gestohlen worden {v:war|wurde|hatte|sei}. # He filed a complaint against persons unknown after his car had been stolen. # Anzeige erstatten.
Die Staatsanwaltschaft hat Anklage {v:erhoben|erstattet|erteilt|erregt}. # The public prosecutor has brought charges. # Anklage erheben.
Der Lehrer {v:erteilte|erstattete|erhob|erregte} ihm eine Rüge. # The teacher gave him a reprimand. # eine Rüge / einen Auftrag / Auskunft erteilen.
Jeder kann einen Beitrag zum Klimaschutz {v:leisten|machen|tun|geben}. # Everyone can make a contribution to climate protection. # einen Beitrag leisten.
Ich {v:vertrete|verstehe|vertrage|vertreibe} die Auffassung, dass Bildung kostenlos sein sollte. # I take the view that education should be free. # eine Auffassung / Meinung vertreten.
Dieser Entwicklung muss die Politik Rechnung {v:tragen|ziehen|nehmen|stellen}. # Politics must take this development into account. # einer Sache Rechnung tragen.
Der Zeuge will den Täter gesehen {v:haben|sein|werden|hat}. # The witness claims to have seen the perpetrator. # wollen + Infinitiv Perfekt = er behauptet es von sich.
Sie soll früher sehr reich gewesen {v:sein|haben|werden|ist}. # She is said to have been very rich. # sollen + Infinitiv Perfekt = man sagt es über sie.
Das hättest du mir früher sagen {v:müssen|gemusst|musstest|müsstest}. # You should have told me that earlier. # Ersatzinfinitiv: hätte … sagen müssen.
Er hat sich nichts anmerken {v:lassen|gelassen|ließ|lässt}. # He didn't let anything show. # Ersatzinfinitiv bei „lassen“.
Die Brücke musste wegen Einsturzgefahr gesperrt {v:werden|worden|sein|wurden}. # The bridge had to be closed because of the danger of collapse.
Nachdem der Vertrag unterzeichnet worden {v:war|wurde|hatte|wäre}, begannen die Bauarbeiten. # After the contract had been signed, construction work began.
Wäre er doch nur früher {v:gekommen|kommen|kam|käme}! # If only he had come earlier!
Der Angeklagte {v:leugnete|log|lehnte|verweigerte}, die Tat begangen zu haben. # The defendant denied having committed the crime.
Die Verhandlungen sind an der Frage der Finanzierung {v:gescheitert|gescheitet|verfehlt|misslungen}. # The negotiations failed over the question of funding. # scheitern an + Dativ.
Sein Verhalten {v:zeugt|zeigt|zeichnet|bezeugt} von großem Mut. # His behaviour shows great courage. # von etwas zeugen.
Das Gericht hat der Klage {v:stattgegeben|zugegeben|nachgegeben|angegeben}. # The court upheld the claim. # einer Klage / einem Antrag stattgeben.
Die Firma {v:verfügt|besitzt|hat|enthält} über langjährige Erfahrung. # The company has many years of experience. # verfügen über + Akkusativ.
Es {v:gilt|geht|gibt|gehört}, diese Chance zu nutzen. # The thing now is to seize this opportunity. # es gilt, etwas zu tun = man muss.
Er {v:erwog|erwägte|erwiegte|erwogen}, das Angebot abzulehnen. # He considered rejecting the offer. # erwägen – erwog – erwogen.
Das Feuer {v:erlosch|erlöschte|erloschte|erlischte} erst gegen Morgen. # The fire only went out towards morning. # erlöschen – erlosch – erloschen.
Sie {v:schwor|schwörte|schworte|geschworen}, ihm ewig treu zu bleiben. # She swore to remain faithful to him for ever.
Alles, {p:was|das|welches|dass} er sagte, {v:erwies|bewies|verwies|wies} sich als falsch. # Everything he said turned out to be wrong. # sich erweisen als.
Der Plan war von Anfang an zum {n:Scheitern|Ende|Fall|Bruch} {v:verurteilt|beurteilt|geurteilt|verteilt}. # The plan was doomed to fail from the start.
Er zog die {n:Konsequenzen|Folgerungen|Ergebnisse|Wirkungen} und {v:trat|tritt|trete|getreten} zurück. # He faced the consequences and resigned. # die Konsequenzen ziehen.
Er besuchte seinen Bruder und {p:dessen|seinen|deren|denen} Frau. # He visited his brother and his (the brother's) wife. # dessen = die Frau des Bruders (nicht seine eigene).
Die Firma und {p:deren|dessen|ihren|denen} Mitarbeiter wurden ausgezeichnet. # The company and its employees received an award.
{p:Wessen|Wem|Wen|Dessen} Idee war das eigentlich? # Whose idea was that anyway?
{p:Derjenige|Denjenigen|Demjenigen|Diejenige}, der das getan hat, soll sich melden. # Whoever did this should come forward.
Sie haben {p:einander|sich selbst|ihnen|jedem} jahrelang nicht gesehen. # They haven't seen each other for years.
Das ist ein Problem, {p:dessen|deren|dem|das} Lösung viel Zeit erfordert. # That is a problem whose solution requires a lot of time.
Man sollte tun, was {p:einem|einen|man|eines} Freude macht. # One should do what gives one pleasure. # „man“ gibt es nur im Nominativ: Dativ einem, Akkusativ einen.
Solche Nachrichten können {p:einen|einem|man|einer} wirklich beunruhigen. # News like that can really worry you. # Akkusativ von „man“: einen.
Wir gedenken {p:derer|deren|denen|dessen}, die im Krieg gefallen sind. # We remember those who fell in the war. # gedenken + Genitiv; vor einem Relativsatz: derer.
Ich bin {p:mir|mich|sich|meiner} dessen durchaus bewusst. # I am well aware of that. # sich (Dativ) einer Sache (Genitiv) bewusst sein.
Er rühmt {p:sich|ihm|ihn|seiner} gern seiner Erfolge. # He likes to boast about his successes. # sich einer Sache (Genitiv) rühmen.
Sie erinnerte sich {p:seiner|ihm|ihn|sein} nur noch dunkel. # She remembered him only dimly. # gehoben: sich jemandes (Genitiv) erinnern.
Wir bedürfen {p:eurer|eure|eurem|euren} Hilfe. # We are in need of your help. # bedürfen + Genitiv.
Das, {p:was|das|dass|wessen} mich am meisten stört, ist sein Ton. # What bothers me most is his tone.
Er hat drei Bücher geschrieben, von {p:denen|deren|die|welche} zwei verfilmt wurden. # He wrote three books, two of which were made into films.
Die Zeugin{z:,|∅|;|:} {p:deren|dessen|der|denen} Aussage entscheidend war{z:,|∅|;|:} wurde bedroht. # The witness, whose testimony was decisive, was threatened.
{p:Wem|Wen|Wer|Wessen} nicht zu raten ist, dem ist auch nicht zu helfen. # He who won't take advice can't be helped. # Sprichwort; raten + Dativ.
Er ist ein Mensch{z:,|∅|;|:} auf {p:den|dem|der|dessen} man sich verlassen kann. # He is a person you can rely on. # sich verlassen auf + Akkusativ.
{p:Etliche|Etliches|Etlichem|Etlicher} der Teilnehmer reisten vorzeitig ab. # Quite a few of the participants left early.
Sie nahm sich {p:dessen|deren|dem|den} an, was sonst niemand tun wollte. # She took on what nobody else wanted to do. # sich einer Sache (Genitiv) annehmen.
Die Regelung, {p:deren|dessen|der|denen} Sinn viele bezweifeln, tritt morgen in {n:Kraft|Gang|Betrieb|Frage}. # The regulation, whose purpose many doubt, comes into force tomorrow. # in Kraft treten.
Der Vorschlag stieß auf heftige {n:Kritik|Rede|Rücksicht|Kenntnis}. # The proposal met with fierce criticism. # auf Kritik stoßen.
Er hat die Folgen nicht in {n:Betracht|Kauf|Anspruch|Frage} gezogen. # He did not take the consequences into consideration. # in Betracht ziehen.
Dafür muss man einige Nachteile in {n:Kauf|Betracht|Gang|Kraft} nehmen. # For that you have to accept a few disadvantages. # in Kauf nehmen.
Wir sollten professionelle Hilfe in {n:Anspruch|Kauf|Kraft|Betracht} nehmen. # We should make use of professional help. # in Anspruch nehmen.
Sie stellte seine Kompetenz offen in {n:Frage|Zweifel|Kritik|Verdacht}. # She openly questioned his competence. # in Frage stellen · in Zweifel ziehen.
Die Rede des {n:Präsidenten|Präsident|Präsidents|Präsidentes} dauerte eine Stunde. # The president's speech lasted an hour. # n-Deklination: des Präsidenten.
Trotz seines berühmten {n:Namens|Name|Names|Namen} blieb er bescheiden. # Despite his famous name he remained modest. # der Name – des Namens.
Die Tragweite dieses {n:Gedankens|Gedanke|Gedankes|Gedanken} wurde erst später erkannt. # The significance of this idea was only recognised later. # der Gedanke – des Gedankens.
Er hat den Nagel auf den {n:Kopf|Hammer|Punkt|Daumen} getroffen. # He hit the nail on the head.
Sie hat mir einen {n:Bären|Hund|Affen|Wolf} aufgebunden. # She pulled my leg. # jemandem einen Bären aufbinden = etwas Unwahres erzählen.
Das ist nicht mein {n:Bier|Tee|Wein|Kaffee}. # That's none of my business. # Redewendung: Das ist nicht mein Bier.
Als sie die Nachricht hörte, fiel sie aus allen {n:Wolken|Himmeln|Sternen|Träumen}. # When she heard the news, she was flabbergasted.
Im Finale geht es um die {n:Wurst|Butter|Suppe|Torte}. # In the final it's do or die. # Es geht um die Wurst = es wird entschieden.
Man sollte nie die Katze im {n:Sack|Korb|Haus|Baum} kaufen. # You should never buy a pig in a poke.
Unser Ausflug ist leider ins {n:Wasser|Meer|Feuer|Gras} gefallen. # Unfortunately our trip fell through. # ins Wasser fallen = nicht stattfinden.
Sie nimmt kein {n:Blatt|Tuch|Wort|Buch} vor den Mund. # She doesn't mince her words.
Er schiebt unangenehme Aufgaben gern auf die lange {n:Bank|Straße|Leitung|Liste}. # He likes to put off unpleasant tasks.
Die Studie liefert neue {n:Erkenntnisse|Kenntnisse|Bekenntnisse|Verständnisse} über das Klima. # The study provides new findings about the climate. # Erkenntnisse = findings · Kenntnisse = knowledge, skills.
Im {n:Hinblick|Anblick|Ausblick|Überblick} auf die Zukunft{z:∅|,|;|:} müssen wir handeln. # With a view to the future we must act. # Nach einer Angabe am Satzanfang steht kein Komma.
In {n:Anbetracht|Betracht|Ansicht|Hinsicht} der Lage wurde die Sitzung vertagt. # In view of the situation the meeting was adjourned. # in Anbetracht + Genitiv.
Unter {n:Berücksichtigung|Rücksicht|Besichtigung|Vorsicht} aller Umstände ist das Urteil gerecht. # Taking all circumstances into account, the verdict is fair.
Alle waren da, mit {n:Ausnahme|Annahme|Aufnahme|Abnahme} von Peter. # Everyone was there, with the exception of Peter.
Die Maßnahme stößt auf breiten {n:Widerstand|Gegenstand|Zustand|Abstand}. # The measure is meeting with broad resistance.
Ich stehe Ihnen jederzeit zur {n:Verfügung|Verführung|Verfassung|Verfolgung}. # I am at your disposal at any time.
Davon kann keine {n:Rede|Sprache|Frage|Aussage} sein. # That is out of the question.
Er steht unter großem {n:Druck|Eindruck|Ausdruck|Abdruck}. # He is under great pressure.
Das Projekt wurde aus {n:Kostengründen|Kostengrund|Kostengrunde|Kostengründe} eingestellt. # The project was discontinued for cost reasons.
Sie hat den {n:Anschein|Schein|Vorschein|Augenschein} erweckt, alles zu wissen. # She gave the impression of knowing everything. # den Anschein erwecken.
Die Wahrheit kam erst Jahre später zum {n:Vorschein|Anschein|Schein|Augenschein}. # The truth only came to light years later. # zum Vorschein kommen.
Er leistete keinen {n:Widerstand|Widerspruch|Widerwillen|Widerruf}. # He offered no resistance. # Widerstand leisten.
Gegen den Bescheid können Sie {n:Widerspruch|Widerstand|Widerwillen|Widerhall} einlegen. # You can lodge an objection to the decision. # Widerspruch einlegen.
Meines {n:Erachtens|Ermessens|Erwägens|Erwartens} ist die Entscheidung falsch. # In my opinion the decision is wrong. # meines Erachtens (m. E.) = meiner Meinung nach.
Das liegt nicht in meinem {n:Ermessen|Erwägen|Ermitteln|Erachten}. # That is not at my discretion.
Er hat aus der Not eine {n:Tugend|Jugend|Tat|Kunst} gemacht. # He made a virtue of necessity.
Er war sich der Gefahr nicht {a:bewusst|bekannt|gewohnt|vertraut}{z:,|∅|;|:} als er losfuhr. # He was not aware of the danger when he set off. # sich einer Sache (Genitiv) bewusst sein.
Er ist der deutschen Sprache {a:mächtig|kräftig|stark|gewaltig}. # He has a command of the German language. # einer Sache (Genitiv) mächtig sein.
Er ist dem Alkohol {a:verfallen|gefallen|zerfallen|entfallen}. # He has become addicted to alcohol.
Alle {a:anwesenden|anwesende|anwesender|anwesendem} Gäste applaudierten. # All the guests present applauded. # Nach „alle“: -en.
Viele {a:junge|jungen|junger|jungem} Menschen ziehen in die Großstadt. # Many young people move to the big city. # Nach „viele“ (Nominativ Plural): -e.
Die Meinung vieler {a:junger|jungen|junge|jungem} Menschen wird ignoriert. # The opinion of many young people is ignored. # Genitiv Plural nach „vieler“: -er.
Mit etwas {a:gutem|guten|guter|gutes} Willen lässt sich das Problem lösen. # With a little goodwill the problem can be solved.
Am Wochenende ist nichts {a:Besonderes|besonderes|Besonderen|Besonderem} passiert. # Nothing special happened at the weekend. # Nach nichts, etwas, viel: Adjektiv großgeschrieben, Endung -es.
Die {a:steigenden|gestiegenden|steigende|gesteigten} Preise belasten die Verbraucher. # Rising prices are a burden on consumers. # Partizip I als Adjektiv: steigend-.
Der gestern {a:eingereichte|einreichende|eingereichter|einzureichen} Antrag wurde abgelehnt. # The application submitted yesterday was rejected. # Partizip II als Attribut.
Die noch zu {a:lösenden|gelösten|lösende|lösbaren} Probleme sind zahlreich. # The problems still to be solved are numerous. # zu + Partizip I = die gelöst werden müssen.
Das ist ein nicht zu {a:unterschätzender|unterschätzter|unterschätzende|unterschätzen} Vorteil. # That is an advantage not to be underestimated.
Trotz {a:heftiger|heftigen|heftige|heftigem} Kritik hielt er an seinem {n:Vorhaben|Vorhabens|Vorhabe|Vorhabung} fest. # Despite fierce criticism he stuck to his plan. # Genitiv feminin ohne Artikel: heftiger Kritik.
Er ist ein {a:angesehener|angesehen|angesehene|ansehender} Wissenschaftler. # He is a respected scientist.
Die Sitzung verlief {a:ergebnislos|ergebnisfrei|ergebnisleer|ergebnisarm}. # The meeting ended without result.
Das Urteil ist {a:rechtskräftig|rechtsstark|rechtsmächtig|rechthaberisch}; {d:folglich|gleichwohl|dennoch|trotzdem} kann keine Berufung mehr eingelegt werden. # The verdict is final; consequently no further appeal can be lodged.
Sie ist {a:alleinerziehend|alleinerzogen|alleinerzieherisch|alleinziehend}. # She is a single parent.
Beim Lesen dieses Textes stößt man auf viel {a:Unbekanntes|unbekanntes|Unbekannten|Unbekannter}. # When reading this text you come across much that is unfamiliar.
Das Angebot ist zeitlich {a:befristet|gefristet|verfristet|fristlos}. # The offer is for a limited time.
Er ist für seine {a:scharfsinnigen|scharfsinnige|scharfsinniger|scharfsinnigem} Analysen bekannt. # He is known for his astute analyses. # Nach „seine“ im Plural: -en.
Der {a:mutmaßliche|mutmaßende|mutmaßlicher|mutmaßlichen} Täter wurde festgenommen. # The suspected perpetrator was arrested.
Die Lage ist ernst; {d:gleichwohl|folglich|demzufolge|infolgedessen} besteht kein Grund zur Panik. # The situation is serious; nevertheless there is no reason to panic. # gleichwohl = dennoch, trotzdem.
Er hatte keinerlei Erfahrung; {d:dennoch|folglich|somit|demnach} wurde er eingestellt. # He had no experience whatsoever; nevertheless he was hired.
Die Kosten sind gestiegen, {d:folglich|gleichwohl|dennoch|trotzdem} müssen wir sparen. # Costs have risen, so we have to save.
Sein Zustand verschlechtert sich {d:zusehends|zusehend|zugesehen|absehends}. # His condition is visibly deteriorating. # zusehends = sichtbar, rasch.
Er kam {d:eigens|eigen|eigentümlich|eigenartig} aus Berlin angereist, um sie zu sehen. # He came all the way from Berlin specially to see her. # eigens = extra, nur zu diesem Zweck.
Das Angebot gilt {d:lediglich|ledig|leidlich|letztens} bis Freitag. # The offer is only valid until Friday. # lediglich = nur.
{d:Insofern|Inwiefern|Sofern|Soweit} hast du recht, als die Zahlen tatsächlich stimmen. # You are right insofar as the figures are indeed correct. # insofern …, als.
Er ist {d:mitnichten|mitunter|mithin|mittlerweile} ein Experte; er hat lediglich einen Artikel gelesen. # He is by no means an expert; he has merely read one article. # mitnichten = keineswegs · mitunter = manchmal · mithin = folglich.
{d:Hierzulande|Hierzu|Hierher|Hierauf} isst man traditionell viel Brot. # In this country people traditionally eat a lot of bread.
Er hat {d:wohlweislich|wohlwollend|wohlauf|wohlig} verschwiegen, dass er selbst beteiligt war. # He very wisely kept quiet about the fact that he himself was involved.
Dessen {d:ungeachtet|unbeachtet|ungeahnt|ungeeignet} setzte er seine Arbeit fort. # Regardless of that, he continued his work. # dessen ungeachtet = trotzdem.
Es gibt nichts, {d:worüber|worauf|woran|wovor} wir uns streiten müssten. # There is nothing we would have to argue about. # sich streiten über → worüber.
Die Frage, {d:inwieweit|soweit|insoweit|sowieso} das Gesetz gilt, ist ungeklärt. # The question of how far the law applies is unresolved.
Er hat sich {d:dahingehend|dahin|daher|dahinter} geäußert, dass er zurücktreten werde. # He stated to the effect that he would resign.
Der Antrag wurde {d:rundweg|rundum|rundherum|ringsum} abgelehnt. # The application was flatly rejected. # rundweg = entschieden, ohne Zögern.
Sie hat {d:zeitlebens|zeitweise|zeitig|zeitlich} in demselben Dorf gewohnt und es nie verlassen. # She lived in the same village all her life and never left it.
Die Frist muss eingehalten werden; {d:andernfalls|andernorts|anderweitig|andererseits} droht eine Geldstrafe. # The deadline must be met; otherwise there is the risk of a fine.
Er wurde {d:kurzerhand|kurzum|kurzweilig|kürzer} entlassen. # He was dismissed without further ado.
{d:Kurzum|Kurzerhand|Kurzfristig|Kürzlich}: Das Projekt ist gescheitert. # In short: the project has failed.
Das ist {d:beileibe|bei Leib|leibhaftig|leiblich} kein Einzelfall. # That is by no means an isolated case. # beileibe nicht / kein = wirklich nicht.
Sie haben {d:allesamt|allemal|allenfalls|allerdings} bestanden – keiner ist durchgefallen. # They all passed – nobody failed.
Das dauert {d:allenfalls|allesamt|allerseits|allerhand} zehn Minuten, eher weniger. # That will take ten minutes at most, probably less. # allenfalls = höchstens.
Die Art, {d:wie|was|wo|wodurch} er mit Kritik umgeht, beeindruckt mich. # The way he deals with criticism impresses me.
Die einen wollten bleiben{z:;|:|?|∅} die anderen wollten gehen. # Some wanted to stay; the others wanted to leave. # Das Semikolon trennt gleichrangige Hauptsätze stärker als ein Komma.
Er hatte nur ein Ziel{z::|;|?|∅} den Sieg. # He had only one goal: victory. # Der Doppelpunkt kündigt an, was folgt.
Sie ist größer{z:∅|,|;|:} als ihr Bruder. # She is taller than her brother. # Vergleich ohne Verb: kein Komma vor „als“.
Sie ist größer{z:,|∅|;|:} als ich gedacht hatte. # She is taller than I had thought. # Vergleichssatz mit Verb: Komma vor „als“.
Er kam{z:,|∅|;|:} ohne ein Wort zu sagen{z:,|∅|;|:} ins Zimmer. # He came into the room without saying a word. # Infinitivgruppen mit ohne / um / statt / anstatt / außer / als: immer Kommas.
Ich hoffe, dass du kommst{z:∅|,|;|:} und dass du Zeit mitbringst. # I hope that you'll come and that you'll bring some time with you. # Zwei gleichrangige Nebensätze mit „und“: kein Komma.
Er sagte, dass er müde sei{z:,|∅|;|:} und ging nach Hause. # He said that he was tired and went home. # Der Nebensatz ist zu Ende – deshalb Komma vor „und“.
Mein Bruder{z:,|∅|;|:} ein begeisterter Segler{z:,|∅|;|:} verbringt jeden Sommer am Meer. # My brother, a keen sailor, spends every summer by the sea. # Die Apposition steht zwischen zwei Kommas.
Sehr geehrte Frau Dr. Weber{z:,|.|;|:} vielen Dank für Ihre Nachricht. # Dear Dr Weber, thank you very much for your message.
Sie kaufte Äpfel, Birnen{z:∅|,|;|:} sowie Pflaumen. # She bought apples, pears and also plums. # Vor „sowie“ (= und) steht kein Komma.
Er ist zwar jung{z:,|∅|;|:} aber sehr erfahren. # He is young, admittedly, but very experienced.
Kurz gesagt{z::|;|.|?} Das Experiment ist gescheitert. # In short: the experiment has failed.
Wer das behauptet{z:,|∅|;|:} lügt. # Whoever claims that is lying.
Es war ein langer{z:,|∅|;|:} anstrengender Tag. # It was a long, exhausting day. # Gleichrangige Adjektive (man könnte „und“ sagen): Komma.
Er trank ein Glas dunkles{z:∅|,|;|:} bayerisches Bier. # He drank a glass of dark Bavarian beer. # „bayerisches Bier“ ist eine Einheit – kein Komma.
Sie hat mir versprochen, pünktlich zu sein{z:,|∅|;|:} und ist dann doch zu spät gekommen. # She promised me to be on time and then came late after all. # Die Infinitivgruppe wird mit einem Komma begonnen – also auch beendet.
Das Wetter war schlecht{z:,|∅|:|?} und zwar die ganze Woche. # The weather was bad – the whole week, in fact. # Vor „und zwar“ steht ein Komma.
Er liebt Musik{z:,|∅|;|?} insbesondere Jazz. # He loves music, especially jazz. # Vor insbesondere, vor allem, nämlich, das heißt: Komma.
Ob er kommt{z:,|∅|;|:} weiß ich nicht. # Whether he is coming, I don't know.
Sie fragte mich{z:,|∅|:|;} ob ich Zeit hätte{z:,|∅|?|;} und lud mich ein. # She asked me whether I had time and invited me.
„Warum“{z:,|.|:|∅} fragte sie{z:,|.|:|∅} „hast du nicht angerufen?“ # “Why,” she asked, “didn't you call?” # Der eingeschobene Begleitsatz steht zwischen zwei Kommas.
Trotz des Regens{z:∅|,|;|:} gingen wir spazieren. # In spite of the rain we went for a walk. # Kein Komma nach einer Angabe am Satzanfang (anders als im Englischen).
Nach langem Überlegen{z:∅|,|;|:} entschied sie sich für das Studium. # After long consideration she decided to go to university.
Ich freue mich darauf{z:,|∅|;|:} dich wiederzusehen. # I am looking forward to seeing you again. # Hinweiswort „darauf“ → Komma vor der Infinitivgruppe.
Sein Wunsch{z:,|∅|;|:} Pilot zu werden{z:,|∅|;|:} ging in Erfüllung. # His wish to become a pilot came true. # Die Infinitivgruppe hängt von einem Nomen ab → Kommas.
`,
};

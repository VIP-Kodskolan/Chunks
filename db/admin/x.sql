PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE courses (
  course_id       INTEGER PRIMARY KEY,
  canvas_url      TEXT DEFAULT "Canvas URL",
  alias           TEXT DEFAULT "Alias",
  code            TEXT DEFAULT "Code",
  kind            TEXT DEFAULT "course",
  name            TEXT DEFAULT "Title",
  semester        TEXT DEFAULT "HT/VT XX",
  week_start      INT DEFAULT 0,
  week_count      INT DEFAULT 0,
  programmes      TEXT DEFAULT ""
);
INSERT INTO courses VALUES(1,'https://mau.instructure.com/courses/11479','WBP_22','ME154A','course','Webbproduktion','HT22',35,17,'["PMA_21"]');
INSERT INTO courses VALUES(2,'https://mau.instructure.com/courses/11431','DBP_22','ME105A','course','Databasbaserad publicering','HT22',35,17,'["MPP_21"]');
INSERT INTO courses VALUES(3,'mau.se','DU1_22','ME102B','course','Webbaserad Design och Utveckling I','HT22',36,7,'["WDU_22"]');
INSERT INTO courses VALUES(4,'mau.se','DU2_22','ME103B','course','Webbaserad Design och Utveckling II','HT22',43,8,'["WDU_22"]');
INSERT INTO courses VALUES(5,'mau.se','DU3_23','ME105B','course','Webbaserad Design och Utveckling III','VT23',3,20,'["WDU_22"]');
INSERT INTO courses VALUES(6,'mau.se','DSM_23','ME110B','course','Design Metoder','HT23',35,18,'["WDU_22"]');
INSERT INTO courses VALUES(7,'mau.se','DSS_23','ME111B','course','Design Studio','HT23',35,18,'["WDU_22"]');
CREATE TABLE users (
  user_id           INTEGER PRIMARY KEY,
  name              TEXT NOT NULL,
  user_password     TEXT NOT NULL,
  user_token        TEXT,
  user_programme    TEXT, -- TCH for teachers, WDU, PMM, MPP, etc
  user_start_year   INT,  -- 99 for teachers, otherwise YY
  can_add_courses   BOOLEAN DEFAULT false
);
INSERT INTO users VALUES(1,'Sebbe','arja',NULL,'TCH',99,1);
INSERT INTO users VALUES(2,'Erik','yoman','2fdbcf0322d956a63','TCH',99,1);

CREATE TABLE course_roles (
  role          TEXT NOT NULL
);
INSERT INTO course_roles VALUES('teacher');
INSERT INTO course_roles VALUES('student');
INSERT INTO course_roles VALUES('assistant');
CREATE TABLE users_courses (
  course_id     INT NOT NULL,
  user_id       INT NOT NULL,
  role          TEXT NOT NULL,

  FOREIGN KEY (course_id)
  REFERENCES courses (course_id)  ON UPDATE CASCADE
                                  ON DELETE CASCADE,
  FOREIGN KEY (user_id)
  REFERENCES users (user_id)  ON UPDATE CASCADE
                              ON DELETE CASCADE

  -- FOREIGN KEY (role)
  -- REFERENCES course_roles (roles)  ON UPDATE CASCADE
                                  --  ON DELETE CASCADE
);
INSERT INTO users_courses VALUES(1,1,'teacher');
INSERT INTO users_courses VALUES(1,2,'teacher');
INSERT INTO users_courses VALUES(2,1,'teacher');
INSERT INTO users_courses VALUES(2,2,'teacher');
INSERT INTO users_courses VALUES(3,1,'teacher');
INSERT INTO users_courses VALUES(3,2,'teacher');
INSERT INTO users_courses VALUES(4,1,'teacher');
INSERT INTO users_courses VALUES(4,2,'teacher');
INSERT INTO users_courses VALUES(5,1,'teacher');
INSERT INTO users_courses VALUES(5,2,'teacher');
INSERT INTO users_courses VALUES(6,1,'teacher');
INSERT INTO users_courses VALUES(6,2,'teacher');
INSERT INTO users_courses VALUES(7,1,'teacher');
INSERT INTO users_courses VALUES(7,2,'teacher');
CREATE TABLE chapters (
  chapter_id    INTEGER PRIMARY KEY,
  course_id     INT NOT NULL,
  kind          TEXT DEFAULT "chapter",
  name          TEXT DEFAULT "(max 15 chars)",
  spot          INT DEFAULT -1,
  story         TEXT DEFAULT 'Short story about the chapter (60 chars max)', done BOOLEAN DEFAULT false,

  FOREIGN KEY (course_id)
  REFERENCES courses (course_id)    ON UPDATE CASCADE
                                    ON DELETE CASCADE

);
INSERT INTO chapters VALUES(1,3,'chapter','Webbutvecklare är hantverkare. Här är våra verktyg.',1,'Short story about the chapter (60 chars max)',0);
INSERT INTO chapters VALUES(2,3,'chapter','Projektet (?)',2,'Short story about the chapter (60 chars max)',0);
INSERT INTO chapters VALUES(3,3,'chapter','Första Webbsidan!',3,'Short story about the chapter (60 chars max)',0);
INSERT INTO chapters VALUES(4,3,'chapter','Grundläggande HTML-element (tags) i &lt;body&gt;',4,'Short story about the chapter (60 chars max)',0);
INSERT INTO chapters VALUES(5,3,'chapter','Favoritverktyget: Webbläsarens inspektor',5,'Short story about the chapter (60 chars max)',0);
INSERT INTO chapters VALUES(6,3,'chapter','Formatering 1: (Intro) Hur formateras webbsidor?',6,'Short story about the chapter (60 chars max)',0);
INSERT INTO chapters VALUES(7,3,'chapter','Formatering 2: HTML-element är som (lite speciella) lådor',7,'Short story about the chapter (60 chars max)',0);
INSERT INTO chapters VALUES(8,3,'chapter','Formatering 3: Färger! Typsnitt! Bakgrundsbilder!',8,'Short story about the chapter (60 chars max)',0);
INSERT INTO chapters VALUES(9,3,'chapter','Formatering 4: Andra viktiga CSS-begrepp',9,'Short story about the chapter (60 chars max)',0);
INSERT INTO chapters VALUES(10,3,'chapter','Sökvägar (paths). Ordning och reda',10,'Short story about the chapter (60 chars max)',0);
INSERT INTO chapters VALUES(11,3,'chapter','Layout 1: Grunderna',11,'Short story about the chapter (60 chars max)',0);
INSERT INTO chapters VALUES(12,3,'chapter','Layout 2: Flexbox',12,'Short story about the chapter (60 chars max)',0);
INSERT INTO chapters VALUES(13,3,'chapter','Layout 3: Grid',13,'Short story about the chapter (60 chars max)',0);
INSERT INTO chapters VALUES(14,3,'chapter','Responsivitet: Anpassning till olika skärmstorlekar',14,'Short story about the chapter (60 chars max)',0);
INSERT INTO chapters VALUES(15,3,'chapter','Bildspecial!',15,'Short story about the chapter (60 chars max)',0);
INSERT INTO chapters VALUES(16,3,'chapter','Övningar med komplexa layouts',16,'Short story about the chapter (60 chars max)',0);
INSERT INTO chapters VALUES(17,3,'chapter','Avancerade CSS-selectors',17,'Short story about the chapter (60 chars max)',0);
INSERT INTO chapters VALUES(18,3,'chapter','Övergångar (transitions)',18,'Short story about the chapter (60 chars max)',0);
INSERT INTO chapters VALUES(19,3,'chapter','Förenkla ditt liv med CSS-variabler och "calc"',19,'Short story about the chapter (60 chars max)',0);
INSERT INTO chapters VALUES(20,3,'chapter','Avancerade övningar',20,'Short story about the chapter (60 chars max)',0);
INSERT INTO chapters VALUES(21,2,'chapter','setTimeout: Utför en funktion efter ett tag',1,'Short story about the chapter (60 chars max)',0);
INSERT INTO chapters VALUES(22,2,'chapter','JSON: Data som strängar',2,'Short story about the chapter (60 chars max)',0);
INSERT INTO chapters VALUES(23,2,'chapter','Löften: Kort intro',3,'Short story about the chapter (60 chars max)',0);
CREATE TABLE sections (
  section_id    INTEGER PRIMARY KEY,
  chapter_id    INT NOT NULL,
  kind          TEXT DEFAULT "section",
  name          TEXT DEFAULT 'New Section Name',
  spot          INT DEFAULT -1,
  story         TEXT DEFAULT 'Short story about the chapter (60 chars max)',

  FOREIGN KEY (chapter_id)
  REFERENCES chapters (chapter_id)  ON UPDATE CASCADE
                                    ON DELETE CASCADE
);
INSERT INTO sections VALUES(1,1,'section','Arbetsbordet',1,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(2,1,'section','Skärmvideos',2,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(3,1,'section','Mjukvaruverktyg',3,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(4,1,'section','GitHub',4,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(5,3,'section','Ladda upp dina kreationer!',5,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(6,3,'section','Kolla på en enkel webbsida',1,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(7,3,'section','Vi ser bara &lt;body&gt; men &lt;head&gt; är också viktig',2,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(8,3,'section','Lite terminologi för att vara exakt',3,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(9,3,'section','Redo för din första webbsida!',4,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(10,4,'section','Webbsidans struktur',1,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(11,4,'section','Text och rubriker',2,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(12,4,'section','Länk (anchor) &lt;a&gt;',3,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(13,4,'section','Bild &lt;img&gt;',4,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(14,4,'section','Lists',5,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(15,4,'section','Övningar',6,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(16,5,'section','Kompis vid tentan!',1,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(17,6,'section','Innehåll vs formatering: HTML och CSS är särbon',1,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(18,6,'section','Vilka element ska formateras? Class och ID',2,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(19,6,'section','Inspector kan om CSS!',4,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(20,6,'section','Vem bestämmer? (Specificity)',3,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(21,6,'section','Terminologi',5,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(22,7,'section','Alla HTML-element är lådor?',1,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(23,7,'section','Box Model: margin, border, padding and content',2,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(24,7,'section','Content: width och height',3,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(25,7,'section','box-sizing: border;',4,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(26,7,'section','Övningar',5,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(27,8,'section','Nu kan dina webbsidor se ut som något',1,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(28,8,'section','Färger!',2,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(29,8,'section','Typsnitt!',3,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(30,8,'section','Bakgrundsbilder!',4,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(31,8,'section','Övningar',5,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(32,9,'section','Pseudo-classes: hover, active',1,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(33,9,'section','Ärvd formatering (inheritance)',2,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(34,10,'section','Vart ligger filerna?',1,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(35,10,'section','Absoluta och relativa sökvägar',2,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(36,11,'section','Varför är det så bökigt?',1,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(37,11,'section','Document Flow',2,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(38,11,'section','position (absolute, relative, sticky, fixed)',3,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(39,12,'section','Kontrollera var elementen placeras',1,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(40,12,'section','Wrap that flex',2,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(41,12,'section','Centrera ett element i ett annat',3,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(42,12,'section','Övningar',4,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(43,13,'section','Schweiziskt ordning',1,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(45,13,'section','Vem dikterar griddens storleken? (items vs containern)',2,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(46,13,'section','Placera items exakt: grid-area, grid-row, grid-column',3,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(47,13,'section','Grid inuti grid',4,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(48,13,'section','Flexbox vs Grid',5,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(49,14,'section','Olika typer av skärmstorlekar. Responsiv vs Adaptiv',1,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(50,14,'section','Webbläsarens Responsive Mode',2,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(51,14,'section','Adaptiv design',3,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(52,14,'section','Responsiv design',4,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(53,14,'section','Responsiv + Adaptiv design',5,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(54,15,'section','Bilder vikt mäts i Kb eller Mb',1,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(55,15,'section','Raster vs Vektor',2,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(56,15,'section','Optimera storleken',3,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(57,10,'section','Ordning och reda',3,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(58,16,'section','Ge järnet!',1,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(59,17,'section','Varför avancerade selectors?',1,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(60,17,'section','* (All elements)',2,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(61,17,'section','Pseudo-classes',3,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(62,17,'section','Descendants och "senare" syskon',4,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(63,17,'section','Övningar',5,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(64,18,'section','Ge sidan en "organic feel" ',1,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(65,19,'section','Vad kan CSS-variabler och "calc" göra för oss?',1,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(66,19,'section','CSS-variabler (Custom Properties)',2,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(67,19,'section','Använd "calc" och sluta räkna själv',3,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(68,13,'section','Övningar',6,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(69,20,'section','Wax on wax off',1,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(70,1,'section','Finurligheter',5,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(71,21,'section','Title',1,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(72,22,'section','Att översätta datastrukturer till strängar',1,'Short story about the chapter (60 chars max)');
INSERT INTO sections VALUES(73,23,'section','När koden lovar saker',1,'Short story about the chapter (60 chars max)');
CREATE TABLE units (
  unit_id                 INTEGER PRIMARY KEY,
  section_id              INT NOT NULL,
  kind                    TEXT DEFAULT '',
  name                    TEXT DEFAULT '',
  spot                    INT DEFAULT -1,
  story                   TEXT DEFAULT '',
  video_link              TEXT DEFAULT '',
  folder_link             TEXT DEFAULT '',
  is_stop_quiz            BOOLEAN DEFAULT false,

  FOREIGN KEY (section_id)
  REFERENCES sections (section_id)  ON UPDATE CASCADE
                                    ON DELETE CASCADE
);
INSERT INTO units VALUES(1,1,'video','Main',1,'','','',0);
INSERT INTO units VALUES(2,1,'exercise','Skapa kursmappen på din dator',2,'','','',0);
INSERT INTO units VALUES(3,2,'video','Main',1,'','4zwvnqo4kieucz14edx01nn43cs73k3i','',0);
INSERT INTO units VALUES(4,2,'video','Title Unit',2,'','','',0);
INSERT INTO units VALUES(5,3,'video','Main',1,'','j1qn0yb6cb896b9mtobun3pynignporz','',0);
INSERT INTO units VALUES(6,3,'assignment','Installera',2,'','','9u8ju5ntegpgywyjuse6yt9c16e7cb6b',0);
INSERT INTO units VALUES(7,4,'video','Main',1,'','2ber11gbz86hrlh84rkzotay378n12ld','',0);
INSERT INTO units VALUES(8,4,'video','Commits',2,'','ijtge0j77gx4p539it0c8f7is67tb8hg','',0);
INSERT INTO units VALUES(9,4,'assignment','Skapa Gihub-konto',3,'','gk5jhxhwehnhu9e7ha5owounfi92fvin','q98js6ev6furo1erqm8g2shuqu268t2t',0);
INSERT INTO units VALUES(10,5,'video','Title Unit',1,'','j8dr815z1iqf03cehlg6hdpksuq3etbp','',0);
INSERT INTO units VALUES(11,5,'video','Filezilla',2,'','jooaltldw7ljzev4sy8hrnqjchy4z7nz','',0);
INSERT INTO units VALUES(12,5,'video','Sökvägar (paths)',3,'','mg8mxq6kjxelgady0twselh0m4od5u54','',0);
INSERT INTO units VALUES(13,5,'quiz','Title Unit',4,'','','',1);
INSERT INTO units VALUES(14,6,'video','Main',1,'','cabr3h0z9rke6akqg9ojvvlshclcy7b8','',0);
INSERT INTO units VALUES(15,6,'exercise','Lekstuga 1',2,'','uhxf6e4iib85od71jxwojdnhx6ald7fk','bmrvg7my9kt4vfro2ypgejsms8zfm3ea',0);
INSERT INTO units VALUES(16,6,'exercise','Lekstuga 2',3,'','e5wa1pq5ctgb625s1t92zyc80gobfitn','wr6muzwd6c2p4hbjrdlspyvi4c9ng60a',0);
INSERT INTO units VALUES(17,7,'video','Main',1,'','bew8lw3m5l9xisqeuo9r5scr1qom7roy','',0);
INSERT INTO units VALUES(18,7,'exercise','Lekstuga 1',2,'','njraobsdlsn3ltmeq0m16d9ilwofxmu7','hl57xh6wab94h7ovt3ucj84rebu08xkv',0);
INSERT INTO units VALUES(19,7,'exercise','Lekstuga 2',3,'','xdth9texqbqw0shfg59zmneg2g9payg2','l4yeigofm8k5x5nkqxje1zm9wk290c7h',0);
INSERT INTO units VALUES(20,8,'video','Main',1,'','wlahjvpq9fudv8ua5xv9345ll0plhijs','',0);
INSERT INTO units VALUES(21,8,'video','Element, tag, attribut, värde',2,'','1v5f5z4wzwsv95j1gdqhkef7h2d0lz6e','',0);
INSERT INTO units VALUES(22,8,'video','Hierarki: Föräldrar, barn, syskon',3,'','minrzth2p8x0netqqiv9giujg4l6iy1l','',0);
INSERT INTO units VALUES(23,9,'exercise','Just do it',1,'','45u8eivryfw2vr8wv7ynk9j5kbvn8yp9','g5xvd8zcfazvkvnq60ll6ronkgcns27j',0);
INSERT INTO units VALUES(24,10,'video','Main',1,'','','',0);
INSERT INTO units VALUES(31,11,'video','Main',1,'','','',0);
INSERT INTO units VALUES(32,11,'exercise','Textövning',2,'','','',0);
INSERT INTO units VALUES(33,12,'exercise','Länkövning',2,'','','',0);
INSERT INTO units VALUES(34,12,'video','Main',1,'','','',0);
INSERT INTO units VALUES(35,13,'video','Main',1,'','','',0);
INSERT INTO units VALUES(36,13,'exercise','Bildövning',2,'','','',0);
INSERT INTO units VALUES(37,14,'video','Main',1,'','','',0);
INSERT INTO units VALUES(38,14,'exercise','Listövning',2,'','','',0);
INSERT INTO units VALUES(39,10,'exercise','Strukturövningar',2,'','','',0);
INSERT INTO units VALUES(40,15,'exercise','Analysera en webbsida',1,'','','',0);
INSERT INTO units VALUES(41,15,'exercise','Bygg sida 1',2,'','','',0);
INSERT INTO units VALUES(42,15,'exercise','Bygg sida 2',3,'','','',0);
INSERT INTO units VALUES(43,15,'assignment','Vem är du?',4,replace('Koda en webbsida som kortfattat presenterar dig.\nSkapa en GitHub repository och lägg filerna där. Repositoryn ska ha en README-fil. Den behöver inte ha en ignore-fil.\nPublicera sidan via ditt webbhotell (mapp: first_webpage)','\n',char(10)),'','',0);
INSERT INTO units VALUES(44,16,'video','Main',1,'','','',0);
INSERT INTO units VALUES(45,16,'exercise','Inspektera!',2,'','','',0);
INSERT INTO units VALUES(46,16,'quiz','Title',3,'','','',1);
INSERT INTO units VALUES(47,17,'video','Main',1,'','','',0);
INSERT INTO units VALUES(48,17,'exercise','Para ihop',2,'','','',0);
INSERT INTO units VALUES(49,17,'exercise','Trekanter...',3,'','','',0);
INSERT INTO units VALUES(50,17,'quiz','Title',4,'','','',0);
INSERT INTO units VALUES(51,18,'exercise','id och class',2,'','','',0);
INSERT INTO units VALUES(52,18,'exercise','id-strul',3,'','','',0);
INSERT INTO units VALUES(53,18,'video','Main',1,'','','',0);
INSERT INTO units VALUES(54,18,'exercise','Förenkla koden',4,'','','',0);
INSERT INTO units VALUES(55,19,'video','Main',1,'','','',0);
INSERT INTO units VALUES(56,19,'exercise','Hitta regeln',2,'','','',0);
INSERT INTO units VALUES(57,19,'video','Live-ändringar med inspector',3,'','','',0);
INSERT INTO units VALUES(58,20,'video','Main',1,'','','',0);
INSERT INTO units VALUES(59,20,'quiz','Title',2,'','','',0);
INSERT INTO units VALUES(60,21,'video','Main',1,'','','',0);
INSERT INTO units VALUES(61,21,'quiz','Title',2,'','','',0);
INSERT INTO units VALUES(62,22,'video','Main',1,'','','',0);
INSERT INTO units VALUES(63,23,'video','Main',1,'','','',0);
INSERT INTO units VALUES(64,23,'exercise','Övning 1',2,'','','',0);
INSERT INTO units VALUES(65,23,'exercise','Övning 2',3,'','','',0);
INSERT INTO units VALUES(66,23,'exercise','Övning 3',4,'','','',0);
INSERT INTO units VALUES(67,23,'exercise','Övning 4',5,'','','',0);
INSERT INTO units VALUES(68,23,'assignment','margin: auto;',6,'','','',0);
INSERT INTO units VALUES(69,23,'quiz','Title',7,'','','',0);
INSERT INTO units VALUES(70,24,'video','Main',1,'','','',0);
INSERT INTO units VALUES(71,24,'exercise','Övning',2,'','','',0);
INSERT INTO units VALUES(72,25,'video','Main',1,'','','',0);
INSERT INTO units VALUES(73,26,'exercise','Övning 1',1,'','','',0);
INSERT INTO units VALUES(74,26,'exercise','Övning 2',2,'','','',0);
INSERT INTO units VALUES(75,26,'exercise','Övning 3',3,'','','',0);
INSERT INTO units VALUES(76,27,'video','Main',1,'','','',0);
INSERT INTO units VALUES(77,28,'video','Main',1,'','','',0);
INSERT INTO units VALUES(78,28,'exercise','Övning 1',2,'','','',0);
INSERT INTO units VALUES(79,28,'video','Färgpaletter',3,'','','',0);
INSERT INTO units VALUES(80,28,'video','Gradienter',4,'','','',0);
INSERT INTO units VALUES(81,28,'exercise','Övningar',5,'','','',0);
INSERT INTO units VALUES(82,29,'video','Main',1,'','','',0);
INSERT INTO units VALUES(83,29,'exercise','Övning',2,'','','',0);
INSERT INTO units VALUES(84,29,'quiz','Title',3,'','','',0);
INSERT INTO units VALUES(85,30,'video','Main',1,'','','',0);
INSERT INTO units VALUES(86,30,'exercise','Övning',2,'','','',0);
INSERT INTO units VALUES(87,30,'exercise','Övning',3,'','','',0);
INSERT INTO units VALUES(88,31,'exercise','Restaurang',1,'','','',0);
INSERT INTO units VALUES(89,31,'exercise','Hotell',2,'','','',0);
INSERT INTO units VALUES(90,31,'exercise','Bar',3,'','','',0);
INSERT INTO units VALUES(91,32,'video','Main',1,'','','',0);
INSERT INTO units VALUES(92,32,'exercise','Övning',2,'','','',0);
INSERT INTO units VALUES(93,33,'video','Main',1,'','','',0);
INSERT INTO units VALUES(94,33,'exercise','Övning',2,'','','',0);
INSERT INTO units VALUES(95,34,'video','Main',1,'','','',0);
INSERT INTO units VALUES(96,34,'exercise','Övningar',2,'','','',0);
INSERT INTO units VALUES(97,34,'exercise','Övning',3,'','','',0);
INSERT INTO units VALUES(98,35,'video','Main',1,'','','',0);
INSERT INTO units VALUES(99,35,'exercise','Övning',2,'','','',0);
INSERT INTO units VALUES(100,36,'exercise','Övning',1,'','','',0);
INSERT INTO units VALUES(101,37,'video','Main',1,'','','',0);
INSERT INTO units VALUES(102,37,'exercise','Övning',2,'','','',0);
INSERT INTO units VALUES(103,38,'video','Main',1,'','','',0);
INSERT INTO units VALUES(104,38,'video','relative',2,'','','',0);
INSERT INTO units VALUES(105,38,'exercise','absolute',3,'','','',0);
INSERT INTO units VALUES(106,38,'exercise','Övning',4,'','','',0);
INSERT INTO units VALUES(107,38,'exercise','Övning',5,'','','',0);
INSERT INTO units VALUES(108,39,'video','Main',1,'','','',0);
INSERT INTO units VALUES(109,39,'exercise','Frog',2,'','','',0);
INSERT INTO units VALUES(110,39,'exercise','Övning',3,'','','',0);
INSERT INTO units VALUES(111,39,'quiz','Title',4,'','','',0);
INSERT INTO units VALUES(112,40,'video','Main',1,'','','',0);
INSERT INTO units VALUES(113,40,'exercise','Övning',2,'','','',0);
INSERT INTO units VALUES(114,41,'video','Main',1,'','','',0);
INSERT INTO units VALUES(115,41,'exercise','Övning',2,'','','',0);
INSERT INTO units VALUES(116,41,'exercise','Övning',3,'','','',0);
INSERT INTO units VALUES(117,41,'video','Centrera bakgrundsbild: en helt annan sak',4,'','','',0);
INSERT INTO units VALUES(118,41,'exercise','Övning',5,'','','',0);
INSERT INTO units VALUES(119,42,'exercise','Övning 1',1,'','','',0);
INSERT INTO units VALUES(120,42,'exercise','Övning 2',2,'','','',0);
INSERT INTO units VALUES(121,43,'video','Main',1,'','','',0);
INSERT INTO units VALUES(122,43,'exercise','Övning',2,'','','',0);
INSERT INTO units VALUES(123,43,'video','Nya rader',3,'','','',0);
INSERT INTO units VALUES(124,43,'video','Nya kolumner',5,'','','',0);
INSERT INTO units VALUES(125,43,'exercise','Övning',4,'','','',0);
INSERT INTO units VALUES(126,43,'exercise','Övning',6,'','','',0);
INSERT INTO units VALUES(129,45,'video','Main',1,'','','',0);
INSERT INTO units VALUES(130,45,'exercise','Övning 1',2,'','','',0);
INSERT INTO units VALUES(131,45,'exercise','Övning 2',3,'','','',0);
INSERT INTO units VALUES(132,46,'video','Main',1,'','','',0);
INSERT INTO units VALUES(133,46,'exercise','Övning',2,'','','',0);
INSERT INTO units VALUES(134,46,'exercise','Övning',3,'','','',0);
INSERT INTO units VALUES(135,47,'video','Main',1,'','','',0);
INSERT INTO units VALUES(136,47,'exercise','Övning',2,'','','',0);
INSERT INTO units VALUES(137,48,'video','Main',1,'','','',0);
INSERT INTO units VALUES(138,48,'exercise','Övning 1',2,'','','',0);
INSERT INTO units VALUES(139,48,'exercise','Övning 2',3,'','','',0);
INSERT INTO units VALUES(140,49,'video','Main',1,'','','',0);
INSERT INTO units VALUES(141,49,'exercise','Övning',2,'','','',0);
INSERT INTO units VALUES(142,50,'video','Main',1,'','','',0);
INSERT INTO units VALUES(143,51,'video','Main',1,'','','',0);
INSERT INTO units VALUES(144,51,'exercise','Övning',2,'','','',0);
INSERT INTO units VALUES(145,52,'video','Main',1,'','','',0);
INSERT INTO units VALUES(146,52,'exercise','Övning',2,'','','',0);
INSERT INTO units VALUES(147,53,'video','Main',1,'','','',0);
INSERT INTO units VALUES(148,53,'exercise','Övning',2,'','','',0);
INSERT INTO units VALUES(149,53,'exercise','Övning',3,'','','',0);
INSERT INTO units VALUES(150,53,'exercise','Övning',4,'','','',0);
INSERT INTO units VALUES(151,54,'exercise','Övning',1,'','','',0);
INSERT INTO units VALUES(152,55,'video','Main',1,'','','',0);
INSERT INTO units VALUES(153,55,'quiz','Title',2,'','','',0);
INSERT INTO units VALUES(154,56,'video','Main',1,'','','',0);
INSERT INTO units VALUES(155,56,'exercise','Övning',2,'','','',0);
INSERT INTO units VALUES(156,57,'video','Main',1,'','','',0);
INSERT INTO units VALUES(157,57,'exercise','Övning',2,'','','',0);
INSERT INTO units VALUES(158,58,'exercise','Övning',1,'','','',0);
INSERT INTO units VALUES(159,58,'exercise','Övning',2,'','','',0);
INSERT INTO units VALUES(160,58,'exercise','Övning',3,'','','',0);
INSERT INTO units VALUES(161,58,'exercise','Övning',4,'','','',0);
INSERT INTO units VALUES(162,58,'exercise','Övning',5,'','','',0);
INSERT INTO units VALUES(163,58,'exercise','Övning',6,'','','',0);
INSERT INTO units VALUES(164,58,'exercise','Övning',7,'','','',0);
INSERT INTO units VALUES(165,58,'exercise','Övning',8,'','','',0);
INSERT INTO units VALUES(166,59,'video','Main',1,'','','',0);
INSERT INTO units VALUES(167,60,'video','Main',1,'','','',0);
INSERT INTO units VALUES(168,60,'exercise','Övning',2,'','','',0);
INSERT INTO units VALUES(169,61,'video','Main',1,'','','',0);
INSERT INTO units VALUES(170,61,'exercise','Övning',2,'','','',0);
INSERT INTO units VALUES(171,62,'video','Main',1,'','','',0);
INSERT INTO units VALUES(172,62,'exercise','Övning',2,'','','',0);
INSERT INTO units VALUES(173,63,'exercise','Övning',1,'','','',0);
INSERT INTO units VALUES(174,63,'exercise','Övning',2,'','','',0);
INSERT INTO units VALUES(175,63,'exercise','Övning',3,'','','',0);
INSERT INTO units VALUES(176,64,'video','Main',1,'','','',0);
INSERT INTO units VALUES(177,64,'exercise','Övning',2,'','','',0);
INSERT INTO units VALUES(178,64,'exercise','Övning',3,'','','',0);
INSERT INTO units VALUES(179,65,'video','Main',1,'','','',0);
INSERT INTO units VALUES(180,66,'video','Main',1,'','','',0);
INSERT INTO units VALUES(181,66,'video','Some important details',2,'','','',0);
INSERT INTO units VALUES(182,66,'exercise','Övning',3,'','','',0);
INSERT INTO units VALUES(183,66,'exercise','Övning',4,'','','',0);
INSERT INTO units VALUES(184,67,'video','Main',1,'','','',0);
INSERT INTO units VALUES(185,67,'exercise','Övning',2,'','','',0);
INSERT INTO units VALUES(186,67,'quiz','Title',3,'','','',0);
INSERT INTO units VALUES(187,63,'quiz','Title',4,'','','',0);
INSERT INTO units VALUES(188,42,'quiz','Title',3,'','','',0);
INSERT INTO units VALUES(189,68,'exercise','Övning',1,'','','',0);
INSERT INTO units VALUES(190,68,'exercise','Övning',2,'','','',0);
INSERT INTO units VALUES(191,68,'exercise','Övning',3,'','','',0);
INSERT INTO units VALUES(192,68,'quiz','Title',4,'','','',0);
INSERT INTO units VALUES(193,69,'exercise','Övning',1,'','','',0);
INSERT INTO units VALUES(194,69,'exercise','Övning',2,'','','',0);
INSERT INTO units VALUES(195,69,'exercise','Övning',3,'','','',0);
INSERT INTO units VALUES(196,69,'exercise','Övning',4,'','','',0);
INSERT INTO units VALUES(197,69,'exercise','Övning',5,'','','',0);
INSERT INTO units VALUES(198,69,'exercise','Övning',6,'','','',0);
INSERT INTO units VALUES(199,70,'video','Main',1,'','','',0);
INSERT INTO units VALUES(200,71,'video','Main',1,'','','',0);
INSERT INTO units VALUES(201,71,'exercise','Övning',2,'','','',0);
INSERT INTO units VALUES(202,71,'exercise','Övning',3,'','','',0);
INSERT INTO units VALUES(203,72,'video','Main',1,'','','',0);
INSERT INTO units VALUES(204,72,'exercise','Övning',2,'','','',0);
INSERT INTO units VALUES(205,72,'exercise','Övning',3,'','','',0);
INSERT INTO units VALUES(206,73,'video','Main',1,'','','',0);
INSERT INTO units VALUES(207,73,'exercise','Övning',2,'','','',0);
INSERT INTO units VALUES(208,73,'quiz','Title',3,'','','',0);
CREATE TABLE dependencies (
  unit_id         INT NOT NULL,
  section_id      INT NOT NULL,

  FOREIGN KEY (unit_id)
  REFERENCES units (unit_id)        ON UPDATE CASCADE
                                    ON DELETE CASCADE,
  FOREIGN KEY (section_id)
  REFERENCES sections (section_id)  ON UPDATE CASCADE
                                    ON DELETE CASCADE
);
INSERT INTO dependencies VALUES(192,58);
CREATE TABLE users_units (
  users_units_id          INTEGER PRIMARY KEY,
  unit_id                 INT NOT NULL,
  user_id                 INT NOT NULL,
  notes                   TEXT DEFAULT '',
  check_question          BOOLEAN DEFAULT false,
  check_complete          BOOLEAN DEFAULT false,

  FOREIGN KEY (unit_id)
  REFERENCES units (unit_id)  ON UPDATE CASCADE
                              ON DELETE CASCADE,
  FOREIGN KEY (user_id)
  REFERENCES users (user_id)  ON UPDATE CASCADE
                              ON DELETE CASCADE
);
INSERT INTO users_units VALUES(1,1,2,'',0,0);
CREATE TABLE quiz_questions (
  quiz_question_id   INTEGER PRIMARY KEY,
  unit_id       INT NOT NULL,
  spot          INT DEFAULT -1,
  question      TEXT DEFAULT '',

  FOREIGN KEY (unit_id)
  REFERENCES units (unit_id)  ON UPDATE CASCADE
                              ON DELETE CASCADE
);
INSERT INTO quiz_questions VALUES(1,13,1,'Question');
INSERT INTO quiz_questions VALUES(2,46,1,'Q');
INSERT INTO quiz_questions VALUES(3,50,1,'q');
INSERT INTO quiz_questions VALUES(4,59,1,'q');
INSERT INTO quiz_questions VALUES(5,61,1,'q');
INSERT INTO quiz_questions VALUES(6,69,1,'Shorthand');
INSERT INTO quiz_questions VALUES(7,84,1,'Vilka av dessa är installerade i alla datorer?');
INSERT INTO quiz_questions VALUES(8,111,1,'align-self');
INSERT INTO quiz_questions VALUES(9,153,1,'Q');
INSERT INTO quiz_questions VALUES(10,186,1,'q');
INSERT INTO quiz_questions VALUES(11,187,1,'q');
INSERT INTO quiz_questions VALUES(12,188,1,'q');
INSERT INTO quiz_questions VALUES(13,192,1,'q');
INSERT INTO quiz_questions VALUES(14,208,1,'q');
CREATE TABLE quiz_options (
  quiz_option_id      INTEGER PRIMARY KEY,
  quiz_question_id    INT NOT NULL,
  option              TEXT DEFAULT '',
  correct             BOOLEAN DEFAULT false,

  FOREIGN KEY (quiz_question_id)
  REFERENCES quiz_questions (quiz_question_id)    ON UPDATE CASCADE
                                                  ON DELETE CASCADE
);
INSERT INTO quiz_options VALUES(1,1,'Correct',1);
INSERT INTO quiz_options VALUES(2,2,'O',1);
INSERT INTO quiz_options VALUES(3,3,'o',1);
INSERT INTO quiz_options VALUES(4,4,'o',1);
INSERT INTO quiz_options VALUES(5,5,'o',1);
INSERT INTO quiz_options VALUES(6,6,'o',1);
INSERT INTO quiz_options VALUES(7,7,'o',1);
INSERT INTO quiz_options VALUES(8,8,'o',1);
INSERT INTO quiz_options VALUES(9,9,'O',1);
INSERT INTO quiz_options VALUES(10,10,'q',1);
INSERT INTO quiz_options VALUES(11,11,'q',1);
INSERT INTO quiz_options VALUES(12,12,'q',1);
INSERT INTO quiz_options VALUES(13,13,'q',1);
INSERT INTO quiz_options VALUES(14,14,'o',1);
CREATE TABLE quiz_answers (
  quiz_answer_id      INTEGER PRIMARY KEY,
  user_id             INT NOT NULL,
  quiz_option_id      INT NOT NULL,
  timestamp           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id)
  REFERENCES users (user_id)  ON UPDATE CASCADE
                              ON DELETE CASCADE,
  FOREIGN KEY (quiz_option_id)
  REFERENCES quiz_options (quiz_option_id)  ON UPDATE CASCADE
                                       ON DELETE CASCADE
);
INSERT INTO quiz_answers VALUES(1,2,1,'2022-08-20 07:12:05');
CREATE TABLE counters (
            counter_create_post      INT DEFAULT 0,
            counter_progress_post    INT DEFAULT 0
        );
INSERT INTO counters VALUES(2,0);
COMMIT;

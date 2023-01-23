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
CREATE TABLE users (
  user_id           INTEGER PRIMARY KEY,
  name              TEXT NOT NULL,
  user_password     TEXT NOT NULL,
  user_token        TEXT,
  user_programme    TEXT, -- TCH for teachers, WDU, PMM, MPP, etc
  user_start_year   INT,  -- 99 for teachers, otherwise YY
  can_add_courses   BOOLEAN DEFAULT false
, amanuens TEXT DEFAULT '[]');
CREATE TABLE course_roles (
  role          TEXT NOT NULL
);
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
CREATE TABLE chapters (
  chapter_id    INTEGER PRIMARY KEY,
  course_id     INT NOT NULL,
  kind          TEXT DEFAULT "chapter",
  name          TEXT DEFAULT "(max 15 chars)",
  spot          INT DEFAULT -1,
  story         TEXT DEFAULT 'Short story about the chapter (60 chars max)',
  done          BOOLEAN DEFAULT false,

  FOREIGN KEY (course_id)
  REFERENCES courses (course_id)    ON UPDATE CASCADE
                                    ON DELETE CASCADE

);
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
CREATE TABLE quiz_questions (
  quiz_question_id   INTEGER PRIMARY KEY,
  unit_id       INT NOT NULL,
  spot          INT DEFAULT -1,
  question      TEXT DEFAULT '',

  FOREIGN KEY (unit_id)
  REFERENCES units (unit_id)  ON UPDATE CASCADE
                              ON DELETE CASCADE
);
CREATE TABLE quiz_options (
  quiz_option_id      INTEGER PRIMARY KEY,
  quiz_question_id    INT NOT NULL,
  option              TEXT DEFAULT '',
  correct             BOOLEAN DEFAULT false,

  FOREIGN KEY (quiz_question_id)
  REFERENCES quiz_questions (quiz_question_id)    ON UPDATE CASCADE
                                                  ON DELETE CASCADE
);
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
CREATE TABLE counters (
            counter_create_post      INT DEFAULT 0,
            counter_progress_post    INT DEFAULT 0
        );
CREATE TABLE archive_users_units (
  unit_id                 INT NOT NULL,
  user_id                 INT NOT NULL,
  timestamp               INT NOT NULL,
  check_question          BOOLEAN DEFAULT false,
  check_complete          BOOLEAN DEFAULT false);

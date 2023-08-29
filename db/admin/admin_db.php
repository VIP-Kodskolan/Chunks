<?php

function _echo ($string) {
  // global $doEcho;
  // if (!$doEcho) return;
  echo "$string<br>";
}
function _var_dump($v) {
  echo '<pre>' . var_export($v, true) . '</pre>';
}




require("../actions.php");
require("./students_admin.php");




define('SQLITE_FILE', '../phpsqlite.db');

function get_pdo () {
  return new \PDO("sqlite:" . SQLITE_FILE, '', '', array(
    \PDO::ATTR_EMULATE_PREPARES => false,
    \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
    \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC
  ));
}
function reset_db () {
  
  // REMOVE DB FILE
  $file = SQLITE_FILE;
  unlink($file);
  
  // CREATE DB
  echo "<br>CREATE<br>";
  $_pdo = get_pdo();
  $_pdo->exec(file_get_contents("./x.sql"));

  return $_pdo;
}
function populate_db ($pdo) {

  // ROLES
  $roles = [ "teacher", "student", "assistant" ];
  foreach ( $roles as $role ) {
    $query = "INSERT INTO course_roles (role) VALUES ('$role')";
    _echo($query);
    $pdo->query($query);
  }

  // USERS: TEACHERS
  $teachers = [
    [
      "name" => "Sebbe",
      "password" => "arja",
    ],
    [
      "name" => "Erik",
      "password" => "yoman",
    ],
  ];
  foreach ($teachers as $user) {
    $name = $user["name"];
    $pass = $user["password"];
    $programme = "TCH";
    $start_year = 99;
    $can_add_courses = "true";

    // USERS
    $query = "INSERT INTO users (name, user_password, user_programme, user_start_year, can_add_courses) VALUES ('$name', '$pass', '$programme', $start_year, $can_add_courses)";
    _echo($query);
    $pdo->query($query);
    $user_id = $pdo->lastInsertId();

  }

  // COURSES
  $courses = [
    [
      "name" => "Webbproduktion",
      "alias" => "WBP_22",
      "code" => "ME154A",
      "canvas_url" => "https://mau.instructure.com/courses/11479",
      "week_start" => 35,
      "week_count" => 17,
      "semester" => "HT22",
      "programmes" => json_encode(["PMA_21"]),
    ],
    [
      "name" => "Databasbaserad publicering",
      "alias" => "DBP_22",
      "code" => "ME105A",
      "canvas_url" => "https://mau.instructure.com/courses/11431",
      "week_start" => 35,
      "week_count" => 17,
      "semester" => "HT22",
      "programmes" => json_encode(["MPP_21"]),
    ],
    [
      "name" => "Webbaserad Design och Utveckling I",
      "alias" => "DU1_22",
      "code" => "ME102B",
      "canvas_url" => "mau.se",
      "week_start" => 35,
      "week_count" => 8,
      "semester" => "HT22",
      "programmes" => json_encode(["WDU_22"]),
    ],
    [
      "name" => "Webbaserad Design och Utveckling II",
      "alias" => "DU2_22",
      "code" => "ME103B",
      "canvas_url" => "mau.se",
      "week_start" => 43,
      "week_count" => 8,
      "semester" => "HT22",
      "programmes" => json_encode(["WDU_22"]),
    ],
    [
      "name" => "Webbaserad Design och Utveckling III",
      "alias" => "DU3_23",
      "code" => "ME105B",
      "canvas_url" => "mau.se",
      "week_start" => 3,
      "week_count" => 20,
      "semester" => "VT23",
      "programmes" => json_encode(["WDU_22"]),
    ],
    [
      "name" => "Design Metoder",
      "alias" => "DSM_23",
      "code" => "ME110B",
      "canvas_url" => "mau.se",
      "week_start" => 35,
      "week_count" => 18,
      "semester" => "HT23",
      "programmes" => json_encode(["WDU_22"]),
    ],
    [
      "name" => "Design Studio",
      "alias" => "DSS_23",
      "code" => "ME111B",
      "canvas_url" => "mau.se",
      "week_start" => 35,
      "week_count" => 18,
      "semester" => "HT23",
      "programmes" => json_encode(["WDU_22"]),
    ]
  ];
  foreach ($courses as $course) {

    // POST
    $params = [
      "name" => $course["name"],
    ];
    $course_id = POST_course($params, $pdo)["data"]["course"]["course_id"];
    echo "<br>COURSE $course_id ADDED";

    // PATCH
    $params = [
      "user_id" => -1,
      "element_id" => $course_id,
      "kind" => "course",
      "updated_fields" => [
        ["field" => "alias", "value" => $course["alias"], "is_text" => true],
        ["field" => "code", "value" => $course["code"], "is_text" => true],
        ["field" => "canvas_url", "value" => $course["canvas_url"], "is_text" => true],
        ["field" => "semester", "value" => $course["semester"], "is_text" => true],
        ["field" => "week_start", "value" => $course["week_start"], "is_text" => false],
        ["field" => "week_count", "value" => $course["week_count"], "is_text" => false],
        ["field" => "programmes", "value" => $course["programmes"], "is_text" => true],
      ],
    ];
    $added_course = PATCH_course($params, $pdo)["data"]["element"];
    $course_id = $added_course["course_id"];
    // echo "<br>";

    // CHAPTERS, SECTIONS AND UNITS
    $name = $course["alias"]."_data";
    if (!file_exists("$name.php")) _echo("No file for $name");
    else {

      include_once("$name.php");

      $chapters = [];
      $sections = [];
      $units = [];
    
      foreach (${"$name"} as $chapter) {
        
        $params = [
          "course" => [ "course_id" => $course_id ],
          "name" => $chapter["name"],
        ];
        $added_chapter = POST_chapter($params, $pdo)["data"]["chapter"];
        $chapter_id = $added_chapter["chapter_id"];
    
        
        foreach ($chapter["sections"] as $section) {
    
          $params = [
            "chapter" => [ "chapter_id" => $chapter_id ],
            "name" => $section["name"],
          ];
          $added_section = POST_section($params, $pdo)["data"]["section"];
          $section_id = $added_section["section_id"];

          
          foreach ($section["units"] as $unit) {
    
            $params = [
              "section" => [ "chapter_id" => $chapter_id, "section_id" => $section_id, "course_id" => $course_id ],
              "name" => $unit["name"],
              "kind" => $unit["kind"],
            ];
            $added_unit = POST_unit($params, $pdo)["data"]["unit"];
            $unit_id = $added_unit["unit_id"];
      
          }
        }
      }    
    }

  }

}
function add_students ($pdo, $programme, $n_students) {

  $students = make_students($pdo, $programme, $n_students);

  foreach ($students as $user) {

    $user = POST_user($user, $pdo)["data"]["user"];
    // _var_dump(_get_user($user["user_id"], $pdo));
    // _get_user($user["user_id"], $pdo);

  }

}
function create_cards ($pdo, $programme, $year) {
  // Cards to give one to each student so they can login.
  $students = array_from_query($pdo, "SELECT * FROM users WHERE user_programme='$programme' AND user_start_year=$year");
  
  echo "
  <html>
  <body>
  ";
  // echo "<body style='background-color: skyblue;' >";
  echo "<body style='width: 19cm; display: grid; grid-template-columns: repeat(4, 1fr); font-size: .4cm; text-align:center' >";
  // echo "<body>";

  foreach ($students as $student) {
    $name = $student["name"];
    $password = $student["user_password"];
    echo "
      <div class='card' style='display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .3cm; margin: .6cm;'>
        <div>username: $name</div>
        <div>password: $password</div>
      </div>
    ";
  }

  echo "</body></html>";

}
function init_db ($pdo) {

  $pdo = reset_db();
  populate_db($pdo);
  
  $programmes = ["WDU_22", "MPP_21", "PMA_21"];
  foreach ( $programmes as $programme ) {
    add_students($pdo, $programme, 65);
  }
    
}
function add_column_done ($pdo) {
  $pdo -> query ("
                  ALTER TABLE chapters
                  ADD done BOOLEAN DEFAULT false;               
  ");
  _var_dump(array_from_query($pdo, "SELECT * FROM chapters"));
}
function test_cascade ($pdo) {

  $pdo -> query("DELETE FROM courses WHERE name = 'test'");
  $pdo -> query("DELETE FROM chapters WHERE name = 'test'");
  $pdo -> query("DELETE FROM sections WHERE name = 'test'");

  $pdo -> query("INSERT INTO courses (name) VALUES ('test')");
  $course_id = $pdo->lastInsertId();

  $pdo -> query("INSERT INTO chapters (name, course_id, spot) VALUES ('test', $course_id, 1)");
  $chapter_id = $pdo->lastInsertId();

  $pdo -> query("INSERT INTO sections (name, chapter_id, spot) VALUES ('test', $chapter_id, 1)");
  $section_id = $pdo->lastInsertId();

  // $pdo -> query("INSERT INTO units (name, section_id, spot) VALUES ('test', $section_id, 1)");
  // $unit_id = $pdo->lastInsertId();

  // $pdo -> query("INSERT INTO quiz_questions (question, unit_id, spot) VALUES ('test', $unit_id, 1)");
  // $quiz_question_id = $pdo->lastInsertId();

  // $pdo -> query("INSERT INTO quiz_options (option, quiz_question_id) VALUES ('test', $quiz_question_id)");
  // $quiz_question_id = $pdo->lastInsertId();

  // $pdo -> query("INSERT INTO dependencies (unit_id, section_id) VALUES ($unit_id, $section_id)");
  // $pdo -> query("INSERT INTO users_units (unit_id, user_id) VALUES ($unit_id, 1)");

  _var_dump(array_from_query($pdo, "SELECT * FROM courses WHERE name = 'test'"));
  _var_dump(array_from_query($pdo, "SELECT * FROM chapters WHERE name = 'test'"));
  _var_dump(array_from_query($pdo, "SELECT * FROM sections WHERE name = 'test'"));
  // _var_dump(array_from_query($pdo, "SELECT * FROM units WHERE name = 'test'"));
  // _var_dump(array_from_query($pdo, "SELECT * FROM quiz_questions WHERE question = 'test'"));
  // _var_dump(array_from_query($pdo, "SELECT * FROM quiz_options WHERE option = 'test'"));
  // _var_dump(array_from_query($pdo, "SELECT * FROM dependencies WHERE section_id = $section_id"));
  // _var_dump(array_from_query($pdo, "SELECT * FROM users_units WHERE unit_id = $unit_id"));

  _echo ("DELETE"); 

  $pdo->exec('PRAGMA foreign_keys = ON');
  $pdo -> query("DELETE FROM courses WHERE course_id = $course_id");
  // cascade_delete($pdo, "chapter", $chapter_id);
  // cascade_delete($pdo, "section", $section_id);
  // cascade_delete($pdo, "course", $course_id);

  _var_dump(array_from_query($pdo, "SELECT * FROM courses WHERE name = 'test'"));
  _var_dump(array_from_query($pdo, "SELECT * FROM chapters WHERE name = 'test'"));
  _var_dump(array_from_query($pdo, "SELECT * FROM sections WHERE name = 'test'"));
  // _var_dump(array_from_query($pdo, "SELECT * FROM units WHERE name = 'test'"));
  // _var_dump(array_from_query($pdo, "SELECT * FROM quiz_questions WHERE question = 'test'"));
  // _var_dump(array_from_query($pdo, "SELECT * FROM quiz_options WHERE option = 'test'"));
  // _var_dump(array_from_query($pdo, "SELECT * FROM dependencies WHERE section_id = $section_id OR unit_id = $unit_id"));
  // _var_dump(array_from_query($pdo, "SELECT * FROM users_units WHERE unit_id = $unit_id"));

}
function check_courses ($pdo) {
  _var_dump(array_from_query($pdo, "SELECT * FROM courses"));
}
function delete_useless_courses ($pdo) {
  $pdo -> query("DELETE FROM courses WHERE alias='Alias'");
  check_courses($pdo);
}
function mark_unit_complete ($pdo, $unit_id, $user_id) {

  $_temp = array_from_query($pdo, "SELECT * FROM users_units WHERE unit_id = $unit_id AND user_id = $user_id;");
  if (count($_temp) > 0) {
    $pdo -> query("UPDATE users_units SET check_complete = true WHERE unit_id = $unit_id AND user_id = $user_id;");
  } else {
    $pdo -> query("INSERT INTO users_units (unit_id, user_id, check_complete) VALUES ($unit_id, $user_id, true)");
    mark_unit_complete($pdo, $unit_id, $user_id);
  }

}
function add_column_amanuens_users ($pdo) {
  $pdo -> query ("
                  ALTER TABLE users
                  ADD amanuens TEXT DEFAULT '[]';               
  ");
  _var_dump(array_from_query($pdo, "SELECT * FROM users"));
}
function copy_course ($pdo, $origin_id, $copy_id) {

  // Check that target course exists
  $check = array_from_query($pdo, "SELECT * FROM courses WHERE course_id = $copy_id");
  if (!count($check)) {
    exit("Course with id ($copy_id) not found");
  }

  // Copies chapters, sections, units, quiz_questions and quiz_options
  $chapters = _get_course_chapters($origin_id, $pdo);
  foreach($chapters as $chapter) {

    $name = $chapter["name"];
    $spot = $chapter["spot"];
    $story = $chapter["story"];
    $done = $chapter["story"] ? "true" : "false";
    $sql = "INSERT INTO chapters (name, course_id, spot, story, done) VALUES ('$name', $copy_id, $spot, '$story', $done)";
    _echo($sql);
    $pdo->query($sql);
    $chapter_id = $pdo->lastInsertId();

    $sections = _get_chapter_sections($chapter["chapter_id"], $pdo);
    foreach ($sections as $section) {

      $name = $section["name"];
      $spot = $section["spot"];
      $story = $section["story"];
      $sql = "INSERT INTO sections (name, chapter_id, spot, story) VALUES ('$name', $chapter_id, $spot, '$story')";
      _echo($sql);
      $pdo->query($sql);
      $section_id = $pdo->lastInsertId();

      $units = _get_section_units($section["section_id"], $pdo);
      foreach ($units as $unit) {

        $name = $unit["name"];
        $kind = $unit["kind"];
        $spot = $unit["spot"];
        $story = $unit["story"];
        $video_link = $unit["video_link"];
        $folder_link = $unit["folder_link"];
        $is_stop_quiz = $unit["is_stop_quiz"] == 1 ? "true" : "false";
        $sql = "INSERT INTO units (name, kind, section_id, spot, story, video_link, folder_link, is_stop_quiz)
                VALUES ('$name', '$kind', $section_id, $spot, '$story', '$video_link', '$folder_link', $is_stop_quiz)";
        _echo($sql);
        $pdo->query($sql);
        $unit_id = $pdo->lastInsertId();
        
        $quiz_questions = _get_quiz_questions ($unit["unit_id"], $pdo);
        foreach ($quiz_questions as $quiz_question) {

          $question = $quiz_question["question"];
          $spot = $quiz_question["spot"];
          $sql = "INSERT INTO quiz_questions (question, unit_id, spot)
                  VALUES ('$question', $unit_id, $spot)";
          $pdo->query($sql);
          _echo($sql);
          $quiz_question_id = $pdo->lastInsertId();

          $quiz_options = _get_question_options($quiz_question["quiz_question_id"], $pdo);
          foreach ($quiz_options as $quiz_option) {

            $option = $quiz_option["option"];
            $correct = $quiz_option["correct"] == 1 ? "true" : "false";
            $sql = "INSERT INTO quiz_options (option, quiz_question_id, correct)
                    VALUES ('$option', $quiz_question_id, $correct)";
            _echo($sql);
            $pdo->query($sql);
              
          }
  
        }
        
      }

    }

  }



}
function add_amanuens ($pdo) {
  // Do it through the GUI!
}
function reset_create_register_tokens ($pdo) {

  // INSERT INTO register_tokens VALUES ('ah5479', 'WDU');
  // INSERT INTO register_tokens VALUES ('ah5478', 'FRI_DU1');
  // INSERT INTO register_tokens VALUES ('ah5477', 'FRI_DU1');

  $query = "
  BEGIN TRANSACTION;

  DROP TABLE IF EXISTS register_tokens;

  CREATE TABLE register_tokens (
    token       TEXT NOT NULL,
    programme   TEXT NOT NULL,
    start_year  INT NOT NULL
  );

  COMMIT;
  ";

  $pdo->exec($query);
  _echo("<br>Done.");
}
function add_column_status ($pdo) {
    $pdo -> query ("
                  ALTER TABLE users_units
                  ADD status INT DEFAULT 0;               
    ");
  _var_dump(array_from_query($pdo, "SELECT * FROM users_units LIMIT 1"));

}
function add_student_ids_23 ($pdo) {
  
  $fri_ids = ["ap2811", "ai7278", "ap2339", "am1369", "ao4551", "am2701", "am5914", "am7429"];
  foreach ($fri_ids as $id) {
    $query = "INSERT INTO register_tokens VALUES ('$id', 'FRI_DU1', 23);";
    _echo($query);
    $pdo->exec($query);
  }

  $program_ids = ["ao7361", "ap0806", "ao7783", "ao8032", "ap0159", "ao8982", "ao7125", "ao8899", "ap0897", "an7605", "ap2577", "ap3014", "ap0845", "ao9862", "ap0963", "am7044", "ao7787", "ao8898", "an3837", "ao8105", "am2169", "ap1700", "ap2328", "an8614", "ao8092", "ah1221", "ao7206", "aj4043", "an1706", "ao9141", "ao8330", "ap0222", "ap2289", "ap1938", "al9332", "ap0476", "ao7230", "ap0206", "ap1916", "an4748", "ao9118", "ao7022", "ao5714", "ap0642", "ap1428", "ao7978", "ao7026", "ao7610", "ao8955", "ao8556", "ap1599", "an5420", "ao7834"];
  foreach ($program_ids as $id) {
    $query = "INSERT INTO register_tokens VALUES ('$id', 'WDU', 23);";
    _echo($query);
    $pdo->exec($query);
  }

}
function add_one_id ($pdo, $id, $program, $start_year) {
  if (!$id) return;
  $query = "INSERT INTO register_tokens VALUES ('$id', '$program', $start_year);";
  _echo($query);
  $pdo->exec($query);
}


$pdo = get_pdo();
add_one_id($pdo, "ap3359", "WDU", 23);
exit("<br>Exit.");


?>


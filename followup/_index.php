<?php

function __get_progress_data () {

  if (!isset($_GET["course"])) {
    echo "Ange kurs. Exempel: prefix/?course=DBP_22";
    exit();
  }

  define('PATH_TO_SQLITE_FILE', '../db/phpsqlite.db');
  $pdo = new \PDO("sqlite:" . PATH_TO_SQLITE_FILE, '', '', array(
    \PDO::ATTR_EMULATE_PREPARES => false,
    \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
    \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC
  ));

  $course = $_GET["course"];
  $course = array_from_query($pdo, "SELECT * FROM courses WHERE alias='$course'")[0];
  $course_id = $course["course_id"];
  $n_course_units = count(_get_course_units($course_id, $pdo));
  $html_course = "";

  // WEEKS
  for ($i = $course["week_start"]; $i < $course["week_start"] + $course["week_count"]; $i++) {
    $html_weeks .= "<div class='week'>v$i</div>";
  }
  $html_course = "<div class='weeks'>$html_weeks</div>";


  // UNITS
  $students = array_from_query($pdo, "SELECT * FROM users_courses WHERE course_id=$course_id AND role='student'");
  $html_students = "";
  foreach ($students as $student) {
    $user_id = $student["user_id"];
    $users_units = _get_users_units_completed($user_id, $course_id, $pdo);

    $html_units = "";
    foreach ($users_units as $unit) {
      $html_units .= "<div class='unit complete'></div>";
    }

    for ($i = 0; $i < $n_course_units - count($users_units); $i++) {
      $html_units .= "<div class='unit incomplete'></div>";
    }

    $html_students .= "<div class='student'>$html_units</div>";
  }
  $html_course .= "<div class='students'>$html_students</div>";

  return $html_course;

}
function sort_students ($s1, $s2) {
  return count($s1["units"]) - count($s2["units"]);
}
function get_progress_data () {

  if (!isset($_GET["course"])) {
    echo "Ange kurs. Exempel: prefix/?course=DBP_22";
    exit();
  }

  define('PATH_TO_SQLITE_FILE', '../db/phpsqlite.db');
  $pdo = new \PDO("sqlite:" . PATH_TO_SQLITE_FILE, '', '', array(
    \PDO::ATTR_EMULATE_PREPARES => false,
    \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
    \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC
  ));

  $course = $_GET["course"];
  $course = array_from_query($pdo, "SELECT * FROM courses WHERE alias='$course'")[0];
  $course_id = $course["course_id"];
  $n_course_units = count(_get_course_units($course_id, $pdo));
  $html_course = "";

  // WEEKS
  for ($i = $course["week_start"]; $i < $course["week_start"] + $course["week_count"]; $i++) {
    $html_weeks .= "<div class='week'>v$i</div>";
  }
  $html_course = "<div class='weeks'>$html_weeks</div>";


  // UNITS
  $students = array_from_query($pdo, "SELECT * FROM users_courses WHERE course_id=$course_id AND role='student'");
  foreach ($students as &$student) {
    $user_id = $student["user_id"];
    $student["units"] = _get_users_units_completed($user_id, $course_id, $pdo);
  }
  usort($students, "sort_students");

  $html_students = "";
  foreach ($students as $student) {

    $html_units = "";
    foreach ($student["units"] as $unit) {
      $html_units .= "<div class='unit complete'></div>";
    }

    for ($i = 0; $i < $n_course_units - count($student["units"]); $i++) {
      $html_units .= "<div class='unit incomplete'></div>";
    }

    $html_students .= "<div class='student'>$html_units</div>";
  }
  $html_course .= "<div class='students'>$html_students</div>";

  return $html_course;

}

function _echo ($string) {
  echo "$string<br>";
}
function _var_dump($v) {
  echo '<pre>' . var_export($v, true) . '</pre>';
}
function _get_users_units_completed ($user_id, $course_id, $pdo) {
  return array_from_query($pdo, "
    SELECT users_units.*, sections.section_id, sections.spot as section_spot, units.spot as unit_spot, chapters.chapter_id
    FROM users_units
    JOIN units USING (unit_id)
    JOIN sections USING (section_id)
    JOIN chapters USING (chapter_id)
    WHERE user_id = $user_id AND course_id = $course_id AND check_complete = true
    ORDER BY
        sections.spot,
        units.spot
    ;
  ");
}
function _get_course_units ($course_id, $pdo) {
  return array_from_query($pdo, "
    SELECT units.*, chapter_id, course_id 
    FROM units
    JOIN sections USING (section_id)
    JOIN chapters USING (chapter_id)
    JOIN courses USING (course_id)
    WHERE course_id = $course_id
    ORDER BY
        chapters.spot,
        sections.spot,
        units.spot
  ;");    
}
function array_from_query($pdo, $sql) {
  $array = [];
  // if (function_exists("_echo")) _echo($sql); 
  $stmt = $pdo -> query($sql);
  while ($element = $stmt->fetch(\PDO::FETCH_ASSOC)) {
    $array[] = $element;
  }
  return $array;
}

?>


<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Chunks - Follow up</title>
  <link href="_index.css" rel="stylesheet">
</head>
<body>

  <div id="wrapper">
    <?php echo get_progress_data(); ?>
  </div>
  
</body>
</html>
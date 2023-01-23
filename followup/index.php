<?php

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
  $course_units = _get_course_units($course_id, $pdo);
  $n_course_units = count($course_units);
  $html_course = "";

  // WEEKS
  for ($i = $course["week_start"]; $i < $course["week_start"] + $course["week_count"]; $i++) {
    $html_weeks .= "<div class='week'>v$i</div>";
  }
  $html_course = "
    <div class='row weeks'>
      <div class=''></div>
      <div class='weeks'>$html_weeks</div>
    </div>
  ";


  // STUDENTS AND THEIR UNITS
  $students = _get_students_in_course($course_id, $pdo);
  foreach ($students as &$student) {
    $user_id = $student["user_id"];
    $student["units"] = _get_users_units_completed($user_id, $course_id, $pdo);
  }
  usort($students, "sort_students");

  // _var_dump($students);

  foreach ($students as $student) {

    $html_student = "";
    if (count($student["units"]) === 0) continue;

    $html_units = "";
    foreach ($course_units as $unit) {

      // _var_dump($unit);
      // _echo($unit["section_spot"].", ".$unit["unit_spot"]);
      // _echo($unit["section_spot"] == "1" ? "First section" : "Other section");

      $class_completed = _is_completed_by_student($unit, $student) ? "complete" : "incomplete";
      $class_first_in_chapter = ($unit["section_spot"] == "1" && $unit["unit_spot"] == "1") ? "first_in_chapter" : "";
      $html_units .= "<div class='unit $class_completed $class_first_in_chapter'></div>";

    }

    $show_names = isset($_GET["x"]);
    $user_name = $show_names ? $student["name"] : "";
    $html_student .= "<div class='row student'>
                        <div class='user_name'>$user_name</div>
                        <div class='user_units'>$html_units</div>
                    </div>";

    $html_course .= $html_student;

  }

  return $html_course;

}

function _echo ($string) {
  echo "$string<br>";
}
function _var_dump($v) {
  echo '<pre>' . var_export($v, true) . '</pre>';
}

function _is_completed_by_student ($unit, $student) {
  foreach ($student["units"] as $completed) {
    if ($completed["unit_id"] === $unit["unit_id"]) {
      return true;
    }
  }
  return false;
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
function _get_students_in_course ($course_id, $pdo) {
  return array_from_query($pdo, "
    SELECT * FROM users_courses
    JOIN users USING (user_id)
    WHERE course_id=$course_id AND role='student'
  ");
}
function _get_course_units ($course_id, $pdo) {
  return array_from_query($pdo, "
    SELECT units.*, chapter_id, course_id, sections.spot as section_spot, units.spot as unit_spot
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
  <link href="index.css" rel="stylesheet">
</head>
<body>

  <div id="wrapper">
    <?php echo get_progress_data(); ?>
  </div>
  
</body>
</html>
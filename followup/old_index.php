<?php




function get_progress_data () {

  if (!isset($_GET["course"])) {
    echo "Ange kurs. Exempel: prefix/?course=DBP_22";
    exit();
  }

  require "../db/actions.php";

  define('PATH_TO_SQLITE_FILE', '../db/phpsqlite.db');
  $pdo = new \PDO("sqlite:" . PATH_TO_SQLITE_FILE, '', '', array(
    \PDO::ATTR_EMULATE_PREPARES => false,
    \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
    \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC
  ));

  $course = $_GET["course"];
  echo "SELECT * FROM courses WHERE alias='$course'";
  $course = array_from_query($pdo, "SELECT * FROM courses WHERE alias='$course'")[0];
  $course_id = $course["course_id"];
  $course["units"] = _get_course_units($course_id, $pdo);

  // ARCHIVED UNITS
  $users_units = array_from_query($pdo, "
    SELECT * FROM archive_users_units
    JOIN units USING (unit_id)
    JOIN sections USING (section_id)
    JOIN chapters USING (chapter_id)
    WHERE course_id = $course_id
    ORDER BY
        sections.spot,
        units.spot
    ;
  ");

  return [
    "users_units" => $users_units,
    "course" => $course,
  ];
}

?>


<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Chunks - Follow up</title>
  <link href="index.css" rel="stylesheet">
</head>
<!-- <body data-progress=""> -->
<body>
  <?php echo json_encode(get_progress_data()) ?>
  <h1>E</h1>
  <script src="index.js"></script>
</body>
</html>
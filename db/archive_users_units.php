<?php

// ARCHIVE USERS_UNITS THAT ARE NEW OR HAVE CHANGED SINCE LAST ARCHIVE

function _echo ($string) {
  // global $doEcho;
  // if (!$doEcho) return;
  return;
  echo "$string<br>";
}
function _var_dump($v) {
  return;
  echo '<pre>' . var_export($v, true) . '</pre>';
}

define('PATH_TO_SQLITE_FILE', './phpsqlite.db');
require('actions.php');

$pdo = new \PDO("sqlite:" . PATH_TO_SQLITE_FILE, '', '', array(
  \PDO::ATTR_EMULATE_PREPARES => false,
  \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
  \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC
));

$sql = "CREATE TABLE IF NOT EXISTS archive_users_units (
  unit_id                 INT NOT NULL,
  user_id                 INT NOT NULL,
  timestamp               INT NOT NULL,
  check_question          BOOLEAN DEFAULT false,
  check_complete          BOOLEAN DEFAULT false)";
$pdo -> query($sql);

$now_timestamp = (new DateTimeImmutable())->getTimestamp();

$users = array_from_query($pdo, "SELECT * FROM users WHERE user_programme!='TCH'");

foreach ($users as $user) {

  _echo("DOING ".$user["name"]);
  $user_id = $user["user_id"];
  $user_courses = _get_user_courses($user_id, $pdo);

  foreach ($user_courses as $user_course) {

    _echo("COURSE: ".$user_course["alias"]);

    if ($user_course["role"] !== "student") continue;

    $course_id = $user_course["course_id"];
    $users_units = _get_users_units ($user_id, $course_id, $pdo);


    foreach ($users_units as $current_users_unit) {
      
      $unit_id = $current_users_unit["unit_id"];
      _echo("UNIT ID: $unit_id");
      $last_archived_users_unit = array_from_query($pdo, "SELECT * FROM archive_users_units WHERE user_id=$user_id AND unit_id=$unit_id ORDER BY timestamp DESC LIMIT 1")[0];
      if ($last_archived_users_unit) {

        _echo("LAST ARCHIVED TIMESTAMP (".$last_archived_users_unit["timestamp"].")");
        _echo("CURRENT");
        _var_dump($current_users_unit);
        _echo("LAST ARCHIVED");
        _var_dump($last_archived_users_unit);

      } else {
        _echo("NOT ARCHIVED");
      }

      $change = $last_archived_users_unit === null
                || $current_users_unit["check_question"] !== $last_archived_users_unit["check_question"]
                || $current_users_unit["check_complete"] !== $last_archived_users_unit["check_complete"];

      if ($change) {
        $check_question = $current_users_unit["check_question"] == "1" ? "true" : "false";
        $check_complete = $current_users_unit["check_complete"] == "1" ? "true" : "false";
        _echo("INSERT INTO archive_users_units (unit_id, user_id, check_question, check_complete, timestamp) VALUES ($unit_id, $user_id, $check_question, $check_complete, $now_timestamp)");
        $pdo -> query("INSERT INTO archive_users_units (unit_id, user_id, check_question, check_complete, timestamp)
                        VALUES ($unit_id, $user_id, $check_question, $check_complete, $now_timestamp)");
      }      

    }

  }


}

header("Content-Type: application/json");
http_response_code(200);
echo json_encode(["message" => "Done"]);
exit();




?>

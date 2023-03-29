<?php

// GETS
function GET_course ($params, $pdo) {
  
  $course_id = $params["course_id"];
  $user_id = $params["user_id"];

  return [
    "data" => [
      "course" => _get_course($course_id, $pdo, $user_id),
      "chapters" => _get_course_chapters($course_id, $pdo),
      "sections" => _get_course_sections($course_id, $pdo),
      "units" => _get_course_units($course_id, $pdo),
      "dependencies" => _get_course_dependencies($course_id, $pdo),
      "users_units" => _get_users_units($user_id, $course_id, $pdo),
      "quiz_questions" => _get_course_quiz_questions($course_id, $pdo),
      "quiz_options" => _get_course_quiz_options($course_id, $pdo),
      "quiz_answers" => _get_course_quiz_answers($user_id, $course_id, $pdo),
    ]
  ];

}
function GET_date_time ($params, $pdo) {

  $date_time = 1000 * substr(date("UTC"), 0, strlen(date("UTC") - 3));
  return [
    "data" => [
      "date_time" => $date_time,
    ]
  ];

}
function GET_login ($params, $pdo) {

  $username = $params["username"];
  $password_token = $params["usertoken"];
  $password = $params["password"];

  $user_db = array_from_query($pdo, "SELECT * from users WHERE name = '$username'")[0];

  $password = $user_db !== null && ($user_db["user_password"] === $password || $user_db["user_token"] === $password_token);
  $status = [
    "password" => $password,
  ];
  $user = "";
  $token = "";
  $courses = [];


  if ($password) {
    $user_id = $user_db["user_id"];

    // SET TOKEN FOR CONTINUOUS LOGIN
    global $n_chars_token;
    $token = substr(md5(rand()), 0, $n_chars_token);
    $pdo -> query("UPDATE users SET user_token = '$token' WHERE user_id = $user_id");

    $user = _get_user($user_id, $pdo);
    $courses = _get_user_courses($user_id, $pdo);
  }

  return [
    "data" => [
      "courses" => $courses,
      "status" => $status,
      "token" => $token,
      "user" => $user,
    ]
  ];

}
function GET_users ($params, $pdo) {

  // // CHECK ACCESS
  // $username = $params["username"];
  // $password_token = $params["usertoken"];
  // $user_db = array_from_query($pdo, "SELECT * from users WHERE name = '$username'")[0];
  // $password = ($user_db !== null && $user_db["user_password"] === $password_token) || $user_db["user_token"] === $password_token;

  // $users = [];

  // if (!$password) {
  // }

  return [
    "data" => [
      "users" => _get_users($pdo),
      "roles" => _get_roles($pdo),
      "courses" => _get_courses($pdo)
    ]
  ];

}


// PATCHER
function PATCH ($params, $pdo) {
  $user_id = $params["user_id"];

  $element = $params["element"];
  $kind = $params["kind"];
  $element_id = $params["element_id"];
  $updated_fields = $params["updated_fields"];
  $id_field_name = $kind."_id";

  $get_function = "_get_$kind";
  $existing_element = $get_function($element_id, $pdo);

  switch ($kind) {
    case "chapter": $kind_parent = "course"; break;
    case "section": $kind_parent = "chapter"; break;
    case "unit": $kind_parent = "section"; break;
    default: $kind_parent = "";
  }
  if ($kind_parent) $parent_id = $element[$kind_parent."_id"];

  // UPDATE FIELDS
  foreach ($updated_fields as $one_field) {
    $field = $one_field["field"];
    $new_value = $one_field["value"];
    $old_value = $existing_element[$field];
    $table = $kind."s";

    // REQUIRE SPECIAL TREATMENT: SPOT, CHAPTER_ID (moves section), AMANUENS
    if ($field === "spot") {

      $new_spot = $one_field["value"];
      $old_spot = $existing_element["spot"];
      update_spot($pdo, $parent_id, $new_spot, $old_spot, $kind, $kind_parent);

    } else if ($field === "chapter_id") {

      $chapter_id = $one_field["value"];
      $existing_sections_new_chapter = _get_chapter_sections($chapter_id, $pdo);
      $spot_in_new_chapter = count($existing_sections_new_chapter) + 1; // Always last
      $pdo -> query("UPDATE $table SET $field = $chapter_id WHERE $id_field_name = $element_id;");
      $pdo -> query("UPDATE $table SET spot = $spot_in_new_chapter WHERE $id_field_name = $element_id;");

      $parent_id = $chapter_id;

      $old_chapter_id = $element["chapter_id"];
      $sections_old_chapter = _get_chapter_sections($chapter_id, $pdo);
      $spot = 0;
      foreach ($sections_old_chapter as $section) {
        $spot++;
        $section_id = $element["section_id"];
        $pdo -> query("UPDATE $table SET spot = $spot WHERE section_id = $section_id;");
      }

    } else if ($field === "amanuens") {

      $user_id = $element_id;

      $pdo -> query("UPDATE $table SET $field = '$new_value' WHERE $id_field_name = $element_id;");

      // ADD AND REMOVE courses as amanuens
      $amanuens_courses = json_decode($new_value);

      // remove all previous amanuens
      $pdo -> query ("DELETE FROM users_courses WHERE user_id=$user_id AND role='amanuens'");

      // add incoming
      foreach ($amanuens_courses as $amanuens_course) {  
        $course_id = array_from_query($pdo, "SELECT * FROM courses WHERE alias='$amanuens_course'")[0]["course_id"];
        $pdo->query("INSERT INTO users_courses (user_id, course_id, role) VALUES ($user_id, $course_id, 'amanuens')");
      }

    }  else if ($field === "password"){
      $value = $one_field["value"];
      $element_id = $user_id;
      $pdo -> query("UPDATE $table SET $field = $value WHERE user_id = $user_id;");
    }else {

      $is_text = $one_field["is_text"];
      $value = $is_text ? "'" . $one_field["value"] . "'" : $one_field["value"];
      if ($one_field["value"] === false) $value = "false";
      if ($one_field["value"] === true) $value = "true";
      
      // echo " UPDATE $table SET $field = $value WHERE $id_field_name = $element_id; ";
      $pdo -> query("UPDATE $table SET $field = $value WHERE $id_field_name = $element_id;");
            
    }     

  }

  // PREPARE RETURN
  $elements = null;
  switch ($kind) {
    case "course":
      $user_id = $params["user_id"];
      $element = _get_course($element_id, $pdo, $user_id);
      break;
    case "user":
      $element = _get_user($element_id, $pdo);
      $element["courses"] = _get_user_courses($element_id, $pdo);
      break;
    default:
      $function_name_element = "_get_$kind";
      $function_name_elements = "_get_$kind_parent"."_$kind"."s";
      $element = $function_name_element($element_id, $pdo);
      $elements = $function_name_elements($parent_id, $pdo);
      // echo " ($function_name_element)($function_name_elements) ";      
  }

  return [
    "data" => [
      "element" => $element,
      "elements" => $elements,
    ],
    "header" => "Content-Type: application/json"
  ];

}
// SPOT UPDATER
function update_spot ($pdo, $parent_id, $new_spot, $old_spot, $kind, $kind_parent) {
    
  // Change in spot implies change for elements between old and new spot
  $low_spot = min($new_spot, $old_spot);
  $hi_spot = max($new_spot, $old_spot);
  $n_spots = $hi_spot - $low_spot;

  // Get elements
  $table_name = $kind."s";
  $parent_field_id = $kind_parent."_id";
  $elements = array_from_query($pdo, "
    SELECT *
    FROM $table_name
    WHERE $parent_field_id = $parent_id AND spot >= $low_spot AND spot <= $hi_spot ORDER BY spot;"
  );

  // Update spots
  if ($new_spot === $low_spot) {
    $elements[$n_spots]["spot"] = $low_spot;

    for ($i = 0; $i < $n_spots; $i++) {
      $elements[$i]["spot"] += 1;
    }
  } else {
    $elements[0]["spot"] = $hi_spot;

    for ($i = 1; $i <= $n_spots; $i++) {
      $elements[$i]["spot"] -= 1;
    }
  }

  // Update DB
  $field_id = $kind."_id";
  foreach ($elements as $element) {
    $spot = $element["spot"];
    $temp_id = $element[$kind . "_id"];
    $pdo -> query("UPDATE $table_name SET spot = $spot WHERE $field_id = $temp_id;");
  }

}


// CHAPTERS
function DELETE_chapter ($params, $pdo) {

  $chapter_id = $params["element"]["chapter_id"];
  $course_id = $params["element"]["course_id"];
  
  $pdo->exec('PRAGMA foreign_keys = ON');
  $pdo -> query("DELETE FROM chapters WHERE chapter_id = $chapter_id");

  // FIX SPOTS IN REST OF CHAPTERS
  $chapters = array_from_query($pdo, "SELECT * FROM chapters WHERE course_id = $course_id ORDER BY spot");
  $index = 0;
  foreach ($chapters as $chapter) {
    $index++;
    $_chapter_id = $chapter["chapter_id"];
    $pdo -> query("UPDATE chapters SET spot = $index WHERE chapter_id = $_chapter_id");
  }

  return [
    "data" => [
      "chapter_id" => $chapter_id,
      "course_id" => $course_id,
      "chapters" => _get_course_chapters($course_id, $pdo)
    ]
  ];

}
function POST_chapter ($params, $pdo) {

  $course_id = $params["course"]["course_id"];
  $existing_chapters = array_from_query($pdo, "SELECT * FROM chapters WHERE course_id = $course_id");
  $spot = count($existing_chapters) + 1;

  $name = $params["name"] ? $params["name"] : "Title";

  $sql = "INSERT INTO chapters (name, course_id, spot) VALUES ('$name', $course_id, $spot)";
  $pdo->query($sql);
  $chapter_id = $pdo->lastInsertId();

  return [
    "data" => [
      "chapter" => _get_chapter($chapter_id, $pdo),
      "chapters" => _get_course_chapters($course_id, $pdo)
    ]
  ];  
}
function PATCH_chapter ($params, $pdo) {
  return PATCH($params, $pdo);
}


// COURSES
function DELETE_course ($params, $pdo) {

  $course_id = $params["course"]["course_id"];
  
  $pdo->exec('PRAGMA foreign_keys = ON');
  $pdo -> query("DELETE FROM courses WHERE course_id = $course_id");

  return [
    "data" => [
      "course_id" => $course_id,
    ]
  ];

}
function PATCH_course ($params, $pdo) {
  return PATCH($params, $pdo);
}
function POST_course ($params, $pdo) {

  $name = $params["name"] ? $params["name"] : "Title";

  $sql = "INSERT INTO courses (name) VALUES ('$name')";
  $pdo->query($sql);
  $course_id = $pdo->lastInsertId();

  // GIVE ACCESS TO COURSE TO TEACHERS
  $teachers = array_from_query($pdo, "SELECT * FROM users WHERE user_programme='TCH'");
  foreach($teachers as $teacher) {
    $teacher_id = $teacher["user_id"];
    $pdo->query("INSERT INTO users_courses (user_id, course_id, role) VALUES ($teacher_id, $course_id, 'teacher')");
  }

  $user_id = $params["user_id"]; // User that creates the course
  $courses = [];
  if ($user_id !== null) {
    $courses = _get_user_courses($user_id, $pdo);
  }

  return [
    "data" => [
      "course" => _get_course($course_id, $pdo, $user_id),
      "courses" => $courses
    ]
  ];

}


// SECTIONS
function POST_section ($params, $pdo) {
  
  $chapter_id = $params["chapter"]["chapter_id"];
  $existing_sections = array_from_query($pdo, "SELECT * FROM sections WHERE chapter_id = $chapter_id");
  $spot = count($existing_sections) + 1;

  $name = $params["name"] ? $params["name"] : "Title";

  $sql = "INSERT INTO sections (name, chapter_id, spot) VALUES ('$name', $chapter_id, $spot)";
  $pdo->query($sql);
  $section_id = $pdo->lastInsertId();

  return [
    "data" => [
      "section" => _get_section($section_id, $pdo),
      "sections" => _get_chapter_sections($chapter_id, $pdo)
    ]
  ];

}
function DELETE_section ($params, $pdo) {

  $chapter_id = $params["element"]["chapter_id"];
  $section_id = $params["element"]["section_id"];
  
  $pdo->exec('PRAGMA foreign_keys = ON');
  $pdo -> query("DELETE FROM sections WHERE section_id = $section_id");

  // FIX SPOTS IN REST OF SECTIONS
  $sections = array_from_query($pdo, "SELECT * FROM sections WHERE chapter_id = $chapter_id ORDER BY spot");
  $index = 0;
  foreach ($sections as $section) {
    $index++;
    $_section_id = $section["section_id"];
    $pdo -> query("UPDATE sections SET spot = $index WHERE section_id = $_section_id");
  }

  return [
    "data" => [
      "chapter_id" => $chapter_id,
      "section_id" => $section_id,
      "sections" => _get_chapter_sections($chapter_id, $pdo)
    ]
  ];
  
}
function PATCH_section ($params, $pdo) {
  return PATCH($params, $pdo);
}


// UNITS
function POST_unit ($params, $pdo) {
  
  $section_id = $params["section"]["section_id"];
  $chapter_id = $params["section"]["chapter_id"];
  $course_id = $params["section"]["course_id"];
  $kind = $params["kind"];
  $story = $params["story"] ? $params["story"] : "";
  $video_link = $params["video_link"] ? $params["video_link"] : "";
  $folder_link = $params["folder_link"] ? $params["folder_link"] : "";
  
  $existing_units = array_from_query($pdo, "SELECT * FROM units WHERE section_id = $section_id");
  $spot = count($existing_units) + 1;
  
  // PREDEFINED STUFF
  $name = $params["name"];
  if (!$name) {
    switch ($kind) {
      case "video": $name = "Main"; break;
      case "exercise": $name = "Övning"; break;
      case "assignment": $name = "Uppgift"; break;
  }}

  
  $sql = "INSERT INTO units (name, section_id, kind, spot, story, video_link, folder_link) VALUES ('$name', $section_id, '$kind', $spot, '$story', '$video_link', '$folder_link')";
  $pdo->query($sql);
  $unit_id = $pdo->lastInsertId();


  // INIT AND RETURN DIFFERENT IF QUIZ
  $data = null;
  switch($kind) {
    case "video":
    case "exercise":
    case "assignment":

      // RETURN
      $data = [
        "element" => _get_unit($unit_id, $pdo),
      ];
  
      break;
    
    case "quiz":
      
      // CREATE ONE QUESTION AND ONE OPTION
      $sql = "INSERT INTO quiz_questions (unit_id, spot, question) VALUES ($unit_id, 1, '')";
      $pdo->query($sql);
      $quiz_question_id = $pdo->lastInsertId();

      $sql = "INSERT INTO quiz_options (quiz_question_id, option, correct) VALUES ($quiz_question_id, '', true)";
      $pdo->query($sql);
      $quiz_option_id = $pdo->lastInsertId();

      // RETURN
      $data = [
        "element" => _get_unit($unit_id, $pdo),
        "quiz_question" => _get_quiz_question($quiz_question_id, $pdo),
        "quiz_option" => _get_quiz_option($quiz_option_id, $pdo)
      ];
      break;
  }

  return  [
    "data" => $data
  ];

}
function DELETE_unit ($params, $pdo) {

  $unit_id = $params["element"]["unit_id"];
  $section_id = $params["element"]["section_id"];

  $original_unit = _get_unit($unit_id, $pdo);
  
  $pdo->exec('PRAGMA foreign_keys = ON');
  $pdo -> query("DELETE FROM units WHERE unit_id = $unit_id");

  // FIX SPOTS IN REST OF UNITS
  $units = _get_section_units($section_id, $pdo);
  $index = 0;
  foreach ($units as $unit) {
    $index++;
    $_unit_id = $unit["unit_id"];
    $pdo -> query("UPDATE units SET spot = $index WHERE unit_id = $_unit_id");
  }

  return [
    "data" => [
      "element" => $original_unit,
      "elements" => _get_section_units($section_id, $pdo)
    ]
  ];
  
}
function PATCH_unit ($params, $pdo) {
  return PATCH($params, $pdo);
}


// DEPENDENCIES
function POST_dependencies ($params, $pdo) {

  $kind = $params["kind"];
  $element_id = $params["element_id"];
  $course_id = $params["course_id"];
  $dependencies = $params["dependencies"];

  foreach($dependencies as $post_id) {

    $section_id = $kind === "section" ? $element_id : $post_id;
    $unit_id = $kind === "unit" ? $element_id : $post_id;

    $pdo->query("INSERT INTO dependencies(section_id, unit_id) VALUES($section_id, $unit_id);");

  }

  return [
    "data" => [
      "dependencies" => _get_course_dependencies($course_id, $pdo),
    ]
  ];

}
function DELETE_dependencies ($params, $pdo) {

  $kind = $params["kind"];
  $element_id = $params["element_id"];
  $course_id = $params["course_id"];
  $dependencies = $params["dependencies"];

  foreach($dependencies as $post_id) {

    $section_id = $kind === "section" ? $element_id : $post_id;
    $unit_id = $kind === "unit" ? $element_id : $post_id;

    $pdo->query("DELETE FROM dependencies WHERE section_id = $section_id AND unit_id = $unit_id;");

  }

  return [
    "data" => [
      "dependencies" => _get_course_dependencies($course_id, $pdo),
    ]
  ];

}


// USERS
function PATCH_user ($params, $pdo) {
  return PATCH($params, $pdo);
}

function PATCH_user_password ($params, $pdo) {
  $user_id = $params["user_id"];
  $password = $params["oldPassword"];
  $field_name = $params["field_name"];
  $value = $params["newUsername"];
  $user = _get_user($user_id, $pdo);

  if($user["user_password"] !== $password){
    return [
      "data" => 
      ["message" => "Wrong Password"]];
  }

  // if(_get_user($user_id, $pdo)){
    $sql = "UPDATE users SET $field_name = $value WHERE user_id = $user_id";
    $pdo -> query($sql);

    return [
      "data" => [
      "user" => _get_user($user_id, $pdo)
      ]
    ];
  // }


  // return PATCH($params, $pdo);
}

function POST_user ($params, $pdo) {

  $name = $params["name"];
  $user_password = $params["user_password"];
  $user_start_year = $params["user_start_year"];
  $user_programme = $params["user_programme"];
  $amanuens = $params["amanuens"];
  $programme_alias = $user_programme."_".$user_start_year;

  $pdo->query("INSERT INTO users(name, user_password, user_start_year, user_programme, amanuens) VALUES('$name', '$user_password', '$user_start_year', '$user_programme', '$amanuens')");
  $user_id = $pdo->lastInsertId();

  // ADD relevant courses
  $courses = $pdo->query("SELECT * FROM courses");
  foreach ( $courses as $course ) {

    // ADD courses as student
    $programmes = json_decode($course["programmes"]);
    if (in_array( $programme_alias, $programmes )) {
      $course_id = $course["course_id"];
      $pdo->query("INSERT INTO users_courses (user_id, course_id, role) VALUES ($user_id, $course_id, 'student')");
    }

    // ADD courses as amanuens
    $amanuens_courses = json_decode($amanuens);
    if ($amanuens_courses && in_array($course["alias"], $amanuens_courses)) {
      $course_id = $course["course_id"];
      $pdo->query("INSERT INTO users_courses (user_id, course_id, role) VALUES ($user_id, $course_id, 'amanuens')");
    }

  }

  return [
    "data" => [
      "user" => _get_user($user_id, $pdo)
    ]
  ];  
}
function DELETE_user ($params, $pdo) {
  
  $user_id = $params["user_id"];

  $pdo->exec('PRAGMA foreign_keys = ON');
  $pdo -> query("DELETE FROM users WHERE user_id = $user_id;");

  return [
    "data" => [
      "deleted_user_id" => $user_id,
    ]
  ];
}


// USERS_UNITS
function PATCH_users_units ($params, $pdo) {

  $user_id = $params["user_id"];
  $unit_id = $params["unit_id"];
  $field_name = $params["field_name"];
  $value = $params["value"];
  if ($field_name !== "notes") {
    $value = $params["value"] ? "true" : "false";
  } else {
    $value = "'$value'";
  }
  
  // USERS_UNIT Exists?
  if (_get_users_unit($user_id, $unit_id, $pdo)) {
    
    $sql = "UPDATE users_units SET $field_name = $value WHERE user_id = $user_id AND unit_id = $unit_id";
    $pdo -> query($sql);

    return [
      "data" => [
        "users_unit" => _get_users_unit($user_id, $unit_id, $pdo)
      ]
    ];
  
  } else {

    $sql = "INSERT INTO users_units (unit_id, user_id) VALUES ($unit_id, $user_id)";
    $pdo -> query($sql);
    return PATCH_users_units ($params, $pdo);

  }
  
}


// QUIZ ANSWER
function POST_quiz_answer ($params, $pdo) {

  $quiz_option_id = $params["option"]["quiz_option_id"];
  $quiz_question_id = $params["option"]["quiz_question_id"];
  $user_id = $params["user_id"];

  $sql = "INSERT INTO quiz_answers (quiz_option_id, user_id) VALUES ($quiz_option_id, $user_id)";
  $pdo->query($sql);
  $last_id = $pdo->lastInsertId();

  $answer = array_from_query($pdo, "
    SELECT quiz_answers.*, quiz_option_id, quiz_question_id, unit_id, chapter_id
    FROM quiz_answers
    JOIN quiz_options USING (quiz_option_id)
    JOIN quiz_questions USING (quiz_question_id)
    JOIN units USING (unit_id)
    JOIN sections USING (section_id)
    WHERE quiz_answer_id = $last_id
  ;")[0];

  // IF QUIZ COMPLETED UPDATE CHECK_COMPLETE
  $unit_id = $answer["unit_id"];
  if (is_quiz_completed($pdo, $unit_id)) {

    $_temp = array_from_query($pdo, "SELECT * FROM users_units WHERE unit_id = $unit_id AND user_id = $user_id;");
    if (count($_temp) > 0) {
      $pdo -> query("UPDATE users_units SET check_complete = true WHERE unit_id = $unit_id AND user_id = $user_id;");
    } else {
      $pdo -> query("INSERT INTO users_units (unit_id, user_id, check_complete) VALUES ($unit_id, $user_id, true)");
    }

  }


  return [
    "data" => [
      "answer" => $answer,
      "unit" => _get_unit($unit_id, $pdo),
      "users_unit" => _get_users_unit($user_id, $unit_id, $pdo)
    ]
  ];  
}

// QUIZ_OPTIONS
function DELETE_quiz_option ($params, $pdo) {
  
  $quiz_option_id = $params["option"]["quiz_option_id"];
  $quiz_question_id = $params["option"]["quiz_question_id"];

  $pdo -> query("DELETE FROM quiz_options WHERE quiz_option_id = $quiz_option_id;");

  return [
    "data" => [
      "deleted_quiz_option_id" => $quiz_option_id,
      "quiz_question_id" => $quiz_question_id,
    ]
  ];
}
function POST_quiz_option ($params, $pdo) {

  $quiz_question_id = $params["question"]["quiz_question_id"];
  
  $pdo->query("INSERT INTO quiz_options(quiz_question_id) VALUES($quiz_question_id)");
  $quiz_option_id = $pdo->lastInsertId();

  return [
    "data" => [
      "option" => _get_quiz_option($quiz_option_id, $pdo),
    ]
  ];  

}
function PATCH_quiz_option ($params, $pdo) {

  $quiz_option_id = $params["option"]["quiz_option_id"];
  $quiz_question_id = $params["option"]["quiz_question_id"];

  // ONLY ONE OPTION CAN BE CORRECT
  if ($params["option"]["correct"]) {
    $pdo -> query ("UPDATE quiz_options SET correct = false WHERE quiz_question_id = $quiz_question_id");
  }

  // UPDATE FIELDS
  $fields = ["option", "correct"];
  foreach ($fields as $field) {
    $value = $params["option"][$field];
    $value = "'$value'";
    if ($field === "correct") {
      $value = $params["option"][$field] ? "true" : "false";
    }
    $pdo -> query ("UPDATE quiz_options SET $field = $value WHERE quiz_option_id = $quiz_option_id;");
  }


  return [
    "data" => [
      "options" => _get_question_options($quiz_question_id, $pdo)
    ]
  ];



}

// QUIZ_QUESTIONS
function PATCH_quiz_question ($params, $pdo) {

  $quiz_question_id = $params["question"]["quiz_question_id"];
  $unit_id = $params["question"]["unit_id"];

  $question_in_db = _get_quiz_question($quiz_question_id, $pdo);

  // SPOT CHANGE REQUIRES SPECIAL HANDLING
  if ($params["question"]["spot"] !== $question_in_db["spot"]) {

    $_params = [
      "parent_id" => $unit_id,
      "new_spot" => $params["question"]["spot"],
      "old_spot" => $question_in_db["spot"]
    ];

    $kind = "quiz_question";
    $kind_parent = "unit";

    update_spot ($pdo, $unit_id, $_params["new_spot"], $_params["old_spot"], $kind, $kind_parent);
  }

  // UPDATE FIELDS
  $fields = ["question"];
  foreach ($fields as $field) {
    $value = $params["question"][$field];
    $pdo -> query ("UPDATE quiz_questions SET $field = '$value' WHERE quiz_question_id = $quiz_question_id");
  }

  return [
    "data" => [
      "questions" => _get_quiz_questions($unit_id, $pdo)
    ]
  ];

}
function POST_quiz_question ($params, $pdo) {

  $unit_id = $params["unit"]["unit_id"];

  $n_questions = count(_get_quiz_questions($unit_id, $pdo));
  $spot = $n_questions + 1;
  
  $pdo->query("INSERT INTO quiz_questions(unit_id, spot) VALUES($unit_id, $spot)");
  $quiz_question_id = $pdo->lastInsertId();

  return [
    "data" => [
      "quiz_question" => _get_quiz_question($quiz_question_id, $pdo),
    ]
  ];  

}




function _get_chapter ($chapter_id, $pdo) {
  return array_from_query($pdo, "SELECT * FROM chapters WHERE chapter_id = $chapter_id ORDER BY spot;")[0];
}
function _get_chapter_sections ($chapter_id, $pdo) {
  return array_from_query($pdo, "
    SELECT sections.*, course_id
    FROM sections
    JOIN chapters USING (chapter_id)
    JOIN courses USING (course_id)
    WHERE chapter_id = $chapter_id
    ORDER BY spot;
  ");
}
function _get_chapter_units ($chapter_id, $pdo) {
  return array_from_query($pdo, "
    SELECT units.*, chapter_id, course_id 
    FROM units
    JOIN sections USING (section_id)
    JOIN chapters USING (chapter_id)
    JOIN courses USING (course_id)
    WHERE chapter_id = $chapter_id
    ORDER BY spot;
  ");  
}


function _get_course ($course_id, $pdo, $user_id = -1) {

  $user_id = $user_id ? $user_id : -1;
  $join_sql = $user_id === -1 ? "" : "JOIN users_courses USING (course_id)";
  $user_where_sql = $user_id === -1 ? "" : " AND user_id = $user_id";

  return array_from_query($pdo, "
    SELECT *
    FROM courses
    $join_sql
    WHERE course_id = $course_id $user_where_sql;
  ")[0];

}
function _get_courses ($pdo) {
  return array_from_query($pdo, "SELECT * FROM courses;");
}
function _get_course_dependencies ($course_id, $pdo) {

  return array_from_query($pdo, "
    SELECT * FROM dependencies
    JOIN sections USING (section_id)
    JOIN chapters USING (chapter_id)
    WHERE course_id = $course_id
  ;");

}
function _get_course_users ($course_id, $pdo) {
  return array_from_query($pdo, "SELECT * FROM users_courses WHERE course_id = $course_id");
}
function _get_course_chapters ($course_id, $pdo) {
  return array_from_query($pdo, "SELECT * FROM chapters WHERE course_id = $course_id ORDER BY spot;");
}
function _get_course_sections ($course_id, $pdo) {
  return array_from_query($pdo, "
    SELECT sections.*, course_id
    FROM sections
    JOIN chapters USING (chapter_id)
    JOIN courses USING (course_id)
    WHERE course_id = $course_id
    ORDER BY
        chapters.spot,
        sections.spot
  ;");
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


function _get_roles ($pdo) {
  $array_of_objs = array_from_query($pdo, "SELECT * FROM course_roles;");
  $roles = [];
  foreach( $array_of_objs as $obj ) {
    $roles[] = $obj["role"];
  }
  return $roles;
}


function _get_user ($user_id, $pdo) {
  $user = array_from_query($pdo, "SELECT * FROM users WHERE user_id = $user_id")[0];
  $user["kind"] = "user";
  $user["name"] = $user["name"];
  $user["courses"] = _get_user_courses($user_id, $pdo);

  return $user;
}
function _get_users ($pdo) {
  $users = array_from_query($pdo, "
    SELECT user_id, name, user_programme, user_start_year    
    FROM users
  ;");

  foreach( $users as &$user) {
    $user = _get_user($user["user_id"], $pdo);
  }

  return $users;
}
function _get_user_courses ($user_id, $pdo) {
  return array_from_query($pdo, "
    SELECT *
    FROM courses c
    JOIN users_courses u_c
    USING (course_id)
    WHERE u_c.user_id = $user_id;"
  );
}


function _get_users_unit ($user_id, $unit_id, $pdo) {
  $users_units = array_from_query($pdo, "
    SELECT users_units.*, sections.section_id, sections.spot as section_spot, units.spot as unit_spot, chapters.chapter_id
    FROM users_units
    JOIN units USING (unit_id)
    JOIN sections USING (section_id)
    JOIN chapters USING (chapter_id)
    WHERE user_id = $user_id AND unit_id = $unit_id
    ORDER BY
        sections.spot,
        units.spot
    ;
  ");

  return count($users_units) > 0 ? $users_units[0] : null;
}
function _get_users_units ($user_id, $course_id, $pdo) {
  return array_from_query($pdo, "
    SELECT users_units.*, sections.section_id, sections.spot as section_spot, units.spot as unit_spot, chapters.chapter_id
    FROM users_units
    JOIN units USING (unit_id)
    JOIN sections USING (section_id)
    JOIN chapters USING (chapter_id)
    WHERE user_id = $user_id AND course_id = $course_id
    ORDER BY
        sections.spot,
        units.spot
    ;
  ");
}


function _get_section ($section_id, $pdo) {
  return array_from_query($pdo, "
    SELECT sections.*, course_id
    FROM sections
    JOIN chapters USING (chapter_id)
    JOIN courses USING (course_id)
    WHERE section_id = $section_id
  ")[0];
}
function _get_section_units ($section_id, $pdo) {
  return array_from_query($pdo, "
    SELECT units.*, chapter_id, course_id
    FROM units
    JOIN sections USING (section_id)
    JOIN chapters USING (chapter_id)
    JOIN courses USING (course_id)
    WHERE section_id = $section_id
    ORDER BY spot;
  ");  
}


function _get_unit ($unit_id, $pdo) {
  return array_from_query($pdo, "
    SELECT units.*, chapters.chapter_id
    FROM units
    JOIN sections USING (section_id)
    JOIN chapters USING (chapter_id)
    JOIN courses USING (course_id)
    WHERE unit_id = $unit_id
  ;")[0];
}



// QUIZ
function is_quiz_completed ($pdo, $unit_id) {

  $questions = array_from_query($pdo, "
    SELECT *
    FROM quiz_questions
    WHERE unit_id = $unit_id
  ");

  $completed = true;

  foreach ($questions as $question) {
    $quiz_question_id = $question["quiz_question_id"];
    $question_answers = array_from_query($pdo, "
      SELECT *
      FROM quiz_answers
      JOIN quiz_options USING (quiz_option_id)
      WHERE quiz_question_id = $quiz_question_id
    ");
    $correctly_answered = false;
    foreach ($question_answers as $question_answer) {
      if ($question_answer["correct"] == "1") {
        $correctly_answered = true;
        break;
      }
    }
    if (!$correctly_answered) {
      $completed = false;
      break;
    }
  }

  return $completed;
}

function _get_chapter_answers ($user_id, $chapter_id, $pdo) {
  return array_from_query($pdo, "
    SELECT quiz_answers.*, quiz_option_id, quiz_question_id, unit_id, chapter_id
    FROM quiz_answers
    JOIN quiz_options USING (quiz_option_id)
    JOIN quiz_questions USING (quiz_question_id)
    JOIN units USING (unit_id)
    JOIN sections USING (section_id)
    WHERE chapter_id = $chapter_id AND user_id = $user_id
  ;");
}
function _get_chapter_options ($chapter_id, $pdo) {
  return array_from_query($pdo, "
    SELECT quiz_options.*, unit_id, chapter_id
    FROM quiz_options
    JOIN quiz_questions USING (quiz_question_id)
    JOIN units USING (unit_id)
    JOIN sections USING (section_id)
    WHERE chapter_id = $chapter_id
  ;");
}
function _get_chapter_questions ($chapter_id, $pdo) {
  return array_from_query($pdo, "
    SELECT quiz_questions.*, section_id, chapter_id
    FROM quiz_questions
    JOIN units USING (unit_id)
    JOIN sections USING (section_id)
    WHERE chapter_id = $chapter_id
  ;");
}

function _get_course_quiz_answers ($user_id, $course_id, $pdo) {
  return array_from_query($pdo, "
    SELECT quiz_answers.*, quiz_option_id, quiz_question_id, unit_id, section_id, chapter_id
    FROM quiz_answers
    JOIN quiz_options USING (quiz_option_id)
    JOIN quiz_questions USING (quiz_question_id)
    JOIN units USING (unit_id)
    JOIN sections USING (section_id)
    JOIN chapters USING (chapter_id)
    WHERE course_id = $course_id AND user_id = $user_id
  ;");
}
function _get_course_quiz_questions ($course_id, $pdo) {
  return array_from_query($pdo, "
    SELECT quiz_questions.*, section_id, chapter_id
    FROM quiz_questions
    JOIN units USING (unit_id)
    JOIN sections USING (section_id)
    JOIN chapters USING (chapter_id)
    WHERE course_id = $course_id
  ;");
}
function _get_course_quiz_options ($course_id, $pdo) {
  return array_from_query($pdo, "
    SELECT quiz_options.*, unit_id, section_id, chapter_id
    FROM quiz_options
    JOIN quiz_questions USING (quiz_question_id)
    JOIN units USING (unit_id)
    JOIN sections USING (section_id)
    JOIN chapters USING (chapter_id)
    WHERE course_id = $course_id
  ;");

}

function _get_quiz_question ($quiz_question_id, $pdo) {
  return array_from_query($pdo, "
    SELECT quiz_questions.*, section_id, chapter_id
    FROM quiz_questions
    JOIN units USING (unit_id)
    JOIN sections USING (section_id)
    WHERE quiz_question_id = $quiz_question_id
  ;")[0];
}
function _get_quiz_option ($quiz_option_id, $pdo) {
  return array_from_query($pdo, "
    SELECT quiz_options.*, unit_id, chapter_id
    FROM quiz_options
    JOIN quiz_questions USING (quiz_question_id)
    JOIN units USING (unit_id)
    JOIN sections USING (section_id)
    WHERE quiz_option_id = $quiz_option_id
  ;")[0];
}
function _get_quiz_questions ($unit_id, $pdo) {
  return array_from_query($pdo, "
    SELECT quiz_questions.*, section_id, chapter_id
    FROM quiz_questions
    JOIN units USING (unit_id)
    JOIN sections USING (section_id)
    WHERE unit_id = $unit_id
  ;");
}

function _get_question_options ($quiz_question_id, $pdo) {
  return array_from_query($pdo, "
    SELECT quiz_options.*, unit_id, chapter_id
    FROM quiz_options
    JOIN quiz_questions USING (quiz_question_id)
    JOIN units USING (unit_id)
    JOIN sections USING (section_id)
    WHERE quiz_question_id = $quiz_question_id
  ;");
}





// ---------------
// HELPERS
function array_from_query($pdo, $sql) {
  $array = [];
  // if (function_exists("_echo")) _echo($sql); 
  $stmt = $pdo -> query($sql);
  while ($element = $stmt->fetch(\PDO::FETCH_ASSOC)) {
    $array[] = $element;
  }
  return $array;
}



// CASCADE DELETE
// function cascade_delete ($pdo, $entity, $id) {

//   $entities = ["course", "chapter", "section", "unit", "quiz_question", "quiz_option", "quiz_answer"];
//   $index = array_search($entity, $entities);

//   if ($index !== false) {

//     $next_entity = $index >= count($entities) - 1 ? false : $entities[$index + 1];
//     $table = $entity."s";
//     $key_id = $entity."_id";
//     $pdo -> query("DELETE FROM $table WHERE $key_id = $id");

//     if ($next_entity !== false) {
//       $table_next = $next_entity."s";
//       $key_id_next = $next_entity."_id";
//       $all_next_entities = array_from_query($pdo, "SELECT $key_id_next FROM $table_next WHERE $key_id = $id");
//       foreach($all_next_entities as $_next_entity) {
//         $_id = $_next_entity[$key_id_next];
//         cascade_delete($pdo, $next_entity, $_id);
//       }
//     }
  
//   }


//   if ($entity === "unit") {
//     cascade_delete_dependencies($pdo, "unit", $id);
//     cascade_delete_users_units($pdo, "unit", $id);
//   }

//   if ($entity === "user") {
//     cascade_delete_users_units($pdo, "user", $id);
//   }

//   if ($entity === "section") {
//     cascade_delete_dependencies($pdo, "section", $id);
//   }

// }
// function cascade_delete_dependencies ($pdo, $kind, $id) {
//   $key_id = $kind."_id";
//   $pdo -> query("DELETE FROM dependencies WHERE $key_id = $id");
// }
// function cascade_delete_users_units ($pdo, $kind, $id) {
//   $key_id = $kind."_id";
//   $pdo -> query("DELETE FROM users_units WHERE $key_id = $id");
// }


?>
<?php

// Don't forget to start the local server :-)

$n_chars_token = 17;
define('PATH_TO_SQLITE_FILE', './phpsqlite.db');
require_once("./actions.php");

$response_function = function ($response) {
    // $header = $response["header"] ? $response["header"] : "Content-Type: text/json";
    // header($header);
    $code = $response["code"] ? $response["code"] : 200;
    http_response_code($code);
    $payload = [
        "data" => $response["data"],
        "message" => $response["message"] ? $response["message"] : "All OK"
    ];
    echo json_encode(["payload" => $payload]);
    exit();
};


$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {

    $action = $_GET["action"];
    $method_action = "GET_" . $action;
    

    $credentials = $_GET["credentials"];
    $params = $_GET;
    
} elseif ($method === "POST" || $method === "DELETE" || $method === "PATCH") {
    
    $body = json_decode(file_get_contents("php://input"), true);

    if (!$body) {
    
        $response_function([
            "code" => 400,
            "message" => "Unreadable JSON body"
        ]);

    } else {

        $action = $body["action"];
        $method_action = $method . "_" . $action;

        $params = $body["params"];
        $credentials = $params["credentials"];
        
    }

} else {
    $method_action = false;
}



$pdo = new \PDO("sqlite:" . PATH_TO_SQLITE_FILE, '', '', array(
  \PDO::ATTR_EMULATE_PREPARES => false,
  \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
  \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC
));

$pdo->exec('PRAGMA foreign_keys = ON');



// A BIT OF SECURITY...
function credentials_decode ($string) {
    $_string = "";
    for ($i = 0; $i < strlen($string); $i++) {
        $_string .= chr(ord($string[$i]) - 1);
    }
    return $_string;
}
if ($method_action !== "GET_login") {
    
    $user_token = credentials_decode(substr($credentials, 0, $n_chars_token));
    $user_id = intval(credentials_decode(substr($credentials, $n_chars_token)));

    $user = _get_user($user_id, $pdo);

    $is_teacher = $user["user_programme"] === "TCH";

    if ($user["user_token"] !== $user_token) {
        $response_function([
            "code" => 400,
            "message" => "Bad user"
        ]);    
    }

    if (!$is_teacher) {
        
        // 1) NON-TEACHERS CANNOT DELETE
        if ($method === "DELETE") {
            $response_function([
                "code" => 400,
                "message" => "delete not allowed"
            ]);    
        }

        // 2) NON-TEACHERS CAN ONLY POST AND PATCH users_units and quiz_answers.
        if ( ($method === "POST" || $method === "PATCH") && ($action !== "users_units" && $action !== "quiz_answer" && $action !== "user_password") ) {
            $response_function([
                "code" => 400,
                "message" => "action not allowed"
            ]);    
        }

        // 3) ONLY UPDATE YOUR OWN users_units and quiz_answers
        if ($action === "users_units" && $action === "quiz_answer" &&  $action === "user_password") {
            $update_user_id = $params["user_id"];
            if ($user_id !== $update_user_id ) {
                $response_function([
                    "code" => 400,
                    "message" => "update not allowed"
                ]);    
            }
        }

        // NON-TEACHERS CANNOT GET USERS
        if ($method_action === "GET_users") {
            $response_function([
                "code" => 400,
                "message" => "get not allowed"
            ]);
        }
    
    }

}

// BACKUPS WHOLE DB
if ($method !== "GET") {

    $pdo -> query ("
                    CREATE TABLE IF NOT EXISTS counters (
                        counter_create_post      INT,
                        counter_progress_post    INT
                    );
    ");

    $counters = array_from_query($pdo, "SELECT * FROM counters")[0];

    // FIRST TIME?
    if ($counters === null) {
    
        $pdo -> query ("INSERT INTO counters (counter_create_post, counter_progress_post) VALUES (0, 0);");
    
    } else {

        $kind_of_post = ( strpos($method_action, "users_unit") !== false || strpos($method_action, "quiz_answer") !== false ) ? "progress" : "create";
        $counter = intval($counters["counter_$kind_of_post"."_post"]) + 1;

        $max_counters = [
            "create" => 5,
            "progress" => 40,
        ];

        if ($counter > $max_counters[$kind_of_post]) {

            copy (PATH_TO_SQLITE_FILE, "./backups/db_".time().".db");
            $pdo -> query ("DELETE FROM counters");
            $pdo -> query ("INSERT INTO counters (counter_create_post, counter_progress_post) VALUES (0, 0);");

        } else {
            $field = "counter_$kind_of_post"."_post";
            $pdo -> query ("UPDATE counters SET $field = $counter");
        }
    }

}


// EXECUTE ACTION
if ($method_action) {
    $response_function($method_action($params, $pdo));    
} else {
    $response_function([
        "code" => 400,
        "message" => "No Action, ($method_action)"
    ]);
}



?>
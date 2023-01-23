<?php

  define('SQLITE_FILE', '../phpsqlite.db');

  function get_pdo () {
    return new \PDO("sqlite:" . SQLITE_FILE, '', '', array(
      \PDO::ATTR_EMULATE_PREPARES => false,
      \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
      \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC
    ));
  }
  function array_from_query($pdo, $sql) {
    $array = [];
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
    <!-- <link rel="shortcut icon" type="image/png" href="./favicon.png"/> -->
    <meta charset="UTF-8">
    <title>KrApp Cards</title>
    <link rel="stylesheet" href="../../css/general.css">

    <style>
      
      body {
        width: 20cm;
      }

      #wrapper {
        display: grid; grid-template-columns: repeat(4, 1fr);
        border-right: .5px solid grey;
        border-top: .5px solid grey;
      }

      .card { 
        display: flex; flex-direction: column; gap: 2mm;
        align-items: center; justify-content: center;
        padding: 9mm 7mm;

        border-left: .5px solid grey;
        border-bottom: .5px solid grey;
        
        font: 5mm "BLWC_light";
        text-align: center;
      }

    </style>
    
</head>

<body>
    
    <div id="wrapper">

      <?php

        $programme = $_GET["programme"];
        $year = $_GET["year"];
        $pdo = get_pdo();

        $students = array_from_query($pdo, "SELECT * FROM users WHERE user_programme='$programme' AND user_start_year=$year");   
        foreach ($students as $student) {
          $name = $student["name"];
          $password = $student["user_password"];
          echo "
            <div class='card'>
              <div>username:<br><b>$name</b></div>
              <div>password: $password</div>
            </div>
          ";
        }

      ?>

    </div>

</body>
</html>



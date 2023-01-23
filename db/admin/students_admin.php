<?php


function get_presuf_fix ($presuf) {

  $colors_blue_green = ["Navy", "Blue", "Teal", "Turquoise", "Green", "Aqua", "Cyan", "Lime", "Indigo", "Chartreuse", "Olive"];
  $colors_yellow_red = ["Yellow", "Red", "Orange", "Sienna", "Brown", "Firebrick", "Peru", "Chocolate", "Tan", "Crimson", "Coral", "Pink"];

  
  
  $prefixes = ["Sea", "Bay", "Pink", "Lime", "Cyan", "Aqua", "Ice", "Sky", "Bed", "Bag", "Biz", "Fly", "Hop", "Air", "Day", "Dig", "Gig", "Dog", "Gas", "Jam", "Jet", "Joy", "Key", "Mad", "Mix", "Oak", "Love", "One", "Pop", "Pro", "Set", "Tax", "Tip", "Top", "Van", "Wow", "Way", "Wit", "Zoo", "Wig", "Data", "Ever", "Free", "Gold", "Grey", "High", "Iron", "Next", "Best", "West", "East", "Brown", "Black", "Blue", "Fix"];
  // $prefixes = ["Sea", "Ape", "Bay", "Ice", "Sky", "Arm", "Bed", "Bag", "Biz", "Bat", "Air", "Fox", "Bug", "Bus", "Day", "Dig", "Gig", "Elf", "Dog", "Fly", "Gas", "Hop", "Jam", "Jet", "Joy", "Key", "Law", "Leg", "Mad", "Map", "Mix", "Oak", "One", "Pop", "Pro", "Pub", "Ray", "Set", "Sir", "Tax", "Tip", "Top", "Van", "Way", "Wit", "Wow", "Zoo", "Wig"];

  $suffixes = ["Yo", "Boy", "Girl", "Blue", "No", "Not", "Go", "Pink", "Boom", "Ape", "Peak", "Ball", "Book", "Boss", "Bat", "Bug", "Bus", "Fox", "Elf", "Chip", "Bear", "Bean", "Leg", "Map", "Law", "Bank", "Pub", "Ray", "Sir", "Lady", "Sand", "Lake", "Rock", "Cave", "Body", "Fjord", "Frost", "Lava", "Bird", "Tree", "Busy", "City", "Club", "Crew", "Deal", "Disc", "Door", "Duke", "Fair", "Film", "Four", "Five", "Game", "Gate", "Gulf", "Wolf", "Heat", "Jump", "King", "Lady", "Line", "Life", "Lord", "Mile", "Mind", "Miss", "Moon", "Name", "Plan", "Rain", "Ring", "Roof", "Self", "Sign", "Song", "Spot", "Tape", "Step", "Stop", "Tech", "Tony", "Wing", "Year", "Word"];
  

  // $prefix_MPP_21 = ["Norwegian", "Spanish", "French", "Icelandic", "Italian", "Belgian", "Dutch", "German", "Swiss", "Austrian", "Greek", "Polish"];
  // $suffix_MPP_21 = ["Eagle", "Hawk", "Falcon", "Pelican", "Seagull", "Condor", "Flamingo", "Nightingale", "Dove", "Crow", "Parrot", "Peacock"];

  // $prefix_PMA_21 = ["Norwegian", "Spanish", "French", "Icelandic", "Italian", "Belgian", "Dutch", "German", "Swiss", "Austrian", "Greek", "Polish"];
  // $suffix_PMA_21 = ["Yellow", "Red", "Purple", "Pink", "Orange", "Green", "Brown", "Coral", "Indigo", "Violet", "Crimson", "Grey"];

  return ${$presuf};

  // return ${$presuf."_".$programme};
}

function random_element ($array) {
  return $array[ rand(0, count($array) - 1) ];
}

function show_users_courses ($pdo) {
  _var_dump(array_from_query($pdo, "SELECT * FROM users_courses"));
}

function remove_previous_students ($pdo) {
  $pdo -> query("DELETE FROM users WHERE user_programme != 'TCH';");
}

function make_students ($pdo, $programme, $n_users) {
  
  $users = [];
    
  $safe = 0;
  $n_created_names = 0;
  $existing_names = array_from_query($pdo, "SELECT name FROM users");
  $prefixes = get_presuf_fix("prefixes");
  $suffixes = get_presuf_fix("suffixes");

  while ($n_created_names < $n_users && $safe < 1000) {
  
    $safe++;

    $prefix = random_element($prefixes);
    $suffix = random_element($suffixes);

    $proposal = $prefix."_".$suffix;
    if ( strlen($proposal) <= 8 && !in_array($proposal, $existing_names)) {

      $n_created_names++;
      $existing_names[] = $proposal;
      
      // https://www.php.net/manual/en/function.rand.php
      for ($s = '', $i = 0, $z = strlen($a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')-1; $i != 3; $x = rand(0,$z), $s .= $a{$x}, $i++); 

      $users[] = [
        "name" => strtolower($proposal),
        "user_password" => $s,
        "user_programme" => substr($programme, 0 , 3),
        "user_start_year" => intval( substr($programme, 4)),
      ];
    }

  }

  _var_dump($users);

  return $users;
  
}

// ADD NEW
// foreach($users as $user) {
//   POST_user($user, $pdo);
// }





?>
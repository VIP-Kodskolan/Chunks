<?php

// Test
// COMPONENT INITIALIZER
(function () {

    $folders_to_init = [
        [
            "path" => "./js/components/",
        ],
    ];

    $js_code_init = "";

    foreach ($folders_to_init as $folder) {
        create_initializer($folder, $js_code_init);
    }
})();
function create_initializer($folder, $js_code)
{

    $ignore_files = [
        ".DS_Store",
    ];

    $path  = $folder["path"];
    $files = array_diff(scandir($path), array('.', '..'));

    if ($js_code === "") {
        $js_code = "// Created automatically at startup by index.php\n\n";
    }

    foreach ($files as $file) {

        if (in_array($file, $ignore_files)) continue;
        if (is_dir($path . $file)) continue;


        $info = pathinfo($file);
        $file_name = $info['filename'];
        $js_code .= "import $file_name from '$path" . "$file';\n";
    }

    file_put_contents("./initializer.js", $js_code);
}

// IMPORT CSS FILES
function links_to_css_files()
{

    $path  = "./css/";
    $files = array_diff(scandir($path), array('.', '..'));
    $ignore_files = [
        ".DS_Store",
    ];

    $links = "";

    foreach ($files as $file) {

        if (in_array($file, $ignore_files)) continue;
        // $info = pathinfo($file);
        // $file_name = $info['filename'];
        $links .= "<link rel='stylesheet' href='./css/$file'>";
        // echo "<link rel='stylesheet' href='./css/$file'>";
    }

    return $links;
}

?>

<!DOCTYPE html>
<html lang="en">

<head>
    <link rel="shortcut icon" type="image/png" href="./favicon.ico" />
    <meta charset="UTF-8">
    <title>Chunks</title>

    <?php echo links_to_css_files(); ?>
</head>

<body id="body">
    <!-- body ID for specificity -->

    <div id="wrapper">

        <div id="content">
            <div id="content_header">
                <div id="content_course_list_and_users_admin_button">
                    <div id="content_course_list"></div>
                    <div id="users_admin"></div>
                </div>
                <div id="content_user"></div>
                <div class="filter-container">
                <button class="filterUnfinishedButton">Filter Unfinished</button>
                   <button class="filterDoneButton">Filter done</button>
                   <button class="filterQuestionButton">Filter question</button>
                    </label>
                </div>
                <div class="theme-switch-container">
                    <label class="theme-slider" for="checkbox">
                        <input type="checkbox" id="checkbox" />
                        <div class="round slider"></div>
                    </label>
                </div>
                <div id="passwordButton">
                    <div id="passwordWindow">
                        <label for="fname">First name:</label>
                        <input type="text" id="fname" name="fname"><br><br>
                        <label for="lname">Last name:</label>
                        <input id="hej" type="text" id="lname" name="lname"><br><br>
                        <input id="submitButton" type="submit" value="Submit">
                    </div>
                </div>
            </div>
            <div id="content_main">
                <div id="content_course">
                    <div id="content_course_open"></div>
                    <div id="content_chapter_list"></div>
                </div>
                <div id="content_users_admin" class="hidden">
                    <div id="content_users_control"></div>
                    <div id="content_users_list"></div>
                </div>
            </div>
            <div id="content_footer"></div>
        </div>

    </div>

    <div id="modal" class="hidden">
        <div class="content"></div>
    </div>

    <div id="editor" class="hidden">
        <div class="content"></div>
    </div>

    <div id="login_register"></div>


    <script type="module" src="./initializer.js?v=<?php echo time(); ?>"></script>
    <script type="module" src="./index.js?v=<?php echo time(); ?>"></script>
</body>

</html>
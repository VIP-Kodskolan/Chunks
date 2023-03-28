import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";
import content_course_list_item from "./content_course_list_item.js";

export default {};

const id_prefix_item = "course_list_id_";

// INIT
; (() => {

  SubPub.subscribe({
    // event: "db::get::user::done",
    event: "user_ok",
    listener: render,
  });

  SubPub.subscribe({
    event: "db::get::course::done",
    listener: mark_course
  });

  SubPub.subscribe({
    event: "db::post::course::done",
    listener: render
  });

  SubPub.subscribe({
    event: "db::delete::course::done",
    listener: render
  });

})();


function render() {

  const courses = state_io.state.courses;
  const dom = document.querySelector("#content_course_list");

  dom.innerHTML = `
    <button class="expand_course_selector">Choose a course</button>
    <ul></ul>
    <div id="theme">
    <input type="checkbox" class="viewMode" id="viewMode">
      <label for="viewMode" class="label">
        <i class="fas fa-moon"></i>
        <i class='fas fa-sun'></i>
        <div class='ball'></div>
      </label>
  </div>
  `;
  const list_dom = dom.querySelector("ul");
  const button_expand_course_selector_dom = dom.querySelector(".expand_course_selector");

  console.log(list_dom.childNodes.length);


  // EVENT: OPEN COURSE SELECTOR
  button_expand_course_selector_dom.addEventListener("click", toggle_course_selector);


  console.log(dom.innerHTML);

  // LIST COURSES
  courses.forEach(course => {
    const container_dom = document.createElement("li");
    list_dom.append(container_dom);
    content_course_list_item.render({ element: course, container_dom });
  });

  // NOTE: dark mode experiment begins

  //after courses loop || in same DOM innerHTML

  const toggleBtn = dom.querySelector('.viewMode');
  const theme = document.getElementById("theme");

  let darkMode = localStorage.getItem("dark-mode");
  let toggleState = localStorage.getItem("toggled");

  const enableDarkMode = () => {
    theme.classList.add("dark-mode-theme");
    toggleBtn.classList.remove("dark-mode-toggle");
    localStorage.setItem("dark-mode", "enabled");
    darkModeColorTheme();
    toggleBtn.checked = true;
  };

  const disableDarkMode = () => {
    theme.classList.remove("dark-mode-theme");
    toggleBtn.classList.add("dark-mode-toggle");
    localStorage.setItem("dark-mode", "disabled");
    lightModeColorTheme();
  };

  const darkModeColorTheme = () => {
    document.querySelector('#wrapper').classList.add('darkMode_I');
    document.querySelector('#content').classList.add('darkMode_II');
    document.querySelectorAll('.assignments').forEach(ass => ass.classList.add('darkMode_III'));
    document.querySelectorAll('li.quiz').forEach(quiz => quiz.classList.add('darkMode_IV'));
    document.querySelectorAll(".expand_compress").forEach(btn => btn.classList.add('darkMode_V'));
    document.querySelectorAll(".status_complete").forEach(comp => comp.classList.add('darkMode_VI'));
    document.querySelectorAll('.progress').forEach(prog => prog.classList.add('darkMode_VII'));
    document.querySelectorAll('.chapter_list_item.ready').forEach(exp => {
      exp.addEventListener('click', function () {
        if (exp.classList.contains('expanded')) {
          exp.classList.add('darkMode_VIII');
        }
      });
    });
    document.querySelectorAll('.chapter_list_item').forEach(exp => {
      if (!exp.classList.contains('ready')) {
        exp.classList.add('darkMode_XI');
      }
    });
    document.querySelectorAll('.section_item.unlocked').forEach(secItm => secItm.classList.add('darkMode_IX'));
    document.querySelectorAll('.unit_item').forEach(unItm => {
      if (!unItm.classList.contains('status_complete')) {
        unItm.classList.add('darkMode_X');
      }
    });
    document.querySelector('#modal').classList.add('darkMode_XII');
    document.querySelector('#content_course_open').classList.add('darkMode_XIII');
    document.querySelector('#content_course_list_and_users_admin_button').classList.add('darkMode_XIV');
  };

  const lightModeColorTheme = () => {
    document.querySelector('#wrapper').classList.remove('darkMode_I');
    document.querySelector('#content').classList.remove('darkMode_II');
    document.querySelectorAll('.assignments').forEach(ass => ass.classList.remove('darkMode_III'));
    document.querySelectorAll('li.quiz').forEach(quiz => quiz.classList.remove('darkMode_IV'));
    document.querySelectorAll(".expand_compress").forEach(btn => btn.classList.remove('darkMode_V'));
    document.querySelectorAll(".status_complete").forEach(comp => comp.classList.remove('darkMode_VI'));
    document.querySelectorAll('.progress').forEach(prog => prog.classList.remove('darkMode_VII'));
    document.querySelectorAll('.chapter_list_item.ready').forEach(exp => {
      exp.addEventListener('click', function () {
        if (exp.classList.contains('darkMode_VIII')) {
          exp.classList.remove('darkMode_VIII');
        }
      });
    });
    document.querySelectorAll('.chapter_list_item').forEach(exp => exp.classList.remove('darkMode_XI'));
    document.querySelectorAll('.unit_item').forEach(unItm => unItm.classList.remove('darkMode_X'));
    document.querySelector('#modal').classList.remove('darkMode_XII');
    document.querySelectorAll('.section_item').forEach(secItm => secItm.classList.remove('darkMode_IX'));
    document.querySelector('#content_course_open').classList.remove('darkMode_XIII');
    document.querySelector('#content_course_open').classList.remove('darkMode_XIV');
  };

  toggleBtn.addEventListener("change", (e) => {

    darkMode = localStorage.getItem("dark-mode"); // update darkMode when clicked

    if (darkMode == "enabled") {
      disableDarkMode();
      lightModeColorTheme();
      document.querySelector('.ball').classList.remove('darkMode_ball');
      document.querySelector('.label').classList.remove('darkMode_lbl');
      localStorage.setItem("toggled", 'false');
    } else {
      enableDarkMode();
      darkModeColorTheme();
      document.querySelector('.ball').classList.add('darkMode_ball');
      document.querySelector('.label').classList.add('darkMode_lbl');
      localStorage.setItem("toggled", 'true');

    }
  });

  if (darkMode == "enabled") {
    enableDarkMode();
    setTimeout(darkModeColorTheme, 100);
    document.querySelector('.ball').classList.add('darkMode_ball');
    document.querySelector('.label').classList.add('darkMode_lbl');
  } else {
    disableDarkMode();
    setTimeout(lightModeColorTheme, 100);
    document.querySelector('.ball').classList.remove('darkMode_ball');
    document.querySelector('.label').classList.remove('darkMode_lbl');
  }

  // NOTE: dark mode experiment ends;

  // ADD COURSE
  if (state_io.state.user.can_add_courses) {
    const add_course_dom = document.createElement("button");
    add_course_dom.classList.add("add_course");
    add_course_dom.innerHTML = "+ COURSE";
    list_dom.append(add_course_dom);
    add_course_dom.addEventListener("click", add_course);
    function add_course(event) {
      event.stopPropagation();
      SubPub.publish({
        event: "db::post::course::request",
        detail: { params: { user_id: state_io.state.user.user_id } }
      });
    }
  }
  console.log(list_dom.childNodes.length);
}
function toggle_course_selector() {

  const dom = document.querySelector("#content_course_list");
  dom.classList.toggle("expanded");

}
function compress_course_selector() {

  const dom = document.querySelector("#content_course_list");
  dom.classList.remove("expanded");

}

function mark_course({ response, params }) {
  const dom = document.querySelector("#content_course_list ul");
  console.log("MARK COURSE:" + dom.childNodes.length);
  const { course } = response;
  document.querySelectorAll(".course_list_item").forEach(x => x.classList.remove("selected"));
  console.log(id_prefix_item, course.course_id);
  document.getElementById(id_prefix_item + course.course_id).classList.add("selected");

  setTimeout(compress_course_selector, 100);

}
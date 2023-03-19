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
  `;
  // NOTE: dark mode experiment begins
  dom.innerHTML += `
    <div id="theme">
      <button class="viewMode">Light mode</button>
    </div>
  `;

  const toggleBtn = dom.querySelector('.viewMode');
  const theme = document.getElementById("theme");
  let darkMode = localStorage.getItem("dark-mode");

  const enableDarkMode = () => {
    theme.classList.add("dark-mode-theme");
    toggleBtn.classList.remove("dark-mode-toggle");
    localStorage.setItem("dark-mode", "enabled");
  };

  const disableDarkMode = () => {
    theme.classList.remove("dark-mode-theme");
    toggleBtn.classList.add("dark-mode-toggle");
    localStorage.setItem("dark-mode", "disabled");
  };

  if (darkMode === "enabled") {
    enableDarkMode(); // set state of darkMode on page load
  }

  toggleBtn.addEventListener("click", (e) => {
    darkMode = localStorage.getItem("dark-mode"); // update darkMode when clicked
    let currentVal = toggleBtn.innerText;
    let darkModeTxt = "Dark Mode";
    let lightModeTxt = "Light Mode";

    if (darkMode === "disabled") {
      enableDarkMode();
      currentVal = darkModeTxt;
    } else {
      disableDarkMode();
      currentVal = lightModeTxt;

    }
    console.log(localStorage);
    toggleBtn.innerText = currentVal;
  });

  // NOTE: dark mode experiment ends

  const list_dom = dom.querySelector("ul");
  const button_expand_course_selector_dom = dom.querySelector(".expand_course_selector");

  // EVENT: OPEN COURSE SELECTOR
  button_expand_course_selector_dom.addEventListener("click", toggle_course_selector);

  // LIST COURSES
  courses.forEach(course => {
    const container_dom = document.createElement("li");
    list_dom.append(container_dom);
    content_course_list_item.render({ element: course, container_dom });
  });

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

  const { course } = response;
  document.querySelectorAll(".course_list_item").forEach(x => x.classList.remove("selected"));
  document.getElementById(id_prefix_item + course.course_id).classList.add("selected");

  setTimeout(compress_course_selector, 100);

}
import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";
import utils from "../utils/utils.js";

export default { render };

const id_prefix_item = "user_list_id_";

// SUBSCRIPTIONS
(() => {
  SubPub.subscribe({
    event: "render::users::user",
    listener: render,
  });

  SubPub.subscribe({
    event: "db::patch::user::done",
    listener: ({ response, params }) => {
      render({ element: response.element });
    },
  });
  SubPub.subscribe({
    event: "db::patch::user_password::done",
    listener: ({ response, params }) => {
      console.log(response.message);
      if (!response.password) {
        document.querySelector(".patch_response").textContent = response.message;
        document.querySelector(".patch_response").classList.add("display_response")
        setTimeout(() => document.querySelector(".patch_response").classList.remove("display_response"), 5000)
        return;
      }
      document.querySelector(".patch_response").textContent = "Change Success!";
        document.querySelector(".patch_response").classList.add("display_response")
        setTimeout(() => document.querySelector(".patch_response").classList.remove("display_response"), 5000)
    },
  });
})();

function render({ element, container_dom }) {
  if (!container_dom) {
    container_dom = document.getElementById(id_prefix_item + element.user_id);
  } else {
    container_dom.id = id_prefix_item + element.user_id;
  }

  container_dom.innerHTML = `
    <button class="button_edit">EDIT</button>
    <div class="program_year">${element.user_programme}${element.user_start_year}</div>
    <div class="name">${element.name}</div>
    <ul class="user_courses"></ul>
    <button class="button_remove">RMV</button>
  `;

  // COURSES
  const user_courses = container_dom.querySelector(".user_courses");
  element.courses.forEach(render_course);
  function render_course(course) {
    const course_dom = document.createElement("li");
    user_courses.appendChild(course_dom);

    const role =
      course.role === "student" ? "" : `/${course.role.substring(0, 3)}`;
    course_dom.innerHTML = `
      <div>${course.alias}${role}</div>
    `;
  }

  // EDIT
  container_dom
    .querySelector(".button_edit")
    .addEventListener("click", open_editor);
  function open_editor() {
    SubPub.publish({
      event: "render::editor::user",
      detail: { element },
    });
  }

  // REMOVE
  container_dom
    .querySelector(".button_remove")
    .addEventListener("click", remove_user);
  function remove_user() {
    if (confirm("Sure about this? No undos here")) {
      SubPub.publish({
        event: "db::delete::user::request",
        detail: { params: { user_id: element.user_id } },
      });
    }
  }
}

import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";
import utils from "../utils/utils.js";

export default {}


  // INIT
  ; (() => {

    SubPub.subscribe({
      event: "user_ok",
      listener: render,
    });

    SubPub.subscribe({
      event: "db::get::course::done",
      listener: ({ response, params }) => {

        if (response.course.role === "teacher") {
          render_views("teacher_create");
        }

        // Hide anonymous student usernames
        if (response.course.role === "student") {
          const h2 = document.querySelector("h2.user_name");
          if (h2) h2.remove();

          const userInfoDiv = document.querySelector("div.user_info");
          if (userInfoDiv) userInfoDiv.classList.add("is-student");
        }
      }
    });

  })();


function render() {

  const user = state_io.state.user;
  const header_dom = document.querySelector("#content_user");

  header_dom.innerHTML = `
    <div class="user_info">
      <h2 class="user_name">${user.name}</h2>
      <button class="button_logout">LOGOUT</button>
      <button class="button_pw">CHANGE PASSWORD</button>
      <div id="dialogue_pw" class="hidden">
        <div id="dialogue_content" class="hidden">
        <label for="old_pw">Old password:</label><br>
        <input type="password" id="old_pw" name="old_pw"><br>
        <label for="new_pw">New password:</label><br>
        <input type="password" id="new_pw" name="new_pw">
        <button id='change_pw'>Change</button>
        </div>
      </div>
    </div>
    <div class="views"></div>
  `;

  header_dom.querySelector(".button_logout").addEventListener("click", logout);
  function logout() {
    localStorage.removeItem("logged_in_name");
    localStorage.removeItem("logged_in_token");

    utils.push_state_window_history("");
    window.location.reload(true);
  }
  // NOTE: start

  header_dom.querySelector(".button_pw").addEventListener("click", openDlg);
  function openDlg() {
    let dialogueBox = header_dom.querySelector("#dialogue_pw");

    dialogueBox.classList.toggle('hidden');
    if (!dialogueBox.classList.contains('hidden')) {
      dialogueBox.classList.add('dialogue_parent');
      dialogueBox.querySelector('div').classList.add('dialogue_child');
      document.addEventListener('mouseup', function (event) {

        if (!dialogueBox.contains(event.target) && !document.querySelector('.button_pw').contains(event.target)) {
          dialogueBox.className = "";
          dialogueBox.classList.add('hidden');
        }
      });
    }

  }

  header_dom.querySelector("#change_pw").addEventListener("click", submit_password_change);
  function submit_password_change(event) {
    event.preventDefault();

    SubPub.publish({
      event: "db::patch::user_password::request",
      detail: {
        params: {
          user: user.name,
          old_pw: document.querySelector("#old_pw").value,
          new_pw: document.querySelector("#new_pw").value
        }
      }
    });
  }

  // NOTE: end

  // USERS_ADMIN
  if (state_io.state.user.user_programme === "TCH") {
    document.querySelector("#users_admin").innerHTML = `
      <button>Users Admin</button>
    `;

    document.querySelector("#users_admin button").addEventListener("click", admin_users);
    function admin_users() {
      utils.push_state_window_history("?users=admin");
      window.location.reload();
    }
  }

}

function render_views(selected_view) {

  const views_dom = document.querySelector("#content_header .views");

  views_dom.innerHTML = `
    <div class="flexer">
      VIEWS: 
      <button name="teacher_create" class="view_teacher_create">CREATE</button>
      <button name="teacher_oversee" class="view_teacher_oversee">FOLLOW UP</button>
      <button name="student" class="view_student">STUDENT</button>
    </div>
  `;

  views_dom.querySelector("button.selected")?.classList.remove("selected");
  views_dom.querySelector(`button[name="${selected_view}"]`).classList.add("selected");

  localStorage.setItem("selected_view", selected_view);
  switch (selected_view) {
    case "teacher_create":
      document.documentElement.style.setProperty("--teacher_display", "block");
      break;
    case "teacher_oversee":
      document.documentElement.style.setProperty("--teacher_display", "none");
      break;
    case "student":
      document.documentElement.style.setProperty("--teacher_display", "none");
      break;
  }

  views_dom.querySelectorAll("button").forEach(x => x.addEventListener("click", change_view));
  function change_view(event) {
    render_views(event.target.name);
    SubPub.publish({
      event: `render::new_view`,
      detail: selected_view
    });
  }

}

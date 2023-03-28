import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";
import utils from "../utils/utils.js";

export default {}

  ; (() => {

    SubPub.subscribe({
      event: "start_up_login",
      listener: render_login
    });

    SubPub.subscribe({
      event: "db::get::login::done",
      listener: check_login_answer
    });


  })();


function render_login() {

  if (localStorage.getItem("logged_in_name")) {

    SubPub.publish({
      event: "db::get::login::request",
      detail: {
        params: {
          username: localStorage.getItem("logged_in_name"),
          usertoken: localStorage.getItem("logged_in_token"),
        }
      }
    });

  } else {

    const login_dom = document.getElementById("login_register");

    login_dom.innerHTML = `
      <form id="login_form">
        <div class="username">
            <label>User Name:</label>
            <input type="text">
        </div>
        <div class="password">
            <label>Password:</label>
            <input type="password">
        </div>
        <input type="submit" value="LOGIN">
      </form>  
    `;

    login_dom.querySelector("form").addEventListener("submit", submit_login);
    function submit_login(event) {
      event.preventDefault();

      SubPub.publish({
        event: "db::get::login::request",
        detail: {
          params: {
            username: document.querySelector(".username input").value,
            password: document.querySelector(".password input").value,
          }
        }
      });
    }

  }

}

function check_login_answer({ response, params }) {

  const { status } = response;

  if (!status.password) {

    localStorage.removeItem("logged_in_name");
    render_login();

  } else {

    const login_dom = document.getElementById("login_register");
    login_dom.innerHTML = "";
    login_dom.classList.add("hidden");

    localStorage.setItem("logged_in_name", state_io.state.user.name);
    localStorage.setItem("logged_in_token", response.token);
    SubPub.publish({
      event: "user_ok",
      detail: { response, params }
    });

  }

}
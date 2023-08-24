import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";
import utils from "../utils/utils.js";

export default {}

;(() => {

  SubPub.subscribe({
    event: "start_up_login",
    listener: render_login_register
  });

  SubPub.subscribe({
    event: "db::get::login::done",
    listener: check_login_answer
  });


})()


function render_login_register () {

  if (localStorage.getItem("logged_in_name")) {

    SubPub.publish({
      event: "db::get::login::request",
      detail: { params: {
        username: localStorage.getItem("logged_in_name"),
        usertoken: localStorage.getItem("logged_in_token"),
      }}
    });
    
  } else {

    const login_dom = document.getElementById("login_register");

    login_dom.innerHTML = `

      <form id="login_form">
        <h1>LOGIN CHUNKS v1.0</h1>
        <div class="username">
            <label>Användarnamn:</label>
            <input type="text">
        </div>
        <div class="password">
            <label>Password:</label>
            <input type="password">
        </div>
        <input type="submit" value="LOGIN">
      </form>  

      <form id="register_form">
        <h1>REGISTER CHUNKS v1.0</h1>
        <div class="register_info">
          <p>Ditt användarnamn ska inte kunna kopplas till dig av någon utomstående.</p>
          <p>Du får därför inte använda något av dina namn eller efternamn, eller delar av dem.</p>
        </div>
        <div class="username">
            <label>Användarnamn:</label>
            <input type="text">
        </div>
        <div class="password">
            <label>Password:</label>
            <input type="text">
        </div>
        <div class="token">
            <label>Token (ditt MaU_id):</label>
            <input type="text">
        </div>
        <input type="submit" value="REGISTER">
      </form>      
    `;
  
    login_dom.querySelector("#login_form").addEventListener("submit", submit_login);
    function submit_login (event) {
      event.preventDefault();
  
      SubPub.publish({
        event: "db::get::login::request",
        detail: { params: {
          username: login_dom.querySelector(".username input").value,
          password: login_dom.querySelector(".password input").value,
        }}
      });
    }

    login_dom.querySelector("#register_form").addEventListener("submit", submit_register);
    function submit_register (event) {
      event.preventDefault();
  
      SubPub.publish({
        event: "db::post::register::request",
        detail: { params: {
          token: login_dom.querySelector(".token input").value,
        }}
      });
    }

  }

}

function render_register () {
  
  localStorage.clear();

}

function check_login_answer ({ response, params }) {

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
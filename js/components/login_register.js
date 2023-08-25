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

  SubPub.subscribe({
    event: "db::post::register::done",
    listener: check_registration
  });

})()


function render_login_register (data = {}) {

  const {login_feedback = false, reg_feedback = false} = data;

  if (localStorage.getItem("logged_in_name")) {

    SubPub.publish({
      event: "db::get::login::request",
      detail: { params: {
        username: localStorage.getItem("logged_in_name"),
        usertoken: localStorage.getItem("logged_in_token"),
      }}
    });
    
  } else {
    
    const logreg_dom = document.getElementById("login_register");

    // Loginform                            
    logreg_dom.innerHTML = `
      <h1>CHUNKS V1.0</h1>
      <form id="login_form">
        <h1>LOGIN</h1>
        <p class="feedback"></p>
        <div class="username">
            <label>Användarnamn:</label>
            <input type="text">
        </div>
        <div class="password">
            <label>Password:</label>
            <input type="password">
        </div>
        <input type="submit" value="LOGIN">
      </form>`;


    // Registreringsform
    logreg_dom.innerHTML += `
      <form id="register_form">
        <h1>REGISTER</h1>
        <div class="register_info">
          <p>Ditt användarnamn ska inte kunna kopplas till dig av någon utomstående.</p>
          <p>Du får därför inte använda något av dina namn eller efternamn, eller delar av dem.</p>
        </div>
        <p class="feedback"></p>
        <div class="username">
            <label>Användarnamn:</label>
            <input type="text">
        </div>
        <div class="password">
            <label>Password:</label>
            <input type="text">
        </div>
        <div class="repeat_password">
            <label>Repeat Password:</label>
            <input type="text">
        </div>
        <div class="token">
            <label>Token (ditt MaU_id):</label>
            <input type="text" value="ah5479">
        </div>
        <input type="submit" value="REGISTER">
      </form>      
    `;


    const login_dom = logreg_dom.querySelector("#login_form")
    const reg_dom = logreg_dom.querySelector("#register_form");
  

    login_dom.addEventListener("submit", submit_login);
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

    reg_dom.addEventListener("submit", submit_register);
    function submit_register (event) {
      event.preventDefault();

      if (reg_dom.querySelector(".not_same")) return;
  
      SubPub.publish({
        event: "db::post::register::request",
        detail: { params: {
          name: reg_dom.querySelector(".username input").value,
          user_password: reg_dom.querySelector(".password input").value,
          token: reg_dom.querySelector(".token input").value,
        }}
      });
    }

    reg_dom.querySelector(".repeat_password input").addEventListener("input", check_same_password);
    function check_same_password (event) {
      const pass_input = reg_dom.querySelector(".password input");
      const repeat_pass_input = reg_dom.querySelector(".repeat_password input");
      const action = pass_input.value !== repeat_pass_input.value ? "add" : "remove";
      repeat_pass_input.classList[action]("not_same");
    }
    

  }

}


function check_login_answer ({ response, params }) {

  const { status } = response;

  if (!status.password) {

    localStorage.removeItem("logged_in_name");
    const logreg_dom = document.getElementById("login_register");
    const login_dom = logreg_dom.querySelector("#login_form")
    login_dom.querySelector(".feedback").textContent = `Fel login-uppgifter.`;
  
  } else {

    const logreg_dom = document.getElementById("login_register");
    logreg_dom.innerHTML = "";
    logreg_dom.classList.add("hidden");

    localStorage.setItem("logged_in_name", state_io.state.user.name);
    localStorage.setItem("logged_in_token", response.token);

    SubPub.publish({
      event: "user_ok",
      detail: { response, params }
    });

  }

}

function check_registration ({ response, params }) {

  const logreg_dom = document.getElementById("login_register");
  const login_dom = logreg_dom.querySelector("#login_form")
  const reg_dom = logreg_dom.querySelector("#register_form");

  reg_dom.querySelector(".feedback").textContent = "";
  login_dom.querySelector(".feedback").textContent = "";
  reg_dom.classList.remove("reg_done");
  
  switch (response) {
    case "name_exists":
      reg_dom.querySelector(".feedback").textContent = "Användarnamnet används redan av någon annan.";
      break;
    case "no_token":
      reg_dom.querySelector(".feedback").textContent = "MaU-ID som du har angivit finns inte i databasen eller har redan använts. Kontakta läraren.";
      break;
    default:
      login_dom.querySelector(".feedback").textContent = `Registreringen lyckades. Du kan nu logga in med dina uppgifter.`;
      reg_dom.classList.add("reg_done");
    }

}
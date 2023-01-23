import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";
import utils from "../utils/utils.js";

export default {}

const selects_data =   [
  {
    text: "Year",
    key: "user_start_year",
    get items_filter () { return extract_unique(state_io.state.users, "user_start_year"); },
    items_add: ["20", "21", "22"],
  },
  {
    text: "Programme",
    key: "user_programme",
    get items_filter () { return extract_unique(state_io.state.users, "user_programme"); },
    items_add: ["WDU", "MPP", "PMA"],
  },

];


// INIT
;(() => {

  SubPub.subscribe({
    event: "db::get::users::done",
    listener: render
  });

  SubPub.subscribe({
    event: "db::post::user::done",
    listener: render_users
  });
  
})();

function render () {

  const control_dom = document.querySelector("#content_users_control");
  control_dom.innerHTML = `
    <div id="users_filters"></div>
    <div id="users_search"></div>
    <div id="users_add">
      <button>ADD USERS</button>
      <div id="users_adder" class="hidden">
        <form></form>
        <div class="added_users"></div>
      </div>
    </div>
  `;

  // FILTERS
  selects_data.forEach(one_filter);
  function one_filter (filter) {

    const filter_dom = document.createElement("div");
    control_dom.querySelector("#users_filters").appendChild(filter_dom);
    filter_dom.dataset.key = filter.key;
    filter_dom.innerHTML = `
      <label>${filter.text}</label>
      <select>
        <option value="all">All</option>
      </select>
    `;

    filter.items_filter.forEach( item => {
      filter_dom.querySelector("select").innerHTML += `<option value="${item}">${item}</option>`;
    });

  }
  control_dom.querySelectorAll("#users_filters select").forEach( s => s.addEventListener("change", render_users));

  render_adder();
  render_users();
}

function render_adder () {

  const users_adder_dom = document.querySelector("#users_adder");
  const users_adder_form_dom = users_adder_dom.querySelector("form");

  users_adder_form_dom.addEventListener("submit", e => {
    e.preventDefault();
  });

  // PROGRAMME & YEAR
  selects_data.forEach(one_select);
  function one_select (select) {

    const select_dom = document.createElement("div");
    users_adder_form_dom.appendChild(select_dom);
    select_dom.dataset.key = select.key;
    select_dom.innerHTML = `
      <label>${select.text}</label>
      <select class="${select.text.toLowerCase()} user_data" data-key="${select.key}">
        <option value="">Choose</option>
      </select>
    `;

    select.items_add.forEach( item => {
      select_dom.querySelector("select").innerHTML += `<option value="${item}">${item}</option>`;
    });

  }

  // INPUTS
  users_adder_form_dom.innerHTML += `
    <input type="text" class="name user_data" placeholder="Name" data-key="name">
    <input type="text" class="password user_data" placeholder="Password" data-key="user_password">
    <button class="button_save">SAVE</button>
    <button class="button_close">CLOSE</close>
  `;
  users_adder_form_dom.querySelector("button.button_save").addEventListener("click", save);
  users_adder_form_dom.querySelector("button.button_close").addEventListener("click", close);
  function save () {

    const params = {};
    let error = false;

    // VALUES?
    const input_doms = Array.from(users_adder_form_dom.querySelectorAll(".user_data"));
    for (let i = 0; i < input_doms.length; i++) {

      const input_dom = input_doms[i];
      if (!input_dom.value) {
        input_dom.classList.add("error");
        error = true;
      } else {
        params[input_dom.dataset.key] = input_dom.value;
      }

    }

    // NAME WITH SPACES?
    if (users_adder_form_dom.querySelector("input.name").value.indexOf(" ") !== -1) {
      users_adder_form_dom.querySelector("input.name").value = "No Spaces in Name";
      users_adder_form_dom.querySelector("input.name").classList.add("error");
      error = true;
    }

    // NAME TAKEN?
    if (state_io.state.users.some(u => u.name === users_adder_form_dom.querySelector("input.name").value)) {
      users_adder_form_dom.querySelector("input.name").value = "This Name Taken";
      users_adder_form_dom.querySelector("input.name").classList.add("error");
      error = true;
    }

    if (error) return false;

    SubPub.publish({
      event: "db::post::user::request",
      detail: { params }
    });
  }
  function close () {
    users_adder_dom.classList.add("hidden");
  }


  // OPEN ADDER
  document.querySelector("#users_add > button").addEventListener("click", addStudents);
  function addStudents () {
    users_adder_dom.classList.remove("hidden");
  }

}

function reset_adder () {

  const users_adder_dom = document.querySelector("#users_adder");
  const users_adder_form_dom = users_adder_dom.querySelector("form");

  users_adder_form_dom.querySelectorAll(".user_data").forEach(d => d.classList.remove("error"));

  users_adder_form_dom.querySelector("input.name").value = "";
  users_adder_form_dom.querySelector("input.password").value = "";

  users_adder_form_dom.querySelector("input.name").focus();

}

function render_users () {

  reset_adder ();

  SubPub.publish({
    event: "render::users",
  });

}


function extract_unique (array, key) {

  const values = [];
  array.forEach( element => {
    if (!values.includes(element[key])) {
      values.push(element[key]);
    }
  });

  return values;
}
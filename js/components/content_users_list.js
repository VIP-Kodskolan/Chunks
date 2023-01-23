import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";
import utils from "../utils/utils.js";

export default {}

const Roles = ["Teacher", "Student"];

// INIT
;(() => {

  SubPub.subscribe({
    event: "render::users",
    listener: render
  });

  SubPub.subscribe({
    event: "db::delete::user::done",
    listener: render
  });
  
})();

function render () {

  // USERS FILTER
  const control_dom = document.querySelector("#content_users_control");
  const filter_values = Array.from(control_dom.querySelectorAll("#users_filters > div")).map(fd => {
    return {
      key: fd.dataset.key,
      value: fd.querySelector("select").value,
    };
  });

  let users = state_io.state.users;
  filter_values.forEach( fv => {
    
    if (fv.value !== "all") {
      users = users.filter(u => u[fv.key] === fv.value);
    }

  });

  // SEARCH (TBD)


  document.querySelector("#content_users_list").innerHTML = "<ul></ul>";
  const list_dom = document.querySelector("#content_users_list ul");

  users.sort((a,b) => a.name > b.name).forEach( element => {
    
    const container_dom = document.createElement("li");
    list_dom.appendChild(container_dom);

    SubPub.publish({
      event: "render::users::user",
      detail: {
        element,
        container_dom
      }
    });
  
  });

}

import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";
import utils from "../utils/utils.js";

export default {}

  // INIT
  ; (() => {

    SubPub.subscribe({
      event: "user_ok",
      listener: render
    });

    SubPub.subscribe({
      event: "db::get::course::done",
      listener: render_courses
    });

  })();

function render() {

  const open_users_admin = utils.get_parameter("users") && utils.get_parameter("users") === "admin";

  if (open_users_admin) {

    render_users_admin();

  } else {

    render_courses();

  }

}

function render_users_admin() {

  document.querySelector("#content_course").classList.add("hidden");
  document.querySelector("#content_users_admin").classList.remove("hidden");

  SubPub.publish({
    event: "db::get::users::request",
    detail: { params: {} }
  });

}

function render_courses() {

  document.querySelector("#content_course").classList.remove("hidden");
  document.querySelector("#content_users_admin").classList.add("hidden");

}
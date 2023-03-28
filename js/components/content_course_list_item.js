import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";
import utils from "../utils/utils.js";

export default { render} 

const id_prefix_item = "course_list_id_";

// SUBSCRIPTIONS
;(() => {

  SubPub.subscribe({
    event: "db::patch::course::done",
    listener: ({ response, params }) => {
      const alias_updated = params.updated_fields.some(f => f.field === "alias");
      if (!alias_updated) return;
      render({ element: response.element });
    }
  });

  // SubPub.subscribe({
  //   event: "db::post::course::done",
  //   listener: ({ response, params }) => {
  //     render({ element: response.course });
  //   }
  // });

})();

function render ({ element, container_dom }) {

  if (!container_dom) {
    container_dom = document.getElementById(id_prefix_item + element.course_id);
  } else {
    container_dom.id = id_prefix_item + element.course_id;
    container_dom.classList.add("course_list_item");
    container_dom.addEventListener("click", new_open_course);
    function new_open_course () {
      utils.push_state_window_history(`?course=${element.course_id}`);
      open_course();
    }
  }

  container_dom.setAttribute("title", element.name);
  container_dom.innerHTML = `
    ${element.alias}
  `;

  // THIS SPECIFIC COURSE OPEN?
  const is_open = utils.get_parameter("course") && utils.get_parameter("course") === element.course_id;
  const already_showing = container_dom.classList.contains("selected");
  (is_open && !already_showing) && open_course();
  function open_course () {

    console.log(document.querySelector('#content_course_list ul').childNodes.length);
    SubPub.publish({
      event: "db::get::course::request",
      detail: {
        params: {
          course_id: element.course_id,
          user_id: state_io.state.user.user_id,
        }
      }
    });
  
  }

}


// function update ({ element }) {
  
//   const container_dom = document.getElementById(id_prefix_item + element.course_id);
//   container_dom.setAttribute("title", element.name);
//   container_dom.innerHTML = `
//     ${element.alias}
//   `;

// }

import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";
import utils from "../utils/utils.js";

export default { }

  // INIT
  ; (() => {

    SubPub.subscribe({
      event: "render::editor",
      listener: render
    });

    SubPub.subscribe({
      event: "render::editor::user",
      listener: render
    });

    SubPub.subscribe({
      event: "db::post::course::done",
      listener: ({ response, params }) => {
        const element = response.course;
        render({ element });
      }
    });

    SubPub.subscribe({
      events: ["db::patch::course::done", "db::patch::chapter::done", "db::patch::section::done", "db::patch::unit::done", "db::patch::user::done"],
      listener: close_editor
    });

  })();

function close_editor() {

  // UPDATE URL  
  const potential_parameters = document.querySelector("#editor").dataset.editing_kind === "user" ? ["users"] : ["course", "unit"]
  const get_parameters_string = utils.get_parameters_string(potential_parameters);
  utils.push_state_window_history(`?${get_parameters_string}`)

  // HIDE DIV
  document.querySelector("#editor").classList.add("hidden");

}

function render({ element }) {

  // console.log("render", element)

  const dom = document.querySelector("#editor .content");
  const element_kind = state_io.Consts.unit_kinds.includes(element.kind) ? "unit" : element.kind;
  const element_id = element[element_kind + "_id"];

  // DATASET (for UPDATE)
  dom.dataset.update_data = JSON.stringify({
    element,
    kind: element_kind,
    element_id: element_id,
  });


  // URL
  document.querySelector("#editor").dataset.editing_kind = element_kind;
  const potential_parameters = element_kind === "user" ? ["users"] : ["course", "unit"]
  const get_parameters_string = utils.get_parameters_string(potential_parameters);
  utils.push_state_window_history(`?${get_parameters_string}&edit_kind=${element_kind}&edit_id=${element_id}`)


  dom.innerHTML = `
    <h2>Editing: ${element.name}, (${element.kind}). ${element_kind}_ID: ${element_id}</h2>
    <ul></ul>
    <div class="buttons control">
      <button class="button_save">SAVE & CLOSE</button>
      <button class="button_close">CLOSE</button>
    </div>
  `;

  const list_dom = dom.querySelector("ul");


  // COMPONENTS
  const components = {
    course: ["name", "alias", "code", "semester", "canvas_url", "week_count", "week_start", "programmes"],
    chapter: ["name", "spot", "done"],
    section: ["parent_chapter", "name", "spot", "dependencies"],

    video: ["name", "spot", "story", "video_link", "folder_link"],
    exercise: ["name", "spot", "story", "video_link", "folder_link"],
    quiz: ["name", "spot", "is_stop_quiz", "quiz"],
    assignment: ["name", "spot", "story", "video_link", "folder_link"],

    user: ["name", "password", "amanuens"],
  };

  components[element.kind].forEach(component => {
    const container_dom = document.createElement("div");
    container_dom.classList.add("editor_item");
    list_dom.append(container_dom);
    renderers["render_" + component]({ element, container_dom });
  });

  // FOCUS TO NAME
  const name_input_dom = list_dom.querySelector(".name input");
  name_input_dom && setTimeout(focus_to_name, 0);
  function focus_to_name() {
    name_input_dom.focus();
    if (name_input_dom.value === "Title") name_input_dom.select();
  }


  // SAVE
  dom.querySelector(".button_save").addEventListener("click", update);

  // CLOSE EDITOR
  dom.querySelector(".button_close").addEventListener("click", close_editor);

  // SHOW EDITOR
  document.getElementById("editor").classList.remove("hidden");

  // CLOSE VIA CLICK ON BACKGROUND or PRESS KEY ESC
  document.querySelector("#editor").addEventListener("click", e => {
    if (e.target.id === "editor") close_editor();
  });

  document.querySelector("html").addEventListener("keyup", e => {
    if (e.key === "Escape" && !document.querySelector("#editor").classList.contains("hidden")) {
      close_editor();
    }
  });
}

const renderers = {
  render_name, render_password, render_code, render_alias, render_semester, render_canvas_url, render_spot,
  render_is_stop_quiz, render_video_link, render_folder_link, render_story, render_quiz, render_parent_chapter,
  render_week_start, render_week_count, render_done, render_dependencies, render_programmes, render_amanuens
}

function update(event) {

  const dom = document.querySelector("#editor .content");
  const { element_id, kind, element } = JSON.parse(dom.dataset.update_data);

  // console.log("updateEvent", element, element_id, kind)

  const params = {
    user_id: state_io.state.user.user_id,
    element,
    element_id,
    kind,
    updated_fields: []
  };

  let updated_dependencies = null;
  dom.querySelectorAll(".editor_item:not(.editor_quiz)").forEach(editor_item_dom => {

    const { field, type } = JSON.parse(editor_item_dom.dataset.update_data);

    let value = editor_item_dom.querySelector(".input").value;
    (type === "checkbox" && (value = editor_item_dom.querySelector(".input").checked))

    if (value != element[field]) {

      if (field === "dependencies") {

        const dependencies = editor_item_dom.dataset.dependencies.replace(/\s+/g, ''); // remove all potential spaces
        const old_deps = dependencies ? dependencies.split(",").map(v => parseInt(v)) : [];

        value = value.replace(/\s+/g, '');
        const new_deps = value ? value.split(",").map(v => parseInt(v)) : [];

        const delete_deps = old_deps.filter(od => !new_deps.includes(od)).filter(d => !isNaN(d));
        const post_deps = new_deps.filter(nd => !old_deps.includes(nd)).filter(d => !isNaN(d));

        updated_dependencies = { delete_deps, post_deps };

      } else {

        params.updated_fields.push({
          field,
          value,
          is_text: type === "text" || type === "textarea",
        });

      }
      
    }
    
  });
  
  console.log("{params}", {params})
  params.updated_fields.length && SubPub.publish({
    event: `db::patch::${kind}::request`,
    detail: { params }
  });

  if (updated_dependencies) {

    const _params = { course_id: state_io.state.course.course_id, kind, element_id };

    updated_dependencies.delete_deps.length && SubPub.publish({
      event: `db::delete::dependencies::request`,
      detail: { params: { ..._params, dependencies: updated_dependencies.delete_deps } }
    });

    updated_dependencies.post_deps.length && SubPub.publish({
      event: `db::post::dependencies::request`,
      detail: { params: { ..._params, dependencies: updated_dependencies.post_deps } }
    });

  }

  // Questions and options are updated silently as the user changes them.
  // If we only edit the quiz questions and options, none of the above will trigger.
  // So we need to close the editor manually.
  if (!params.updated_fields.length && !updated_dependencies) {
    close_editor();
  }

}

function render_input_item({ element, container_dom, field, type }) {

  // console.log("render_input_item", element, container_dom, field, type)

  const kind = state_io.Consts.unit_kinds.includes(element.kind) ? "unit" : element.kind;
  container_dom.dataset.update_data = JSON.stringify({ element, field, kind, type });
  container_dom.classList.add(field);

  // TYPE OF INPUT
  let input_html = "";
  const escaped_value = type !== "text" ? element[field] : utils.escape_html(element[field]);
  switch (type) {
    case "text":
      input_html = `<input type="text" value="${escaped_value}" class="input">`;
      break;
    case "number":
      input_html = `<input type="number" value="${escaped_value}" size="2" class="input">`;
      break;
    case "textarea":
      input_html = `<textarea class="input">${escaped_value}</textarea>`;
      break;
    case "checkbox":
      input_html = `<input type="checkbox" class="input" ${escaped_value ? "checked" : ""}>`;
      break;
  }

  // LABEL
  let label_text;
  switch (field) {
    case "dependencies":
      label_text = `Dependencies as comma separated ${element.kind === "section" ? "unit" : "section"} ids`;
      break;
    case "video_link":
      label_text = "Box video file id (not the whole link)";
      break;
    case "folder_link":
      label_text = "Box folder id (not the whole link)";
      break;
    default:
      label_text = field[0].toUpperCase() + field.substring(1);
  }


  container_dom.innerHTML = `
    <label>${label_text}:</label>
    ${input_html}
  `;

  // REMOVE BOX-prefix WHEN ADDING LINK
  // https://mau.box.com/s/fpb2ro5so9wsdf4j1f2m9nihz5xd8oxh
  if (field === "video_link" || field==="folder_link") {
    container_dom.querySelector("input").addEventListener("paste", remove_box_prefix);
    function remove_box_prefix (event) {
      event.preventDefault();
      const paste_value = event.clipboardData.getData("text/plain");
      const remove = "https://mau.box.com/s/";
      if (paste_value.indexOf(remove) !== -1) {
        event.target.value = paste_value.substring(remove.length);
      } else {
        event.target.value = paste_value;
      }
    }
  }


}




function render_password({ element, container_dom }) {
  console.log("render_password", element, container_dom)
  render_input_item({ element, container_dom, field: "user_password", type: "text" });
}








function render_name({ element, container_dom }) {
  render_input_item({ element, container_dom, field: "name", type: "text" });
}

function render_week_start({ element, container_dom }) {
  render_input_item({ element, container_dom, field: "week_start", type: "number" });
}

function render_week_count({ element, container_dom }) {
  render_input_item({ element, container_dom, field: "week_count", type: "number" });
}

function render_parent_chapter({ element, container_dom }) {
  render_input_item({ element, container_dom, field: "chapter_id", type: "number" });
}

function render_code({ element, container_dom }) {
  render_input_item({ element, container_dom, field: "code", type: "text" });
}

function render_alias({ element, container_dom }) {
  render_input_item({ element, container_dom, field: "alias", type: "text" });
}

function render_semester({ element, container_dom }) {
  render_input_item({ element, container_dom, field: "semester", type: "text" });
}

function render_canvas_url({ element, container_dom }) {
  render_input_item({ element, container_dom, field: "canvas_url", type: "text" });
}

function render_video_link({ element, container_dom }) {
  render_input_item({ element, container_dom, field: "video_link", type: "text" });
}

function render_folder_link({ element, container_dom }) {
  render_input_item({ element, container_dom, field: "folder_link", type: "text" });
}

function render_spot({ element, container_dom }) {
  render_input_item({ element, container_dom, field: "spot", type: "number" });
}

function render_is_stop_quiz({ element, container_dom }) {
  render_input_item({ element, container_dom, field: "is_stop_quiz", type: "checkbox" });
}

function render_done({ element, container_dom }) {
  render_input_item({ element, container_dom, field: "done", type: "checkbox" });
}

function render_story({ element, container_dom }) {
  render_input_item({ element, container_dom, field: "story", type: "textarea" });
}

function render_dependencies({ element, container_dom }) {

  const key_filter = element.kind + "_id";
  const key_map = element.kind === "section" ? "unit_id" : "section_id";
  const dependencies = state_io.state.dependencies.filter(d => d.section_id === element[key_filter]).map(d => parseInt(d[key_map])).join(", ");
  container_dom.dataset.dependencies = dependencies;
  element.dependencies = dependencies;

  render_input_item({ element, container_dom, field: "dependencies", type: "text" });
}

function render_programmes({ element, container_dom }) {
  render_input_item({ element, container_dom, field: "programmes", type: "text" });
}

function render_amanuens({ element, container_dom }) {
  render_input_item({ element, container_dom, field: "amanuens", type: "text" });
}

function render_quiz({ element, container_dom }) { 

  SubPub.publish({
    event: "render_quiz::editor_quiz",
    detail: { element, container_dom }
  })

}

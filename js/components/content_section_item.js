import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";
import utils from "../utils/utils.js";
import content_unit_item from "./content_unit_item.js";

export default { render }

const id_prefix_item = "section_id_";

// INIT
;(() => {

  SubPub.subscribe({
    event: "db::patch::unit::done",
    listener: ({ response, params }) => {
      const section_id = response.elements[0].section_id;
      render_units({ units: response.elements, section_id })
    }
  });

  SubPub.subscribe({
    event: "db::post::unit::done",
    listener: ({ response, params }) => {
      
      // // Open Modal
      // const course_id = state_io.state.course.course_id;
      // const unit_id = response.element.unit_id;
      // const modal_history = `?course=${course_id}&unit=${unit_id}`;

      // // Open Editor
      // const editor_history = `&edit_kind=unit&edit_id=${unit_id}`;
      // utils.push_state_window_history(`${modal_history}${editor_history}`)

      // Re-render
      const section_id = response.element.section_id;
      const units = state_io.get_section_units(section_id);
      render_units({ units, section_id });

    }
  });

  SubPub.subscribe({
    event: "db::delete::unit::done",
    listener: ({ response, params }) => {

      const units = state_io.get_section_units(response.element.section_id);
      render_units({ units, section_id: response.element.section_id });
      
    }
  });

  SubPub.subscribe({
    events: ["db::delete::dependencies::done", "db:post::dependencies::done"],
    listener: ({ response, params }) => {

      if (params.kind === "section") {
        render({ element: state_io.state.sections.find(s => s.section_id === params.element_id)});
      } else {
        params.dependencies.forEach(dependency => {
          const element = state_io.state.sections.find(s => s.section_id === dependency);
          render({ element });
        });
      }

    }
  });
})();


function render ({ element, container_dom }) {
  let arrayWithMatchingUnits = state_io.state.arrayWithMatchedUnits;

  if(arrayWithMatchingUnits){
    console.log(arrayWithMatchingUnits)

    arrayWithMatchingUnits.forEach(e => {
     if( e.section_id != element.section_id){
      container_dom.classList.add("notSearchedFor")
      console.log("hej")
     }
    });
  }

  if (!container_dom) {
    container_dom = document.getElementById(id_prefix_item + element.section_id)
    if (!container_dom) return; // Trying to re-render a section that is not rendered
  } else {
    container_dom.id = id_prefix_item + element.section_id;
    container_dom.classList.add("section_item");
    // console.log(element)
  }

  container_dom.innerHTML = `
    <div class="content">
      <div class="top">
        <div class="teacher">
          <div class="control_buttons">
            <button class="button_edit">EDIT</button>
            <button class="button_delete">DELETE</button>
          </div>
        </div>
        <div class="bullet_name"></div>
      </div>
      <ul class="unit_list"></ul>
    </div>
    <div class="lock">
      <div class="dependencies">
        <span class="span_locked">To unlock this section you need to complete these quizzes:</span>
        <ul></ul>
      </div>
    </div>
  `;


  // LOCKED?
  /*
    A section can be locked because:
      1) an unsolved depend quiz. Data kept in dependencies.
      2) an unsolved stop quiz upstreams. Unsolved stop quizes lock all sections that come after their section.
  */

  // Dependencies
  const unsolved_depend_quizes = state_io.state.dependencies
                                    .filter(d => d.section_id === element.section_id)
                                    .filter(d => {
                                      const users_unit = state_io.state.users_units.find(uu => uu.unit_id === d.unit_id);
                                      return !users_unit?.check_complete;
                                    })
                                    .map(d => {
                                          return {
                                            ...state_io.state.units.find(u => u.unit_id === d.unit_id),
                                            ...state_io.state.users_units.find(u => u.unit_id === d.unit_id),
                                          };
                                        });


  // Stop quizes
  const chapter_spot = state_io.state.chapters.find( c => c.chapter_id === element.chapter_id ).spot;
  const unsolved_stop_quizes = state_io.state.units
                                  .filter (u => u.is_stop_quiz)
                                  .map(u => {
                                    return {
                                      ...u,
                                      ...state_io.state.users_units.find(uu => uu.unit_id === u.unit_id),
                                      section_spot: state_io.state.sections.find( s => s.section_id === u.section_id ).spot,
                                      chapter_spot: state_io.state.chapters.find( c => c.chapter_id === u.chapter_id ).spot,
                                    };
                                  })
                                  .filter(u => !u.check_complete && (
                                                        (u.chapter_spot === chapter_spot && u.section_spot < element.spot) ||
                                                        (u.chapter_spot < chapter_spot)
                                                        ));
  
  const locking_quizes = [...unsolved_depend_quizes, ...unsolved_stop_quizes].sort((a,b) => state_io.bullet_number_element(a) > state_io.bullet_number_element(b));
  const is_teacher = state_io.state.course.role === "teacher" || state_io.state.course.role === "amanuens";
  const student_view = localStorage.getItem("selected_view") === "student";
  
  if (locking_quizes.length === 0 || (is_teacher && !student_view)) {

    container_dom.classList.add("unlocked");

  } else {

    container_dom.classList.add("locked");
    locking_quizes.forEach(uud => {
      const dom = document.createElement("li");
      dom.classList.add("quiz_dependency");
      // uud.check_complete && dom.classList.add("status_complete");
      container_dom.querySelector(".lock .dependencies ul").append(dom);
  
      dom.innerHTML = `
        <div>${state_io.bullet_number_element(uud)}</div>
      `;
    });

  }


  // TOP
  render_bullet_name({ element });

  // UNITS
  const units = state_io.get_section_units(element.section_id);
  render_units({ units, section_id: element.section_id });

  // DELETE
  container_dom.querySelector(".button_delete").addEventListener("click", delete_section);
  function delete_section() {
    if (confirm("DELETE SECTION? No undos!")) {
      SubPub.publish({
        event: "db::delete::section::request",
        detail: { params: { element } }
      });
    }
  }

  // EDIT
  container_dom.querySelector(".button_edit").addEventListener("click", open_editor);
  function open_editor() {
    SubPub.publish({
      event: "render::editor",
      detail: { element }
    });
  }

  // STOP PROPAGATION TO CHAPTER (expand/compress)
  container_dom.addEventListener("click", e => e.stopPropagation());


  // THIS SPECIFIC ELEMENT EDITING?
  let is_editing = utils.get_parameter("edit_kind") && utils.get_parameter("edit_kind") === "section";
  is_editing = is_editing && utils.get_parameter("edit_id") && utils.get_parameter("edit_id") === element.section_id;
  is_editing && open_editor();

}


function render_bullet_name ({ element }) {

  const container_dom = document.getElementById(id_prefix_item + element.section_id);
  const bullet_name_dom = container_dom.querySelector(".bullet_name");

  bullet_name_dom.innerHTML = `
    <div><span class="teacher">(id: ${element.section_id})</span>Section ${state_io.bullet_number_element(element)}</div>
    <h2>${element.name}</h2>
  `;

}

function render_units ({ units, section_id }) {
  // section_id required because units could be empty array

  const container_dom = document.getElementById(id_prefix_item + section_id);
  const list_dom = container_dom.querySelector("ul");
  list_dom.innerHTML = "";
  units.forEach(unit => {
    const container_dom = document.createElement("div");
    list_dom.append(container_dom);
    content_unit_item.render({ element: unit, container_dom });
  });

  // BUTTONS ADD UNIT
  if (units.length < state_io.Consts.max_n_units_in_section) {

    const add_unit_dom = document.createElement("div");
    add_unit_dom.classList.add("add_unit");
    add_unit_dom.classList.add("teacher");
    list_dom.append(add_unit_dom);
    add_unit_dom.innerHTML = `
      <div class="flexer">
        <button class="add_video" name="video">+VID</button>
        <button class="add_exercise" name="exercise">+EXE</button>
        <button class="add_assignment" name="assignment">+ASS</button>
        <button class="add_quiz" name="quiz">+QUZ</button>
      </div>
    `;
    add_unit_dom.querySelectorAll("button").forEach(b => b.addEventListener("click", add_unit));
    function add_unit (event) {

      SubPub.publish({
        event: `db::post::unit::request`,
        detail: { params: { 
                            section: state_io.state.sections.find(s => s.section_id === section_id),
                            kind: event.target.name,
                            user_id: state_io.state.user.user_id
                          }}
      });

    }  
  }

}


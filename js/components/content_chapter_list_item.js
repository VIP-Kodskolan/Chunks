import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";
import utils from "../utils/utils.js";
import content_section_item from "./content_section_item.js";


export default { render }

const id_prefix_item = "chapter_list_id_";


// INIT
;(() => {

  SubPub.subscribe({
    event: "db::patch::users_units::done",
    listener: ({ response, params }) => {
      const element = state_io.state.chapters.find(c => c.chapter_id === response.users_unit.chapter_id);
      render_progress({ element });
    }
  });

  SubPub.subscribe({
    event: "db::patch::unit::done",
    listener: ({ response, params }) => {
      const element = state_io.state.chapters.find(c => c.chapter_id === response.element.chapter_id);
      render_progress({ element });
      render_assignments({ element });
    }
  });
  
  SubPub.subscribe({
    events: [
      "db::delete::unit::done",
      "db::post::unit::done",
    ],
    listener: ({ response, params }) => {
      const element = state_io.state.chapters.find(c => c.chapter_id === response.element.chapter_id);
      render_progress({ element });
    }
  });

  SubPub.subscribe({
    events: [
      "db::delete::section::done",
    ],
    listener: ({ response, params }) => {
      const element = state_io.state.chapters.find(c => c.chapter_id === params.element.chapter_id);
      render({ element });
    }
  });

  SubPub.subscribe({
    event: "db::patch::section::done",
    listener: ({ response, params }) => {
      const element = state_io.state.chapters.find(c => c.chapter_id === response.element.chapter_id);
      render_sections({ element });
    }
  });

  SubPub.subscribe({
    event: "db::post::section::done",
    listener: ({ response, params }) => {
      const element = state_io.state.chapters.find(c => c.chapter_id === response.section.chapter_id);
      render_sections({ element });
    }
  });

  SubPub.subscribe({
    event: "db::post::quiz_answer::done",
    listener: ({ response, params }) => {
      if (response.users_unit?.check_complete) {
        const element = state_io.state.chapters.find(c => c.chapter_id === response.unit.chapter_id);
        render({ element });
      }
    }
  })

})();

function render ({ element, container_dom }) {
  let arrayWithMatchingUnits = state_io.state.arrayWithMatchedUnits;
  let arrayUnitChapterID = [];
  if(arrayWithMatchingUnits){
    arrayUnitChapterID = arrayWithMatchingUnits.map(e => e.chapter_id)
    console.log(arrayUnitChapterID)
    console.log(element.chapter_id)
  }





  
  if (!container_dom) {
    container_dom = document.getElementById(id_prefix_item + element.chapter_id);
  } else {
    if(arrayWithMatchingUnits && arrayWithMatchingUnits.length > 0 || arrayWithMatchingUnits && arrayWithMatchingUnits.includes("No matches")){
      if(!arrayUnitChapterID.includes(element.chapter_id)){
       container_dom.classList.add("notSearchedFor")
      }
    }



    container_dom.id = id_prefix_item + element.chapter_id;
    container_dom.classList.add("chapter_list_item");
    container_dom.classList[element.done ? "add" : "remove"]("ready");

    container_dom.addEventListener("click", expand_compress_chapter);
    function expand_compress_chapter () {
      container_dom.classList.toggle("expanded");
      state_io.set_class_expanded_chapter(element, container_dom.classList.contains("expanded"));
    }
  }

  const action = state_io.get_class_expanded_chapter(element) ? "add" : "remove";
  container_dom.classList[action]("expanded");

  container_dom.innerHTML = `
    <div class="chapter_top"></div>
    <ul class="section_list"></ul>
  `;


  // TOP
  render_top({ element });

  // SECTIONS
  render_sections({ element });

}
function render_sections ({ element }) {
  
  const sections = state_io.get_chapter_sections(element.chapter_id);
  const dom = document.getElementById(id_prefix_item + element.chapter_id);
  const list_dom = dom.querySelector("ul.section_list");

  list_dom.innerHTML = "";
  sections.forEach(section => {

    const container_dom = document.createElement("li");
    list_dom.append(container_dom);
    content_section_item.render({ element: section, container_dom })

  });

  // ADD SECTION
  
  const container_dom = document.createElement("li");
  container_dom.classList.add("add_section");
  container_dom.innerHTML = `
    <button class="teacher">+ SECTION</button>
  `;
  list_dom.append(container_dom);
  
  container_dom.querySelector("button").addEventListener("click", add_section);
  function add_section (event) {
    event.stopPropagation();
    SubPub.publish({
      event: "db::post::section::request",
      detail: { params: { chapter: element }}
    });
  }

}
function render_top ({ element }) {

  const container_dom = document.getElementById(id_prefix_item + element.chapter_id);
  const top_dom = container_dom.querySelector(".chapter_top");

  top_dom.innerHTML = `
    <button class="button_edit teacher">EDIT</button>
    <button class="button_delete teacher">DELETE</button>
    <h2>Kapitel ${state_io.bullet_number_element(element)}. ${element.name}</h2>
    <div class="assignments_progress">
      <div class="assignments">
        <ul></ul>
      </div>
      <div class="progress">
        <ul></ul>
      </div>
    </div>
    <button class="expand_compress"><img src="./media/expand_compress.png"></button>
  `;

  // FILL ASSIGNMENTS & PROGRESS
  render_assignments({ element });
  render_progress({ element });


  // DELETE
  top_dom.querySelector(".button_delete").addEventListener("click", delete_chapter);
  function delete_chapter (event) {
    event.stopPropagation();
    if (!confirm("DELETE CHAPTER? No undos!")) return;

    SubPub.publish({
      event: "db::delete::chapter::request",
      detail: { params: { element } }
    });
  }

  // EDIT
  top_dom.querySelector(".button_edit").addEventListener("click", open_editor);
  function open_editor (event) {
    event && event.stopPropagation();
    SubPub.publish({
      event: "render::editor",
      detail: { element }
    });
  }

  // THIS SPECIFIC CHAPTER EDITING?
  let is_editing = utils.get_parameter("edit_kind") && utils.get_parameter("edit_kind") === "chapter";
  is_editing = is_editing && utils.get_parameter("edit_id") && utils.get_parameter("edit_id") === element.chapter_id;
  is_editing && open_editor();

}
function render_assignments ({ element }) {

  const container_dom = document.getElementById(id_prefix_item + element.chapter_id);
  const asses_dom = container_dom.querySelector(".chapter_top .assignments ul");
  asses_dom.innerHTML = "";

  const assignments = state_io.get_chapter_assignments(element.chapter_id);
  assignments.forEach(a => {

    const ass_dom = document.createElement("li");
    const uu = state_io.state.users_units.find(uu => uu.unit_id === a.unit_id);
    
    ass_dom.innerHTML = `
      <div class="status_mark">
        <div></div>
        <div></div>
      </div>
    `;

    const is_complete = !!uu?.check_complete;
    ass_dom.classList[is_complete ? "add" : "remove"]("status_complete");

    // ass_dom.dataset.user_unit = JSON.stringify(uu);
    ass_dom.addEventListener("click", access_assignment);
    function access_assignment (event) {
      event.stopPropagation();
      SubPub.publish({
        event: "render::modal::new_unit",
        detail: { element: a }
      });
    }

    asses_dom.append(ass_dom);

  });

}

function render_progress ({ element }) {


  const container_dom = document.getElementById(id_prefix_item + element.chapter_id);
  const progress_dom = container_dom.querySelector(".chapter_top .progress ul");
  progress_dom.innerHTML = "";
  
  const units = state_io.state.units.filter(u => u.chapter_id === element.chapter_id)
                .sort((a, b) => {    
                  return 10 * parseInt(a.section_spot) + parseInt(a.unit_spot) > 10 * parseInt(b.section_spot) + parseInt(b.unit_spot);
                });

  units.forEach(u => {

    const one_line_dom = document.createElement("li");

    one_line_dom.classList.add(u.kind);
    u.is_stop_quiz && one_line_dom.classList.add("stop_quiz");

    const users_unit = state_io.state.users_units.find(uu => uu.unit_id === u.unit_id);
    if (users_unit) {
      one_line_dom.classList[users_unit.check_question ? "add" : "remove"]("status_question");
      one_line_dom.classList[users_unit.check_complete ? "add" : "remove"]("status_complete");
      one_line_dom.classList[(!users_unit.check_question && !users_unit.check_complete) ? "add" : "remove"]("status_default");
    } else {
      one_line_dom.classList.add("status_default");
    }
    
    const is_empty = state_io.is_unit_empty(u);
    one_line_dom.classList[is_empty ? "add" : "remove"]("status_empty");
    progress_dom.append(one_line_dom);
    
  });

}
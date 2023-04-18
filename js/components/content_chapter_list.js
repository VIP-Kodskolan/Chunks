import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";
import utils from "../utils/utils.js";

export default {}

// INIT
;(() => {

  SubPub.subscribe({
    events: ["db::get::course::done", "render::new_view"],
    listener: render
  });

  SubPub.subscribe({
    events: ["db::delete::course::done"],
    listener: render_empty
  });

  SubPub.subscribe({
    events: [ "db::delete::chapter::done" ],
    listener: render
  });

  SubPub.subscribe({
    event: "db::post::chapter::done",
    listener: render
  });

  SubPub.subscribe({
    event: "filter_chapters",
    listener: render
  });

  SubPub.subscribe({
    event: "db::patch::section::done",
    listener: ({ response, params }) => {
      if (params.updated_fields.some(uf => uf.field === "chapter_id")) {
        render();
      }
    }
  });

})();

function render_empty () {

  const dom = document.querySelector("#content_chapter_list");
  dom.innerHTML = "";

}

function render (data) {

  const dom = document.querySelector("#content_chapter_list");
  dom.innerHTML = `
    <div class="top">
      KAPITEL I KURSEN
    </div>
    <ul></ul>
  `;

  let { chapters } = state_io.state;
  const list_dom = document.querySelector("#content_chapter_list > ul");

  let filter = data.filtering !== undefined ? data.filtering : false ;
  filter !== false ? chapters = filterChapters(filter, chapters): false ; 

  list_dom.innerHTML = "";

  chapters.forEach(chapter => {
    const container_dom = document.createElement("li");
    list_dom.append(container_dom);

    SubPub.publish({
      event: "render::content_chapter_list_item",
      detail: {element: chapter, container_dom}
    });

  });

  // ADD CHAPTER
  const button_add_chapter_dom = document.createElement("button");
  button_add_chapter_dom.classList.add("teacher");
  button_add_chapter_dom.innerHTML = "+ CHAPTER";
  list_dom.append(button_add_chapter_dom);
  button_add_chapter_dom.addEventListener("click", add_chapter);

  function add_chapter () {
    SubPub.publish({
      event: "db::post::chapter::request",
      detail: { params: { course: state_io.state.course } }
    });
  }

}

function filterChapters (filter, chapters){

  let { units } = state_io.state;

  if (filter === "Completed") {

    return chapters.filter(chapter => {
        let unitsInChapter = units.filter(unit => unit.chapter_id === chapter.chapter_id);
        let allUnitsComplete = unitsInChapter.every(unit => unit.check_complete);
        return allUnitsComplete;
    });

  }

  if (filter === "UnCompleted") {

    return chapters.filter(chapter => {
      let unitsInChapter = units.filter(unit => unit.chapter_id === chapter.chapter_id);
      let unitUnCompleted = unitsInChapter.some(unit => !unit.check_complete);
      return unitUnCompleted;
    });

  }

  if ( filter === "Questions") {

    return chapters.filter(chapter => {
      let unitsInChapter = units.filter(unit => unit.chapter_id === chapter.chapter_id);
      let unitQustion = unitsInChapter.some(unit => unit.check_question);
      return unitQustion;
    });
  
  }

  return chapters

}
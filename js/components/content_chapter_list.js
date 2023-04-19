import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";
import utils from "../utils/utils.js";
import content_chapter_list_item from "../components/content_chapter_list_item.js";

export default {};

// INIT
(() => {
  SubPub.subscribe({
    events: ["db::get::course::done", "render::new_view"],
    listener: render,
  });

  SubPub.subscribe({
    events: ["db::delete::course::done"],
    listener: render_empty,
  });

  SubPub.subscribe({
    events: ["db::delete::chapter::done"],
    listener: render_chapters,
  });

  SubPub.subscribe({
    event: "db::post::chapter::done",
    listener: render_chapters,
  });

  SubPub.subscribe({
    event: "db::patch::chapter::done",
    listener: render_chapters,
  });

  SubPub.subscribe({
    event: "db::patch::section::done",
    listener: ({ response, params }) => {
      if (params.updated_fields.some((uf) => uf.field === "chapter_id")) {
        render_chapters();
      }
    },
  });

  SubPub.subscribe({
    event: "state::patch::filter::done",
    listener: render_chapters,
  });
})();

function render_empty() {
  const dom = document.querySelector("#content_chapter_list");
  dom.innerHTML = "";
}
function render() {
  const dom = document.querySelector("#content_chapter_list");
  dom.innerHTML = `
    <div class="top">
      KAPITEL I KURSEN
    </div>
    <ul></ul>
  `;

  // CHAPTERS
  render_chapters();
}
function render_chapters() {
   console.log(state_io.state.button)
   
  const { chapters } = state_io.state;

  let arrayToPrint = chapters;
  const allUnits = state_io.state.units;
  const allChapters = state_io.state.chapters;
  let finishedChapters = [];



  // console.log(chapters)
  // console.log(state_io.state.users_units)
  let arrayWithQuestions = [];
  let arrayWithFinished = [];

  if (state_io.state.button == "questions") {
   console.log("vi är inne i knappen");
  //  console.log(state_io.state.button);

let allUserUnits = state_io.state.users_units;

let arrayWithQuestions = chapters.filter(chapter => {
let matchingUnits = allUserUnits.filter(unit => unit.chapter_id == chapter.chapter_id && unit.check_question)

return matchingUnits.length > 0
})

/*
    state_io.state.users_units.forEach((unit) => {
      if (unit.check_question == true) {
        chapters.forEach((chapter) => {
          if (chapter.chapter_id == unit.chapter_id) {
           // console.log(chapter);
            arrayWithQuestions.push(chapter);
          }
        });
      }
    });
*/

    arrayToPrint = arrayWithQuestions;
    state_io.state.button = "";
  } else {
    console.log("knappen är återställd");
  }

  if (state_io.state.button == "finished") {
 //   console.log(state_io.state.units);
console.log(state_io.state.button)
    allChapters.forEach(chapter => {
      let chapterUnits = allUnits.filter((unit) => unit.chapter_id == chapter.chapter_id);
     console.log(chapterUnits)
  
   //  console.log(chapterUnits)
  //console.log(JSON.stringify(chapterUnits))
    let completeUnits =  chapterUnits.filter(units => units.check_complete)
  
   // console.log(completeUnits)
  
    });
  }

  const list_dom = document.querySelector("#content_chapter_list > ul");
  // console.log(arrayToPrint);
  list_dom.innerHTML = "";
  arrayToPrint.forEach((chapter) => {
    const container_dom = document.createElement("li");
    list_dom.append(container_dom);
    content_chapter_list_item.render({ element: chapter, container_dom });
  });

  // ADD CHAPTER
  const button_add_chapter_dom = document.createElement("button");
  button_add_chapter_dom.classList.add("teacher");
  button_add_chapter_dom.innerHTML = "+ CHAPTER";
  list_dom.append(button_add_chapter_dom);
  button_add_chapter_dom.addEventListener("click", add_chapter);
  function add_chapter() {
    SubPub.publish({
      event: "db::post::chapter::request",
      detail: { params: { course: state_io.state.course } },
    });
  }
}

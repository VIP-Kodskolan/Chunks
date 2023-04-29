import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";
import utils from "../utils/utils.js";
//  import content_chapter_list_item from "../components/content_chapter_list_item.js";


export default {}

// INIT
;(() => {

  SubPub.subscribe({
    events: ["db::get::course::done", "render::new_view"],
    listener: render_chapters,
  });

  SubPub.subscribe({
    events: ["db::delete::course::done"],
    listener: render_empty
  });

  SubPub.subscribe({
    events: [ "db::delete::chapter::done" ],
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
      if (params.updated_fields.some(uf => uf.field === "chapter_id")) {
        render_chapters;
      }
    }
  });

  SubPub.subscribe({
    event: "state::patch::filter_chapters::done",
    listener: render_chapters,
  });

  SubPub.subscribe({
    event: "db::patch::users_units::done",
    listener: render_chapters,
  })


})();

function render_empty () {

  const dom = document.querySelector("#content_chapter_list");
  dom.innerHTML = "";

}

function render_chapters () {
  
  const dom = document.querySelector("#content_chapter_list");
  dom.innerHTML = `
    <div class="top">
      KAPITEL I KURSEN
    </div>
    <ul></ul>
  `;

  let chapter_filter = state_io.state.chapter_filter
  const { chapters } = state_io.state;
  let filteredChapters = [];

  if(chapter_filter == "all_done"){filteredChapters.push(...showChaptDone())} 
  else if(chapter_filter == "not_done"){filteredChapters.push(...showChaptNoDone())} 
  else if(chapter_filter == "questions"){filteredChapters.push(...showChaptQuestion())}
  else{filteredChapters = chapters};

  const list_dom = document.querySelector("#content_chapter_list > ul");
  list_dom.innerHTML = "";

  //console.log(filteredChapters);
  filteredChapters.forEach(chapter => {

    const container_dom = document.createElement("li");
    list_dom.append(container_dom);

      SubPub.publish({
      event: "render::chapter_list_item",
      detail: { element: chapter, container_dom }

      //eller
      //content_chapter_list_item.render({ element: chapter, container_dom });
    })
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

function showChaptQuestion(){
  let allUnits = state_io.state.users_units;
  let allChapters = state_io.state.chapters;
  let questionUnits = [];
  
  allChapters.forEach(chapter => {
    let chapterUnits = allUnits.filter(unit => unit.chapter_id === chapter.chapter_id);

    chapterUnits.forEach(unit => {
      if(unit.check_question === true){
        questionUnits.push(chapter);
      }
    });
  });
  return questionUnits;
  }

function showChaptDone(){
  let allUnits = state_io.state.units;
  let allChapters = state_io.state.chapters;
  let chaptersCompl = [];

  allChapters.forEach(chapter => {
      let chapterUnits = allUnits.filter(unit => unit.chapter_id === chapter.chapter_id);
      let completeUnits = [];

      //picks out units which are all done in one chapter
      chapterUnits.forEach(unit => {
          if (unit.check_complete === true){completeUnits.push(unit);}
        })

    if (chapterUnits.length == completeUnits.length && chapterUnits.length !== 0){
        chaptersCompl.push(chapter);
      }
  });
  return chaptersCompl;
}

function showChaptNoDone(){
  let allUnits = state_io.state.units;
  let allChapters = state_io.state.chapters;
  let noDoneChapters = [];
  
  allChapters.forEach(chapter => {
    let chapterUnits = allUnits.filter(unit => unit.chapter_id === chapter.chapter_id);
    let doneUnits = [];


    chapterUnits.forEach(unit => {
      if(unit.check_complete === true){doneUnits.push(unit);}
    });

    if (doneUnits.length !== chapterUnits.length){
      noDoneChapters.push(chapter);
    }
  });
  return noDoneChapters;
}


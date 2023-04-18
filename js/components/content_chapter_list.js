import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";
import utils from "../utils/utils.js";
import content_chapter_list_item from "../components/content_chapter_list_item.js";

export default {};

// INIT
(() => {
  SubPub.subscribe({
    event: ["toggle::notes"],
    listener: () => {
      document.querySelector("#notes_div").classList.toggle("show_notes");
    },
  });

  SubPub.subscribe({
    events: ["db::get::course::done"],
    listener: fillNotes,
  });

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
    event: "state::patch::chapter_filter::done",
    listener: render_chapters,
  })

  SubPub.subscribe({
    event: "db::patch::users_units::done",
    listener: render_chapters,
  })

  SubPub.subscribe({
    event: "db::patch::section::done",
    listener: ({ response, params }) => {
      if (params.updated_fields.some((uf) => uf.field === "chapter_id")) {
        render_chapters();
      }
    },
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
  let { chapters } = state_io.state;
  const list_dom = document.querySelector("#content_chapter_list > ul");
  const filter = state_io.state.filter
  if(filter !== undefined){
    chapters = filtered_chapters(chapters, filter)
  }
  

  list_dom.innerHTML = "";
  chapters.forEach((chapter) => {
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

function filtered_chapters(chapters, filter){
  let filtered_chapters = [];
  switch (filter) {
    case "Completed":
      chapters.forEach((c) => {
        if (
          filter_bool(c, filter)
        ) {
          filtered_chapters.push(c)
        } 
      });
      break;

    case "Unfinished":
      chapters.forEach((c) => {
        if (
          filter_bool(c, filter)
        ) {
          filtered_chapters.push(c)
        } 
      });
      break;

    case "Questions":
      chapters.forEach((c) => {
        if (
          filter_bool(c, filter)
        ) {
          filtered_chapters.push(c)
        } 
      });
      break;
    default:
      return chapters
  }
  return filtered_chapters
}

function filter_bool (chapter, filter){
  const units = state_io.state.users_units
  const chapter_units = units.filter(u => u.chapter_id == chapter.chapter_id)
  switch(filter){
    case "Completed":
      const all_units = state_io.state.units
      const all_chapter_units = all_units.filter(u => u.chapter_id == chapter.chapter_id)
      const completed_units = chapter_units.filter(u => u.check_complete)
      if(all_chapter_units.length !== completed_units.length){
        return false;
      } else{
        return true
      }
    case "Unfinished":
      if(chapter_units.some(u => u.check_complete)){
        return false;
      } else{
        return true
      }
    case "Questions":
      if (chapter_units.some(u => u.check_question)){
        return true
      } else{
        return false
      }

  }
}

function fillNotes() {
  document.querySelector("#notes_div").innerHTML = ""
  const { chapters, users_units } = state_io.state;
  for (let note of users_units) {
    for (let chapter of chapters) {
      if (note.chapter_id === chapter.chapter_id) {
        let noteDiv = document.createElement("div");
        let chunkLink = document.createElement("a");
        let noteText = document.createElement("p");

        noteDiv.classList.add("note");
        chunkLink.href = `https://maumt.se/chunks/?course=${chapter.course_id}&unit=${note.unit_id}`;
        chunkLink.textContent = `${chapter.name} chunk:${note.unit_id}`;
        noteText.textContent = note.notes;

        noteDiv.append(chunkLink, noteText);

        document.querySelector("#notes_div").append(noteDiv);
      }
    }
  }
}

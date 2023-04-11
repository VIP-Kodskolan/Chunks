import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";
import utils from "../utils/utils.js";

export default {};

// INIT
(() => {
  SubPub.subscribe({
    event: "db::get::course::done",
    listener: render,
  });

  SubPub.subscribe({
    event: "db::patch::course::done",
    listener: render,
  });

  SubPub.subscribe({
    event: "db::delete::course::done",
    listener: reset_window_history,
  });

  SubPub.subscribe({
    event: "user_ok",
    listener: render_empty,
  });

  SubPub.subscribe({
    events: [
      "db::patch::users_units::done",
      "db::delete::chapter::done",
      "db::post::unit::done",
    ],
    listener: render_progress,
  });
})();

function render({ response, params }) {
  let { course } = response;
  if (!course) course = response.element;

  const dom = document.querySelector("#content_course_open");

  const canvas_url = course.canvas_url
    ? course.canvas_url.startsWith("https://")
      ? course.canvas_url
      : `https://${course.canvas_url}`
    : "";

  const canvas_link_html = canvas_url
    ? `<a href="${canvas_url}">Link to Canvas</a>`
    : "No canvas link yet";

  dom.innerHTML = `
    <div class="weekly_progress">
      <ul class="weeks"></ul>
      <ul class="units"></ul>
      <div class="units_by_chapters"></div>
    </div>
    <div class="course_info">
      <h2>Course: ${course.name}</h2>
      <h2>(${course.code})</h2>
      <h2>(${course.semester})</h2>
      <div class="canvas_link">${canvas_link_html}</div>
      <button id="course_notes_button">Notes</button>
    </div>
    <div class="control teacher">
      <div class="flexer">
        <button class="button_edit">EDIT COURSE</button>
        <button class="button_delete">DELETE COURSE</button>
      </div>
      </div>
      <div class="filter_buttons">
        <div class="flexer">
          <button class="show_finished_chapters chapBTN">Finished Chapters</button>
          <button class="show_unfinished_chapters chapBTN">Unfinished Chapters</button>
          <button class="show_chapters_with_questions chapBTN">Chapters With Questions</button>
        </div>
      </div>
  `;

  // FILL PROGRESS
  render_progress();

  //TOGGLE NOTES
  dom
    .querySelector("#course_notes_button")
    .addEventListener("click", toggle_notes);

  function toggle_notes() {
    SubPub.publish({
      event: "toggle::notes",
    });
  }
  // EVENT: DELETE
  dom.querySelector(".button_delete").addEventListener("click", delete_course);
  function delete_course() {
    if (!confirm("DELETE COURSE? No undos!")) return;

    SubPub.publish({
      event: "db::delete::course::request",
      detail: { params: { course } },
    });
  }

  // EVENT: EDIT
  dom.querySelector(".button_edit").addEventListener("click", open_editor);
  function open_editor() {
    SubPub.publish({
      event: "render::editor",
      detail: { element: course },
    });
  }

  // EVENT: FILTER
  let chapBTN = Array.from(dom.querySelectorAll(".chapBTN"));
  chapBTN.forEach((e) => e.addEventListener("click", toggle_filter));

  function toggle_filter(event) {
    if (event.target.classList.contains("active")) {
      event.target.classList.remove("active");
    } else {
      let chapBTN = Array.from(document.querySelectorAll(".chapBTN"));

      chapBTN.forEach((e) => e.classList.remove("active"));
      event.target.classList.add("active");
    }
    renderFilter(event.target);
  }

  function renderFilter(element){
    let chapters = state_io.state.chapters;
    let units = state_io.state.units;
    console.log("click");
    if(element.classList.contains("active")){
      switch(element.textContent){
        case "Finished Chapters":
          chapters.forEach(e => {if (units.filter(u => u.chapter_id == e.chapter_id).filter(u => u.check_complete).length != units.filter(u => u.chapter_id == e.chapter_id).length){
            document.querySelector("#chapter_list_id_" + e.chapter_id).style.display = "none"
          } else {document.querySelector("#chapter_list_id_" + e.chapter_id).style.display = "block"}})
          break;
          case "Unfinished Chapters":
            chapters.forEach(e => {if (units.filter(u => u.chapter_id == e.chapter_id).filter(u => u.check_complete).length == units.filter(u => u.chapter_id == e.chapter_id).length){
              document.querySelector("#chapter_list_id_" + e.chapter_id).style.display = "none"
            } else {document.querySelector("#chapter_list_id_" + e.chapter_id).style.display = "block"}})
          break;
          case "Chapters With Questions":
            chapters.forEach(e => {if (units.filter(u => u.chapter_id == e.chapter_id).filter(u => u.check_question).length > 0){
              document.querySelector("#chapter_list_id_" + e.chapter_id).style.display = "block"
            } else {document.querySelector("#chapter_list_id_" + e.chapter_id).style.display = "none"}})
            break;
      }

    } else {
      chapters.forEach(e => document.querySelector("#chapter_list_id_" + e.chapter_id).style.display = "block")
    }
  }

  // THIS SPECIFIC ELEMENT EDITING?
  let is_editing =
    utils.get_parameter("edit_kind") &&
    utils.get_parameter("edit_kind") === "course";
  is_editing =
    is_editing &&
    utils.get_parameter("edit_id") &&
    utils.get_parameter("edit_id") === course.course_id;
  is_editing && open_editor();
}

function render_progress_units_by_chapters(chapters, units, users_units) {
  const chaptersContainer = document.querySelector(
    "#content_course_open .weekly_progress .units_by_chapters"
  );
  chaptersContainer.innerHTML = "";

  const unitsByChapters = {};
  // Group units by chapter_id
  for (const unit of units) {
    const id = unit.chapter_id;

    if (unitsByChapters[id] == undefined) {
      unitsByChapters[id] = [];
    }

    // Add user `checked` interaction values to the unit
    const userUnit = users_units.find((uu) => uu.unit_id === unit.unit_id);
    unit.check_complete = userUnit && userUnit.check_complete;
    unit.check_question = userUnit && userUnit.check_question;

    unitsByChapters[id].push(unit);
  }

  const sortedUnitsByChapters = Object.entries(unitsByChapters).sort((a, b) => {
    const cA = chapters.find((c) => c.chapter_id == a[0]);
    const cB = chapters.find((c) => c.chapter_id == b[0]);
    return cA.spot - cB.spot;
  });

  let chapterCounter = 1;

  for (const [chapter_id, chapter_units] of sortedUnitsByChapters) {
    const chapterContainer = document.createElement("div");
    chapterContainer.className = `chapter chapter-${chapter_id}`;

    // ie. which chapter: 1, 2, n...
    const chapterCounterContainer = document.createElement("div");
    chapterCounterContainer.className = "chapter-counter";
    chapterCounterContainer.textContent = chapterCounter;
    chapterContainer.appendChild(chapterCounterContainer);

    for (const chapter_unit of chapter_units) {
      const unitContainer = document.createElement("div");
      unitContainer.className = `chapter-unit`;

      if (chapter_unit.check_complete) {
        unitContainer.classList.add("check_complete");
      }

      if (chapter_unit.check_question) {
        unitContainer.classList.add("check_question");
      }

      chapterContainer.appendChild(unitContainer);
    }

    chaptersContainer.appendChild(chapterContainer);
    chapterCounter++;
  }
}

function render_progress() {
  render_progress_units_by_chapters(
    state_io.state.chapters,
    state_io.state.units,
    state_io.state.users_units
  );

  const progress_dom = document.querySelector(
    "#content_course_open .weekly_progress ul.units"
  );
  progress_dom.innerHTML = "";

  const units = state_io.state.units.map((u) => {
    return {
      ...u,
      check_complete: state_io.state.users_units.find(
        (uu) => uu.unit_id === u.unit_id
      )?.check_complete,
    };
  });
  // .sort((a, b) => a.check_complete ? -1 : 1);

  units.forEach((u) => {
    const one_line_dom = document.createElement("li");
    one_line_dom.classList[u.check_complete ? "add" : "remove"](
      "status_complete"
    );

    progress_dom.append(one_line_dom);
  });

  const course = state_io.state.course;
  const n_weeks = course.week_count;
  const week_0 = course.week_start;
  const weeks_dom = document.querySelector(
    "#content_course_open .weekly_progress ul.weeks"
  );
  weeks_dom.innerHTML = "";
  for (let i = 0; i < n_weeks; i++) {
    const week_nr = week_0 + i;
    const one_week_dom = document.createElement("li");
    one_week_dom.innerHTML = `V${week_nr}`;

    if (week_nr === utils.get_current_week_number()) {
      one_week_dom.style.fontWeight = "bold";
      one_week_dom.style.color = "#961212";
    }

    weeks_dom.append(one_week_dom);
  }
}
function render_empty() {
  const dom = document.querySelector("#content_course_open");
  dom.innerHTML = `
    <div class="top">
      <h2>No Course Selected</h2>
    </div>
  `;
}
function reset_window_history() {
  utils.push_state_window_history("");
  render_empty();
}

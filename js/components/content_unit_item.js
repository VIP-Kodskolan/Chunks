import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";
import utils from "../utils/utils.js";


export default { render }

const id_prefix_item = "unit_id_";

// INIT
;(() => {

  SubPub.subscribe({
    event: "db::patch::users_units::done",
    listener: ({ response, params }) => {
      const element = state_io.state.units.find(u => u.unit_id === params.unit_id);
      render_status({ element });
    }
  });

  SubPub.subscribe({
    event: "db::post::quiz_answer::done",
    listener: ({ response, params }) => {
      render({ element: response.unit });
    }
  });

})();

function render ({ element, container_dom }) {
  
  const text = {
    video: "VID",
    exercise: "EXE",
    assignment: "ASS",
    quiz: "QUZ"
  }

  if (!container_dom) {
    container_dom = document.getElementById(id_prefix_item + element.unit_id);
  } else {
    container_dom.id = id_prefix_item + element.unit_id;
    container_dom.classList.add("unit_item");
    container_dom.classList.add(element.kind);
    container_dom.classList[element.is_stop_quiz ? "add" : "remove"]("stop_quiz");
    container_dom.addEventListener("click", new_open_modal_unit);
  }

  // STATUS
  render_status({ element });

  // ICON || PROGRESS IF QUIZ
  const icon_html = element.kind === "quiz" ?
                                        `<div class="quiz_progress"></div>` :
                                        `<div class="icon"><img src="./media/${element.kind}.png"></div>`;

  // TITLE || BULLET IF QUIZ
  const title_html = element.kind === "quiz" ?
                                        `<div class="bullet_title">${state_io.bullet_number_element(element)}</div>` :
                                        `<div class="bullet_title">${element.name}</div>` ; 

  // STOP QUIZ?
  // const stop_quiz_class = element.is_stop_quiz ? "stop_quiz" : "";

  container_dom.innerHTML = `
    <div class="content">
      <div class="question_mark"></div>
      ${title_html}
      ${icon_html}
    </div>
  `;

  // FILL QUIZ SUMMARY
  const quiz_progress_dom = container_dom.querySelector(".quiz_progress");
  quiz_progress_dom && render_quiz_progress()
  function render_quiz_progress () {

    const questions = state_io.state.quiz_questions.filter(q => q.unit_id === element.unit_id)
                                                   .sort((a,b) => a.spot > b.spot);

    questions.forEach(question => {
      const status = state_io.get_quiz_question_status(question);
      quiz_progress_dom.innerHTML += `<div class="${status}"></div>`;
    });
    
  }

  // OPEN FROM URL?
  const is_open_url = utils.get_parameter("unit") && utils.get_parameter("unit") == element.unit_id;
  const modal_not_displaying = document.querySelector("#modal").classList.contains("hidden");
  (is_open_url && modal_not_displaying) && open_modal_unit();
  function new_open_modal_unit () {
    SubPub.publish({
      event: "render::modal::new_unit",
      detail: { element: state_io.state.units.find(u => u.unit_id === element.unit_id) } // User may have edited element and it has been updated in State
    });
  }
  function open_modal_unit () {
    SubPub.publish({
      event: "render::modal::unit",
      detail: { element: state_io.state.units.find(u => u.unit_id === element.unit_id) } // User may have edited element and it has been updated in State
    });
  }
}

function render_status ({ element }) {

  const container_dom = document.getElementById(id_prefix_item + element.unit_id);

  const users_unit = state_io.state.users_units.find(u => u.unit_id === element.unit_id);

  if (users_unit) {

    // has question?
    users_unit.check_question ? container_dom.classList.add("unit_with_question") : container_dom.classList.remove("unit_with_question");
    
    // status
    container_dom.classList.add(`unit_status_${users_unit.status}`);

    // completed quiz?
    if (users_unit.check_complete) container_dom.classList.add(`unit_status_4`);
  }
  else {
    container_dom.classList.add(`unit_status_0`);
  }

  state_io.is_unit_empty(element) ? container_dom.classList.add("status_empty") : container_dom.classList.remove("status_empty");

}


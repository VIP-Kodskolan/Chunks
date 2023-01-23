import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";

export default { render_quiz }

// INIT
;(() => {

  SubPub.subscribe({
    event: "db::delete::quiz_option::done",
    listener: ({ response, params }) => {
      const question = state_io.state.quiz_questions.find(q => q.quiz_question_id === response.quiz_question_id);
      render_page({ question });
    }
  });

  SubPub.subscribe({
    event: "db::post::quiz_option::done",
    listener: ({ response, params }) => {
      const quiz_question_id = response.option.quiz_question_id;
      const question = state_io.state.quiz_questions.find(q => q.quiz_question_id === quiz_question_id);
      render_page({ question });
    }
  });

  SubPub.subscribe({
    event: "db::patch::quiz_option::done",
    listener: ({ response, params }) => {
      const quiz_question_id = params.option.quiz_question_id;
      const question = state_io.state.quiz_questions.find(q => q.quiz_question_id === quiz_question_id);
      render_page({ question });
    }
  });

  SubPub.subscribe({
    event: "db::patch::quiz_question::done",
    listener: ({ response, params }) => {
      const unit_id = params.question.unit_id;
      const element = state_io.state.units.find(u => u.unit_id === unit_id);
      render_quiz({ element });
    }
  });

  SubPub.subscribe({
    event: "db::post::quiz_question::done",
    listener: ({ response, params }) => {
      const unit_id = response.quiz_question.unit_id;
      const element = state_io.state.units.find(u => u.unit_id === unit_id);
      render_quiz({ element });
    }
  });

})();

function render_quiz ({ element, container_dom }) {

  if (!container_dom) {
    container_dom = document.getElementById("quiz_editor_id_" + element.unit_id);
  } else {
    container_dom.id = "quiz_editor_id_" + element.unit_id;
    container_dom.classList.add("editor_quiz");
  }

  container_dom.innerHTML = `
    <div>
      <h2>INSTRUCTIONS</h2>
      <p>- Use "Done" as name to mark the quiz as done (ready for students)</p>
      <p>- Saves automatically "onchange"</p>
      <p>- Questions and options accept HTML markup. CSS-class .code is available.</p>
    </div>

    <ul></ul>
  `;

  const list_dom = container_dom.querySelector("ul");

  // PAGES
  const questions = get_unit_quiz_questions({ element });
  for (let i = -1; i < questions.length; i++) {
    const page_dom = document.createElement("li");
    page_dom.classList.add("quiz_page");
    list_dom.append(page_dom);

    const question = questions[i] || null;
    render_page({ question, container_dom: page_dom });
  }

  // ADD PAGE (QUESTION)
  if (questions.length < state_io.Consts.max_n_questions_in_quiz) {

    const add_quiz_question_dom = document.createElement("button");
    list_dom.append(add_quiz_question_dom);
    add_quiz_question_dom.classList.add("add_quiz_question");
    add_quiz_question_dom.innerHTML = "+ QUESTION";
    add_quiz_question_dom.addEventListener("click", add_quiz_question);
    function add_quiz_question () {
      SubPub.publish({
        event: "db::post::quiz_question::request",
        detail: { params: { unit: element } }
      });
    }
  }

}
function render_page({ question, container_dom }) {

  const quiz_question_id = question?.quiz_question_id || "head";
  if (!container_dom) {
    container_dom = document.querySelector(`#quiz_page_id_${quiz_question_id}`);
  } else {
    container_dom.id = `quiz_page_id_${quiz_question_id}`;
  }

  const input_spot_html = question ? `<input type="text" value="${question.spot}" size="2">` : "<label>Spot</label>";
  const textarea_question_html = question ? `<textarea>${question.question}</textarea>` : "<label>Question</label>";
  const options_label_html = question ? "<ul></ul><button class='button_add_option'>ADD OPTION</button>" : "<label>Options (Check correct option)</label>";

  container_dom.innerHTML = `
    <div class="spot">
      ${input_spot_html}
    </div>
    <div class="question">
      ${textarea_question_html}
    </div>
    <div class="options">
      ${options_label_html}
    </div>
  `;


  // PATCH QUESTION
  const spot_input_dom = container_dom.querySelector(".spot input");
  const question_textarea_dom = container_dom.querySelector(".question textarea");
  question && spot_input_dom.addEventListener("change", patch_question);
  question && question_textarea_dom.addEventListener("change", patch_question);
  function patch_question() {

    const _question = {
      ...question,
      question: question_textarea_dom.value,
      spot: spot_input_dom.value
    };

    SubPub.publish({
      event: "db::patch::quiz_question::request",
      detail: { params: { question: {..._question} }}
    });

  }

  // OPTIONS
  const options_list_dom = container_dom.querySelector(".options > ul");
  const options = state_io.state.quiz_options.filter(qo => qo.quiz_question_id === quiz_question_id);
  options.forEach((option, index) => {
    const option_item_dom = document.createElement("div");
    option_item_dom.classList.add("option_item");
    options_list_dom.append(option_item_dom);
    render_option({ option, container_dom: option_item_dom });
  });

  // IS THERE ONE OPTION MARKED AS CORRECT?
  const one_correct = options.some(o => o.correct);
  container_dom.classList[one_correct ? "remove" : "add"]("missing_correct_option");



  // ADD OPTION
  question && container_dom.querySelector(".button_add_option").addEventListener("click", add_option);
  function add_option () {
    SubPub.publish({
      event: "db::post::quiz_option::request",
      detail: { params: { question } }
    });
  }

}
function render_option ({ option, container_dom }) {
  
  const checked = option.correct ? "checked" : "";

  container_dom.innerHTML = `
    <div class="check_correct">
      <input type="checkbox" ${checked}>
    </div>
    <div class="option">
      <textarea>${option.option}</textarea>
    </div>
    <div class="remove">
      <button>DELETE</button>
    </div>
  `;

  // DELETE
  container_dom.querySelector(".remove button").addEventListener("click", remove_option);
  function remove_option () {

    SubPub.publish({
      event: "db::delete::quiz_option::request",
      detail: { params: { option }}
    });

  }

  // PATCH
  const option_textarea_dom = container_dom.querySelector(".option textarea");
  const option_checkbox_dom = container_dom.querySelector(".check_correct input");
  option_textarea_dom.addEventListener("change", patch_option);
  option_checkbox_dom.addEventListener("change", patch_option);
  function patch_option (event) {

    const _option = {
      ...option,
      option: option_textarea_dom.value,
      correct: option_checkbox_dom.checked
    };

    SubPub.publish({
      event: "db::patch::quiz_option::request",
      detail: { params: { option: {..._option} }}
    });

  }


}


function get_unit_quiz_questions ({ element }) {
  return state_io.state.quiz_questions.filter(q => q.unit_id === element.unit_id).sort((a,b) => parseInt(a.spot) > parseInt(b.spot));
}

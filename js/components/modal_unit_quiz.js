import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";

export default { render_quiz }

const prefix_navigation_id = "question_navigation_id_";

// INIT
;(() => {

  SubPub.subscribe({
    events: ["db::post::quiz_answer::done"],
    listener: ({ response, params }) => {
      const { answer } = response;
      const option = state_io.state.quiz_options.find(o => o.quiz_option_id === answer.quiz_option_id);
      const question = state_io.state.quiz_questions.find(q => q.quiz_question_id === option.quiz_question_id);
      const element = state_io.state.units.find(u => u.unit_id === question.unit_id);

      render_question_navigation({ question });
      render_question_content({ question });

      if (option.correct) {
        render_answer_correct({ element });
      }
    }
  });

  SubPub.subscribe({
    events: ["db::delete::quiz_option::done"],
    listener: ({ response, params }) => {
      
      // If option was removed from the question that is showing
      // we need to re-render the options (or the whole question)
      // Otherwise no need to re-render anything
      const { quiz_question_id } = response;
      const content_dom = document.getElementById("quiz_page");
      const current_question = JSON.parse(content_dom.dataset.question);
      if (current_question.quiz_question_id === quiz_question_id) {
        render_question_options({ question: state_io.state.quiz_questions.find(q => q.quiz_question_id === quiz_question_id) });
      }
    
    }
  });

  SubPub.subscribe({
    events: ["db::get::date_time::done"],
    listener: ({ response, params }) => {

      const { question, option } = params;
      const answers = state_io.get_question_answers({ question });

      // Can user answer the question or must she wait?
      const server_now = response.date_time;
      
      if (answers.length > 0) {

        answers.sort((a, b) => Date.parse(a.timestamp) < Date.parse(b.timestamp));
        const last_time = Date.parse(answers[0].timestamp);        
        const WEIRD_TIME_DECALAGE_AT_SQLITE = 60;
        const mins_elapsed = (server_now - last_time) / (60 * 1000) - WEIRD_TIME_DECALAGE_AT_SQLITE;

        if (mins_elapsed < state_io.Consts.mins_after_incorrect_answer) {
          const wait = state_io.Consts.mins_after_incorrect_answer - mins_elapsed;
          const wait_mins = Math.floor(wait);
          const wait_secs = Math.round((wait - wait_mins) * 60);
          alert(`You need to wait ${wait_mins < 10 ? "0" + wait_mins : wait_mins}:${wait_secs < 10 ? "0" + wait_secs : wait_secs} minutes before you can answer again`);
          return;
        }
      }

      SubPub.publish({
        event: "db::post::quiz_answer::request",
        detail: { params: { option, user_id: state_io.state.user.user_id }}
      });

    }
  })

  SubPub.subscribe({
    events: ["db::patch::quiz_question::done", "db::patch::quiz_option::done"],
    listener: ({ response, params }) => {
      const unit_id = params.question?.unit_id || params.option.unit_id;
      const element = state_io.state.units.find(u => u.unit_id == unit_id);
      console.log(element);
      render_quiz({ element });
    }
  })

})();

function render_quiz({ element, container_dom }) {

  if (!container_dom) {
    container_dom = document.querySelector("#modal_quiz");
  } else {
    container_dom.id = "modal_quiz";
  }

  container_dom.innerHTML = `
    <div id="quiz_navigation"></div>
    <div id="quiz_page"></div>
    <div id="quiz_option_correct" class="hidden"></div>
  `;

  const current_spot = get_current_spot({ element });
  
  // QUESTIONS (NAVIGATION)
  const questions = get_unit_quiz_questions({ element });
  const navigation_dom = container_dom.querySelector("#quiz_navigation");
  questions.forEach((question, index) => {
    const nav_item_dom = document.createElement("div");
    navigation_dom.append(nav_item_dom);
    if (index >= current_spot) {
      nav_item_dom.classList.add("inactive");
    }
    render_question_navigation({ question, container_dom: nav_item_dom });
  });

  // GO TO CURRENT PAGE
  navigation_dom.querySelector(`.question_navigation:nth-of-type(${current_spot})`).click();

}

function render_question_navigation ({ question, container_dom }) {

  if (container_dom === undefined) {
    container_dom = document.getElementById(prefix_navigation_id + question.quiz_question_id);
  } else {
    container_dom.classList.add("question_navigation");
    container_dom.id = prefix_navigation_id + question.quiz_question_id;
    container_dom.innerHTML = `
      <div class="number">
        <div class="content">${question.spot}</div>
      </div>
      <div class="selected_mark"></div>
    `;

    container_dom.addEventListener("click", open_question);
    function open_question () {
      document.querySelectorAll(".question_navigation").forEach(qn => qn.classList.remove("selected"));
      container_dom.classList.add("selected");
      render_question_content({ question });
    }  
  }

  // ANSWERED STATUS
  const status = state_io.get_quiz_question_status(question);
  ["answered_no", "answered_correct", "answered_incorrect"].forEach(s => container_dom.classList.remove(s));
  container_dom.classList.add(status);

}
function render_question_content ({ question }) {

  const content_dom = document.getElementById("quiz_page");
  content_dom.dataset.question = JSON.stringify(question);

  // const question_html = question.question.replace(/ /g, "&nbsp;");
  content_dom.innerHTML = `
    <div class="question">
      <div class="spot">(${question.spot})</div>
      <div class="text">${question.question}</div>
    </div>
    <div class="options"></div>
  `;

  // Show spaces in (potential) code in question text
  let code_text = content_dom.querySelector(".text .code")?.innerHTML;
  code_text && (content_dom.querySelector(".text .code").innerHTML = content_dom.querySelector(".text .code").innerHTML.replace(/ /g, "&nbsp;"));


  render_question_options({ question });

  // const element = state_io.state.units.find(u => u.unit_id === question.unit_id); 
  // render_answer_correct({ element });
}
function render_question_options({ question }) {

  const options = get_question_options({ question });
  const question_solved = is_question_solved(question.quiz_question_id);

  const container_dom = document.querySelector("#quiz_page .options");
  container_dom.innerHTML = "";

  options.forEach(option => {
    
    const answer = state_io.state.quiz_answers.find(a => a.quiz_option_id === option.quiz_option_id);
    
    const option_dom = document.createElement("div");
    container_dom.append(option_dom);
    option_dom.classList.add("option");

    // PASSIVE?
    (question_solved || !!answer) && option_dom.classList.add("passive");

    // STATUS ANSWERED
    const status_answered = answer ? 
                    (option.correct ? "correct" : "incorrect") :
                    "";
    status_answered && option_dom.classList.add(status_answered);

    // HTML CONTENT
    option_dom.innerHTML = `
      <div class="content">
        ${option.option}
      </div>
    `;

    // EVENT: CLICK
    !question_solved && option_dom.addEventListener("click", choose_option);
    function choose_option() {

      SubPub.publish({
        event: "db::get::date_time::request",
        detail: { params: { question, option } }
      });

    }

  });

}
function render_answer_correct({ element }) {

  const message = is_quiz_solved({ element }) ? "Quiz Complete!" : "Next Question";

  document.getElementById("quiz_option_correct").innerHTML = `
    <div class="content">
      <div>Correct!</div>
      <button>${message}</button>
    </div>
  `;
  document.getElementById("quiz_option_correct").classList.remove("hidden");

  document.querySelector("#quiz_option_correct button").addEventListener("click", next_question);
  function next_question () {
    render_quiz({ element });
  }

}


function get_unit_quiz_questions ({ element }) {
  return state_io.state.quiz_questions.filter(q => q.unit_id === element.unit_id).sort((a,b) => a.spot - b.spot);
}
function get_current_spot ({ element }) {

  const questions = get_unit_quiz_questions({ element });
  const unsolved_questions = questions.filter( q => !is_question_solved(q.quiz_question_id) );
  unsolved_questions.sort( (a,b) => a.spot > b.spot );
  const spot = unsolved_questions[0]?.spot || questions.length;
  return spot;

}
function get_question_options ({ question }) {
  return state_io.state.quiz_options.filter(o => o.quiz_question_id === question.quiz_question_id);
}
function is_quiz_solved ({ element }) {

  const quiz_id = element.unit_id;
  const quiz_question_ids = state_io.state.quiz_questions.filter( q => q.unit_id === quiz_id ).map( q => q.quiz_question_id );
  return !quiz_question_ids.some(q => !is_question_solved(q));

}
function is_question_solved (quiz_question_id) {

  if (!is_question_answered(quiz_question_id)) { return false; }

  return state_io.state.quiz_answers.some(a => {
    const option = state_io.state.quiz_options.find(o => o.quiz_option_id === a.quiz_option_id);
    return option.quiz_question_id === quiz_question_id && option.correct;
  });

}
function is_question_answered (quiz_question_id) {

  return state_io.state.quiz_answers.some(a => {
    const option = state_io.state.quiz_options.find(o => o.quiz_option_id === a.quiz_option_id);
    return option.quiz_question_id === quiz_question_id;
  });

}

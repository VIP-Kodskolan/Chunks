import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";
import utils from "../utils/utils.js";
import content_chapter_list_item from "../components/content_chapter_list_item.js";


export default {}

  // INIT
  ; (() => {

    SubPub.subscribe({
      events: ["db::get::course::done", "render::new_view"],
      listener: render
    });

    SubPub.subscribe({
      events: ["db::delete::course::done"],
      listener: render_empty
    });

    SubPub.subscribe({
      events: ["db::delete::chapter::done"],
      listener: render_chapters
    });

    SubPub.subscribe({
      event: "db::post::chapter::done",
      listener: render_chapters
    });

    SubPub.subscribe({
      event: "db::patch::chapter::done",
      listener: render_chapters
    });

    SubPub.subscribe({
      event: "db::patch::section::done",
      listener: ({ response, params }) => {
        if (params.updated_fields.some(uf => uf.field === "chapter_id")) {
          render_chapters();
        }
      }
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
    <div class="top" id="chapter_filters">
      <div>
        <input type="checkbox" id="opt_complete" name="selector">
        <label for="opt_complete">Avklarade</label>
      </div>

      <div>
        <input type="checkbox" id="opt_non_complete" name="selector">
        <label for="opt_non_complete">Icke-avklarade</label>
      </div>

      <div>
        <input type="checkbox" id="opt_question" name="selector">
        <label for="opt_question">Frågor</label>
      </div>
    </div>
    <ul></ul>
  `;

  // CHAPTERS
  render_chapters();

  // CHAPTER FILTERS
  chapter_filters(document.querySelector('#chapter_filters'));

}

function chapter_filters(parent_div) {

  let inputs = parent_div.querySelectorAll('input');

  inputs.forEach(input => {
    input.addEventListener('change', function () {
      if (this.checked == true) {
        check_status();
        inputs.forEach(box => {
          if (box != this) {
            box.disabled = true;
            box.classList.add('opt_blocked');
          }
        });
        show_selected_chapters(this);
        let text = document.querySelector(`#${this.id} + label`).innerText;
        let altered = text.split(" (");
        localStorage.setItem('checkbox_text', altered[0]);
      } else {
        inputs.forEach(box => {
          box.disabled = false;
          box.classList.remove('opt_blocked');
        });
        show_all_chapters();
        document.querySelector(`#${this.id} + label`).innerText = localStorage.getItem('checkbox_text');
      }
    });
  });

}

function render_chapters() {

  const { chapters } = state_io.state;
  const list_dom = document.querySelector("#content_chapter_list > ul");

  list_dom.innerHTML = "";
  chapters.forEach(chapter => {

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
      detail: { params: { course: state_io.state.course } }
    });
  }

}

// CHECK CHAPTER STATUS
function check_status() {
  let chapters = document.querySelectorAll(".chapter_list_item");

  chapters.forEach(chapter => {
    let progress_bar = chapter.querySelector('.progress');
    let progress_item = progress_bar.querySelectorAll('li');
    progress_item.forEach(item => {
      if (!item.classList.contains('status_complete')) {
        chapter.classList.add('not_complete');
      }

      if (item.classList.contains('status_question')) {
        chapter.classList.add('has_question');
      }
    });

    if (progress_bar.querySelectorAll('.status_question').length == 0 && chapter.classList.contains('has_question')) {
      chapter.classList.remove('has_question');
    };

    if (progress_bar.querySelectorAll('.status_complete').length === chapter.querySelectorAll('.progress li').length) {
      chapter.classList.remove('not_complete');
    }
  });
}

function show_selected_chapters(checkbox) {
  let box_id = checkbox.id;
  let not_complete = document.querySelectorAll('.not_complete');
  let complete = document.querySelectorAll('.chapter_list_item:not(.not_complete)');
  let all_chapters = document.querySelectorAll('.chapter_list_item');

  switch (box_id) {

    case "opt_complete":
      not_complete.forEach(chapter => chapter.classList.add('hide'));
      break;

    case "opt_non_complete":
      complete.forEach(chapter => chapter.classList.add('hide'));
      break;

    case "opt_question":
      all_chapters.forEach(chapter => {
        if (!chapter.classList.contains('has_question')) {
          chapter.classList.add('hide');
        }
      });
      break;

    default:
      break;
  }

  let all_visible = document.querySelectorAll('.chapter_list_item:not(.hide)');
  document.querySelector(`#${box_id} + label`).innerText += " (" + all_visible.length + ")";

}

function show_all_chapters() {
  let chapters = document.querySelectorAll(".chapter_list_item");
  chapters.forEach(chapter => {
    if (chapter.classList.contains('hide')) {
      chapter.classList.remove('hide');
    }
  });

}

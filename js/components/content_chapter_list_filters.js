import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";
import utils from "../utils/utils.js";

export default {};

// INIT
; (() => {

    SubPub.subscribe({
        events: [
            "db::patch::section::done",
            "db::post::chapter::done",
            "db::delete::chapter::done",
            "db::delete::course::done",
            "render::new_view",
            "db::get::course::done",
            "db::post::unit::done",
        ],
        listener: render
    });

    SubPub.subscribe({
        event: "db::patch::users_units::done",
        listener: check_status
    });
    SubPub.subscribe({
        event: "db::patch::users_units::done",
        listener: check_updated
    });

})();

function render() {

    const header = document.querySelector("#chapter_filters");
    header.innerHTML = `
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

    // CHAPTER FILTERS
    chapter_filters(document.querySelector('#chapter_filters'));

}

function chapter_filters(parent_div) {

    const inputs = parent_div.querySelectorAll('input');

    inputs.forEach(input => {
        input.setAttribute('label', document.querySelector(`#${input.id} + label`).innerText);
        input.addEventListener('change', function () {
            if (this.checked == true) {
                check_status();
                inputs.forEach(box => {
                    if (box != this) {
                        box.disabled = true;
                        box.classList.add('opt_blocked');
                    }
                });
                setTimeout(() => {
                    show_selected_chapters(this);
                }, 20);
            } else {
                inputs.forEach(box => {
                    box.disabled = false;
                    box.classList.remove('opt_blocked');
                });
                show_all_chapters();
                document.querySelector(`#${this.id} + label`).innerText = this.attributes['label'].nodeValue;
            }
        });
    });

}

// CHECK CHAPTER STATUS
function check_status() {

    const { chapters } = state_io.state;

    chapters.forEach(chapter => {

        let chapter_units = state_io.get_chapter_units(chapter.chapter_id);

        setTimeout(() => {

            let is_complete = chapter_units.filter(unit => unit.check_complete);
            let has_questions = chapter_units.filter(unit => unit.check_question);

            if (is_complete.length < chapter_units.length) {
                // TODO: fix when chapter goes from non-complete to complete
                document.querySelector(`#chapter_list_id_${chapter.chapter_id}`).classList.add('not_complete');
            }

            if (has_questions.length >= 1) {
                document.querySelector(`#chapter_list_id_${chapter.chapter_id}`).classList.add('has_question');
            }
        }, 10);

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
    document.querySelector(`#${box_id} + label`).innerText = checkbox.attributes['label'].nodeValue + " (" + all_visible.length + ")";

    if (all_visible.length == 0) {
        no_filter_results();
    }

}

function show_all_chapters() {
    if (document.querySelector('.no_results') !== null) {
        document.querySelector('.no_results').remove();
    };

    let chapters = document.querySelectorAll(".chapter_list_item");
    chapters.forEach(chapter => {
        if (chapter.classList.contains('hide')) {
            chapter.classList.remove('hide');
        }
    });

}

function no_filter_results() {
    let li_no_results = document.createElement('li');
    li_no_results.classList.add('no_results');
    li_no_results.innerHTML = `
        <img src='https://cdn-icons-png.flaticon.com/512/8731/8731782.png'>
        <p>Här var det tomt...</p>
    `;
    document.querySelector('#content_chapter_list > ul').append(li_no_results);
}

function check_updated() {
    let inputs = document.querySelectorAll('#chapter_filters input');
    inputs.forEach(input => {
        if (input.checked == true) {
            check_status();
            setTimeout(() => {
                show_selected_chapters(input);
            }, 20);
        } else {
            show_all_chapters();
        }
    });
}
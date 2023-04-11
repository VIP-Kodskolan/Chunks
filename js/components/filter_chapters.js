import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";
import utils from "../utils/utils.js";

export default { }

;(() => {

    SubPub.subscribe({
        event: "db::get::course::done",
        listener: render,
    });

})();

function render (data) {
    let { response } = data;

    let content_course_open = document.querySelector("#content_course_open");
    content_course_open.querySelectorAll("div").forEach(div => {
        if (div.id === "filterBtnsContainer") { 
            div.remove();
        }
    });

    let filterBtnsContainer = document.createElement("div");
    filterBtnsContainer.id = "filterBtnsContainer";
    content_course_open.appendChild(filterBtnsContainer);

    let btnsFiltering = [
        {
            text: "Completed",
            filter: () => {
                filterCompletd(response);
            }
        },
        {
            text: "UnCompleted",
            filter: () => {
                filterUnCompleted(response)
            }
        },
        {
            text: "Questions",
            filter: () => {
                filterQuestions(response)
            }
        },
    ];

    btnsFiltering.forEach(filter => {
        let btn = document.createElement("button");
        btn.innerHTML = `${filter.text} <span class="btnCircle"> </span>`;
        btn.classList.add(filter.text);

        btn.addEventListener("click", (e) => {
            filterBtnsContainer.querySelectorAll("button").forEach(btn => {
                if (e.target != btn) {
                    btn.classList.remove("Filteractive");
                    showAll(response);
                }
            });

            btn.classList.toggle("Filteractive"); 

            if (btn.classList.contains("Filteractive")) {
                filter.filter();
            } else {
                showAll(response);
            }

        });

        filterBtnsContainer.appendChild(btn);

    });
}

function filterQuestions(response) {
    let { chapters, users_units  } = response;

    let questions = users_units.filter(unit => unit.check_question);

    let chapterIdsWithQuestions = questions.map(question => question.chapter_id);

    let chaptersNoQuestion = chapters.filter(chapter => !chapterIdsWithQuestions.includes(chapter.chapter_id));
    
    chaptersNoQuestion.forEach(element => {
        let liElement = document.querySelector(`#chapter_list_id_${element.chapter_id}`);
        liElement.style.display = "none";
    });

}

function filterCompletd (response) {
    let { chapters, units } = response;

    let incompleteChapters = chapters.filter(chapter => {
        let unitsInChapter = units.filter(unit => unit.chapter_id === chapter.chapter_id);

        let allUnitsComplete = unitsInChapter.every(unit => unit.check_complete);
        
        return allUnitsComplete === false;
    });
    
    incompleteChapters.forEach(chapter => {
        let liElement = document.querySelector(`#chapter_list_id_${chapter.chapter_id}`);
        liElement.style.display = "none";
    });

}

function filterUnCompleted (response) {
    let { chapters, units } = response;

    let incompleteChapters = chapters.filter(chapter => {
        let unitsInChapter = units.filter(unit => unit.chapter_id === chapter.chapter_id);

        let allUnitsComplete = unitsInChapter.some(unit => !unit.check_complete);
        
        return allUnitsComplete === false;
    });
    
    incompleteChapters.forEach(chapter => {
        let liElement = document.querySelector(`#chapter_list_id_${chapter.chapter_id}`);
        liElement.style.display = "none";
    });
}

function showAll (response) {
    const { chapters } = response;

    chapters.forEach(chapter => {
        let liElement = document.querySelector(`#chapter_list_id_${chapter.chapter_id}`);
        liElement.style.display = "block";
    }) 
}

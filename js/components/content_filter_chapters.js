import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";

export default {}

// INIT
; (() => {

    SubPub.subscribe({
        event: "db::get::course::done",
        listener: render
    });

    })();

function render(){

    let content_filter_chapters = document.querySelector("#content_filter_chapters");

    content_filter_chapters.innerHTML = `
        <div class="filters">
            <h3>Filter course chapters</h3>
            <div>
                <button class="NOTDONE">NOT DONE</button>
                <button class="ALLDONE">ALL DONE</button>
                <button class="QUESTIONS">QUESTIONS</button>
            </div>
        </div>
        `;

    let filterBtns = document.querySelectorAll("#content_filter_chapters button");
        //reset filters
        let params = "none";
        changeFilter(params)

    filterBtns.forEach(btn => {
        btn.addEventListener("click", (event) => {

            if(!event.target.classList.contains("active")){
                //if another btn is active
                if (document.querySelectorAll(".active").length !== 0){document.querySelector(".active").classList.remove("active");}

                event.target.classList.add("active");
                if (event.target.innerHTML == "ALL DONE"){params = "all_done"}
                else if (event.target.innerHTML == "NOT DONE"){params = "not_done"}
                else if (event.target.innerHTML == "QUESTIONS"){params = "questions"}
                else {params = "none"};
                } else {
                    //unclick button
                    event.target.classList.remove("active");
                    params = "none";
                }
            changeFilter(params)
        })
    })
}


function changeFilter(params){
    SubPub.publish({
        event: "state::patch::filter_chapters::received",
        detail: {params}
    })
}

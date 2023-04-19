import { SubPub } from "../utils/subpub.js";

export default { }

;(() => {

    SubPub.subscribe({
        event: "db::get::course::done",
        listener: render,
    });

})();

function render () {

    let filter_chapters = document.querySelector("#filter_chapters");
    filter_chapters.innerHTML = "";

    let filterBtnsContainer = document.createElement("div");
    filterBtnsContainer.id = "filterBtnsContainer";
    filter_chapters.appendChild(filterBtnsContainer);

    let btnsFiltering = [
        {
            text: "Completed",
        },
        {
            text: "UnCompleted",
        },
        {
            text: "Questions",
        },
    ];

    let params;

    btnsFiltering.forEach(filter => {

        let btn = document.createElement("button");
        btn.innerHTML = `${filter.text} <span class="btnCircle"></span>`;
        btn.classList.add(filter.text);
        filterBtnsContainer.appendChild(btn);
        
        btn.addEventListener("click", () => {

            if (!btn.classList.contains("Filteractive")) {
            
                filterBtnsContainer.querySelectorAll("button").forEach(btn => {
                    btn.classList.remove("Filteractive");
                });
                btn.classList.add("Filteractive");
                params = filter.text;
    
            } else {

                btn.classList.remove("Filteractive");
                params = "";

            }

            SubPub.publish({
                event: "state::patch::filter_chapters::received",
                detail: { params }
            });

        });

    });
    
}


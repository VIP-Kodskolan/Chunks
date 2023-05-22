import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";
import utils from "../utils/utils.js";

export default { render }

// INIT
;(() => {

    SubPub.subscribe({
        event: "render::modal::units_list",
        listener: render
    });
    
    SubPub.subscribe({
        event: "render::modal::new_unit",
        listener: ({ element }) => {
            const course_id = element.course_id;
            const unit_id = element.unit_id;
            
            utils.push_state_window_history(`?course=${course_id}&unit=${unit_id}`);
            
            SubPub.publish({
                event: "render::modal::units_list",
                detail: { element }
            });
        }
    });
})();

function render({element}){
    let allUnitIDs = get_all_unitIDs();

    let indexOfUnitID = allUnitIDs.findIndex(u => u === element.unit_id);

    let beforeUnitID = indexOfUnitID - 1;
    let nextUnitID = indexOfUnitID + 1;

    let modal_list = document.querySelector("#modal_list");
    modal_list.innerHTML = `
        <li class="modalLeft"></li>
        <li class="modalMiddle"></li>
        <li class="modalRight"></li>
    `;

    //first - middle unit
    SubPub.publish({
        event: "render::modal::unit",
        detail: { element: element, modal_dom: "Middle" }
    });

    //second, the unit before
    if(state_io.state.units.find(u => u.unit_id === allUnitIDs[beforeUnitID]) === undefined){} 
    else {
        SubPub.publish({
            event: "render::modal::unit",
            detail: { element: state_io.state.units.find(u => u.unit_id === allUnitIDs[beforeUnitID]), modal_dom: "Left" }
        });
    }

    //lastly, the unit after
    if (state_io.state.units.find(u => u.unit_id === allUnitIDs[nextUnitID]) === undefined) {} else {
        SubPub.publish({
            event: "render::modal::unit",
            detail: { element: state_io.state.units.find(u => u.unit_id === allUnitIDs[nextUnitID]), modal_dom: "Right" }
        });
    }
    

    // SHOW MODAL
    document.getElementById("modal_wrapper").classList.remove("hidden");


    //CLOSE VIA CLICK ON BACKGROUND or PRESS KEY ESC
    document.querySelector("#modal_list").addEventListener("click", e => {
        if (e.target.id === "modal_list") close_modal();
    });
    document.querySelector("html").addEventListener("keyup", e => {
        if (e.key === "Escape" && !document.getElementById("modal_wrapper").classList.contains("hidden")) {
            close_modal();
        }   
    });
}

function close_modal () {
    const get_parameters_string = utils.get_parameters_string(["course"]);
    utils.push_state_window_history(`?${get_parameters_string}`)
    
    document.querySelector("#modal_wrapper").classList.add("hidden");
}

function get_all_unitIDs(){
    let allUnits = state_io.state.units;
    let allChapters = state_io.state.chapters;
    let allUnitIDs = []

    //bring out all chapter units and their IDs
    allChapters.forEach(chapter => {
        let chapterUnits = allUnits.filter(unit => unit.chapter_id === chapter.chapter_id);
        let unitID = chapterUnits.map(unit => unit.unit_id);
        allUnitIDs.push(...unitID);
    })
    return allUnitIDs;
}
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

    const dom = document.querySelector("#modal_list");
    dom.innerHTML = `
    <button class="leftModul shift"> < </button>
    <ul></ul>
    <button class="rightModul shift"> > </button>`;

    //find section of unit picked
    let sections = state_io.state.sections;
    let units = state_io.state.units;
    let sectionOfUnit = sections.find(s => s.section_id === element.section_id);

    //filter all units in section, then publish them
    let unitsInSection = units.filter(u => u.section_id === sectionOfUnit.section_id);

    const list_dom = document.querySelector("#modal_list > ul");
    unitsInSection.forEach(unit => {
        let container_dom = document.createElement("li");
        list_dom.append(container_dom);

        SubPub.publish({
            event: "render::modal::unit",
            detail: { element: unit, container_dom }
        });
    });

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

    //set the placement of the unit in the list
    let spotOfUnit = element.spot;
    set_unit_spot(spotOfUnit)

    if(spotOfUnit === 1){dom.querySelector(".leftModul").classList.add("btnError")};
    if(spotOfUnit === unitsInSection.length){dom.querySelector(".rightModul").classList.add("btnError")};

    dom.querySelector(".leftModul").addEventListener("click", () => {
        spotOfUnit = spotOfUnit - 1;
        if (spotOfUnit !== 0){
            set_unit_spot(spotOfUnit);
        }
    })
    dom.querySelector(".rightModul").addEventListener("click", () => {
        spotOfUnit = spotOfUnit + 1;
        if (spotOfUnit !== unitsInSection.length){
            set_unit_spot(spotOfUnit);
        }
    })
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

function set_unit_spot(spot){

    let unitSpot = spot - 1;
    let place = unitSpot.toString() + "00";

    document.querySelector("#modal_list ul").style.right = place + "vw";
}
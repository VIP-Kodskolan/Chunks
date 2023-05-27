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

    // SHOW MODALS
    document.getElementById("modal_wrapper").classList.remove("hidden");

    //CLOSE VIA CLICK ON BACKGROUND or PRESS KEY ESC
    document.querySelectorAll("html").forEach(html => { 
        html.addEventListener("click", e => {
            if (e.target.tagName === "UL") close_modal();
        });
    });
    document.querySelector("html").addEventListener("keyup", e => {
        if (e.key === "Escape" && !document.getElementById("modal_wrapper").classList.contains("hidden")) {
            close_modal();
        }   
    });

    //set the placement of the unit in the list
    let spotOfUnit = element.spot;
    set_modal_spot(spotOfUnit, unitsInSection)
    render_modal_placement(spotOfUnit, unitsInSection);
}

function close_modal () {
    const get_parameters_string = utils.get_parameters_string(["course"]);
    utils.push_state_window_history(`?${get_parameters_string}`)
    
    document.querySelector("#modal_wrapper").classList.add("hidden");
}

function set_modal_spot(spot, unitsInSection){

    let unitSpot = spot - 1;
    let place = unitSpot.toString() + "00";
    document.querySelector("#modal_list ul").style.right = place + "vw";

    let leftModul = document.querySelector(".leftModul");
    let rightModul = document.querySelector(".rightModul");

    //if unit is the first or last one in sectionlist
    spot === 1 ? leftModul.classList.add("btnError") : leftModul.classList.remove("btnError");
    spot === unitsInSection.length ? rightModul.classList.add("btnError") : rightModul.classList.remove("btnError");
}

function render_modal_placement(spot, unitsInSection){

    //depending on direction, and spotnumber in section
    document.querySelectorAll(".shift").forEach(btn => {
        btn.addEventListener("click", () => {
            if(btn.classList.contains("leftModul")){
                if(spot !== 0){spot = spot - 1}}
            else if(btn.classList.contains("rightModul")){
                if(spot !== unitsInSection.length){spot = spot + 1}}
            set_modal_spot(spot, unitsInSection)
        });
    })
}
import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";
import utils from "../utils/utils.js";

export default { renderUnitList }

// INIT
;(() => {

    SubPub.subscribe({
        event: "render::modal::unit_list",
        listener: render
    });

    SubPub.subscribe({
        event: "render::modal::unit_lists",
        listener: render
    });

    SubPub.subscribe({
        event: "db::patch::unit::done",
        listener: render
    });

})

function render(){
    console.log("hej");
}

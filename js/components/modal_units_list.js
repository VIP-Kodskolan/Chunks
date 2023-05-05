import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";
import utils from "../utils/utils.js";

export default {}

// INIT
;(() => {

    SubPub.subscribe({
        event: "render::modal::unit::list",
        listener: render,
    });
})

console.log("modal_unit_list");



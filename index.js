import { SubPub } from "./js/utils/subpub.js";

// INITIALIZATION
import init_db from "./js/utils/db.js"; 
import init_sio from "./js/utils/state_io.js";

SubPub.publish({
  event: "start_up_login",
});

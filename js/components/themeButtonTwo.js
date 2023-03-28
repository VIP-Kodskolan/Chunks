import { SubPub } from "../utils/subpub.js";


document.querySelector(".theme-slider").addEventListener("change", function(){
    SubPub.publish({
        event: "changeTheme"
      });
})

export default{}
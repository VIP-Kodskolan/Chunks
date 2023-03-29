import { SubPub } from "../utils/subpub.js";

document.querySelector("#passwordButton").style.width = '100px';
document.querySelector("#passwordButton").style.height = '50px';
document.querySelector("#passwordButton").style.background = "pink";


document.querySelector("#passwordWindow").style.background = "white";

document.querySelector("#passwordWindow").style.position = "absolute"
//document.querySelector("#passwordWindow").hidden = "true";

document.querySelector("#submitButton").addEventListener("click", function(){
console.log("hej")
})

SubPub.subscribe({
    event: "dbb::patch::user::done",
    listener: changeWindow
  });

function changeWindow(){
    document.querySelector("#passwordWindow").innerHTML = `<p>success</p>`;
}

export default{}
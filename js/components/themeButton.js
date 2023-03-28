import { SubPub } from "../utils/subpub.js";

let theme = localStorage.getItem("theme")
console.log(localStorage.getItem("theme"))
console.log(theme)

if(theme == "darkmode"){
    document.querySelector("#content_main").id = "darkmode"
}

if(theme == "lightmode"){
    document.querySelector("#content_main").id = "lightmode"
}



SubPub.subscribe({
    event: "changeTheme",
    listener: changeTheme
  });


function changeTheme(){
    if(localStorage.getItem("theme") == "darkmode"){
        document.querySelector(`#${theme}`).id = "lightmode"
        localStorage.setItem("theme", "lightmode")
        theme = localStorage.getItem("theme")
        console.log(localStorage.getItem("theme"))
        console.log(theme)
    }else{
        document.querySelector(`#${theme}`).id = "darkmode"
        localStorage.setItem("theme", "darkmode")
        theme = localStorage.getItem("theme")
        console.log(localStorage.getItem("theme"))
        console.log(theme)
    }
}

export default{}
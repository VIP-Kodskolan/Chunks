import { SubPub } from "../utils/subpub.js";

export default { render };

;(() => {

    SubPub.subscribe({
      event: "user_ok",
      listener: render,
    });

  })();

//knapp för light eller dark mode
function render (){

  //om jag använder dbn får jag dra in state io o sånt här
  //och ändra knappen efterhand 
    // const mode_dom = document.querySelector("#mode");
// 
    // mode_dom.innerHTML = `
    // 
    // `;

}

  const btn = document.querySelector("#modeswitch");
  console.log(btn);

//kollar av vilken preferens användaren har
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  var theme = "dark"
  changeTheme(document.body, "dark", btn);
} else {
  var theme = "light"
  changeTheme(document.body, "light", btn);
}
document.cookie = "theme=" + theme;


//ändrar användarens preferens manuellt
//och uppdaterar cookienFF
btn.addEventListener("click", () => {
  console.log("klick");
  if(document.body.classList.contains("dark-theme")){
    console.log("villhalight");
    //vill ha light
    var theme = "light"
    changeTheme(document.body, "light", btn);
  }else if(document.body.classList.contains("light-theme")){
    console.log("villhadark");
    //vill ha dark
    var theme = "dark"
    changeTheme(document.body, "dark", btn);
  }
  document.cookie = "theme=" + theme;
})

function changeTheme(element, theme, button){
  element.className="";
  element.classList.add(`${theme}-theme`);
  button.style.backgroundImage = `url("./media/${theme}.png")`;
}










//@media (prefers-color-scheme: dark) {
//  :root{
//    /*bakgrunder*/
//    --color_back_0: #303839;
//    --color_back_1: #434a4a;
//    --color_back_2: #616161;
//    --color_accent_0: #8a8b8d;
//    --color_accent_1: #a2a2a2;
//    --color_accent_2: black;
//    
//    --color_accent_completed_general:#446200;
//    
//    /*content*/
//    --color_overlay_light: rgba(156, 156, 156, 0.8);
//    --color_accent_1_overlay:rgba(29, 29, 29, 0.5);
//  }
//}

import { SubPub } from "../utils/subpub.js";

export default { render };

;(() => {

    SubPub.subscribe({
      event: "user_ok",
      listener: render,
    });

    //ur funktion
    //SubPub.subscribe({
    //  event: "db::patch::user_mode::done",
    //  listener: ({response, params}) => {
    //    //hämta user_mode från state
    //  }
    //})

  })();

//renderar light eller dark mode
function render (){
  
  const btn = document.querySelector("#modeswitch");

  //kollar av vilken preferens användaren har
  checkPreferScheme(btn);

  //om inte användaren har en systempreferens
  //får den light
  getBodyTheme(btn);

  //ändrar användarens preferens manuellt
  //och uppdaterar cookienFF
  btn.addEventListener("click", () => {
    if(document.body.classList.contains("dark-theme")){
      //vill ha light
      var theme = "light"
      changeTheme(document.body, "light", btn);
    }else if(document.body.classList.contains("light-theme")){
      //vill ha dark
      var theme = "dark"
      changeTheme(document.body, "dark", btn);
    }
    document.cookie = "theme=" + theme;
  })

}

//tar bort bodyns klass(er) och lägger till temat
function changeTheme(element, theme, button){
  element.className="";
  element.classList.add(`${theme}-theme`);
  button.style.backgroundImage = `url("./media/${theme}.png")`;
}

function getBodyTheme(button){
  let bodyEl = document.body.className;
  let modeClass = bodyEl.replace(/-theme/g, '')

  if (bodyEl === ''){
    changeTheme(document.body, "light", button);
  }else {
    changeTheme(document.body, modeClass, button);
  }
  
}

function checkPreferScheme(button){
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      var theme = "dark"
      changeTheme(document.body, "dark", button);
    } else {
      var theme = "light"
      changeTheme(document.body, "light", button);
    }
    document.cookie = "theme=" + theme;
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

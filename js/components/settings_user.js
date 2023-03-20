import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";
import utils from "../utils/utils.js";


export default {}

;(() => {

    SubPub.subscribe({
        event: "user_ok",
        listener: render,
    });

    SubPub.subscribe({
        event: "db::patch::user::done",
        listener: render
    });

})();

function render( data ) {
    let { response } = data
    let header = document.querySelector("#content_user");

    header.querySelectorAll("div").forEach(div => {
        if (div.id === "containerSettings") { 
            div.remove();
        }
    });

    let container = document.createElement("div");
    container.id = "containerSettings";
    header.append(container);

    let settingsBtn = document.createElement("button");
    settingsBtn.innerText = "Settings";

    let settingsForm = document.createElement("form");
    settingsForm.classList.add("settingsDiv");
    container.append(settingsBtn, settingsForm);

    settingsBtn.addEventListener("click", settings);

    settingsForm.innerHTML = `
        <div>
            <label> Old password </label>
            <input type="password" id="old_password" placeholder="Old password">
            <div class="pwErrorOld"> </div>
        </div>
        <div>
            <label> New password </label>
            <input type="password" id="new_password" placeholder="New password">
            <div class="pwErrorNew"> </div>
        </div>
        <div> 
            <a class="cancelSet"> Cancel </a>
            <button class="changeSet"> Change </button>
        </div>
    `
    change_password(response);
}

function settings () {
    const container = document.querySelector("#containerSettings");
    const settingsForm = document.querySelector("#containerSettings > form");

    document.querySelector("#old_password").value = "";
    document.querySelector("#new_password").value = "";

    container.classList.toggle("expanded");
    container.classList.contains("expanded") ? settingsForm.style.height = "200px" : settingsForm.style.height = "0px";
}  

function change_password( response ) { 
    
    document.querySelector(".cancelSet").addEventListener("click", (e) => { 
        e.preventDefault();
        settings();
    });
    
    const user = response.user ? response.user : response.element;
    
    const params = {
        user_id: user.user_id,
        kind: "user", 
        element: user,
        element_id: user.user_id,
        updated_fields: []
    }

    document.querySelector(".changeSet").addEventListener("click", (e) => { 
        e.preventDefault();
        
        let old_password = document.querySelector("#old_password");
        let new_password = document.querySelector("#new_password");

        let oldPw, newPw;

        old_password.value === "" ? document.querySelector(".pwErrorOld").classList.add("error") : document.querySelector(".pwErrorOld").classList.remove("error");
        old_password.value === "" ? document.querySelector(".pwErrorOld").textContent = " The old password is not enterd" : document.querySelector(".pwErrorOld").textContent = "";
        
        new_password.value === "" ? document.querySelector(".pwErrorNew").classList.add("error") : document.querySelector(".pwErrorNew").classList.remove("error");
        new_password.value === "" ? document.querySelector(".pwErrorNew").textContent = " There is no new password enterd" : document.querySelector(".pwErrorNew").textContent = "";

        if ( old_password.value !== "" && new_password.value !== "" ) { 
            oldPw = old_password.value;
            newPw = new_password.value;
        }

        if ( oldPw !== user.user_password ) {
            document.querySelector(".pwErrorOld").textContent = " The old password is incorrect";
        } else {

            document.querySelector(".pwErrorOld").textContent = " Change the password ";

            params.updated_fields.push({
                field: "user_password",
                value: newPw,
                is_text: true 
            })

            settings();

            setTimeout(() => {
                SubPub.publish({
                    event: `db::patch::user::request`,
                    detail: { params }
                });
            }, 500)
            
        }
    });
}

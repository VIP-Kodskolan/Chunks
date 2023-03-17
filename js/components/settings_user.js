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
    console.log("render", data );
    const { response } = data
    console.log("render", response );
    const header = document.querySelector("#content_user");

    header.querySelectorAll("div").forEach(div => {
        if (div.id === "containerSettings") { 
            div.remove();
        }
    })


    let container = document.createElement("div");
    container.id = "containerSettings";
    header.append(container);

    let settingsBtn = document.createElement("button");
    settingsBtn.innerText = "Settings";

    let settingsDiv = document.createElement("form");
    settingsDiv.classList.add("settingsDiv");
    container.append(settingsBtn, settingsDiv);

    settingsBtn.addEventListener("click", settings);

    settingsDiv.innerHTML = `
        <div>
            <label> Old password </label>
            <input type="password" id="old_password" placeholder="Old password">
        </div>
        <div>
            <label> New password </label>
            <input type="password" id="new_password" placeholder="New password">
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
    const settingsDiv = document.querySelector("#containerSettings > form");

    document.querySelector("#old_password").value = "";
    document.querySelector("#new_password").value = "";

    container.classList.toggle("expanded");
    container.classList.contains("expanded")? settingsDiv.style.height = "125px" : settingsDiv.style.height = "0px";
}  

function change_password( response ) { 

    document.querySelector(".cancelSet").addEventListener("click", (e) => { 
        e.preventDefault();
        settings()
    });
    
    console.log("change_password response", response );
    const data = response.user ? response.user : response.element;
    console.log("change_password data", data);

    document.querySelector(".changeSet").addEventListener("click", (e) => { 
        e.preventDefault();
        let old_password = document.querySelector("#old_password");
        let new_password = document.querySelector("#new_password");

        let oldPw, newPw;

        const params = {
            user_id: data.user_id,
            kind: "user", 
            element: data,
            element_id: data.user_id,
            updated_fields: []
        }

        console.log("change_password params", params);
        if ( old_password.value == "" || new_password.value == "" ) { 

            old_password.value === "" ? old_password.style.borderBottom = " 1px solid red" : old_password.style.borderBottom = "";
            new_password.value === "" ? new_password.style.borderBottom = " 1px solid red" : new_password.style.borderBottom = "";
            return; 

        } else {

            oldPw = old_password.value;
            newPw = new_password.value;

        }

        if ( oldPw !== data.user_password ) {

            console.log("Old password is wrong");

        } else {

            params.updated_fields.push({
                field: "user_password",
                value: newPw,
                is_text: "text" ? true : false
            })

            // can_add_courses: "0" need to be boolean changes in state_io response 
            // user_start_year: "21" needs to be a number changes in state_io response 

            console.log("change_password params2", {params});
            params.updated_fields.length && SubPub.publish({
                event: `db::patch::user::request`,
                detail: { params }
            });

        }
    });
}

import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";
import utils from "../utils/utils.js";


export default {}

;(() => {

    SubPub.subscribe({
        event: "user_ok",
        listener: render,
    });

    // SubPub.subscribe({
    //     event: "db::patch::user_password::done",
    //     listener: render
    // });

    SubPub.subscribe({
        event: "password_error",
        listener: render_error
    });

    SubPub.subscribe({
        event: "db::patch::user_password::done",
        listener: render_password_confirmd
    })

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
    settingsBtn.addEventListener("click", settings);


    let options = document.createElement("div");
    options.classList.add("settingsDiv");
    options.innerHTML = ` 
    <div class="optionDiv">
        <button class="optionPW"> Change password </button>
    </div>
    <div class="openForm"> 
        <form id="containerForm">
            <div>
                <label> Old password </label>
                <input type="password" id="old_password" placeholder="Old password">
            </div>
            <div>
                <label> New password </label>
                <input type="password" id="new_password" placeholder="New password">
            </div>
                <div class="pwNew"> </div>
            <div class="PasswordBts"> 
                <button class="cancelSet"> Cancel </button>
                <button class="changeSet"> Change </button>
            </div>
        </form>
    </div>
    <div class="optionDiv"> 
        <button class="optionTheme"> Change Theme </button>
    </div>
    `

    container.append(settingsBtn, options);

    document.querySelector(".optionPW").addEventListener("click", (e) => { 
        e.preventDefault();

        document.querySelector(".openForm").classList.toggle("active");
        document.querySelector(".openForm").classList.contains("active") ? document.querySelector(".settingsDiv").style.height = "280px" : document.querySelector(".settingsDiv").style.height = "100px";
    
        change_password(response);
    });

    document.querySelector(".optionTheme").addEventListener("click", toggleDarkMode)


    function toggleDarkMode() {
        // Check if the user has a preference for dark mode
        const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
        // If the user prefers dark mode and the website isn't already in dark mode, switch to dark mode
        if (prefersDarkMode && !document.documentElement.classList.contains("dark")) {
            document.documentElement.classList.add("dark");
        }
        // Otherwise, switch back to light mode
        else {
            document.documentElement.classList.remove("dark");
        }
    }

}

function change_password( response ) { 

    let new_password = document.querySelector("#new_password");
    let old_password = document.querySelector("#old_password");

    document.querySelector(".cancelSet").addEventListener("click", (e) => { 
        e.preventDefault();
        new_password.value = "";
        old_password.value = "";

        document.querySelector(".settingsDiv").style.height = "100px";
        document.querySelector(".openForm").classList.remove("active");
        document.querySelector(".settingsDiv").style.backgroundColor = "white";

    });
    
    const user = response.user ? response.user : response.element;
    
    document.querySelector(".changeSet").addEventListener("click", (e) => { 
        e.preventDefault();

        let texBox =  document.querySelector(".pwNew")

        if (new_password.value === "" || old_password.value === "") {  

            texBox.classList.add("error");
            texBox.innerText = "Control input fileds";
            document.querySelector(".settingsDiv").style.backgroundColor = "#e56c6c";

        } else {

            const params = {
                kind: "user_password", 
                element_id: user.user_id,
                old_password: old_password.value,
                updated_fields: [
                    {
                        field: "user_password",
                        value: new_password.value,
                        is_text: true
                    }
                ]
            }
    
            texBox.innerText = "change password";
            texBox.classList.add("error");

            SubPub.publish({
                event: `db::patch::user_password::request`,
                detail: { params }
            });
        }
        
    });
}

function settings () {
    const container = document.querySelector("#containerSettings");
    const settingsForm = document.querySelector(".settingsDiv");

    container.classList.toggle("expanded");
    container.classList.contains("expanded") ? settingsForm.style.height = "100px" : settingsForm.style.height = "0px";
    container.classList.contains("expanded") ? container.style.border = `1px solid var(--color_accent_0)` : settingsForm.style.border = "0px";
}  

function render_password_confirmd ( ) { 
    document.querySelector(".settingsDiv").style.backgroundColor = "#83d083";

    setTimeout(() => { 
    //     settings();
    }, 1000)
}

function render_error () {
    let error =  document.querySelector(".pwNew")
    error.classList.add("error");
    error.innerText = "old password does not match current password";
    document.querySelector(".settingsDiv").style.backgroundColor = "#e56c6c";
}

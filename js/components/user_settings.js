import { SubPub } from "../utils/subpub.js";
import state_io from "../utils/state_io.js";

export default { render };

;(() => {

    SubPub.subscribe({
        event: "user_ok",
        listener: render,
    });

    SubPub.subscribe({
        event: "passwordchange_ok",
        listener: acceptchange,
        });

    SubPub.subscribe({
        event: "db::patch::user::done",
        listener: check_change_answer
    });

})();


function render(){
    let user_settingswrapper = document.querySelector("#user_settings_wrapper");
    let user_settings = document.querySelector("#user_settings");

    user_settingswrapperElement(user_settings, user_settingswrapper);

    toggle_user_settings();
}

function toggle_user_settings(){
    let user_settings = document.querySelector("#user_settings");
    let user_settingswrapper = document.querySelector("#user_settings_wrapper");

    user_settings.addEventListener("click", (e) => {
        user_settingswrapper.classList.remove("hidden");
    });
}

function user_settingswrapperElement(parent, child){
    
    child.innerHTML = `
    <span class="error" >Fill all fields</span>
    <button class="settings_exit">X</button>
    <form>
        <input class="oldpassword" type="text" placeholder="Old Password">
        <input class="newpassword" type="text" placeholder="New Password">
        <button>Change Password</button>
    </form>
    `;
    parent.append(child);
    document.querySelector(".error").style.display = "none";

    document.querySelector(".settings_exit").addEventListener("click", (e) => {
        e.stopPropagation();
        console.log(e.target);
        document.querySelector("#user_settings_wrapper").remove();
        //ta bort all info i inputs
        user_settingswrapperElement(parent, child);
        child.classList.add("hidden");
    })
    child.querySelector("form").addEventListener("submit", submit_change_password);
}

//om patch::user::done
function check_change_answer ({ response, params }) {

    const { status } = response;
    console.log(status);

if (!status.password) {

    //FEL!!!! 
    window.alert("Wrong password");
    user_settingswrapperElement(document.querySelector("#user_settings"), document.querySelector("#user_settings_wrapper"));

} else {

    //RÄTT!! gick bra

    SubPub.publish({
    event: "passwordchange_ok",
    detail: { response, params }
    });
    }
}

function submit_change_password (event) {
    event.preventDefault();
    console.log(document.querySelector(".oldpassword").value +
    document.querySelector(".newpassword").value);

    if(document.querySelector(".oldpassword").value === "" 
    || document.querySelector(".newpassword").value === ""){
        document.querySelector(".error").style.display = "block";
        document.querySelector(".error").style.textAlign = "center";
        document.querySelector(".error").style.color = "red";
    } else {
        SubPub.publish({
            event: "db::patch::user::request",
            detail: { params: {
            oldpassword: document.querySelector(".oldpassword").value,
            newpassword: document.querySelector(".newpassword").value,
            user_id: state_io.state.user.user_id,
            }}
        });
        document.querySelector("#user_settings_wrapper").remove();
    }


    


}

function acceptchange(){
    window.alert("password is changed");
}






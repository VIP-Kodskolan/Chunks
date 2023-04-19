import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";

export default SubPub.subscribe({
  event: "db::get::course::done",
  listener: chapter_filter_buttons,
});

function chapter_filter_buttons() {
  let dom = document.getElementById("filter_buttons");
  dom.innerHTML = "";
  let buttons = ["Completed", "Unfinished", "Questions"];
  let container = document.createElement("div");
  container.classList.add("flexer");
  buttons.forEach((s) => {
    let button = document.createElement("button");
    button.textContent = s;
    button.classList.add("filter_button");
    button.addEventListener("click", toggle_filter);
    container.append(button);
  });
  dom.append(container);
}

function toggle_filter(event) {
  let params = "";
  if (event.target.classList.contains("active")) {
    event.target.classList.remove("active");
    params = "default";
  } else {
    let chapBTN = Array.from(document.querySelectorAll(".filter_button"));

    chapBTN.forEach((e) => e.classList.remove("active"));
    event.target.classList.add("active");
    console.log(event.target.textContent);
    params = event.target.textContent;
  }
  console.log(params);
  SubPub.publish({
    event: "state::patch::chapter_filter::received",
    detail: { params },
  });
}

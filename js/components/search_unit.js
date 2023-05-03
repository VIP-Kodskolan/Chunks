import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";

SubPub.subscribe({
  events: ["db::get::course::done"],
  listener: render_search_unit,
});

function render_search_unit() {
  state_io.state.button = "";
  console.log(state_io.state);

  const container = document.querySelector("#content_filter_chapter");
  container.innerHTML = "";

  const searchButton = document.createElement("button");
  const searchInput = document.createElement("input");
  const searchEraseButton = document.createElement("button");

  searchButton.innerText = "Sök";
  searchInput.placeholder  = "Name of unit";
  searchEraseButton.innerText = "X";

  container.append(searchButton);
  container.append(searchInput);
  container.append(searchEraseButton);

  searchButton.addEventListener("click", function () {
    SubPub.publish({
      event: "state::patch::search::received",
      detail: {
        params: {
          filterButton: searchInput.value,
        },
      },
    });
  });

  searchEraseButton.addEventListener("click", function () {
    searchInput.value = "";
  });
}

/*
document
  .querySelector(".filterDoneButton")
  .addEventListener("click", function () {
    const allDone = document.querySelectorAll(".icon");
    console.log(allDone);
    allDone.forEach((element) => {
      const foundItem = element.closest(".status_complete");
      if (foundItem != null) {
        if (foundItem.style.display == "none") {
          foundItem.style.display = "flex";
        } else {
          foundItem.style.display = "none";
        }
      }

  
    });
  });

document
  .querySelector(".filterQuestionButton")
  .addEventListener("click", function () {
    const allDone = document.querySelectorAll(".question_mark");
    console.log(allDone);
    allDone.forEach((element) => {
      const foundItem = element.closest(".status_question");
      if (foundItem != null) {
        if (foundItem.style.display == "none") {
          foundItem.style.display = "flex";
        } else {
          foundItem.style.display = "none";
        }
      }

 
    });
  });

document
  .querySelector(".filterUnfinishedButton")
  .addEventListener("click", function () {
    const allDone = document.querySelectorAll(".icon");

    allDone.forEach((element) => {
      const foundItem = element.closest(".unit_item");

      if (foundItem != null) {
        if (
          foundItem.getAttribute("class") !=
            "unit_item exercise status_question" &&
          foundItem.getAttribute("class") !=
            "unit_item exercise status_complete" &&
          foundItem.getAttribute("class") != "unit_item video status_complete"
        ) {
          if (foundItem.style.display == "none") {
            foundItem.style.display = "flex";
          } else {
            foundItem.style.display = "none";
          }
        }
      }


    });
  });
*/
export default {};

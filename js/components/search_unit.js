import state_io from "../utils/state_io.js";
import { SubPub } from "../utils/subpub.js";

SubPub.subscribe({
  events: ["db::get::course::done"],
  listener: render_search_unit,
});

function render_search_unit() {
  state_io.state.button = "";
 // console.log(state_io.state);

  const container = document.querySelector("#content_filter_chapter");
  container.innerHTML = "";

  const searchButton = document.createElement("button");
  const searchInput = document.createElement("input");
  const searchEraseButton = document.createElement("button");
  const searchContainer =  document.createElement("div");

  searchContainer.className = "searchContainer";

  searchButton.innerText = "Sök";
  searchInput.placeholder  = "Name of unit";
  searchEraseButton.innerText = "X";


  searchContainer.append(searchButton)
  searchContainer.append(searchInput)
  searchContainer.append(searchEraseButton)
  container.append(searchContainer)

  searchButton.addEventListener("click", function () {
    SubPub.publish({
      event: "state::patch::search::received",
      detail: {
        params: {
          searchValue: searchInput.value,
          pressedSearch: true
        },
      },
    });
  });

  searchEraseButton.addEventListener("click", function () {
    searchEraseButton.addEventListener("click", function () {
      searchInput.value = ""
      SubPub.publish({
        event: "state::patch::search::received",
        detail: {
          params: {
            searchValue: "",
          },
        },
      });
    });
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

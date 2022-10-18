const vscode = acquireVsCodeApi();

window.addEventListener("load", main);

let SEARCH_BOX;
let SEARCH_BUTTON;
let CANCEL_BUTTON;
let CHECKBOX;
let REPLACEMENT_PART;
let SELECTION;
let REPLACEMENT_FORM;
let REPLACEMENT_BOX;
let REPLACE_BUTTON;
let REVERT_BUTTON;

function main() {
  SEARCH_BOX = document.getElementById("searchBox");
  SEARCH_BUTTON = document.getElementById("searchBtn");
  CANCEL_BUTTON = document.getElementById("cancelBtn");
  CHECKBOX = document.getElementById("searchInAll");
  REPLACEMENT_PART = document.getElementById("replacementPart");
  SELECTION = document.getElementById("selection");
  REPLACEMENT_FORM = document.getElementById("replacementForm");
  REPLACEMENT_BOX = document.getElementById("replacementBox");
  REPLACE_BUTTON = document.getElementById("replaceBtn");
  REVERT_BUTTON = document.getElementById("revertBtn");

  SEARCH_BOX.addEventListener("keyup", enableSearchButton);
  SEARCH_BUTTON.addEventListener("click", onClickSearchButton);
  CANCEL_BUTTON.addEventListener("click", onClickCancelButton);
  SELECTION.addEventListener("change", showReplacementForm);
  REPLACEMENT_BOX.addEventListener("keyup", enableReplaceButton);
  REPLACE_BUTTON.addEventListener("click", onClickReplaceButton);
  REVERT_BUTTON.addEventListener("click", onClickRevertButton);
  window.addEventListener('message', event => {
    const { command } = event.data;

    switch (command) {
      // Lock the search part not to be modified and display the replacement part 
      case "onFoundSearchResult":
        SEARCH_BOX.readOnly = true;
        CHECKBOX.readOnly = true;
        SEARCH_BUTTON.disabled = true;
        CANCEL_BUTTON.disabled = false;
        REPLACEMENT_PART.style.display = "inline";
        SELECTION.value = "Unselected";

        break;
      // This part will lock all UI not to be modified during the API progress
      case "lockUIComponents":
        CANCEL_BUTTON.disabled = true;
        SELECTION.disabled = true;
        REVERT_BUTTON.disabled = true;
        REPLACE_BUTTON.disabled = true;
        REPLACEMENT_BOX.readOnly = true;

        break;
      // This part will unlock all UI after the API progress
      case "unlockUIComponents":
        CANCEL_BUTTON.disabled = false;
        SELECTION.disabled = false;
        REVERT_BUTTON.disabled = false;
        
        // Since the text of the Remove Tag and Remove Upper Tag options is fixed and already written,
        // replacement box for these choices is always readonly and replace button is always enabled.
        if (SELECTION.value === "Remove Tag" || SELECTION.value === "Remove Upper Tag"){
          REPLACE_BUTTON.disabled = false;
          REPLACEMENT_BOX.readOnly = true;
        }
        // Replacement box for other choices will be no longer readonly and
        // replace button is enabled if a replace text has been provided 
        else {
          REPLACEMENT_BOX.readOnly = false;
          enableReplaceButton();
        }

        break;
    }
  });
}

function onClickSearchButton() {

  vscode.postMessage({
    command: CHECKBOX.checked ? "searchInFiles" : "searchInFile",
    search: SEARCH_BOX.value
  });
}

function onClickCancelButton() {
  SEARCH_BOX.readOnly = false;
  CHECKBOX.readOnly = false;
  SEARCH_BUTTON.disabled = false;
  CANCEL_BUTTON.disabled = true;
  REPLACEMENT_PART.style.display = "none";
  REPLACEMENT_FORM.style.display = "none";
  SELECTION.value = "";

  vscode.postMessage({
    command: "cancelSearch"
  });
}

function onClickReplaceButton() {

  vscode.postMessage({
    command: CHECKBOX.checked ? "replaceInFiles" : "replaceInFile",
    search: SEARCH_BOX.value,
    replace: REPLACEMENT_BOX.value,
    choice: SELECTION.value
  });
}

function onClickRevertButton() {

  vscode.postMessage({
    command: "revertChanges",
    choice: SELECTION.value
  });
}

function enableSearchButton() {

  if (SEARCH_BOX.value.trim() === "") {
    SEARCH_BUTTON.disabled = true;
  } else {
    SEARCH_BUTTON.disabled = false;
  }
}

function enableReplaceButton() {

  if (REPLACEMENT_BOX.value.trim() === "") {
    REPLACE_BUTTON.disabled = true;
  } else {
    REPLACE_BUTTON.disabled = false;
  }
}

function showReplacementForm() {
  const choice = SELECTION.value;
  REPLACEMENT_BOX.innerText = "Replace Text";
  REPLACEMENT_BOX.value = "";
  REPLACE_BUTTON.disabled = true;
  REPLACEMENT_BOX.readOnly = false;
  
  if (choice !== "Unselected") {
    REPLACEMENT_FORM.style.display = "inline";

    switch (choice) {
      case "Set Class":
        REPLACEMENT_BOX.placeholder = "class-name1 class-name2 ...";
        REPLACE_BUTTON.innerText = "Set";
        break;

      case "Append to Class":
        REPLACEMENT_BOX.placeholder = "class-name1 class-name2 ...";
        REPLACE_BUTTON.innerText = "Append";
        break;
      
      case "Remove from Class":
        REPLACEMENT_BOX.placeholder = "class-name1 class-name2 ...";
        REPLACE_BUTTON.innerText = "Remove";
        break;
      
      case "Set Id":
        REPLACEMENT_BOX.placeholder = "Id Value";
        REPLACE_BUTTON.innerText = "Set";
        break;

      case "Set Style Property":
        REPLACEMENT_BOX.placeholder = "prop-1:value1,prop-2:value2, ...";
        REPLACE_BUTTON.innerText = "Set";
        break;
      
      case "Edit Style Property":
        REPLACEMENT_BOX.placeholder = "prop-1:value1,prop-2:value2, ...";
        REPLACE_BUTTON.innerText = "Edit";
        break;

      case "Set Attribute":
        REPLACEMENT_BOX.placeholder = "atr-name value1 value2 ...";
        REPLACE_BUTTON.innerText = "Set";
        break;
      
      case "Append to Attribute":
        REPLACEMENT_BOX.placeholder = "atr-name value1 value2 ...";
        REPLACE_BUTTON.innerText = "Append";
        break;
      
      case "Remove from Attribute":
        REPLACEMENT_BOX.placeholder = "atr-name value1 value2 ...";
        REPLACE_BUTTON.innerText = "Remove";
        break;

      case "Remove Attribute":
        REPLACEMENT_BOX.placeholder = "atr-name1 atr-name2 ...";
        REPLACE_BUTTON.innerText = "Remove";
        break;

      case "Change Tag Name":
        REPLACEMENT_BOX.placeholder = "New Tag Name";
        REPLACE_BUTTON.innerText = "Change";
        break;

      case "Remove Tag":
        REPLACEMENT_BOX.innerText = "Are you sure to remove the tag with its children?";
        REPLACEMENT_BOX.value = "Click Remove if you are sure";
        REPLACEMENT_BOX.readOnly = true;
        REPLACE_BUTTON.disabled = false;
        REPLACE_BUTTON.innerText = "Remove";
        break;

      case "Add Upper Tag":
        REPLACEMENT_BOX.placeholder = "tagname#id.class[attribute='value']";
        REPLACE_BUTTON.innerText = "Add";
        break;
      
      case "Remove Upper Tag":
        REPLACEMENT_BOX.innerText = "Are you sure to remove the upper tag?";
        REPLACEMENT_BOX.value = "Click Remove if you are sure";
        REPLACEMENT_BOX.readOnly = true;
        REPLACE_BUTTON.disabled = false;
        REPLACE_BUTTON.innerText = "Remove";
        break;
    }
  }
  else {
    REPLACEMENT_FORM.style.display = "none";
  }
}
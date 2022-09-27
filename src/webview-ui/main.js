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
  REPLACE_BUTTON.addEventListener("click", onClickReplaceButton);
  REVERT_BUTTON.addEventListener("click", onClickRevertButton);
}

function onClickSearchButton() {
  SEARCH_BOX.readOnly = true;
  CHECKBOX.readOnly = true;
  SEARCH_BUTTON.disabled = true;
  CANCEL_BUTTON.disabled = false;
  REPLACEMENT_PART.style.display = "inline";
  SELECTION.value = "Unselected";

  vscode.postMessage({
      command: CHECKBOX.checked ? "searchInFiles" : "searchInFile",
      search: SEARCH_BOX.value
    });
}

function onClickCancelButton(){
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

function onClickReplaceButton(){

  vscode.postMessage({
    command: CHECKBOX.checked ? "replaceInFiles" : "replaceInFile",
    search: SEARCH_BOX.value,
    replace: REPLACEMENT_BOX.value,
    choice: SELECTION.value
  });
}

function onClickRevertButton(){

  vscode.postMessage({
    command: "revertChanges",
    search: SEARCH_BOX.value,
    choice: SELECTION.value
  });
}

function enableSearchButton(that) {
 
  if(SEARCH_BOX.value.trim() === "") { 
    SEARCH_BUTTON.disabled = true;
  } else { 
    SEARCH_BUTTON.disabled = false;
  }
}

function showReplacementForm() {
  const choice = SELECTION.value;
  REPLACEMENT_BOX.value = "";

  if (choice !== "Unselected") {
    REPLACEMENT_FORM.style.display = "inline";

    if(choice === "Set Class"){
      REPLACEMENT_BOX.placeholder = "class-name1 class-name2 ...";
      REPLACE_BUTTON.innerText = "Set";
    }else if(choice === "Append to Class"){
      REPLACEMENT_BOX.placeholder = "class-name1 class-name2 ...";
      REPLACE_BUTTON.innerText = "Append";
    }else if(choice === "Set Id"){
      REPLACEMENT_BOX.placeholder = "Id Value";
      REPLACE_BUTTON.innerText = "Set";
    }else if(choice === "Set Attribute"){
      REPLACEMENT_BOX.placeholder = "name1=value1,name2=value2, ...";
      REPLACE_BUTTON.innerText = "Set";
    }else if(choice === "Append to Attribute"){
      REPLACEMENT_BOX.placeholder = "atr-name,value1,value2, ...";
      REPLACE_BUTTON.innerText = "Append";
    }else if(choice === "Set Style Property"){
      REPLACEMENT_BOX.placeholder = "prop-1:value1,prop-2:value2, ...";
      REPLACE_BUTTON.innerText = "Set";
    }else if(choice === "Edit Style Property"){
      REPLACEMENT_BOX.placeholder = "prop-1:value1,prop-2:value2, ...";
      REPLACE_BUTTON.innerText = "Edit";
    }else if(choice === "Change Tag Name"){
      REPLACEMENT_BOX.placeholder = "New Tag Name";
      REPLACE_BUTTON.innerText = "Change";
    }else if (choice === "Remove Tag"){
      REPLACEMENT_BOX.placeholder = "Click Remove if You Are Sure";
      REPLACE_BUTTON.innerText = "Remove";
    }else if(choice === "Remove from Class"){
      REPLACEMENT_BOX.placeholder = "class-name1 class-name2 ...";
      REPLACE_BUTTON.innerText = "Remove";
    }else if(choice === "Remove from Attribute"){
      REPLACEMENT_BOX.placeholder = "atr-name,value1,value2, ...";
      REPLACE_BUTTON.innerText = "Remove";
    }else if(choice === "Remove Attribute"){
      REPLACEMENT_BOX.placeholder = "atr-name1,atr-name2, ...";
      REPLACE_BUTTON.innerText = "Remove";
    }else if(choice === "Add Upper Tag"){
      REPLACEMENT_BOX.placeholder = "tagName#id.class[attribute=value]";
      REPLACE_BUTTON.innerText = "Add";
    }else if(choice === "Remove Upper Tag"){
      REPLACEMENT_BOX.placeholder = "Click Remove If You Are Sure";
      REPLACE_BUTTON.innerText = "Remove";
    }else {
      REPLACEMENT_FORM.style.display = "none";
    }
  } 
  else {
    REPLACEMENT_FORM.style.display = "none";
  }
}
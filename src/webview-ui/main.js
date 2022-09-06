const vscode = acquireVsCodeApi();

window.addEventListener("load", main);

function main() {
  const searchButton = document.getElementById("searchBtn");
  searchButton.addEventListener("click", onClickSearchBtn);

  const replaceButton = document.getElementById("replaceBtn");
  replaceButton.addEventListener("click", onClickReplaceButton);

  const revertButton = document.getElementById("revertBtn");
  revertButton.addEventListener("click", onClickRevertButton);
}

function onClickSearchBtn() {
  const searchText = document.getElementById("searchBox").value;
  const checkbox = document.getElementById("searchInAll").checked;

  vscode.postMessage({
      command: checkbox ? "searchInFiles" : "searchInFile",
      search: searchText
    });
}

function onClickReplaceButton(){
  const searchText = document.getElementById("searchBox").value;
  const replacementText = document.getElementById("replacementBox").value;
  const choice = document.getElementById("selection").value;

  vscode.postMessage({
    command: "replaceInFiles",
    search: searchText,
    replace: replacementText,
    choice: choice
  });
}

function onClickRevertButton(){
  const searchText = document.getElementById("searchBox").value;
  const choice = document.getElementById("selection").value;

  vscode.postMessage({
    command: "revertChanges",
    search: searchText,
    choice: choice
  });
}
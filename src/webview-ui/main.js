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
  vscode.postMessage({
      command: "searchTagAll",
      search: searchText
    });
}

function onClickReplaceButton(){
  const searchText = document.getElementById("searchBox").value;
  const replacementText = document.getElementById("replacementBox").value;
  const choice = document.getElementById("selection").value;

  vscode.postMessage({
    command: "replaceTagAll",
    search: searchText,
    replace: replacementText,
    choice: choice
  });
}

function onClickRevertButton(){
  const searchText = document.getElementById("searchBox").value;
  const replacementText = document.getElementById("replacementBox").value;

  vscode.postMessage({
    command: "revertChanges",
    search: searchText,
    replace: replacementText
  });
}
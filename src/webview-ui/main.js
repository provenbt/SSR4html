const vscode = acquireVsCodeApi();

window.addEventListener("load", main);

function main() {
  const searchInputArea = document.getElementById("searchBtn");
  searchInputArea.addEventListener("click", onClickSearchBtn);

  const replacementInputArea = document.getElementById("replaceBtn");
  replacementInputArea.addEventListener("click", onClickReplaceButton);
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
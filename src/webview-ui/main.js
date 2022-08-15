const vscode = acquireVsCodeApi();

window.addEventListener("load", main);

function main() {
  const replacementInputArea = document.getElementById("searchBtn");
  replacementInputArea.addEventListener("click", onClickSearchBtn);
}

function onClickSearchBtn() {
    const searchText = document.getElementById("searchBox").value;
    vscode.postMessage({
        command: "searchTagAll",
        text: searchText
      });
}
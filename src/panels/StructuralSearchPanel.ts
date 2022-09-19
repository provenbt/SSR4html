import * as vscode from "vscode";
import { getUri } from "../utilities/getUri";

export class StructuralSearchPanel {
  public static currentPanel: StructuralSearchPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this.panel = panel;
    this.panel.onDidDispose(this.dispose, null, this.disposables);
    this.panel.webview.html = this.getWebviewContent(this.panel.webview, extensionUri);
    this.setWebviewMessageListener(this.panel.webview);
  }

  public static render(extensionUri: vscode.Uri) {
    if (StructuralSearchPanel.currentPanel) {
      StructuralSearchPanel.currentPanel.panel.reveal(vscode.ViewColumn.Beside);
    } else {
      const panel = vscode.window.createWebviewPanel("webview", "SSR4HTML", vscode.ViewColumn.Beside, {
        enableScripts: true,
        retainContextWhenHidden: true
      });

      StructuralSearchPanel.currentPanel = new StructuralSearchPanel(panel, extensionUri);
    }
  }

  public dispose() {
    StructuralSearchPanel.currentPanel = undefined;

    this.panel.dispose();

    while (this.disposables.length) {
      const disposable = this.disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private setWebviewMessageListener(webview: vscode.Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        const { command, search, replace, choice } = message;

        switch (command) {
          case "searchInFile":
            vscode.commands.executeCommand("tag-manager.searchInFile", search);
            break;

          case "searchInFiles":
            vscode.commands.executeCommand("tag-manager.searchInFiles", search);
            break;

          case "replaceInFile":
            vscode.commands.executeCommand("tag-manager.replaceInFile", search, replace, choice);
            break;

          case "replaceInFiles":
            vscode.commands.executeCommand("tag-manager.replaceInFiles", search, replace, choice);
            break;

          case "revertChanges":
            vscode.commands.executeCommand("tag-manager.revertChanges", search, choice);
            break;
        }
      },
      undefined,
      this.disposables
    );
  }

  private getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
    const toolkitUri = getUri(webview, extensionUri, [
      "node_modules",
      "@vscode",
      "webview-ui-toolkit",
      "dist",
      "toolkit.js" // A toolkit.min.js file is also available
    ]);

    const mainUri = getUri(webview, extensionUri, ["src", "webview-ui", "main.js"]);

    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script type = "module" src = "${toolkitUri}"></script>
          <script type = "module" src = "${mainUri}"></script>
          <title>SSR4HTML</title>
        </head>
        <body>
          <h3>Structural Search and Replace</h3>
          <div style = "width:auto">
          <form class = "btn-group" style = "padding-left: 5px;">
            <div class = "form-group row" style = "display:inline">
              <span style = "vertical-align: middle;">
                <vscode-text-area id = "searchBox" autofocus cols="45" rows="1" placeholder="basic CSS selector commands">Search</vscode-text-area>
              </span>
              <div>
                <vscode-button id = "searchBtn" appearance="primary">Search</vscode-button>
              </div>
            </div>

            <div class = "form-group row" style = "padding-top:12px;padding-bottom:12px;">
              <fieldset style = "width:50%;">
                <legend>Search Option</legend>
                <vscode-checkbox id="searchInAll" checked>Search in all HTML files</vscode-checkbox>
              </fieldset>
            </div>

            <div class = "form-group row" style = "padding-top:12px;padding-bottom:12px;">
              <vscode-tag style = "padding-bottom: 2px;">Replacement Choice</vscode-tag>
              <div>
                <vscode-dropdown id = "selection" onchange = "showReplacementForm(this)" position="below" style = "width: 180px;text-align-last: center;">
                  <vscode-option value = "Unselected">Unselected</vscode-option>
                  <vscode-option value = "Set Class">Set Class</vscode-option>
                  <vscode-option value = "Append to Class">Append to Class</vscode-option>
                  <vscode-option value = "Remove from Class">Remove from Class</vscode-option>
                  <vscode-option value = "Set Id">Set Id</vscode-option>
                  <vscode-option value = "Set Attribute">Set Attribute</vscode-option>
                  <vscode-option value = "Append to Attribute">Append to Attribute</vscode-option>
                  <vscode-option value = "Remove from Attribute">Remove from Attribute</vscode-option>
                  <vscode-option value = "Remove Attribute">Remove Attribute</vscode-option>
                  <vscode-option value = "Change Tag Name">Change Tag Name</vscode-option>
                  <vscode-option value = "Remove Tag">Remove Tag</vscode-option>
                  <vscode-option value = "Add Upper Tag">Add Upper Tag</vscode-option>
                  <vscode-option value = "Remove Upper Tag">Remove Upper Tag</vscode-option>
                </vscode-dropdown>
              </div>
            </div>

            <div id = "replacementForm" class = "form-group row" style = "display:none;">
              <span style = "vertical-align: middle;">
                <vscode-text-area id = "replacementBox" autofocus cols="45" rows="1">Replace</vscode-text-area>
              </span>
              <div>
                <vscode-button id = "replaceBtn" appearance="primary">Replace</vscode-button>
                <vscode-button id = "revertBtn" appearance="secondary">Revert</vscode-button>
              </div>
            </div>

            <script>
              function showReplacementForm(that) {
                const replacementForm = document.getElementById("replacementForm");
                const replacementBox = document.getElementById("replacementBox");
                const replaceBtn = document.getElementById("replaceBtn");
                replacementBox.value = "";
                if (that.value !== "Unselected") {
                  replacementForm.style.display = "inline";
                  if(that.value === "Set Class"){
                    replacementBox.placeholder = "class-name1 class-name2 ...";
                    replaceBtn.innerText = "Set";
                  }else if(that.value === "Append to Class"){
                    replacementBox.placeholder = "class-name1 class-name2 ...";
                    replaceBtn.innerText = "Append";
                  }else if(that.value === "Set Id"){
                    replacementBox.placeholder = "id value";
                    replaceBtn.innerText = "Set";
                  }else if(that.value === "Set Attribute"){
                    replacementBox.placeholder = "atr name1=value1,name2=value2, ...";
                    replaceBtn.innerText = "Set";
                  }else if(that.value === "Append to Attribute"){
                    replacementBox.placeholder = "atr-name,value1,value2, ...";
                    replaceBtn.innerText = "Append";
                  }else if(that.value === "Change Tag Name"){
                    replacementBox.placeholder = "new tag name";
                    replaceBtn.innerText = "Change";
                  }else if (that.value === "Remove Tag"){
                    replacementBox.placeholder = "click remove if you are sure";
                    replaceBtn.innerText = "Remove";
                  }else if(that.value === "Remove from Class"){
                    replacementBox.placeholder = "class-name1 class-name2 ...";
                    replaceBtn.innerText = "Remove";
                  }else if(that.value === "Remove from Attribute"){
                    replacementBox.placeholder = "atr-name,value1,value2, ...";
                    replaceBtn.innerText = "Remove";
                  }else if(that.value === "Remove Attribute"){
                    replacementBox.placeholder = "atr-name1,atr-name2, ...";
                    replaceBtn.innerText = "Remove";
                  }else if(that.value === "Add Upper Tag"){
                    replacementBox.placeholder = "tagName#id.class[attribute=value]";
                    replaceBtn.innerText = "Add";
                  }else if(that.value === "Remove Upper Tag"){
                    replacementBox.placeholder = "click remove if you are sure";
                    replaceBtn.innerText = "Remove";
                  }else {
                    console.log("this selection is not possible");
                    replacementForm.style.display = "none";
                  }
                } 
                else {
                  replacementForm.style.display = "none";
                }
              }
            </script>
          </form>
          </div>
        </body>
      </html>
    `;
  }

}
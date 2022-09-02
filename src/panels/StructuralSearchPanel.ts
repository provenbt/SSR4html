import * as vscode from "vscode";
import { getUri } from "../utilities/getUri";

export class StructuralSearchPanel {
  public static currentPanel: StructuralSearchPanel | undefined;
  public readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._panel.onDidDispose(this.dispose, null, this._disposables);
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
    this._setWebviewMessageListener(this._panel.webview);
  }

  public static render(extensionUri: vscode.Uri) {
    if (StructuralSearchPanel.currentPanel) {
      StructuralSearchPanel.currentPanel._panel.reveal(vscode.ViewColumn.Beside);
    } else {
      const panel = vscode.window.createWebviewPanel("webview", "Structural Search and Replace", vscode.ViewColumn.Beside, {
        enableScripts: true,
      });

      StructuralSearchPanel.currentPanel = new StructuralSearchPanel(panel, extensionUri);
    }
  }

  public dispose() {
    StructuralSearchPanel.currentPanel = undefined;

    this._panel.dispose();

    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private _setWebviewMessageListener(webview: vscode.Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        const { command, search, replace, choice } = message;

        switch (command) {
          case "searchTag":
            vscode.commands.executeCommand("tag-manager.searchInFile", search);
            break;

          case "searchTagAll":
            vscode.commands.executeCommand("tag-manager.searchInFiles", search);
            break;

          case "replaceTagAll":
            vscode.commands.executeCommand("tag-manager.replaceInFiles", search, replace, choice);
            break;

          case "revertChanges":
            vscode.commands.executeCommand("tag-manager.revertChanges", search, choice);
            break;
        }
      },
      undefined,
      this._disposables
    );
  }

  private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
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
          <title>Structural Search and Replace</title>
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
                <legend>Search Options</legend>
                <vscode-checkbox id="searchInAll" checked>Search in all files</vscode-checkbox>
              </fieldset>
            </div>

            <div class = "form-group row" style = "padding-top:12px;padding-bottom:12px;">
              <vscode-tag style = "padding-bottom: 2px;">Replacement Choice</vscode-tag>
              <div>
                <vscode-dropdown id = "selection" onchange = "showReplacementForm(this)" position="below" style = "width: 165px;text-align-last: center;">
                  <vscode-option value = "Unselected">Unselected</vscode-option>
                  <vscode-option value = "Set Class">Set Class</vscode-option>
                  <vscode-option value = "Set Attribute">Set Attribute</vscode-option>
                  <vscode-option value = "Change Tag">Change Tag</vscode-option>
                  <vscode-option value = "Add Upper Tag">Add Upper Tag</vscode-option>
                  <vscode-option value = "Remove Tag">Remove Tag</vscode-option>
                  <vscode-option value = "Remove Attribute">Remove Attribute</vscode-option>
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
                    replacementBox.placeholder = "class name";
                    replaceBtn.innerText = "Set";
                  }else if(that.value === "Set Attribute"){
                    replacementBox.placeholder = "attribute name = value";
                    replaceBtn.innerText = "Set";
                  }else if(that.value === "Change Tag"){
                    replacementBox.placeholder = "new tag name";
                    replaceBtn.innerText = "Change";
                  }else if (that.value === "Remove Tag"){
                    replacementBox.placeholder = "click remove if you are sure";
                    replaceBtn.innerText = "Remove";
                  }else if(that.value === "Remove Attribute"){
                    replacementBox.placeholder = "attribute name to remove";
                    replaceBtn.innerText = "Remove";
                  }else if(that.value === "Add Upper Tag"){
                    replacementBox.placeholder = "element#id.class[attribute=value]";
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
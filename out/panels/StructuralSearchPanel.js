"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructuralSearchPanel = void 0;
const vscode = require("vscode");
const getUri_1 = require("../utilities/getUri");
class StructuralSearchPanel {
    constructor(panel, extensionUri) {
        this._disposables = [];
        this._panel = panel;
        this._panel.onDidDispose(this.dispose, null, this._disposables);
        this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
        this._setWebviewMessageListener(this._panel.webview);
    }
    static render(extensionUri) {
        if (StructuralSearchPanel.currentPanel) {
            StructuralSearchPanel.currentPanel._panel.reveal(vscode.ViewColumn.Beside);
        }
        else {
            const panel = vscode.window.createWebviewPanel("webview", "Structural Search and Replace", vscode.ViewColumn.Beside, {
                enableScripts: true,
            });
            StructuralSearchPanel.currentPanel = new StructuralSearchPanel(panel, extensionUri);
        }
    }
    dispose() {
        StructuralSearchPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
    _setWebviewMessageListener(webview) {
        webview.onDidReceiveMessage((message) => {
            const { command, search, replace } = message;
            switch (command) {
                case "searchTagAll":
                    vscode.commands.executeCommand("tag-manager.searchTagAll", search);
                    break;
                case "replaceTagAll":
                    vscode.commands.executeCommand("tag-manager.replaceTagAll", search, replace);
                    break;
            }
        }, undefined, this._disposables);
    }
    _getWebviewContent(webview, extensionUri) {
        const toolkitUri = (0, getUri_1.getUri)(webview, extensionUri, [
            "node_modules",
            "@vscode",
            "webview-ui-toolkit",
            "dist",
            "toolkit.js" // A toolkit.min.js file is also available
        ]);
        const mainUri = (0, getUri_1.getUri)(webview, extensionUri, ["src", "webview-ui", "main.js"]);
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
          <form class = "btn-group" style = "padding-left: 5px;">
            <div class = "form-group row" style = "display:inline">
              <span style = "vertical-align: middle;">
                <vscode-text-area id = "searchBox" autofocus cols="35" rows="1" placeholder="basic CSS selector commands">Search</vscode-text-area>
              </span>
              <span style = "padding-left: 10px;">
                <vscode-button id = "searchBtn" style = "text-align: center;font-size: 16px;width: 75px;height: 25px;" appearance="primary">Search</vscode-button>
              </span>
            </div>

            <div class = "form-group row" style = "padding-top:12px;padding-bottom:12px;">
              <fieldset style = "width:50%;">
                <legend>Search Options</legend>
                <vscode-checkbox>Search in all files of the project</vscode-checkbox>
              </fieldset>
            </div>

            <div class = "form-group row" style = "padding-top:12px;padding-bottom:12px;">
              <vscode-tag style = "padding-bottom: 2px;">Replacement Options</vscode-tag>
              <div style = "padding-left: 5px;">
                <vscode-dropdown onchange = "showReplacementForm(this)" position="below" style = "width: 120px;text-align-last: center;">
                  <vscode-option value = "unselected">Unselected</vscode-option>
                  <vscode-option id = "WT" value = "wrapTag">Wrap Tag</vscode-option>
                  <vscode-option id = "MT" value = "modifyTag">Modify Tag</vscode-option>
                  <vscode-option id = "RT" value = "removeTag">Remove Tag</vscode-option>
                </vscode-dropdown>
              </div>
            </div>

            <div id = "replacementForm" class = "form-group row" style = "display:none;">
              <span style = "vertical-align: middle;">
                <vscode-text-area id = "replacementBox" autofocus cols="35" rows="1">Replace</vscode-text-area>
              </span>
              <span style = "padding-left: 10px;">
                <vscode-button id = "replaceBtn" style = "text-align: center; font-size: 16px;width: 75px;height: 25px;" appearance="primary">Replace</vscode-button>
              </span>
            </div>

            <script>
              function showReplacementForm(that) {
                if (that.value !== "unselected") {
                  document.getElementById("replacementForm").style.display = "inline";
                  if(that.value === "wrapTag"){
                    document.getElementById("replacementBox").placeholder = "replacement text";
                  }else if(that.value === "modifyTag"){
                    document.getElementById("replacementBox").placeholder = "replacement text";
                  }else if(that.value === "removeTag"){
                    document.getElementById("replacementBox").placeholder = "remove command, Eg. remove";
                  } else {
                    console.log("this selection is not possible");
                    document.getElementById("replacementForm").style.display = "none";
                  }
                } 
                else {
                  document.getElementById("replacementForm").style.display = "none";
                }
              }
            </script>
          </form>
        </body>
      </html>
    `;
    }
}
exports.StructuralSearchPanel = StructuralSearchPanel;
//# sourceMappingURL=StructuralSearchPanel.js.map
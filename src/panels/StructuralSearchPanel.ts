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
          case "searchTagAll":
            vscode.commands.executeCommand("tag-manager.searchTagAll", search);
            break;

          case "replaceTagAll":
            vscode.commands.executeCommand("tag-manager.replaceTagAll", search, replace, choice);
            break;

          case "revertChanges":
            vscode.commands.executeCommand("tag-manager.revertChanges", search, replace);
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
                <vscode-text-area id = "searchBox" autofocus cols="40" rows="1" placeholder="basic CSS selector commands">Search</vscode-text-area>
              </span>
              <div>
                <vscode-button id = "searchBtn" appearance="primary">Search</vscode-button>
              </div>
            </div>

            <div class = "form-group row" style = "padding-top:12px;padding-bottom:12px;">
              <fieldset style = "width:50%;">
                <legend>Search Options</legend>
                <vscode-checkbox>Search in all files</vscode-checkbox>
              </fieldset>
            </div>

            <div class = "form-group row" style = "padding-top:12px;padding-bottom:12px;">
              <vscode-tag style = "padding-bottom: 2px;">Replacement Options</vscode-tag>
              <div style = "padding-left: 5px;">
                <vscode-dropdown id = "selection" onchange = "showReplacementForm(this)" position="below" style = "width: 120px;text-align-last: center;">
                  <vscode-option value = "unselected">Unselected</vscode-option>
                  <vscode-option value = "setClass">Set Class</vscode-option>
                  <vscode-option value = "setAttribute">Set Attribute</vscode-option>
                  <vscode-option value = "changeTag">Change Tag</vscode-option>
                  <vscode-option value = "removeTag">Remove Tag</vscode-option>
                  <vscode-option value = "removeAttribute">Remove Attribute</vscode-option>
                </vscode-dropdown>
              </div>
            </div>

            <div id = "replacementForm" class = "form-group row" style = "display:none;">
              <span style = "vertical-align: middle;">
                <vscode-text-area id = "replacementBox" autofocus cols="40" rows="1">Replace</vscode-text-area>
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
                replacementBox.value = "";
                if (that.value !== "unselected") {
                  replacementForm.style.display = "inline";
                  if(that.value === "setClass"){
                    replacementBox.placeholder = "class name";
                  }else if(that.value === "setAttribute"){
                    replacementBox.placeholder = "attribute name = value";
                  }else if(that.value === "changeTag"){
                    replacementBox.placeholder = "new tag name";
                  }else if (that.value === "removeTag"){
                    replacementBox.placeholder = "click replace if you are sure";
                  }else if(that.value === "removeAttribute"){
                    replacementBox.placeholder = "attribute name";
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
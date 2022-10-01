import * as vscode from "vscode";
import { getUri } from "../utilities/getUri";

export class StructuralSearchPanel {
  public static currentPanel: StructuralSearchPanel | undefined;
  public readonly panel: vscode.WebviewPanel;
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
    // To clear Search Query/Results fields
    vscode.commands.executeCommand("search.action.clearSearchResults");
    // To clear Files to Include/Exclude fields
    vscode.commands.executeCommand("search.action.clearSearchResults");
    vscode.commands.executeCommand("workbench.action.closeSidebar");
    
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
    // Handle outgoing message from webview to extension
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

          case "cancelSearch":
            // To clear Search Query/Results fields
            vscode.commands.executeCommand("search.action.clearSearchResults");
            // To clear Files to Include/Exclude fields
            vscode.commands.executeCommand("search.action.clearSearchResults");
            vscode.commands.executeCommand("workbench.action.closeSidebar");
            break;

          case "replaceInFile":
            vscode.commands.executeCommand("tag-manager.replaceInFile", search, replace, choice);
            break;

          case "replaceInFiles":
            vscode.commands.executeCommand("tag-manager.replaceInFiles", search, replace, choice);
            break;

          case "revertChanges":
            vscode.commands.executeCommand("tag-manager.revertChanges", choice);
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
          <div style="width:300px;">
            <h3>Structural Search and Replace</h3>
          </div>

          <div style = "width:auto;padding-left:5px;">
            <form class="btn-group">
              <div class="form-group row" style="padding-bottom:15px;">
                <fieldset>
                  <legend style="text-align:center;">Search</legend>
                  <div>
                    <vscode-text-area id = "searchBox" cols="150" rows="1" placeholder="Basic CSS Selector(s)">Search Text</vscode-text-area>
                  </div>

                  <div style="padding-top:10px;padding-bottom:10px;">
                    <fieldset style="width:175px;">
                      <legend>Search&Replace Option</legend>
                      <vscode-checkbox id="searchInAll" checked>Include all HTML files</vscode-checkbox>
                    </fieldset>
                  </div>

                  <div>
                    <vscode-button id="searchBtn" appearance="primary" disabled>Search</vscode-button>
                    <vscode-button id="cancelBtn" appearance="secondary" disabled>Cancel</vscode-button>
                  </div>
                </fieldset>
              </div>
              
              <div id="replacementPart" class="form-group row" style="display:none;">
                <fieldset>
                  <legend style="text-align:center;">Replace</legend>
                  
                  <div>
                    <vscode-tag style = "padding-bottom:3px;">Replacement Choice</vscode-tag>
                    <div>
                      <vscode-dropdown id = "selection" position="below" style = "width:180px;text-align-last:center;">
                        <vscode-option value = "Unselected">Unselected</vscode-option>
                        <vscode-option value = "Set Class">Set Class</vscode-option>
                        <vscode-option value = "Append to Class">Append to Class</vscode-option>
                        <vscode-option value = "Remove from Class">Remove from Class</vscode-option>
                        <vscode-option value = "Set Id">Set Id</vscode-option>
                        <vscode-option value = "Set Attribute">Set Attribute</vscode-option>
                        <vscode-option value = "Remove Attribute">Remove Attribute</vscode-option>
                        <vscode-option value = "Append to Attribute">Append to Attribute</vscode-option>
                        <vscode-option value = "Remove from Attribute">Remove from Attribute</vscode-option>
                        <vscode-option value = "Set Style Property">Set Style Property</vscode-option>
                        <vscode-option value = "Edit Style Property">Edit Style Property</vscode-option>
                        <vscode-option value = "Change Tag Name">Change Tag Name</vscode-option>
                        <vscode-option value = "Remove Tag">Remove Tag</vscode-option>
                        <vscode-option value = "Add Upper Tag">Add Upper Tag</vscode-option>
                        <vscode-option value = "Remove Upper Tag">Remove Upper Tag</vscode-option>
                      </vscode-dropdown>
                    </div>
                  </div>

                  <div id="replacementForm" class="form-group row" style="display:none;">

                    <div style="padding-top:10px;padding-bottom:10px;">
                      <vscode-text-area id="replacementBox" cols="150" rows="1">Replacement Text</vscode-text-area>
                    </div>
                    <div>
                      <vscode-button id="replaceBtn" appearance="primary">Replace</vscode-button>
                      <vscode-button id="revertBtn" appearance="secondary">Revert</vscode-button>
                    </div>

                  </div>
                </fieldset>
              </div>    
            </form>
          </div>
        </body>
      </html>
    `;
  }
}
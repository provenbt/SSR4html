import * as vscode from "vscode";
import { getUri } from "../utilities/getUri";

export class StructuralSearchAndReplacePanel {
  // Track the current panel. Only allow a single panel to exist at a time.
  public static currentPanel: StructuralSearchAndReplacePanel | undefined;

  public static readonly viewType = "SSR4HTML_UI";

  private readonly panel: vscode.WebviewPanel;
  private readonly extensionUri: vscode.Uri;
  private disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this.panel = panel;
    this.extensionUri = extensionUri;

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    // Set the webview's initial html content
    this.panel.webview.html = this.getWebviewContent(this.panel.webview);
    this.setWebviewMessageListener(this.panel.webview);
  }

  public static launchOrCloseUI(extensionUri: vscode.Uri) {
    // Dispose the webview and close the UI if it is already open
    if (StructuralSearchAndReplacePanel.currentPanel) {
      StructuralSearchAndReplacePanel.currentPanel.panel.dispose();
      return;
    }

    // Set an editor layout for a better UI representation
    vscode.commands.executeCommand("vscode.setEditorLayout", { orientation: 0, groups: [{ size: 0.7 }, { size: 0.3 }] });

    // Create a new panel for the webview
    const panel = vscode.window.createWebviewPanel(
      StructuralSearchAndReplacePanel.viewType,
      "SSR4HTML",
      vscode.ViewColumn.Beside,
      { enableScripts: true, retainContextWhenHidden: true }
    );

    // Lock the editor group of the webview for a better UX
    vscode.commands.executeCommand("workbench.action.lockEditorGroup");

    StructuralSearchAndReplacePanel.currentPanel = new StructuralSearchAndReplacePanel(panel, extensionUri);
  }

  public dispose() {
    this.cleanUpSidebarSearchAndCloseSidebar();

    StructuralSearchAndReplacePanel.currentPanel = undefined;

    this.panel.dispose();

    while (this.disposables.length) {
      const disposable = this.disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  public lockUIComponents() {
    this.panel.webview.postMessage({ command: 'lockUIComponents' });
  }

  public unlockUIComponents() {
    this.panel.webview.postMessage({ command: 'unlockUIComponents' });
  }

  public showReplacementPart() {
    this.panel.webview.postMessage({ command: 'onFoundSearchResult' });
  }

  public notifyUser(processName: string, processResult: string, choice: string) {
    if (processResult === "Success") {
      vscode.commands.executeCommand("search.action.refreshSearchResults").then(() => {
        vscode.window.showInformationMessage(`${processName} process for "${choice.toLowerCase()}" successful`);
      });
    }
    else if (processResult === "No modifications required for the desired change") {
      vscode.window.showWarningMessage(processResult);
    }
    else {
      vscode.window.showErrorMessage(`An error occured during the ${processName} process`);
    }
  }

  private cleanUpSidebarSearchAndCloseSidebar() {
    // Clear Search Query/Results fields
    vscode.commands.executeCommand("search.action.clearSearchResults");
    // Clear Files to Include/Exclude fields
    vscode.commands.executeCommand("search.action.clearSearchResults");
    // Make the search settings default
    vscode.commands.executeCommand("toggleSearchCaseSensitive");
    vscode.commands.executeCommand("toggleSearchRegex");
    vscode.commands.executeCommand("toggleSearchWholeWord");
    // Close the primary sidebar
    vscode.commands.executeCommand("workbench.action.closeSidebar");
  }

  private setWebviewMessageListener(webview: vscode.Webview) {
    // Handle outgoing message from webview to extension
    webview.onDidReceiveMessage(
      (message: any) => {
        const { command, search, replace, choice } = message;

        switch (command) {
          case "searchInFile":
            vscode.commands.executeCommand("ssr4html.searchInFile", search);
            break;

          case "searchInFiles":
            vscode.commands.executeCommand("ssr4html.searchInFiles", search);
            break;

          case "cancelSearch":
            this.cleanUpSidebarSearchAndCloseSidebar();
            break;

          case "replaceInFile":
            vscode.commands.executeCommand("ssr4html.replaceInFile", replace, choice);
            break;

          case "replaceInFiles":
            vscode.commands.executeCommand("ssr4html.replaceInFiles", replace, choice);
            break;

          case "revertChanges":
            vscode.commands.executeCommand("ssr4html.revertChanges");
            break;
        }
      },
      null,
      this.disposables
    );
  }

  private getWebviewContent(webview: vscode.Webview) {
    const toolkitUri = getUri(webview, this.extensionUri, [
      "node_modules",
      "@vscode",
      "webview-ui-toolkit",
      "dist",
      "toolkit.js"
    ]);

    const mainUri = getUri(webview, this.extensionUri, ["src", "webview-ui", "main.js"]);

    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="Content-Security-Policy">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>SSR4HTML</title>
          <script type = "module" src = "${toolkitUri}"></script>
          <script type = "module" src = "${mainUri}"></script>
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
                        <vscode-option value = "Append to Attribute">Append to Attribute</vscode-option>
                        <vscode-option value = "Remove from Attribute">Remove from Attribute</vscode-option>
                        <vscode-option value = "Remove Attribute">Remove Attribute</vscode-option>
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
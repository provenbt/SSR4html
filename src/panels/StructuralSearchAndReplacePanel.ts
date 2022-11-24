import * as vscode from 'vscode';
import { getUri } from '../utilities/getUri';
import strings from '../../stringVariables.json';

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
      strings.extensionShortName,
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
    this.panel.webview.postMessage({ command: strings.lockUIComponentsWebviewCommand });
  }

  public unlockUIComponents() {
    this.panel.webview.postMessage({ command: strings.unlockUIComponentsWebviewCommand });
  }

  public showReplacementPart() {
    this.panel.webview.postMessage({ command: strings.onFoundSearchResultWebviewCommand });
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
        const { command, search, filesToExcludePath, replace, choice } = message;

        switch (command) {
          case strings.searchInFileWebviewCommand:
            vscode.commands.executeCommand(strings.searchInFileCommand, search);
            break;

          case strings.searchInFilesWebviewCommand:
            vscode.commands.executeCommand(strings.searchInFilesCommand, search, filesToExcludePath);
            break;

          case strings.cancelSearchWebviewCommand:
            this.cleanUpSidebarSearchAndCloseSidebar();
            break;

          case strings.replaceInFileWebviewCommand:
            vscode.commands.executeCommand(strings.replaceInFileCommand, replace, choice);
            break;

          case strings.replaceInFilesWebviewCommand:
            vscode.commands.executeCommand(strings.replaceInFilesCommand, replace, choice);
            break;

          case strings.revertChangesWebviewCommand:
            vscode.commands.executeCommand(strings.revertChangesCommand);
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

    const mainUri = getUri(webview, this.extensionUri, ["webview-ui", "main.js"]);

    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="Content-Security-Policy">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${strings.extensionShortName}</title>
          <script type = "module" src = "${toolkitUri}"></script>
          <script type = "module" src = "${mainUri}"></script>
        </head>
        <body>
          <div style="width:300px;">
            <h3>${strings.extensionTitle}</h3>
          </div>

          <div style = "width:auto;padding-left:5px;">
            <form class="btn-group">
              <div class="form-group row" style="padding-bottom:15px;">
                <fieldset>
                  <legend style="text-align:center;">${strings.searchPartLegendText}</legend>
                  <div>
                    <vscode-text-area id = "searchBox" cols="150" rows="1" placeholder="${strings.searchTextAreaPlaceholder}">${strings.searchTextAreaTitle}</vscode-text-area>
                  </div>

                  <div style="padding-top:10px;padding-bottom:10px;">
                    <fieldset style="width:175px;">
                      <legend>${strings.searchAndReplaceOptionLegendText}</legend>
                      <vscode-checkbox id="searchInAll">${strings.searchAndReplaceOptionCheckboxText}</vscode-checkbox>
                      <vscode-text-field id="filesToExclude" placeholder="${strings.filesToExcludeTextAreaPlaceholder}" style="margin: 3px; display:none;">${strings.filesToExcludeTextAreaTitle}</vscode-text-field>
                    </fieldset>
                  </div>

                  <div>
                    <vscode-button id="searchBtn" appearance="primary" disabled>${strings.searchButtonText}</vscode-button>
                    <vscode-button id="cancelBtn" appearance="secondary" disabled>${strings.cancelButtonText}</vscode-button>
                  </div>
                </fieldset>
              </div>
              
              <div id="replacementPart" class="form-group row" style="display:none;">
                <fieldset>
                  <legend style="text-align:center;">${strings.replacePartLegendText}</legend>
                  
                  <div>
                    <vscode-tag style = "padding-bottom:3px;">${strings.replacementOperationSelectionTitle}</vscode-tag>
                    <div>
                      <vscode-dropdown id = "selection" position="below" style = "width:180px;text-align-last:center;">
                        <vscode-option value = "${strings.replacementOperationDefaultText}">${strings.replacementOperationDefaultText}</vscode-option>
                        <vscode-option value = "${strings.setClassNameText}">${strings.setClassNameText}</vscode-option>
                        <vscode-option value = "${strings.appendClassNameText}">${strings.appendClassNameText}</vscode-option>
                        <vscode-option value = "${strings.removeClassNameText}">${strings.removeClassNameText}</vscode-option>
                        <vscode-option value = "${strings.setIdValueText}">${strings.setIdValueText}</vscode-option>
                        <vscode-option value = "${strings.setAttributeText}">${strings.setAttributeText}</vscode-option>
                        <vscode-option value = "${strings.appendAttributeValueText}">${strings.appendAttributeValueText}</vscode-option>
                        <vscode-option value = "${strings.removeAttributeValueText}">${strings.removeAttributeValueText}</vscode-option>
                        <vscode-option value = "${strings.removeAttributeText}">${strings.removeAttributeText}</vscode-option>
                        <vscode-option value = "${strings.setStylePropertyText}">${strings.setStylePropertyText}</vscode-option>
                        <vscode-option value = "${strings.editStylePropertyText}">${strings.editStylePropertyText}</vscode-option>
                        <vscode-option value = "${strings.editTagNameText}">${strings.editTagNameText}</vscode-option>
                        <vscode-option value = "${strings.removeTagText}">${strings.removeTagText}</vscode-option>
                        <vscode-option value = "${strings.addUpperTagText}">${strings.addUpperTagText}</vscode-option>
                        <vscode-option value = "${strings.removeUpperTagText}">${strings.removeUpperTagText}</vscode-option>
                      </vscode-dropdown>
                    </div>
                  </div>

                  <div id="replacementForm" class="form-group row" style="display:none;">

                    <div style="padding-top:10px;padding-bottom:10px;">
                      <vscode-text-area id="replacementBox" cols="150" rows="1">${strings.replaceTextAreaDefaultTitle}</vscode-text-area>
                    </div>
                    <div>
                      <vscode-button id="replaceBtn" appearance="primary">${strings.replaceButtonDefaultText}</vscode-button>
                      <vscode-button id="revertBtn" appearance="secondary">${strings.revertButtonText}</vscode-button>
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
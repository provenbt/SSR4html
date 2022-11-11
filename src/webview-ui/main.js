import strings from '../stringVariables.json' assert {type: 'json'};

const vscode = acquireVsCodeApi();

window.addEventListener("load", main);

let SEARCH_BOX;
let SEARCH_BUTTON;
let CANCEL_BUTTON;
let CHECKBOX;
let REPLACEMENT_PART;
let SELECTION;
let REPLACEMENT_FORM;
let REPLACEMENT_BOX;
let REPLACE_BUTTON;
let REVERT_BUTTON;

function main() {
  SEARCH_BOX = document.getElementById("searchBox");
  SEARCH_BUTTON = document.getElementById("searchBtn");
  CANCEL_BUTTON = document.getElementById("cancelBtn");
  CHECKBOX = document.getElementById("searchInAll");
  REPLACEMENT_PART = document.getElementById("replacementPart");
  SELECTION = document.getElementById("selection");
  REPLACEMENT_FORM = document.getElementById("replacementForm");
  REPLACEMENT_BOX = document.getElementById("replacementBox");
  REPLACE_BUTTON = document.getElementById("replaceBtn");
  REVERT_BUTTON = document.getElementById("revertBtn");

  SEARCH_BOX.addEventListener("keyup", enableSearchButton);
  SEARCH_BUTTON.addEventListener("click", onClickSearchButton);
  CANCEL_BUTTON.addEventListener("click", onClickCancelButton);
  SELECTION.addEventListener("change", showReplacementForm);
  REPLACEMENT_BOX.addEventListener("keyup", enableReplaceButton);
  REPLACE_BUTTON.addEventListener("click", onClickReplaceButton);
  REVERT_BUTTON.addEventListener("click", onClickRevertButton);
  window.addEventListener('message', event => {
    const { command } = event.data;

    switch (command) {
      // Lock the search part not to be modified and display the replacement part 
      case strings.onFoundSearchResultWebviewCommand:
        SEARCH_BOX.readOnly = true;
        CHECKBOX.readOnly = true;
        SEARCH_BUTTON.disabled = true;
        CANCEL_BUTTON.disabled = false;
        REPLACEMENT_PART.style.display = "inline";
        SELECTION.value = strings.replacementOperationDefaultText;

        break;
      // This part will lock all UI not to be modified during the API progress
      case strings.lockUIComponentsWebviewCommand:
        SEARCH_BOX.readOnly = true;
        CHECKBOX.readOnly = true;
        SEARCH_BUTTON.disabled = true;
        CANCEL_BUTTON.disabled = true;
        SELECTION.disabled = true;
        REVERT_BUTTON.disabled = true;
        REPLACE_BUTTON.disabled = true;
        REPLACEMENT_BOX.readOnly = true;

        break;
      // This part will unlock the necessary parts of the UI after the API progress
      case strings.unlockUIComponentsWebviewCommand:
        // Unlock search button and search box if no result found for the current search query
        if (REPLACEMENT_PART.style.display !== "inline") {
          SEARCH_BOX.readOnly = false;
          CHECKBOX.readOnly = false;
          SEARCH_BUTTON.disabled = false;
        }
        // Unlock the remain parts of the UI if a result found for the current search query
        else {
          CANCEL_BUTTON.disabled = false;
          SELECTION.disabled = false;
          REVERT_BUTTON.disabled = false;
          // Since the text of the Remove Tag and Remove Upper Tag options is fixed and already written,
          // replacement box for these choices is always readonly and replace button is always enabled.
          if (SELECTION.value === strings.removeTagText || SELECTION.value === strings.removeUpperTagText) {
            REPLACE_BUTTON.disabled = false;
            REPLACEMENT_BOX.readOnly = true;
          }
          // Replacement box for other choices will be no longer readonly and
          // replace button is enabled if a replace text has been provided 
          else {
            REPLACEMENT_BOX.readOnly = false;
            enableReplaceButton();
          }
        }

        break;
    }
  });
}

function onClickSearchButton() {

  vscode.postMessage({
    command: CHECKBOX.checked ? strings.searchInFilesWebviewCommand : strings.searchInFilesWebviewCommand,
    search: SEARCH_BOX.value
  });
}

function onClickCancelButton() {
  SEARCH_BOX.readOnly = false;
  CHECKBOX.readOnly = false;
  SEARCH_BUTTON.disabled = false;
  CANCEL_BUTTON.disabled = true;
  REPLACEMENT_PART.style.display = "none";
  REPLACEMENT_FORM.style.display = "none";
  SELECTION.value = "";

  vscode.postMessage({
    command: strings.cancelSearchWebviewCommand
  });
}

function onClickReplaceButton() {

  vscode.postMessage({
    command: CHECKBOX.checked ? strings.replaceInFilesWebviewCommand : strings.replaceInFileWebviewCommand,
    search: SEARCH_BOX.value,
    replace: REPLACEMENT_BOX.value,
    choice: SELECTION.value
  });
}

function onClickRevertButton() {

  vscode.postMessage({
    command: strings.revertChangesWebviewCommand,
    choice: SELECTION.value
  });
}

function enableSearchButton() {

  if (SEARCH_BOX.value.trim() === "") {
    SEARCH_BUTTON.disabled = true;
  } else {
    SEARCH_BUTTON.disabled = false;
  }
}

function enableReplaceButton() {

  if (REPLACEMENT_BOX.value.trim() === "") {
    REPLACE_BUTTON.disabled = true;
  } else {
    REPLACE_BUTTON.disabled = false;
  }
}

function showReplacementForm() {
  const choice = SELECTION.value;
  REPLACEMENT_BOX.innerText = strings.replaceTextAreaDefaultTitle;
  REPLACEMENT_BOX.value = "";
  REPLACE_BUTTON.disabled = true;
  REPLACEMENT_BOX.readOnly = false;

  if (choice !== strings.replacementOperationDefaultText) {
    REPLACEMENT_FORM.style.display = "inline";

    switch (choice) {
      case strings.setClassNameText:
        REPLACEMENT_BOX.placeholder = strings.replaceTextAreaPlaceholderForClassOperations;
        REPLACE_BUTTON.innerText = strings.replaceButtonSetOperationText;
        break;

      case strings.appendClassNameText:
        REPLACEMENT_BOX.placeholder = strings.replaceTextAreaPlaceholderForClassOperations;
        REPLACE_BUTTON.innerText = strings.replaceButtonAppendOperationText;
        break;

      case strings.removeClassNameText:
        REPLACEMENT_BOX.placeholder = strings.replaceTextAreaPlaceholderForClassOperations;
        REPLACE_BUTTON.innerText = strings.replaceButtonRemoveOperationText;
        break;

      case strings.setIdValueText:
        REPLACEMENT_BOX.placeholder = strings.replaceTextAreaPlaceholderForSetIdOperation;
        REPLACE_BUTTON.innerText = strings.replaceButtonSetOperationText;
        break;

      case strings.setStylePropertyText:
        REPLACEMENT_BOX.placeholder = strings.replaceTextAreaPlaceholderForStyleOperations;
        REPLACE_BUTTON.innerText = strings.replaceButtonSetOperationText;
        break;

      case strings.editStylePropertyText:
        REPLACEMENT_BOX.placeholder = strings.replaceTextAreaPlaceholderForStyleOperations;
        REPLACE_BUTTON.innerText = strings.replaceButtonEditOperationText;
        break;

      case strings.setAttributeText:
        REPLACEMENT_BOX.placeholder = strings.replaceTextAreaPlaceholderForAttributeValueOperations;
        REPLACE_BUTTON.innerText = strings.replaceButtonSetOperationText;
        break;

      case strings.appendAttributeValueText:
        REPLACEMENT_BOX.placeholder = strings.replaceTextAreaPlaceholderForAttributeValueOperations;
        REPLACE_BUTTON.innerText = strings.replaceButtonAppendOperationText;
        break;

      case strings.removeAttributeValueText:
        REPLACEMENT_BOX.placeholder = strings.replaceTextAreaPlaceholderForAttributeValueOperations;
        REPLACE_BUTTON.innerText = strings.replaceButtonRemoveOperationText;
        break;

      case strings.removeAttributeText:
        REPLACEMENT_BOX.placeholder = strings.replaceTextAreaPlaceholderForRemoveAttributeOperation;
        REPLACE_BUTTON.innerText = strings.replaceButtonRemoveOperationText;
        break;

      case strings.editTagNameText:
        REPLACEMENT_BOX.placeholder = strings.replaceTextAreaPlaceholderForEditTagNameOperation;
        REPLACE_BUTTON.innerText = strings.replaceButtonEditOperationText;
        break;

      case strings.removeTagText:
        REPLACEMENT_BOX.innerText = strings.replaceTextAreaTitleForRemoveTagOperation;
        REPLACEMENT_BOX.value = strings.confirmationTextForRemoveTagOperations;
        REPLACEMENT_BOX.readOnly = true;
        REPLACE_BUTTON.disabled = false;
        REPLACE_BUTTON.innerText = strings.replaceButtonRemoveOperationText;
        break;

      case strings.addUpperTagText:
        REPLACEMENT_BOX.placeholder = strings.replaceTextAreaPlaceholderForAddUpperTagOperation;
        REPLACE_BUTTON.innerText = strings.replaceButtonAddOperationText;
        break;

      case strings.removeUpperTagText:
        REPLACEMENT_BOX.innerText = strings.replaceTextAreaTitleForRemoveUpperTagOperation;
        REPLACEMENT_BOX.value = strings.confirmationTextForRemoveTagOperations;
        REPLACEMENT_BOX.readOnly = true;
        REPLACE_BUTTON.disabled = false;
        REPLACE_BUTTON.innerText = strings.replaceButtonRemoveOperationText;
        break;
    }
  }
  else {
    REPLACEMENT_FORM.style.display = "none";
  }
}
import { test, expect, type FrameLocator, type Page } from '@playwright/test';
import strings from '../../stringVariables.json';
import { prepareTestEnvironment } from './prepareTestEnvironment';

let webview: FrameLocator;
let page: Page;

const validSearchQueries = [
  { title: 'Search with type selector', query: 'div' },
  { title: 'Search with class selector', query: '.form-group' },
  { title: 'Search with multiple class values', query: '.form-group.row' },
  { title: 'Search with id selector', query: '#altElements' },
  { title: 'Search with attribute selector', query: '[alt = "I-have-alt-attribute"]' },
  { title: 'Search with multiple attribute selector', query: '[alt $= "alt-attribute"][src *= "images"][height]' },
  { title: 'Search with type, class, id, and attribute selectors together', query: 'main#idal.aslan[atr ^= "upper-tag"]' },
  { title: 'Search with multiple CSS selectors', query: 'div.form.group, img[src $= "svg"], #idal' },
];

const invalidReplacementOperations = [
  { title: 'Warn the user when invalid class-name(s) provided (Set Class)', replacementProcess: strings.setClassNameText, replacementText: 'İnvalid-class-name1 valid-class-name invalid-class-şçö', expectedWarningMessage: strings.invalidClassNamePluralMessage },
  { title: 'Warn the user when an invalid id value is provided (Set Id)', replacementProcess: strings.setIdValueText, replacementText: 'id with whitespace char', expectedWarningMessage: strings.invalidIdValueMessage },
  { title: 'Warn the user when no attribute value is provided (Append to Attribute)', replacementProcess: strings.appendAttributeValueText, replacementText: 'attribute-name', expectedWarningMessage: strings.missingAttributeValueMessage },
  { title: 'Warn the user when an invalid attribute-name provided (Set Attribute)', replacementProcess: strings.setAttributeText, replacementText: 'invalidAtrName{} atr-value', expectedWarningMessage: strings.invalidAttributeNameSingularMessage },
  { title: 'Warn the user when invalid attribute value(s) provided (Set Attribute)', replacementProcess: strings.setAttributeText, replacementText: 'alt <invalidValue1> validValue invalid&Value2', expectedWarningMessage: strings.invalidAttributeValuePluralMessage },
  { title: 'Warn the user when invalid property-value structure(s) provided (Set Style Property)', replacementProcess: strings.setStylePropertyText, replacementText: 'display: inline, property= value, property: value', expectedWarningMessage: strings.invalidPropertyValueStructureMessage },
  { title: 'Warn the user when invalid property-value pair(s) provided (Edit Style Property)', replacementProcess: strings.editStylePropertyText, replacementText: 'acx: 213, display: inline, width: abc', expectedWarningMessage: strings.invalidPropertyValuePairMessage },
  { title: 'Warn the user when an invalid tag name is provided (Edit Tag Name)', replacementProcess: strings.editTagNameText, replacementText: 'invalid tag name', expectedWarningMessage: strings.invalidTagNameMessage },
  { title: 'Warn the user when an invalid tag name is provided (Add Upper Tag)', replacementProcess: strings.addUpperTagText, replacementText: 'invalid tag name#id.class[atr="test"]', expectedWarningMessage: strings.invalidTagNameMessage },
  { title: 'Warn the user when an invalid id value is provided (Add Upper Tag)', replacementProcess: strings.addUpperTagText, replacementText: 'newuppertag#İnvalidİdValue.class[atr="test"]', expectedWarningMessage: strings.invalidIdValueMessage },
  { title: 'Warn the user when an invalid class-name is provided (Add Upper Tag)', replacementProcess: strings.addUpperTagText, replacementText: 'newuppertag#id.İnvalidClassName[atr="test"]', expectedWarningMessage: strings.invalidClassNameSingularMessage },
  { title: 'Warn the user when an invalid attribute-value structure is provided (Add Upper Tag)', replacementProcess: strings.addUpperTagText, replacementText: 'newuppertag#id.class[atr=test]', expectedWarningMessage: strings.invalidAttributeValuePairStructureMessage },
  { title: 'Warn the user when an invalid attribute name is provided (Add Upper Tag)', replacementProcess: strings.addUpperTagText, replacementText: 'newuppertag#id.class[{invalid-atr-name}="test"]', expectedWarningMessage: strings.invalidAttributeNameSingularMessage },
  { title: 'Warn the user when an invalid attribute value is provided (Add Upper Tag)', replacementProcess: strings.addUpperTagText, replacementText: 'newuppertag#id.class[atr="<test>"]', expectedWarningMessage: strings.invalidAttributeValueSingularMessage }
];

const searchAndReplaceScope = [
  { title: 'in the workspace', inWorkspace: true, folderName: 'test-files-for-replacement-in-workspace' },
  { title: 'in the current file', inWorkspace: false, folderName: 'test-files-for-replacement-in-file' }
];

const validReplacementOperations = [
  { title: 'Set Class', replacementProcess: strings.setClassNameText, replacementText: 'test-class-name1-to-set class-name-2' },
  { title: 'Append to Class', replacementProcess: strings.appendClassNameText, replacementText: 'test-class-name1-to-append className2' },
  { title: 'Remove from Class', replacementProcess: strings.removeClassNameText, replacementText: 'form-group' },
  { title: 'Set Id', replacementProcess: strings.setIdValueText, replacementText: 'test-id' },
  { title: 'Set Attribute', replacementProcess: strings.setAttributeText, replacementText: 'atr-name-to-set value-1 value-2' },
  { title: 'Append to Attribute', replacementProcess: strings.appendAttributeValueText, replacementText: 'alt appendValue1 appendValue2' },
  { title: 'Remove from Attribute', replacementProcess: strings.removeAttributeValueText, replacementText: 'alt I-have-alt-attribute' },
  { title: 'Remove Attribute', replacementProcess: strings.removeAttributeText, replacementText: 'alt style' },
  { title: 'Set Style Property', replacementProcess: strings.setStylePropertyText, replacementText: 'display: block, color: red' },
  { title: 'Edit Style Property', replacementProcess: strings.editStylePropertyText, replacementText: 'display: null, color: blue, width: auto' },
  { title: 'Edit Tag Name', replacementProcess: strings.editTagNameText, replacementText: 'newtagname' },
  { title: 'Add Upper Tag', replacementProcess: strings.addUpperTagText, replacementText: 'uppertag#test.test[attribute="test-value"]' },
  { title: 'Remove Upper Tag', replacementProcess: strings.removeUpperTagText, replacementText: null },
  { title: 'Remove Tag', replacementProcess: strings.removeTagText, replacementText: null },
];

test.describe('Extension Tests', () => {
  // All structural search tests can be executed simultaneously
  test.describe.parallel('Structural Search Tests', () => {

    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext();
      page = await context.newPage();

      webview = await prepareTestEnvironment(page, 'test-files-for-search');
    });

    test.afterAll(async () => {
      await page.close();
    });

    test('Warn the user when an invalid CSS selector is provided', async () => {
      // Click on the search text area
      await webview.getByRole('textbox', { name: strings.searchTextAreaTitle }).click();

      // Enter an invalid CSS Selector
      await webview.getByRole('textbox', { name: strings.searchTextAreaTitle }).fill('invalidSelector{}');
      await webview.locator('#searchBox').dispatchEvent('keyup');

      // Search in the workspace
      await webview.locator('#searchInAll').check();
      await webview.locator('#searchBtn').getByRole('button').click();

      // Verify that the user is warned due to an invalid search query (CSS selector)
      await expect.soft(page.getByRole('dialog').locator('div').first()).toContainText(strings.invalidCssSelectorMessage);
    });

    test('Warn the user if the currently active document is not an HTML file', async () => {
      // Open a non-HTML file
      await page.getByRole('treeitem', { name: 'nonHtmlFile.txt' }).locator('a').click();

      // Create a search query
      await webview.getByRole('textbox', { name: strings.searchTextAreaTitle }).click();
      await webview.getByRole('textbox', { name: strings.searchTextAreaTitle }).fill('div');
      await webview.locator('#searchBox').dispatchEvent('keyup');

      // Search in only the current file
      await webview.locator('#searchInAll').uncheck();
      await webview.locator('#searchBtn').getByRole('button').click();

      // Verify that the user is warned since the current file is an invalid document 
      await expect.soft(page.getByRole('dialog').locator('div').first()).toHaveText(strings.invalidDocumentIsOpenedMessage);
    });

    test('Warn the user when no search results found', async () => {
      // Create a search query and trigger the search process in the workspace
      await webview.getByRole('textbox', { name: strings.searchTextAreaTitle }).click();
      await webview.getByRole('textbox', { name: strings.searchTextAreaTitle }).fill('nonexistentTag');
      await webview.locator('#searchBox').dispatchEvent('keyup');
      await webview.locator('#searchInAll').check();
      await webview.locator('#searchBtn').getByRole('button').click();

      // Verfiy that the user is warned since there is not any search result found
      await expect.soft(page.getByRole('dialog').locator('div').first()).toContainText(strings.nothingFoundToModifyInFileMessage);
    });

    validSearchQueries.forEach(data => {
      test(data.title, async () => {
        // Create a search query and trigger the search process
        await webview.getByRole('textbox', { name: strings.searchTextAreaTitle }).click();
        await webview.getByRole('textbox', { name: strings.searchTextAreaTitle }).fill(data.query);
        await webview.locator('#searchBox').dispatchEvent('keyup');
        await webview.locator('#searchInAll').check();
        await webview.locator('#searchBtn').getByRole('button').click();

        // Wait for the search results
        await page.waitForSelector('div.messages.text-search-provider-messages > div.message');
        // Verify that there are search results found
        await expect.soft(page.locator('div.messages.text-search-provider-messages > div.message')).toHaveText(/^\d+ result/);

        // Go back to the search part
        await webview.locator('#cancelBtn').getByRole('button').click();
      });
    });
  });

  // The test groups of structural replace can be executed simultaneously
  test.describe.parallel('Structural Replace Tests', async () => {
    // All tests for checking replacement text can be executed simultaneously
    test.describe.parallel("Check Replacement Text", () => {

      test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext();
        page = await context.newPage();

        // Since the test files for the structural search tests are not modified,
        // these test files can be also used to perform the tests for checking replacement text
        webview = await prepareTestEnvironment(page, 'test-files-for-search');

        // Create a search query
        await webview.getByRole('textbox', { name: strings.searchTextAreaTitle }).click();
        await webview.getByRole('textbox', { name: strings.searchTextAreaTitle }).fill('div, img');
        await webview.locator('#searchBox').dispatchEvent('keyup');

        // Search in the whole workspace 
        await webview.locator('#searchInAll').check();
      });

      test.afterAll(async () => {
        await page.close();
      });

      invalidReplacementOperations.forEach(data => {
        test(data.title, async () => {

          await test.step('Replacement Trial', async () => {
            // Clear all notifications that block screen
            await page.getByRole('button', { name: 'Notifications' }).click();
            await page.getByRole('button', { name: 'Clear All Notifications' }).click({ force: true });

            // Search with the created search query
            await webview.locator('#searchBtn').getByRole('button').click();

            // Wait for the search results
            await page.waitForSelector('div.messages.text-search-provider-messages > div.message');
            // Verify that there are search results found
            await expect.soft(page.locator('div.messages.text-search-provider-messages > div.message')).toHaveText(/^\d+ result/);

            // Open the list of replacement operations
            await webview.locator('#selection').click();
            // Select a replacement process
            await webview.getByRole('option', { name: data.replacementProcess }).click();

            // Enter an invalid replacement text and trigger the replacement process
            await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).click();
            await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).fill(data.replacementText);
            await webview.locator('#replacementBox').dispatchEvent('keyup');
            await webview.locator('#replaceBtn').getByRole('button').click();

            // Verify that the user is warned according to the invalid replacement text
            await expect.soft(page.getByRole('dialog').locator('div').first()).toContainText(data.expectedWarningMessage);
          });

          await test.step("Rollback Trial", async () => {
            // Clear all notifications that block screen
            await page.getByRole('button', { name: 'Notifications' }).click();
            await page.getByRole('button', { name: 'Clear All Notifications' }).click({ force: true });

            // Try to revert changes after each replacement trial
            await webview.locator('#revertBtn').getByRole('button').click();

            // Verify that nothing is changed since there is not any replacement process performed
            await expect.soft(page.getByRole('dialog').locator('div').first()).toHaveText(strings.nothingFoundToRevertMessage);
          });

          // Go back to the search part for a new replacement trial
          await webview.locator('#cancelBtn').getByRole('button').click();
        });
      });
    });

    searchAndReplaceScope.forEach(value => {
      // Since the tests for the valid replacement operations may try to overwrite the same file(s) at the same time in case of parallelism,
      // these tests were serially connected
      test.describe.serial(`Replace ${value.title}`, () => {
  
        test.beforeAll(async ({ browser }) => {
          const context = await browser.newContext();
          page = await context.newPage();
  
          webview = await prepareTestEnvironment(page, value.folderName);
  
          // Open an HTML document with at least one div element
          await page.getByRole('treeitem', { name: 'sample1.html' }).locator('a').click();
  
          // Create a search query to find div elements
          await webview.getByRole('textbox', { name: strings.searchTextAreaTitle }).click();
          await webview.getByRole('textbox', { name: strings.searchTextAreaTitle }).fill('div');
          await webview.locator('#searchBox').dispatchEvent('keyup');
  
          // Test each replacement operation in the workspace and in the current file
          value.inWorkspace ? await webview.locator('#searchInAll').check() : await webview.locator('#searchInAll').uncheck();
        });
  
        test.afterAll(async () => {
          await page.close();
        });
  
        for (let data of validReplacementOperations) {
          test(`${data.title} ${value.title}`, async () => {
  
            await test.step(`${data.title}(Apply the Replacement)`, async () => {
              // Clear all notifications that block screen
              await page.getByRole('button', { name: 'Notifications' }).click();
              await page.getByRole('button', { name: 'Clear All Notifications' }).click({ force: true });
  
              // Start search query
              await webview.locator('#searchBtn').getByRole('button').click();
  
              // Wait for the search results
              await page.waitForSelector('div.messages.text-search-provider-messages > div.message');
              // Verify that there are search results found
              await expect.soft(page.locator('div.messages.text-search-provider-messages > div.message')).toHaveText(/^\d+ result/);
  
              // Open the list of replacement operations
              await webview.locator('#selection').click();
              // Select a replacement process
              await webview.getByRole('option', { name: data.replacementProcess }).click();
  
              // If a replacement text is necessary to perform the replacement process, enter a valid replacement text 
              if (data.replacementText !== null) {
                await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).click();
                await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).fill(data.replacementText);
                await webview.locator('#replacementBox').dispatchEvent('keyup');
              }
  
              // trigger the replacement process
              await webview.locator('#replaceBtn').getByRole('button').click();
  
              // Verify that the replacement process is successfull
              await expect.soft(page.getByRole('dialog').locator('div').first()).toHaveText(`${strings.replacementProcessName} ${strings.successfulProcessMessage}`);
            });
  
            await test.step(`${data.title}(Rollback the Replacement)`, async () => {
              // Clear all notifications that block screen
              await page.getByRole('button', { name: 'Notifications' }).click();
              await page.getByRole('button', { name: 'Clear All Notifications' }).click({ force: true });
  
              // Revert changes after each replacement process (to preserve the structure of test files for other replacement tests)
              await webview.locator('#revertBtn').getByRole('button').click();
              // Verify that the rollback process is successfull
              await expect.soft(page.getByRole('dialog').locator('div').first()).toHaveText(`${strings.revertProcessName} ${strings.successfulProcessMessage}`);
            });
  
            // Go back to the search part for a new replacement process
            await webview.locator('#cancelBtn').getByRole('button').click();
          });
        }
      });
    });
  });
});
import { test, expect, type FrameLocator, type Page, chromium } from '@playwright/test';
import strings from '../../stringVariables.json';
import { prepareTestEnvironment } from './prepareTestEnvironment';

test.describe.parallel('Extension Tests', () => {
  let webview: FrameLocator;
  let page: Page;

  test.describe.serial('Structural Search Tests', () => {

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage();
      webview = await prepareTestEnvironment(page);
    });

    test.afterAll(async () => {
      await page.close();
    });

    test('Warn the user when an invalid CSS selector is provided', async () => {
      await webview.getByRole('textbox', { name: strings.searchTextAreaTitle }).click();
      await webview.getByRole('textbox', { name: strings.searchTextAreaTitle }).fill('invalidSelector{}');
      await webview.locator('#searchBox').dispatchEvent('keyup');
      await webview.locator('#searchInAll').check();
      await webview.locator('#searchBtn').getByRole('button').click();

      await expect(page.getByRole('dialog').locator('div').first()).toContainText(`${strings.invalidCssSelectorMessage}`);
    });

    test('Warn the user if the currently active document is not an HTML file', async () => {
      // Open a non-HTML file
      await page.getByRole('treeitem', { name: 'nonHtmlFile.txt' }).locator('a').click();

      await webview.getByRole('textbox', { name: strings.searchTextAreaTitle }).click();
      await webview.getByRole('textbox', { name: strings.searchTextAreaTitle }).fill('div');
      await webview.locator('#searchBox').dispatchEvent('keyup');
      await webview.locator('#searchInAll').uncheck();
      await webview.locator('#searchBtn').getByRole('button').click();

      await expect(page.getByRole('dialog').locator('div').first()).toContainText(`${strings.invalidDocumentIsOpenedMessage}`);
    });

    test('Warn the user when no search results found', async () => {
      await webview.getByRole('textbox', { name: strings.searchTextAreaTitle }).click();
      await webview.getByRole('textbox', { name: strings.searchTextAreaTitle }).fill('nonexistentTag');
      await webview.locator('#searchBox').dispatchEvent('keyup');
      await webview.locator('#searchInAll').check();
      await webview.locator('#searchBtn').getByRole('button').click();

      await expect(page.getByRole('dialog').locator('div').first()).toContainText(`${strings.nothingFoundToModifyInFileMessage}`);
    });

    test('Search with type selector', async () => {
      await webview.getByRole('textbox', { name: strings.searchTextAreaTitle }).click();
      await webview.getByRole('textbox', { name: strings.searchTextAreaTitle }).fill('div');
      await webview.locator('#searchBox').dispatchEvent('keyup');
      await webview.locator('#searchInAll').check();
      await webview.locator('#searchBtn').getByRole('button').click();

      await page.waitForSelector('div.messages.text-search-provider-messages > div.message');
      await expect(page.locator('div.messages.text-search-provider-messages > div.message')).toHaveText(/\d+ results in \d+ files/);
      await webview.locator('#cancelBtn').getByRole('button').click();
    });

    test('Search with class selector', async () => {
      await webview.getByRole('textbox', { name: strings.searchTextAreaTitle }).click();
      await webview.getByRole('textbox', { name: strings.searchTextAreaTitle }).fill('.form-group');
      await webview.locator('#searchBox').dispatchEvent('keyup');
      await webview.locator('#searchInAll').check();
      await webview.locator('#searchBtn').getByRole('button').click();

      await page.waitForSelector('div.messages.text-search-provider-messages > div.message');
      await expect(page.locator('div.messages.text-search-provider-messages > div.message')).toHaveText(/\d+ results in \d+ files/);
      await webview.locator('#cancelBtn').getByRole('button').click();
    });

    test('Search with id selector', async () => {
      await webview.getByRole('textbox', { name: strings.searchTextAreaTitle }).click();
      await webview.getByRole('textbox', { name: strings.searchTextAreaTitle }).fill('#altElements');
      await webview.locator('#searchBox').dispatchEvent('keyup');
      await webview.locator('#searchInAll').check();
      await webview.locator('#searchBtn').getByRole('button').click();

      await page.waitForSelector('div.messages.text-search-provider-messages > div.message');
      await expect(page.locator('div.messages.text-search-provider-messages > div.message')).toHaveText(/\d+ results in \d+ files/);
      await webview.locator('#cancelBtn').getByRole('button').click();
    });

    test('Search with attribute selector', async () => {
      await webview.getByRole('textbox', { name: strings.searchTextAreaTitle }).click();
      await webview.getByRole('textbox', { name: strings.searchTextAreaTitle }).fill('[alt="I-have-alt-attribute"]');
      await webview.locator('#searchBox').dispatchEvent('keyup');
      await webview.locator('#searchInAll').check();
      await webview.locator('#searchBtn').getByRole('button').click();

      await page.waitForSelector('div.messages.text-search-provider-messages > div.message');
      await expect(page.locator('div.messages.text-search-provider-messages > div.message')).toHaveText(/\d+ results in \d+ files/);
      await webview.locator('#cancelBtn').getByRole('button').click();
    });

    test('Search with type, class, id, and attribute selectors together', async () => {
      await webview.getByRole('textbox', { name: strings.searchTextAreaTitle }).click();
      await webview.getByRole('textbox', { name: strings.searchTextAreaTitle }).fill('main#idal.aslan[atr^="upper-tag"]');
      await webview.locator('#searchBox').dispatchEvent('keyup');
      await webview.locator('#searchInAll').check();
      await webview.locator('#searchBtn').getByRole('button').click();

      await page.waitForSelector('div.messages.text-search-provider-messages > div.message');
      await expect(page.locator('div.messages.text-search-provider-messages > div.message')).toHaveText(/\d+ results in \d+ files/);
    });
  });

  test.describe.serial('Structural Replace Tests', () => {
    let webview: FrameLocator;
    let page: Page;

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage();
      webview = await prepareTestEnvironment(page);

      // Open an HTML document with at least one div element
      await page.getByRole('treeitem', { name: 'sample1.html' }).locator('a').click();

      // Create a search query
      await webview.getByRole('textbox', { name: strings.searchTextAreaTitle }).click();
      await webview.getByRole('textbox', { name: strings.searchTextAreaTitle }).fill('div');
      await webview.locator('#searchBox').dispatchEvent('keyup');

      // Search and Replace only in the current file
      await webview.locator('#searchInAll').uncheck();
    });

    test.afterAll(async () => {
      await page.close();
    });

    test.beforeEach(async () => {
      // Start search query
      await webview.locator('#searchBtn').getByRole('button').click();

      // Open the list of replacement operations
      await webview.locator('#selection div').nth(1).click();
    });

    test.afterEach(async () => {
      // Revert changes after each replacement process (to preserve the structure of test files for other replacement tests)
      await webview.locator('#revertBtn').getByRole('button').click();
      // Validate that rollback process is successfull or nothing found to revert (if nothing changed)
      await expect(page.getByRole('dialog').locator('div').first()).toHaveText(new RegExp(`${strings.revertProcessName} ${strings.successfulProcessMessage}\|${strings.nothingFoundToRevertMessage}`));

      // Go back to the search part for a new replacement process
      await webview.locator('#cancelBtn').getByRole('button').click();

      // Clear all notifications
      await page.getByRole('button', { name: 'Notifications' }).click();
      await page.getByRole('button', { name: 'Clear All Notifications' }).click();
    });


    test.describe.serial('Class Operations', async () => {

      test('Warn the user when invalid class-name(s) provided', async () => {
        await webview.getByRole('option', { name: strings.setClassNameText }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).fill('İnvalid-class-name1 valid-class-name invalid-class-şçö');
        await webview.locator('#replacementBox').dispatchEvent('keyup');
        await webview.locator('#replaceBtn').getByRole('button').click();

        await expect(page.getByRole('dialog').locator('div').first()).toContainText(`${strings.invalidClassNamePluralMessage}`);
      });

      test('Set Class Operation', async () => {
        await webview.getByRole('option', { name: strings.setClassNameText }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).fill('test-class-name1-to-set class-name-2');
        await webview.locator('#replacementBox').dispatchEvent('keyup');
        await webview.locator('#replaceBtn').getByRole('button').click();

        await expect(page.getByRole('dialog').locator('div').first()).toHaveText(`${strings.replacementProcessName} ${strings.successfulProcessMessage}`);
      });

      test('Append to Class Operation', async () => {
        await webview.getByRole('option', { name: strings.appendClassNameText }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).fill('test-class-name1-to-append class-name-2');
        await webview.locator('#replacementBox').dispatchEvent('keyup');
        await webview.locator('#replaceBtn').getByRole('button').click();

        await expect(page.getByRole('dialog').locator('div').first()).toHaveText(`${strings.replacementProcessName} ${strings.successfulProcessMessage}`);
      });

      test('Remove from Class Operation', async () => {
        await webview.getByRole('option', { name: strings.removeClassNameText }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).fill('form-group');
        await webview.locator('#replacementBox').dispatchEvent('keyup');
        await webview.locator('#replaceBtn').getByRole('button').click();

        await expect(page.getByRole('dialog').locator('div').first()).toHaveText(`${strings.replacementProcessName} ${strings.successfulProcessMessage}`);
      });
    });

    test.describe.serial('Id Operations', async () => {

      test('Warn the user when an invalid id value is provided', async () => {
        await webview.getByRole('option', { name: strings.setIdValueText }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).fill('id with whitespace char');
        await webview.locator('#replacementBox').dispatchEvent('keyup');
        await webview.locator('#replaceBtn').getByRole('button').click();

        await expect(page.getByRole('dialog').locator('div').first()).toContainText(`${strings.invalidIdValueMessage}`);
      });

      test('Set Id', async () => {
        await webview.getByRole('option', { name: strings.setIdValueText }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).fill('test-id');
        await webview.locator('#replacementBox').dispatchEvent('keyup');
        await webview.locator('#replaceBtn').getByRole('button').click();

        await expect(page.getByRole('dialog').locator('div').first()).toHaveText(`${strings.replacementProcessName} ${strings.successfulProcessMessage}`);
      });
    });

    test.describe.serial('Attribute Operations', async () => {

      test('Warn the user when invalid attribute-name(s) provided', async () => {
        await webview.getByRole('option', { name: strings.setAttributeText }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).fill('invalidAtrName{} atr-value');
        await webview.locator('#replacementBox').dispatchEvent('keyup');
        await webview.locator('#replaceBtn').getByRole('button').click();

        await expect(page.getByRole('dialog').locator('div').first()).toContainText(`${strings.invalidAttributeNameSingularMessage}`);
      });

      test('Warn the user when invalid attribute value(s) provided', async () => {
        await webview.getByRole('option', { name: strings.appendAttributeValueText }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).fill('alt <invalidValue1> validValue invalid&Value2');
        await webview.locator('#replacementBox').dispatchEvent('keyup');
        await webview.locator('#replaceBtn').getByRole('button').click();

        await expect(page.getByRole('dialog').locator('div').first()).toContainText(`${strings.invalidAttributeValuePluralMessage}`);
      });

      test('Set Attribute', async () => {
        await webview.getByRole('option', { name: strings.setAttributeText }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).fill('atr-name-to-set value1 value2');
        await webview.locator('#replacementBox').dispatchEvent('keyup');
        await webview.locator('#replaceBtn').getByRole('button').click();

        await expect(page.getByRole('dialog').locator('div').first()).toHaveText(`${strings.replacementProcessName} ${strings.successfulProcessMessage}`);
      });

      test('Append to Attribute', async () => {
        await webview.getByRole('option', { name: strings.appendAttributeValueText }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).fill('alt value1-to-append value2-to-append');
        await webview.locator('#replacementBox').dispatchEvent('keyup');
        await webview.locator('#replaceBtn').getByRole('button').click();

        await expect(page.getByRole('dialog').locator('div').first()).toHaveText(`${strings.replacementProcessName} ${strings.successfulProcessMessage}`);
      });

      test('Remove from Attribute', async () => {
        await webview.getByRole('option', { name: strings.removeAttributeValueText }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).fill('alt I-have-alt-attribute');
        await webview.locator('#replacementBox').dispatchEvent('keyup');
        await webview.locator('#replaceBtn').getByRole('button').click();

        await expect(page.getByRole('dialog').locator('div').first()).toHaveText(`${strings.replacementProcessName} ${strings.successfulProcessMessage}`);
      });

      test('Remove Attribute', async () => {
        await webview.getByRole('option', { name: strings.removeAttributeText }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).fill('alt style');
        await webview.locator('#replacementBox').dispatchEvent('keyup');
        await webview.locator('#replaceBtn').getByRole('button').click();

        await expect(page.getByRole('dialog').locator('div').first()).toHaveText(`${strings.replacementProcessName} ${strings.successfulProcessMessage}`);
      });
    });

    test.describe.serial('Style Operations', async () => {

      test('Warn the user when invalid property-value structure(s) provided', async () => {
        await webview.getByRole('option', { name: strings.setStylePropertyText }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).fill('invalid-property/invalid-value');
        await webview.locator('#replacementBox').dispatchEvent('keyup');
        await webview.locator('#replaceBtn').getByRole('button').click();

        await expect(page.getByRole('dialog').locator('div').first()).toContainText(`${strings.invalidPropertyValueStructureMessage}`);
      });

      test('Warn the user when invalid property-value pair(s) provided', async () => {
        await webview.getByRole('option', { name: strings.editStylePropertyText }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).fill('acx: 213, display: inline, width: abc');
        await webview.locator('#replacementBox').dispatchEvent('keyup');
        await webview.locator('#replaceBtn').getByRole('button').click();

        await expect(page.getByRole('dialog').locator('div').first()).toContainText(`${strings.invalidPropertyValuePairMessage}`);
      });

      test('Set Style Property', async () => {
        await webview.getByRole('option', { name: strings.setStylePropertyText }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).fill('display: block, color: red');
        await webview.locator('#replacementBox').dispatchEvent('keyup');
        await webview.locator('#replaceBtn').getByRole('button').click();

        await expect(page.getByRole('dialog').locator('div').first()).toHaveText(`${strings.replacementProcessName} ${strings.successfulProcessMessage}`);
      });

      test('Edit Style Property', async () => {
        await webview.getByRole('option', { name: strings.editStylePropertyText }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).fill('display: null, color: blue');
        await webview.locator('#replacementBox').dispatchEvent('keyup');
        await webview.locator('#replaceBtn').getByRole('button').click();

        await expect(page.getByRole('dialog').locator('div').first()).toHaveText(`${strings.replacementProcessName} ${strings.successfulProcessMessage}`);
      });
    });

    test.describe.serial('Edit Tag Name Operations', async () => {

      test('Warn the user when an invalid tag name is provided', async () => {
        await webview.getByRole('option', { name: strings.editTagNameText }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).fill('invalid tag name');
        await webview.locator('#replacementBox').dispatchEvent('keyup');
        await webview.locator('#replaceBtn').getByRole('button').click();

        await expect(page.getByRole('dialog').locator('div').first()).toHaveText(`${strings.invalidTagNameMessage}`);
      });

      test('Edit Tag Name', async () => {
        await webview.getByRole('option', { name: strings.editTagNameText }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).fill('newtagname');
        await webview.locator('#replacementBox').dispatchEvent('keyup');
        await webview.locator('#replaceBtn').getByRole('button').click();

        await expect(page.getByRole('dialog').locator('div').first()).toHaveText(`${strings.replacementProcessName} ${strings.successfulProcessMessage}`);
      });
    });

    test.describe.serial('Add Upper Tag Operations', async () => {

      test('Warn the user when an invalid tag name is provided', async () => {
        await webview.getByRole('option', { name: strings.addUpperTagText }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).fill('invalid tag name#id.class[atr="test"]');
        await webview.locator('#replacementBox').dispatchEvent('keyup');
        await webview.locator('#replaceBtn').getByRole('button').click();

        await expect(page.getByRole('dialog').locator('div').first()).toHaveText(`${strings.invalidTagNameMessage}`);
      });

      test('Warn the user when an invalid id is provided', async () => {
        await webview.getByRole('option', { name: strings.addUpperTagText }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).fill('newuppertag#İnvalidİdValue.class[atr="test"]');
        await webview.locator('#replacementBox').dispatchEvent('keyup');
        await webview.locator('#replaceBtn').getByRole('button').click();

        await expect(page.getByRole('dialog').locator('div').first()).toContainText(`${strings.invalidIdValueMessage}`);
      });

      test('Warn the user when an invalid class-name is provided', async () => {
        await webview.getByRole('option', { name: strings.addUpperTagText }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).fill('newuppertag#id.İnvalidClassName[atr="test"]');
        await webview.locator('#replacementBox').dispatchEvent('keyup');
        await webview.locator('#replaceBtn').getByRole('button').click();

        await expect(page.getByRole('dialog').locator('div').first()).toContainText(`${strings.invalidClassNameSingularMessage}`);
      });

      test('Warn the user when an invalid attribute-value structure is provided', async () => {
        await webview.getByRole('option', { name: strings.addUpperTagText }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).fill('newuppertag#id.class[atr=test]');
        await webview.locator('#replacementBox').dispatchEvent('keyup');
        await webview.locator('#replaceBtn').getByRole('button').click();

        await expect(page.getByRole('dialog').locator('div').first()).toHaveText(`${strings.invalidAttributeValuePairStructureMessage}`);
      });

      test('Warn the user when an invalid attribute name is provided', async () => {
        await webview.getByRole('option', { name: strings.addUpperTagText }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).fill('newuppertag#id.class[{invalid-atr-name}="test"]');
        await webview.locator('#replacementBox').dispatchEvent('keyup');
        await webview.locator('#replaceBtn').getByRole('button').click();

        await expect(page.getByRole('dialog').locator('div').first()).toContainText(`${strings.invalidAttributeNameSingularMessage}`);
      });

      test('Warn the user when an invalid attribute value is provided', async () => {
        await webview.getByRole('option', { name: strings.addUpperTagText }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).fill('newuppertag#id.class[atr="<test>"]');
        await webview.locator('#replacementBox').dispatchEvent('keyup');
        await webview.locator('#replaceBtn').getByRole('button').click();

        await expect(page.getByRole('dialog').locator('div').first()).toContainText(`${strings.invalidAttributeValueSingularMessage}`);
      });

      test('Add Upper Tag', async () => {
        await webview.getByRole('option', { name: strings.addUpperTagText }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).click();
        await webview.getByRole('textbox', { name: strings.replaceTextAreaDefaultTitle }).fill('testtag#test.test[attribute="test-value"]');
        await webview.locator('#replacementBox').dispatchEvent('keyup');
        await webview.locator('#replaceBtn').getByRole('button').click();

        await expect(page.getByRole('dialog').locator('div').first()).toHaveText(`${strings.replacementProcessName} ${strings.successfulProcessMessage}`);
      });
    });

    test.describe.serial('Remove Tag Operations', async () => {

      test('Remove Upper Tag', async () => {
        await webview.getByRole('option', { name: strings.removeUpperTagText }).click();
        await webview.locator('#replaceBtn').getByRole('button').click();

        await expect(page.getByRole('dialog').locator('div').first()).toHaveText(`${strings.replacementProcessName} ${strings.successfulProcessMessage}`);
      });

      test('Remove Tag', async () => {
        await webview.getByRole('option', { name: strings.removeTagText }).click();
        await webview.locator('#replaceBtn').getByRole('button').click();

        await expect(page.getByRole('dialog').locator('div').first()).toHaveText(`${strings.replacementProcessName} ${strings.successfulProcessMessage}`);
      });
    });
  });
});

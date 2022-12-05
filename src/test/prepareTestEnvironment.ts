/*
    This section prepares the test environment to test whether the requirements are met.
    The extension and test files must be already transferred to the locally installed ubuntu.  
*/

import { type FrameLocator, type Page } from "@playwright/test";

export async function prepareTestEnvironment(page: Page): Promise<FrameLocator> {
    // Open VS code in the browser
    await page.goto('http://localhost:3000/?tkn=ssr4html');
    // Skip tutorial of the VS Code IDE
    await page.getByRole('button', { name: ' Mark Done' }).click();

    // Install the extension
    await page.getByRole('document', { name: 'Overview of how to get up to speed with your editor.' }).press('Control+Shift+P');
    await page.getByPlaceholder('Type the name of a command to run.').fill('>Extensions: Install from VSIX...');
    await page.keyboard.press('Enter');
    // Wait until VS Code resolves the files and folders in the current directory
    await page.waitForSelector('div.monaco-list-row[aria-label=".."]');
    // Upload the correct version of the extension
    await page.getByRole('combobox', { name: 'Type to narrow down results. - Install from VSIX' }).fill('/home/main/ssr4html-1.0.0.vsix');
    await page.keyboard.press('Enter');
    await page.reload();

    // Upload HTML files to be tested
    await page.getByRole('tab', { name: 'Explorer (Ctrl+Shift+E)' }).locator('a').click();
    await page.getByRole('button', { name: 'Open Folder' }).click();
    // Wait until VS Code resolves the files and folders in the current directory
    await page.waitForSelector('div.monaco-list-row[aria-label=".."]');
    await page.getByRole('combobox', { name: 'Type to narrow down results. - Open Folder' }).fill('/home/main/files-to-test/');
    page.keyboard.press('Enter');

    // Wait until the testHtmlFiles folder is loaded
    await page.waitForSelector('div.monaco-list-row[aria-label$="html"]');

    // Focus on vs code
    await page.getByRole('document', { name: 'Overview of how to get up to speed with your editor.' }).locator('div').filter({ hasText: 'OpenVSCode ServerEditing evolvedStartNew File...Open File...Clone Git Repository' }).nth(2).focus();

    // Launch the Extension UI
    await page.getByRole('document', { name: 'Overview of how to get up to speed with your editor.' }).press('Control+Shift+P');
    await page.getByPlaceholder('Type the name of a command to run.').fill('>Structural Search and Replace Panel');
    await page.keyboard.press('Enter');

    // Wait the UI (webview) to be rendered
    const webviewFrame = await page.waitForSelector('div[data-parent-flow-to-element-id^="webview-"]');

    // Get dynamic name of the webview
    const webviewName = (await webviewFrame.getAttribute('id'))!.replace("webview-", "");

    // Get webview
    const webview = page.frameLocator(`iframe[name="${webviewName}"]`).frameLocator('#active-frame');

    // Refuse to format HTML files since they are already well-shaped
    await page.getByRole('button', { name: 'Nevermind' }).click();

    // Clear all notifications
    await page.getByRole('button', { name: 'Notifications' }).click();
    await page.getByRole('button', { name: 'Clear All Notifications' }).click();

    return webview;
}
/*
    This section satisfies the preconditions that are required to run each test.
    The extension must be installed on the VS Code Server.
    There must already be test files on the server where the VS Code Server is running. 
*/

import { type FrameLocator, type Page } from "@playwright/test";

export async function prepareTestEnvironment(page: Page, folderName: string): Promise<FrameLocator> {
    // Go to the link where the VS Code Server is up
    await page.goto('http://localhost:3000/?tkn=ssr4html');
    // Skip tutorial of the VS Code IDE
    await page.getByRole('button', { name: ' Mark Done' }).click();

    // Upload HTML files to be tested
    await page.getByRole('tab', { name: 'Explorer (Ctrl+Shift+E)' }).locator('a').click();
    await page.getByRole('button', { name: 'Open Folder' }).click();
    // Wait until VS Code resolves the files and folders in the current directory
    await page.waitForSelector('div.monaco-list-row[aria-label=".."]');
    await page.getByRole('combobox', { name: 'Type to narrow down results. - Open Folder' }).fill(`/home/main/${folderName}/`);
    page.keyboard.press('Enter');

    // Wait until the test files are loaded
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

    // Refuse to format HTML files after 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.getByRole('button', { name: 'Nevermind' }).click();

    return webview;
}
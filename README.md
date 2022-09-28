# README: Structural Search and Replace for HTML files (SSR4HTML)

Today, HTML is at the core of every web project. Therefore, web projects (not small ones) generally include many html files since developers generally prefer 
to create a different html file for each different tab of the web site/application for better maintainability and readability of the code. Despite the fact that 
this technique makes the code easier to understand, it also makes it more challenging to modify common HTML elements in HTML files since a developer has to check 
and modify each related file even for a small update. This project (visual studio code extension) allows developers to structurally search and replace in HTML 
files of the project. In this way, developers can find all HTML elements that have specified tag name, class, id, attribute-value pair, or combination 
of them and can modify all of them at once. Thanks to this extension, developers may save effort and time when editing the HTML files of the project.

## Features

This visual studio code extension allows you to structurally search and replace in HTML files located in the current workspace. In order to highlight 
related HTML elements, the extension uses regular expression that is generated according to the CSS selector that is typed by the user and then it uses 
the results of "querySelectorAll" to manipulate the related parts in the related HTML files. After the successful replacement process in DOMs of 
the files, the extension overwrites the new contents on the related HTML files. Finally, it automatically saves the changes in the files. These changes include
the manipulated and formated (well-shaped) version of the old HTML files.


>Focused animations for each feature will be added.

if there is an image subfolder under your extension project workspace:
\!\[feature X\]\(images/feature-x.png\)


## Used External Packages and Limitations

I used selector-2-regexp package that is written by m-yoshiro to generate a regular expression from the valid CSS selectors. In order to search in HTML files in the 
workspace, you can use all kind of type, class, id and attribute selectors that has showed above in the features part. This regular expression conversion is used to 
higlight matched results in the documents of visual studio code. However, there is a limitation since search at primary sidebar in visual studio code does not support 
regular expressions with look behind assertion due to "look behind assertion is not fixed length error". That is why, you cannot use combinator selectors such as 
"parentTag childTag", "parentTag > childTag", "parentTag ~ childTag" and "parentTag + childTag" but I am currently working on generating regular expressions for them.
Please note that the generated regular expressions differ from the ones provided by selector-2-regexp because they contain some missing components. For example, 
the generated regular expressions captured style="any-value" but not style = "any-value" (spaces before and after the equality symbol) and "body" tag with "b" tag even 
though the user only wanted to see the results with the "b" tag. For the purpose of more reliable searching, selector-2-regexp's regular expressions are modified by me.

* [More information about selector-2-regexp](https://github.com/m-yoshiro/Selector2Regexp)

In order to manipulate the related parts of HTML source codes, I wanted to take benefit of "Query Selector". That is why, jsdom package is used to provide
Document Object Model(DOM), which is necessary to find and replace the related parts. Therefore, this extension can be only used to manipulate HTML files. 
Otherwise, it may break the structure of the files.

* [More information about jsdom](https://github.com/jsdom/jsdom)

As I have mentioned above, the manipulated DOMs of the HTML files are overwritten on old HTML files, which may result in unexpected changes in the format of
the documents. Therefore, pretty package that helps beautifying HTML with js-beautify is used to prevent these side effects and make the source code more readable.

* [More information about pretty]( https://www.npmjs.com/package/pretty)

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...



**Enjoy!**

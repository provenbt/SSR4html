const jsdom = require("jsdom");
import { setClass } from './replacement-operations/setClass';
import { appendToClass } from './replacement-operations/appendToClass';
import { removeFromClass } from './replacement-operations/removeFromClass';
import { setId } from './replacement-operations/setId';
import { setAttribute } from './replacement-operations/setAttribute';
import { appendToAttribute } from './replacement-operations/appendToAttribute';
import { removeFromAttribute } from './replacement-operations/removeFromAttribute';
import { removeAttribute } from './replacement-operations/removeAttribute';
import { setStyleProperty } from './replacement-operations/setStyleProperty';
import { editStyleProperty } from './replacement-operations/editStyleProperty';
import { changeTagName } from './replacement-operations/changeTagName';
import { removeTag } from './replacement-operations/removeTag';
import { addUpperTag } from './replacement-operations/addUpperTag';
import { removeUpperTag } from './replacement-operations/removeUpperTag';

export class HtmlDom {
    // Document Object Model of an HTML file
    private dom: any;

    // HTML elements (search results) to be replaced
    private querySelectorResults: any;

    public constructor (htmlText: string, searchText: string) {
        this.dom = new jsdom.JSDOM(htmlText);
        this.querySelectorResults = this.dom.window.document.querySelectorAll(searchText);
    }

    public getDom(): any {
        return this.dom;
    }

    public setClass(replaceText: string) {
        setClass(this.querySelectorResults, replaceText);
    }

    public appendToClass(replaceText: string) {
        appendToClass(this.querySelectorResults, replaceText);
    }

    public removeFromClass(replaceText: string) {
        removeFromClass(this.querySelectorResults, replaceText);
    }

    public setId(replaceText: string) {
        setId(this.querySelectorResults, replaceText);
    }

    public setAttribute(replaceText: string) {
        setAttribute(this.querySelectorResults, replaceText);
    }

    public appendToAttribute(replaceText: string) {
        appendToAttribute(this.querySelectorResults, replaceText);
    }

    public removeFromAttribute(replaceText: string) {
        removeFromAttribute(this.querySelectorResults, replaceText);
    }

    public removeAttribute(replaceText: string) {
        removeAttribute(this.querySelectorResults, replaceText);
    }

    public setStyleProperty(replaceText: string) {
        setStyleProperty(this.querySelectorResults, replaceText);
    }

    public editStyleProperty(replaceText: string) {
        editStyleProperty(this.querySelectorResults, replaceText);
    }

    public changeTagName(replaceText: string) {
        changeTagName(this.querySelectorResults, replaceText);
    }

    public removeTag() {
        removeTag(this.querySelectorResults);
    }

    public addUpperTag(replaceText: string) {
        addUpperTag(this.querySelectorResults, replaceText);
    }

    public removeUpperTag() {
        removeUpperTag(this.querySelectorResults);
    }
}
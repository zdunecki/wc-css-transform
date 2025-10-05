import {readFileSync} from 'node:fs';
import {join} from 'node:path';

import {describe, it, expect} from "vitest";

import {
    transformHostSelectors,
    toLayer,
} from "./utils";

describe("utils", () => {
    it("replaces :host selectors with CSS-in-JS format", () => {
        const input = `:host { color: red; } :host([id]) { cursor: pointer; }`;
        const expected = `color: red; &[id] { cursor: pointer; }`;
        const output = transformHostSelectors(input);
        expect(output).toBe(expected);
    });

    it("wraps into a layer when provided", () => {
        const out = toLayer("a{color:red}", "defaults");
        expect(out).toBe("@layer defaults {\na{color:red}\n}");
    });

    it("maps attribute selectors to data-* when enabled", () => {
        const input = ':host([id]) { cursor: pointer; } :host([size="2"]) { font-size: 24px; }';
        const expected = '&[data-id] { cursor: pointer; } &[data-size="2"] { font-size: 24px; }';
        const output = transformHostSelectors(input, {dataAttributes: true});
        expect(output).toBe(expected);
    });

    it("excludes specified attributes from data- prefix", () => {
        const input = `:host([active="true"]) [part="icon"] { opacity: 1; }`;
        const expected = `&[data-active="true"] [part="icon"] { opacity: 1; }`;
        const result = transformHostSelectors(input, {
            dataAttributes: true,
            excludeFromData: ['part']
        });
        expect(result).toBe(expected);
    });

    it("handles :host [attr] descendant selectors", () => {
        const input = `:host [part="icon"] { opacity: 1; }`;
        const expected = `& [part="icon"] { opacity: 1; }`;
        const result = transformHostSelectors(input, {
            dataAttributes: true,
            excludeFromData: ['part']
        });
        expect(result).toBe(expected);
    });

    it("full transformation example: web component CSS to regular CSS", () => {
        const input = readFileSync(join(__dirname, '__fixtures__/1.full-transformation/input.css'), 'utf-8');
        const expected = readFileSync(join(__dirname, '__fixtures__/1.full-transformation/output.css'), 'utf-8');

        const result = transformHostSelectors(input, {dataAttributes: true, excludeFromData: ['part']});
        expect(result.trim()).toBe(expected.trim());
    });
});

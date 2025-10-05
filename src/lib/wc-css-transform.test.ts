import {describe, it, expect} from "vitest";
import {
    wcCssTransform,
} from "./wc-css-transform";

describe("wcCssTransform", () => {
    it("produces hashed name and transformed css ready for CSS-in-JS WITHOUT layers", () => {
        const input = `:host { color: red; } :host([id]) { cursor: pointer; }`;
        const {name, css} = wcCssTransform(input);

        expect(name).toMatch(/^[a-f0-9]{8}$/);
        expect(css).toBe(`color: red; &[id] { cursor: pointer; }`);
    });

    it("produces hashed name and transformed css ready for CSS-in-JS WITH layers", () => {
        const input = `:host { color: red; } :host([id]) { cursor: pointer; }`;
        const {name, css} = wcCssTransform(input, {
            hostTag: "&",
            layer: "defaults",
        });

        expect(name).toMatch(/^[a-f0-9]{8}$/);
        expect(css).toBe(`@layer defaults {
color: red; &[id] { cursor: pointer; }
}`);
    });

    it("full pipeline with dataAttributes maps attributes and wraps in layer", () => {
        const input = ":host([id]) { color:red }";
        const expected = `@layer defaults {
&[data-id] { color:red }
}`;
        const {css} = wcCssTransform(input, {
            hostTag: "&",
            layer: "defaults",
            dataAttributes: true,
        });
        expect(css).toBe(expected);
    });
});

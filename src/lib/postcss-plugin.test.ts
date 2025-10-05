import {readFileSync} from 'node:fs';
import {join} from 'node:path';

import {describe, it, expect} from 'vitest';
import postcss from 'postcss';

import wcCssTransformPlugin from './postcss-plugin';

describe('PostCSS Plugin', () => {
    it('transforms :host selectors to CSS-in-JS format', async () => {
        const input = `
:host {
  color: red;
}

:host([id]) {
  cursor: pointer;
}

:host([data-size="2"]) {
  font-size: 24px;
}
`;

        const expected = `
color: red;

&[id] {
  cursor: pointer;
}

&[data-size="2"] {
  font-size: 24px;
}
`;
        const result = await postcss([
            wcCssTransformPlugin({hostTag: '&'})
        ]).process(input);

        expect(result.css.trim()).toBe(expected.trim());
    });

    it('transforms with data attributes mapping', async () => {
        const input = readFileSync(join(__dirname, '__fixtures__/2.postcss-plugin/input.css'), 'utf-8');
        const expected = readFileSync(join(__dirname, '__fixtures__/2.postcss-plugin/output.css'), 'utf-8');

        const result = await postcss([
            wcCssTransformPlugin({
                dataAttributes: true
            })
        ]).process(input);

        expect(result.css.trim()).toBe(expected.trim());
    });

    it('works with CSS-in-JS nesting pattern', async () => {
        const input = `
:host {
  color: var(--heading-color);
  line-height: var(--line-height-xlarge);
  font-weight: var(--font-weight-semibold);
}

:host([id]) {
  cursor: pointer;
}

:host(:hover) svg {
  opacity: 1;
}
`;

        const expected = `
color: var(--heading-color);
line-height: var(--line-height-xlarge);
font-weight: var(--font-weight-semibold);

&[data-id] {
  cursor: pointer;
}

&:hover svg {
  opacity: 1;
}
`;

        const result = await postcss([
            wcCssTransformPlugin({
                hostTag: '&',
                dataAttributes: true
            })
        ]).process(input);

        expect(result.css.trim()).toBe(expected.trim());
    });

    it('preserves existing data- attributes', async () => {
        const input = `
:host([existing="true"]) {
  color: blue;
}

[data-keep] {
  opacity: 0.5;
}
`;

        const expected = `
&[data-existing="true"] {
  color: blue;
}

[data-keep] {
  opacity: 0.5;
}
`;

        const result = await postcss([
            wcCssTransformPlugin({
                hostTag: '&',
                dataAttributes: true
            })
        ]).process(input);

        expect(result.css.trim()).toBe(expected.trim());
    });

    it('excludes specified attributes from data- prefix', async () => {
        const input = `
:host([active="true"]) [part="icon"] {
  opacity: 1;
}

[class="my-class"] {
  color: red;
}
`;

        const expected = `
&[data-active="true"] [part="icon"] {
  opacity: 1;
}

[class="my-class"] {
  color: red;
}
`;

        const result = await postcss([
            wcCssTransformPlugin({
                hostTag: '&',
                dataAttributes: true,
                excludeFromData: ['part', 'class']
            })
        ]).process(input);

        expect(result.css.trim()).toBe(expected.trim());
    });

    it('handles :host [attr] descendant selectors', async () => {
        const input = `
:host [part="icon"] {
  opacity: 1;
}
`;

        const expected = `
& [part="icon"] {
  opacity: 1;
}
`;

        const result = await postcss([
            wcCssTransformPlugin({
                hostTag: '&',
                dataAttributes: true,
                excludeFromData: ['part']
            })
        ]).process(input);

        expect(result.css.trim()).toBe(expected.trim());
    });

    it('full transformation example: web component CSS to regular CSS', async () => {
        const input = readFileSync(join(__dirname, '__fixtures__/1.full-transformation/input.css'), 'utf-8');
        const expected = readFileSync(join(__dirname, '__fixtures__/1.full-transformation/output.css'), 'utf-8');

        const result = await postcss([
            wcCssTransformPlugin({
                dataAttributes: true,
                excludeFromData: ['part']
            })
        ]).process(input);

        expect(result.css.trim()).toBe(expected.trim());
    });
});

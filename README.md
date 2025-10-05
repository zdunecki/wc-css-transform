# wc-css-transform

Transform Web Components CSS to regular CSS format with data attribute mapping.

A powerful tool for converting web component CSS (using `:host` selectors) into regular CSS compatible formats, with automatic data attribute mapping for better framework integration.

## Features

- 🎯 **Transform `:host` selectors** to regular CSS format
- 🔄 **Data attribute mapping** - automatically convert attributes to `data-*` format
- 🛠️ **PostCSS plugin** - integrate with your existing build pipeline
- 📦 **Framework agnostic** - works with React, Vue, Angular, and more
- 🎨 **CSS compatible** - outputs clean CSS that works with styled-components, emotion, etc.

## Installation

```bash
npm install wc-css-transform
# or
pnpm add wc-css-transform
# or
yarn add wc-css-transform
```

## Usage

### Basic Usage

```typescript
import { wcCssTransform } from 'wc-css-transform';

const input = `
:host {
  color: red;
  font-size: 16px;
}

:host([active]) {
  background: blue;
}

:host(:hover) {
  opacity: 0.8;
}
`;

const output = wcCssTransform(input);

console.log(output);
// Output:
// color: red;
// font-size: 16px;
//
// &[active] {
//   background: blue;
// }
//
// &:hover {
//   opacity: 0.8;
// }
```

### PostCSS Plugin

```javascript
import postcss from 'postcss';
import { postcssPlugin } from 'wc-css-transform';

const result = await postcss([
  postcssPlugin
]).process(input);
```

## API

### `wcCssTransform(input, options)`

Transform web component CSS to regular CSS format.

**Parameters:**
- `input` (string): CSS input string
- `options` (object): Configuration options

**Options:**
- `hostTag` (string): Tag to replace `:host` with (default: `"&"`)
- `dataAttributes` (boolean): Enable data attribute mapping (default: `false`)
- `excludeFromData` (string[]): Attributes to exclude from data- prefix
- `layer` (string | false): CSS layer name (default: `false`)

### `postcssPlugin(options)`

PostCSS plugin for build pipeline integration.

## Examples

### React with styled-components

```typescript
import styled from 'styled-components';
import { wcCssTransform } from 'wc-css-transform';

const webComponentCSS = `
:host {
  color: var(--primary-color);
}

:host([size="large"]) {
  font-size: 24px;
}
`;

const StyledComponent = styled.div`
  ${wcCssTransform(webComponentCSS, { hostTag: '&', dataAttributes: true })}
`;
```

### Vue with CSS modules

```typescript
import { wcCssTransform } from 'wc-css-transform';

const componentCSS = wcCssTransform(`
:host {
  display: flex;
  align-items: center;
}

:host([disabled]) {
  opacity: 0.5;
  pointer-events: none;
}
`, { hostTag: '&', dataAttributes: true });
```

## Configuration

### Data Attribute Mapping

When `dataAttributes: true`, attributes are automatically prefixed with `data-`:

```css
/* Input */
:host([id]) { }
:host([size="large"]) { }
[active] { }

/* Output */
&[data-id] { }
&[data-size="large"] { }
[data-active] { }
```

### Exclude Attributes

Use `excludeFromData` to prevent certain attributes from being prefixed:

```typescript
wcCssTransform(input, {
  dataAttributes: true,
  excludeFromData: ['part', 'class', 'id']
});
```

## Build Integration

### Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { postcssPlugin } from 'wc-css-transform';

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        postcssPlugin({
          dataAttributes: true
        })
      ]
    }
  }
});
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
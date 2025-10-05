import crypto from "node:crypto";

export interface TransformOptions {
  hostTag?: string;
  layer?: string | false;
  dataAttributes?: boolean;
  excludeFromData?: string[];
}

const REGEX_PATTERNS = {
  HOST_BLOCK: /:host\s*\{([^}]*)\}/g,
  HOST_ATTRIBUTE: /:host\(([^)]*)\)/g,
  HOST_DESCENDANT: /:host\s+\[([^\]]*)\]/g,
  ATTRIBUTE_IN_BRACKETS: /\[([a-zA-Z_][a-zA-Z0-9_-]*)/,
  ATTRIBUTE_NAME: /([a-zA-Z_][a-zA-Z0-9_-]*)/,
  STANDALONE_ATTRIBUTE: /(?<!&)\[(?!data-)([a-zA-Z_][a-zA-Z0-9_-]*)/g,
  LEADING_WHITESPACE: /^\s+/gm,
  DATA_ATTRIBUTE: /\[(?!data-)([a-zA-Z_][a-zA-Z0-9_-]*)/g,
} as const;

// Centralized attribute name mapping
function mapAttributeName(
  attrName: string,
  excludeFromData: string[] = []
): string {
  return excludeFromData.includes(attrName) ? attrName : `data-${attrName}`;
}

// Unified pattern transformation
function transformPattern(
  attrContent: string,
  hostTag: string,
  dataAttributes: boolean,
  excludeFromData: string[],
  regex: RegExp,
  wrapper: (mapped: string) => string
): string {
  if (!dataAttributes) {
    return wrapper(attrContent);
  }

  const mapped = attrContent.replace(regex, (_match, attrName) => {
    const prefix = regex === REGEX_PATTERNS.ATTRIBUTE_NAME ? "" : "[";
    return `${prefix}${mapAttributeName(attrName, excludeFromData)}`;
  });

  return wrapper(mapped);
}

// Simplified transform functions using the unified helper
function transformHostAttributePattern(
  attrContent: string,
  hostTag: string,
  dataAttributes: boolean,
  excludeFromData: string[]
): string {
  return transformPattern(
    attrContent,
    hostTag,
    dataAttributes,
    excludeFromData,
    REGEX_PATTERNS.ATTRIBUTE_IN_BRACKETS,
    (mapped) => `${hostTag}${mapped}`
  );
}

function transformHostDescendantPattern(
  attrContent: string,
  hostTag: string,
  dataAttributes: boolean,
  excludeFromData: string[]
): string {
  return transformPattern(
    attrContent,
    hostTag,
    dataAttributes,
    excludeFromData,
    REGEX_PATTERNS.ATTRIBUTE_NAME,
    (mapped) => `${hostTag} [${mapped}]`
  );
}

// Main transform function
export function transformHostSelectors(
  input: string,
  options: TransformOptions = {}
): string {
  const {
    hostTag = "&",
    dataAttributes = false,
    layer,
    excludeFromData = [],
  } = options;

  let out = input
    // :host { ... } -> just the CSS properties
    .replace(REGEX_PATTERNS.HOST_BLOCK, (_match, cssContent) =>
      cssContent.trim().replace(REGEX_PATTERNS.LEADING_WHITESPACE, "")
    )
    // :host([attr]) -> &[data-attr]
    .replace(REGEX_PATTERNS.HOST_ATTRIBUTE, (_match, attrContent) =>
      transformHostAttributePattern(
        attrContent,
        hostTag,
        dataAttributes,
        excludeFromData
      )
    )
    // :host [attr] -> & [attr]
    .replace(REGEX_PATTERNS.HOST_DESCENDANT, (_match, attrContent) =>
      transformHostDescendantPattern(
        attrContent,
        hostTag,
        dataAttributes,
        excludeFromData
      )
    );

  // Map remaining standalone [attr] selectors
  if (dataAttributes) {
    out = out.replace(
      REGEX_PATTERNS.STANDALONE_ATTRIBUTE,
      (_match, name) => `[${mapAttributeName(name, excludeFromData)}`
    );
  }

  return layer ? toLayer(out, layer) : out;
}

// Transform individual selectors for PostCSS
export function transformSelector(
  selector: string,
  options: TransformOptions = {}
): string {
  const {
    hostTag = "&",
    dataAttributes = false,
    excludeFromData = [],
  } = options;

  if (selector === ":host") return "";

  const transforms = [
    {
      condition: () => selector.includes(":host("),
      pattern: REGEX_PATTERNS.HOST_ATTRIBUTE,
      transform: transformHostAttributePattern,
    },
    {
      condition: () => selector.includes(":host "),
      pattern: REGEX_PATTERNS.HOST_DESCENDANT,
      transform: transformHostDescendantPattern,
    },
  ];

  for (const { condition, pattern, transform } of transforms) {
    if (condition()) {
      return selector.replace(pattern, (_match, attrContent) =>
        transform(attrContent, hostTag, dataAttributes, excludeFromData)
      );
    }
  }

  // Map remaining standalone [attr] selectors
  if (dataAttributes) {
    return selector.replace(
      REGEX_PATTERNS.STANDALONE_ATTRIBUTE,
      (_match, name) => `[${mapAttributeName(name, excludeFromData)}`
    );
  }

  return selector;
}

// Convert [attr] to [data-attr]
export function mapAttributesToData(input: string): string {
  return input.replace(
    REGEX_PATTERNS.DATA_ATTRIBUTE,
    (_m, name) => `[data-${name}`
  );
}

export function toLayer(input: string, layer?: string | false): string {
  return layer ? `@layer ${layer} {\n${input}\n}` : input;
}

export function hashName(base: string): string {
  return crypto.createHash("sha256").update(base).digest("hex").slice(0, 8);
}

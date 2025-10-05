import {Plugin} from 'postcss';

import {transformSelector, TransformOptions} from './utils';

export interface PostCSSPluginOptions extends TransformOptions {
}

export default function wcCssTransform(options: PostCSSPluginOptions = {}): Plugin {
    return {
        postcssPlugin: 'postcss-wc-css-transform',
        Once(root) {
            // Process all rules
            root.walkRules((rule) => {
                // Handle :host { ... } -> move declarations to parent
                if (rule.selector === ':host') {
                    const parent = rule.parent;
                    if (parent) {
                        // Collect all declarations first
                        const declarations: any[] = [];
                        rule.walkDecls((decl) => {
                            declarations.push(decl.clone());
                        });

                        // Insert declarations at the beginning of parent
                        declarations.forEach((decl) => {
                            parent.insertBefore(rule, decl);
                        });

                        // Remove the :host rule
                        rule.remove();
                    }
                }
                // Handle other :host selectors
                else if (rule.selector.includes(':host')) {
                    const transformedSelector = transformSelector(rule.selector, options);
                    rule.selector = transformedSelector;
                }
                // Handle standalone attribute selectors when dataAttributes is enabled
                else if (options.dataAttributes && rule.selector.includes('[') && !rule.selector.includes('data-')) {
                    const transformedSelector = transformSelector(rule.selector, options);
                    rule.selector = transformedSelector;
                }
            });

            // Clean up extra blank lines between consecutive declarations
            root.walkDecls((decl) => {
                if (decl.raws.before && decl.raws.before.includes('\n\n')) {
                    decl.raws.before = '\n';
                }
            });
        },
    };
}

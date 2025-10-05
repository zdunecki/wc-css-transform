import {hashName, toLayer, transformHostSelectors, TransformOptions} from "./utils";

export function wcCssTransform(input: string, opts: TransformOptions = {}): { name: string; css: string } {
    const transformed = transformHostSelectors(input, {
        hostTag: opts.hostTag ?? '&',
        dataAttributes: !!opts.dataAttributes,
        excludeFromData: opts.excludeFromData || ["part"]
    });

    const layered = toLayer(transformed, opts.layer ?? false);
    const name = hashName(layered);

    return {name, css: layered};
}
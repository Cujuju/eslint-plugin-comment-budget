import { dirname, relative, sep } from 'node:path';
import { analyze } from "./analyze.js";
import { budgetFor } from "./baseline.js";
import { policyFrom } from "./policy.js";
import { isTouched } from "./touched.js";
export const OPTIONS_SCHEMA = [
    {
        type: 'object',
        properties: {
            budget: { type: 'object' },
            root: { type: 'string' },
            touched: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
    },
];
export function resolve(context) {
    const options = context.options[0] ?? {};
    const found = budgetFor(dirname(context.filename));
    const budget = options.budget ?? found.budget;
    const root = options.root ?? found.root;
    return {
        budget,
        root,
        policy: policyFrom(budget),
        key: relative(root, context.filename).split(sep).join('/'),
        touched: options.touched,
    };
}
/**
 * An exemption is forgiveness until you touch the file. Editing one withdraws
 * it, so the cap applies in the editor rather than at commit time. When git
 * cannot answer, the exemption stands.
 */
export function isExempt(resolved) {
    if (!resolved.budget.exempt.includes(resolved.key))
        return false;
    const touched = resolved.touched === undefined ? isTouched(resolved.root, resolved.key) : resolved.touched.includes(resolved.key);
    return touched !== true;
}
export function violationsOf(context, resolved) {
    const source = context.sourceCode;
    return analyze(source.getText(), source.getAllComments(), resolved.policy);
}

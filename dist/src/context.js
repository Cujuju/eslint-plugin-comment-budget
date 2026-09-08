import { dirname, relative, sep } from 'node:path';
import { analyze } from "./analyze.js";
import { budgetFor } from "./baseline.js";
export const OPTIONS_SCHEMA = [
    {
        type: 'object',
        properties: { budget: { type: 'object' }, root: { type: 'string' } },
        additionalProperties: false,
    },
];
export function isExempt(context) {
    const options = context.options[0] ?? {};
    const found = budgetFor(dirname(context.filename));
    const budget = options.budget ?? found.budget;
    const root = options.root ?? found.root;
    return budget.exempt.includes(relative(root, context.filename).split(sep).join('/'));
}
export function violationsOf(context) {
    const source = context.sourceCode;
    return analyze(source.getText(), source.getAllComments());
}

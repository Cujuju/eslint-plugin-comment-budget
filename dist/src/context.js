import { dirname, relative, sep } from 'node:path';
import { analyze } from "./analyze.js";
import { budgetFor } from "./baseline.js";
import { policyFrom } from "./policy.js";
export const OPTIONS_SCHEMA = [
    {
        type: 'object',
        properties: { budget: { type: 'object' }, root: { type: 'string' } },
        additionalProperties: false,
    },
];
export function resolve(context) {
    const options = context.options[0] ?? {};
    const found = budgetFor(dirname(context.filename));
    const budget = options.budget ?? found.budget;
    return { budget, root: options.root ?? found.root, policy: policyFrom(budget) };
}
export function isExempt(context, resolved) {
    return resolved.budget.exempt.includes(relative(resolved.root, context.filename).split(sep).join('/'));
}
export function violationsOf(context, resolved) {
    const source = context.sourceCode;
    return analyze(source.getText(), source.getAllComments(), resolved.policy);
}

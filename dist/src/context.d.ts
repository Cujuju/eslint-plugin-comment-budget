import type { Rule } from 'eslint';
import { type Violation } from './analyze.ts';
import { type Budget } from './baseline.ts';
/** Tests inject a budget and a root; a real run walks up for `.comment-budget.json`. */
export type RuleOptions = {
    budget?: Budget;
    root?: string;
};
export declare const OPTIONS_SCHEMA: {
    type: string;
    properties: {
        budget: {
            type: string;
        };
        root: {
            type: string;
        };
    };
    additionalProperties: boolean;
}[];
export declare function isExempt(context: Rule.RuleContext): boolean;
export declare function violationsOf(context: Rule.RuleContext): Violation[];

import type { Rule } from 'eslint';
import { type Violation } from './analyze.ts';
import { type Budget } from './baseline.ts';
import { type Policy } from './policy.ts';
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
type Resolved = {
    budget: Budget;
    root: string;
    policy: Policy;
};
export declare function resolve(context: Rule.RuleContext): Resolved;
export declare function isExempt(context: Rule.RuleContext, resolved: Resolved): boolean;
export declare function violationsOf(context: Rule.RuleContext, resolved: Resolved): Violation[];
export {};

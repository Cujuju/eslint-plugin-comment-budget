import type { Rule } from 'eslint';
import { type Violation } from './analyze.ts';
import { type Budget } from './baseline.ts';
import { type Policy } from './policy.ts';
/** Tests inject these; a real run walks up for the budget and asks git. */
export type RuleOptions = {
    budget?: Budget;
    root?: string;
    touched?: string[];
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
        touched: {
            type: string;
            items: {
                type: string;
            };
        };
    };
    additionalProperties: boolean;
}[];
type Resolved = {
    budget: Budget;
    root: string;
    policy: Policy;
    key: string;
    touched?: string[];
};
export declare function resolve(context: Rule.RuleContext): Resolved;
/**
 * An exemption is forgiveness until you touch the file. Editing one withdraws
 * it, so the cap applies in the editor rather than at commit time. When git
 * cannot answer, the exemption stands.
 */
export declare function isExempt(resolved: Resolved): boolean;
export declare function violationsOf(context: Rule.RuleContext, resolved: Resolved): Violation[];
export {};

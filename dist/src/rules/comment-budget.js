import { isExempt, OPTIONS_SCHEMA, resolve, violationsOf } from '../context.js';
import { redirectOf } from '../redirect.js';
export const commentBudget = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Cap a comment block at the repo word cap and keep decision-record prose out of the source.',
        },
        schema: OPTIONS_SCHEMA,
        messages: {
            overCap: 'Comment block is {{words}} words; the cap is {{cap}}. Cut it, or move the reasoning to {{redirect}}.',
            banned: 'Comment carries {{label}}, which belongs in {{redirect}}, not beside the code.',
        },
    },
    create(context) {
        return {
            'Program:exit'() {
                const resolved = resolve(context);
                if (isExempt(resolved))
                    return;
                const redirect = redirectOf(resolved.budget);
                const cap = String(resolved.policy.wordCap);
                for (const violation of violationsOf(context, resolved)) {
                    const loc = {
                        start: { line: violation.line, column: violation.column },
                        end: { line: violation.endLine, column: violation.endColumn },
                    };
                    if (violation.kind === 'over-cap') {
                        context.report({ loc, messageId: 'overCap', data: { words: String(violation.words), cap, redirect } });
                    }
                    else {
                        context.report({ loc, messageId: 'banned', data: { label: violation.label, redirect } });
                    }
                }
            },
        };
    },
};

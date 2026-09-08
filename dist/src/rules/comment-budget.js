import { COMMENT_WORD_CAP } from "../analyze.js";
import { isExempt, OPTIONS_SCHEMA, violationsOf } from "../context.js";
import { REDIRECT } from "../redirect.js";
export const commentBudget = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Cap a comment block at 30 words and keep decision-record prose out of the source.',
        },
        schema: OPTIONS_SCHEMA,
        messages: {
            overCap: `Comment block is {{words}} words; the cap is ${COMMENT_WORD_CAP}. Cut it, or move the reasoning to {{redirect}}.`,
            banned: 'Comment carries {{label}}, which belongs in {{redirect}}, not beside the code.',
        },
    },
    create(context) {
        return {
            'Program:exit'() {
                if (isExempt(context))
                    return;
                const redirect = REDIRECT;
                for (const violation of violationsOf(context)) {
                    const loc = {
                        start: { line: violation.line, column: violation.column },
                        end: { line: violation.endLine, column: violation.endColumn },
                    };
                    if (violation.kind === 'over-cap') {
                        context.report({ loc, messageId: 'overCap', data: { words: String(violation.words), redirect } });
                    }
                    else {
                        context.report({ loc, messageId: 'banned', data: { label: violation.label, redirect } });
                    }
                }
            },
        };
    },
};

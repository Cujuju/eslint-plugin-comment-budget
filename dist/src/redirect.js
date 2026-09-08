/** Where the prose is supposed to go, named in every message. */
export const DEFAULT_REDIRECT = 'the commit message or a decision record';
/** The policy file is the place to say it; the env var stays as an override. */
export function redirectOf(policy) {
    return policy.redirect ?? process.env['COMMENT_BUDGET_REDIRECT'] ?? DEFAULT_REDIRECT;
}

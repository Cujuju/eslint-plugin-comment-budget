/** Where the prose is supposed to go, named in every message. */
export declare const DEFAULT_REDIRECT = "the commit message or a decision record";
/** The policy file is the place to say it; the env var stays as an override. */
export declare function redirectOf(policy: {
    redirect?: string;
}): string;

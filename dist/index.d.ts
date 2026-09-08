export { IGNORED_GLOBS, LINTED_GLOBS } from './src/targets.ts';
export declare const rules: {
    'comment-budget': import("eslint").Rule.RuleModule;
};
export declare const plugin: {
    meta: {
        name: string;
        version: string;
    };
    rules: {
        'comment-budget': import("eslint").Rule.RuleModule;
    };
};
export default plugin;

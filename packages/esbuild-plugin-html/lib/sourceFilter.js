/**
 * Filter path to not bundle external resources
 */
export default path => {
    return path && path.indexOf("://") < 0 && !path.startsWith("//");
};
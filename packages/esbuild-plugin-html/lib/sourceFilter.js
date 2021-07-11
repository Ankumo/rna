/**
 * Filter path to not bundle external resources
 * @param {string|undefined} path Path to the resource
 */
export default path => path && path.indexOf('://') < 0 && !path.startsWith('//');
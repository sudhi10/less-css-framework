/**
 * Kicks off less and compiles any stylesheets
 * used in the browser distributed version of less
 * to kick-start less using the browser api
 */
/*global window */

var options = window.less || {};
import addDefaultOptionsFactory from "./add-default-options";
addDefaultOptionsFactory(window, options);

import lessFactory from "./index";
var less = lessFactory(window, options);
export default less;

window.less = less;

if (options.onReady) {
    if (/!watch/.test(window.location.hash)) {
        less.watch();
    }

    less.registerStylesheetsImmediately();
    less.pageLoadFinished = less.refresh(less.env === 'development');
}

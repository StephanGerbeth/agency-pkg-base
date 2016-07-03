/**
 * Copy js source files to root from installed package, for use relative path with require.
 * require("agency-pkg-name/relative/path");
 * @version 0.0.1
 */

"use strict";

var fs = require('fs');
var path = require('path');

function isDependencyPackage(cb) {
    fs.exists(__dirname + '/../../node_modules/' + path.basename(__dirname), function(exists) {
        if (exists) {
            cb();
        }
    });
}

/**
 * Clean package root and exclude src/js
 */
function preparePackage() {
    var excludedFiles = ['package.json', 'README.md', 'LICENSE.md', '.gitignore', '.npmignore', 'index.js', 'index.pcss'];
    var excludedSrcJsFiles = ['main.js', 'packages.js'];
    var copyRecursiveSync = function(src, dest) {
        var exists = fs.existsSync(src);
        var stats = exists && fs.statSync(src);
        var isDirectory = exists && stats.isDirectory();
        if (exists && isDirectory) {
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest);
            }
            fs.readdirSync(src).forEach(function(childItemName) {
                copyRecursiveSync(path.join(src, childItemName),
                    path.join(dest, childItemName));
            });
        } else {
            if (excludedSrcJsFiles.indexOf(path.basename(src)) === -1) {
                fs.linkSync(src, dest);
            }
        }
    };
    var src = path.join(process.cwd(), 'src', 'js');
    fs.readdirSync(process.cwd()).forEach(function(childItemName) {
        var curPath = path.join(process.cwd(), childItemName);
        if (excludedFiles.indexOf(path.basename(curPath)) === -1 && fs.statSync(curPath).isFile()) {
            fs.unlinkSync(curPath);
        }
    });
    copyRecursiveSync(src, process.cwd());
}

isDependencyPackage(preparePackage);

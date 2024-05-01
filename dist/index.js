"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KmpTools = void 0;
const extend = require("node.extend");
const yaml = require("js-yaml");
const fs = require("fs");
const expressReverse = require("express-reverse");
const path = require("path");
var KmpTools;
(function (KmpTools) {
    class Controller {
        getFolderPaths(dir, srcDir = "src", controlerDir = "Controller", folderPaths = []) {
            const items = fs.readdirSync(dir);
            items.forEach((item) => {
                const itemPath = path.join(dir, item);
                if (fs.statSync(itemPath).isDirectory()) {
                    const containsControllers = fs.existsSync(path.join(itemPath, controlerDir));
                    if (containsControllers) {
                        folderPaths.push(path.relative(srcDir, itemPath) + "/");
                    }
                    if (!containsControllers) {
                        this.getFolderPaths(itemPath, srcDir, controlerDir, folderPaths);
                    }
                }
            });
            return folderPaths;
        }
    }
    KmpTools.Controller = Controller;
    class Routes {
        controllers = {};
        pathObjectTab = null;
        constructor(app, options) {
            options = extend(true, {
                routingFile: path.join(__dirname, "/../../app/config/routes.yml"),
                controllerPath: [path.join(__dirname, "/../../app/controllers")],
                helperName: "url",
            }, options || {});
            expressReverse(app, {
                helperName: options.helperName,
            });
            this.initRoutes(app, options);
        }
        initRoutes = (app, options) => {
            options.controllerPath.forEach((dir) => {
                fs.readdirSync(dir).forEach((file) => {
                    const ext = path.extname(file);
                    if (file.indexOf(ext) !== -1) {
                        const name = file.substr(0, file.indexOf("."));
                        const controllerCurrent = require(path.join(dir, file));
                        this.pathObjectTab = [];
                        const pathObjectString = this.depthOf(controllerCurrent, this.pathObjectTab).join(".");
                        this.controllers[pathObjectString + "." + name] = controllerCurrent;
                    }
                });
            });
            this.parseYML(options.routingFile, app, null);
        };
        parseYML = (file, app, prefix) => {
            prefix = prefix || "";
            let routesYaml = yaml.safeLoad(fs.readFileSync(file, "utf8"));
            for (const key in routesYaml) {
                const obj = routesYaml[key];
                if (obj.resource) {
                    this.parseYML(path.dirname(file) + "/" + obj.resource, app, obj.prefix);
                    continue;
                }
                const split = obj.controller.split(":");
                const bundle = split.slice(0, -1).join(".") + "Controller";
                const action = split.slice(-1)[0] + "Action";
                if (!obj.methods) {
                    throw new Error("No methods defined for controller " + obj.controller);
                }
                obj.methods.forEach((method) => {
                    const controllerClass = bundle
                        .split(".")
                        .reduce((o, i) => {
                        if (o !== undefined)
                            return o[i];
                    }, this.controllers[bundle]);
                    const container = app.get('container');
                    let actionFunction;
                    if (container) {
                        let regex = /\.(\w+)Controller$/;
                        let bundleService = bundle.replace(regex, '.Controller.$1Controller');
                        actionFunction = container.get(bundleService)[action];
                    }
                    else {
                        actionFunction = new controllerClass()[action];
                    }
                    if (!actionFunction) {
                        throw new Error("No action found for " + obj.controller);
                    }
                    const httpMethod = method.toLowerCase();
                    app[httpMethod](key + "_" + method, prefix + obj.pattern, actionFunction);
                });
            }
        };
        depthOf(object, pathObject) {
            for (let key in object) {
                if (!object.hasOwnProperty(key)) {
                    continue;
                }
                if (typeof object[key] === "object") {
                    pathObject.push(key);
                    this.depthOf(object[key], pathObject);
                }
            }
            return pathObject;
        }
    }
    KmpTools.Routes = Routes;
})(KmpTools || (exports.KmpTools = KmpTools = {}));

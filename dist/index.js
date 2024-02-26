"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KmpTools = void 0;
const extend = require('node.extend');
const yaml = require('js-yaml');
const fs = require('fs');
const expressReverse = require('express-reverse');
const path = require('path');
var KmpTools;
(function (KmpTools) {
    /**
     * KmpTools manage routes
     */
    class Routes {
        /**
         * Constructor that initialize all routes when this class is instanced
         * @param app Express.Application
         * @param options OptionsKmpRoutes
         */
        constructor(app, options) {
            this.controllers = {};
            this.pathObjectTab = null;
            /**
             * Initialize all routes of application
             * @param app Express.Application
             * @param options OptionsKmpRoutes
             * @private
             */
            this.initRoutes = (app, options) => {
                options.controllerPath.forEach((dir) => {
                    fs.readdirSync(dir).forEach((file) => {
                        const ext = path.extname(file);
                        if (file.indexOf(ext) !== -1) {
                            const name = file.substr(0, file.indexOf('.'));
                            const controllerCurrent = require(path.join(dir, file));
                            this.pathObjectTab = [];
                            const pathObjectString = this.depthOf(controllerCurrent, this.pathObjectTab).join('.');
                            this.controllers[pathObjectString + '.' + name] = controllerCurrent;
                        }
                    });
                });
                // Load YAML
                this.parseYML(options.routingFile, app, null);
            };
            /**
             * Load Yaml config file and build all routes of application
             * @param file string
             * @param app Express.Application
             * @param prefix string|null
             * @private
             */
            this.parseYML = (file, app, prefix) => {
                prefix = prefix || '';
                let routesYaml = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
                for (const key in routesYaml) {
                    const obj = routesYaml[key];
                    if (obj.resource) {
                        this.parseYML(path.dirname(file) + '/' + obj.resource, app, obj.prefix);
                        continue;
                    }
                    const split = obj.controller.split(':');
                    const bundle = split.slice(0, -1).join('.') + 'Controller';
                    const action = split.slice(-1)[0] + 'Action';
                    if (!obj.methods) {
                        throw new Error('No methods defined for controller ' + obj.controller);
                    }
                    obj.methods.forEach((method) => {
                        const controllerClass = bundle.split('.').reduce((o, i) => {
                            if (o !== undefined)
                                return o[i];
                        }, this.controllers[bundle]);
                        const actionFunction = new controllerClass()[action];
                        if (!actionFunction) {
                            throw new Error('No action found for ' + obj.controller);
                        }
                        const httpMethod = method.toLowerCase();
                        console.log(httpMethod, key + '_' + method, prefix + obj.pattern, actionFunction);
                        app[httpMethod](key + '_' + method, prefix + obj.pattern, actionFunction);
                    });
                }
            };
            options = extend(true, {
                routingFile: path.join(__dirname, '/../../app/config/routes.yml'),
                controllerPath: [path.join(__dirname, '/../../app/controllers')],
                helperName: 'url'
            }, options || {});
            expressReverse(app, {
                helperName: options.helperName
            });
            this.initRoutes(app, options);
        }
        /**
         * Build the complete class name in string
         * @param object { [key: string]: any; } | any
         * @param pathObject string[]
         * @return string[]
         * @private
         */
        depthOf(object, pathObject) {
            for (let key in object) {
                if (!object.hasOwnProperty(key)) {
                    continue;
                }
                if (typeof object[key] === 'object') {
                    pathObject.push(key);
                    this.depthOf(object[key], pathObject);
                }
            }
            return pathObject;
        }
    }
    KmpTools.Routes = Routes;
})(KmpTools || (exports.KmpTools = KmpTools = {}));

const extend = require('node.extend')
const yaml = require('js-yaml')
const fs = require('fs')
const expressReverse = require('express-reverse')
const path = require('path')
import {Application} from 'express';

export namespace KmpTools {
    interface OptionsKmpRoutes {
        routingFile: string;
        controllerPath: string[]; // Correction de type
        helperName: string;
    }

    /**
     * KmpTools manage routes
     */
    export class Routes {
        private controllers: { [key: string]: any } = {}; // Correction de type
        private pathObjectTab: string[] | null = null; // Correction de type

        /**
         * Constructor that initialize all routes when this class is instanced
         * @param app Express.Application // Correction de type
         * @param options OptionsKmpRoutes
         */
        constructor(app: Application, options: OptionsKmpRoutes) { // Correction de type
            options = extend(true, {
                routingFile: path.join(__dirname, '/../../app/config/routes.yml'), // Utilisation de path.join pour la concaténation des chemins
                controllerPath: [path.join(__dirname, '/../../app/controllers')], // Correction du type et utilisation de path.join
                helperName: 'url'
            }, options || {});

            expressReverse(app, {
                helperName: options.helperName
            });

            this.initRoutes(app, options);
        }

        /**
         * Initialize all routes of application
         * @param app Express.Application // Correction de type
         * @param options OptionsKmpRoutes
         * @private
         */
        private initRoutes = (app: Application, options: OptionsKmpRoutes) => {
            options.controllerPath.forEach((dir) => {
                console.log(dir);
                fs.readdirSync(dir).forEach((file: string) => {
                    if (file.indexOf('.js') !== -1) {
                        const name = file.substr(0, file.indexOf('.'));
                        const controllerCurrent = require(path.join(dir, file)); // Utilisation de path.join pour la concaténation des chemins
                        this.pathObjectTab = [];
                        const pathObjectString = this.depthOf(controllerCurrent, this.pathObjectTab).join('.');
                        this.controllers[pathObjectString + '.' + name] = controllerCurrent;
                    }
                });
            });

            // Load YAML
            this.parseYML(options.routingFile, app, null);
        }

        /**
         * Load Yaml config file and build all routes of application
         * @param file string
         * @param app Express.Application // Correction de type
         * @param prefix string|null
         * @private
         */
        private parseYML = (file: string, app: Application, prefix: string | null) => {
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
                const action = split.slice(-1)[0] + 'Action'; // Correction de l'accès à la dernière partie

                if (!obj.methods) {
                    throw new Error('No methods defined for controller ' + obj.controller);
                }

                obj.methods.forEach((method: string) => {
                    const controllerClass: any = bundle.split('.').reduce((o: any, i: string) => {
                        if (o !== undefined) return o[i];
                    }, this.controllers[bundle]);

                    const actionFunction = new controllerClass()[action];

                    if (!actionFunction) {
                        throw new Error('No action found for ' + obj.controller);
                    }

                    app.de[method.toLowerCase() as "get" |"post"](key + '_' + method, prefix + obj.pattern, actionFunction);
                });
            }
        }

        /**
         * Build the complete class name in string
         * @param object { [key: string]: any; } | any // Correction de type
         * @param pathObject string[]
         * @return string[] // Correction de type de retour
         * @private
         */
        private depthOf(object: { [key: string]: any } | any, pathObject: string[]): string[] { // Correction de type
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
}

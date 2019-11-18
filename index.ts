const extend = require('node.extend')
const yaml = require('js-yaml')
const fs = require('fs')
const expressReverse = require('express-reverse')
const path = require('path')
import * as Express from 'express';

export namespace KmpTools {
    interface OptionsKmpRoutes {
        routingFile: string;
        controllerPath: Array<string>;
        helperName: string;
    }

    /**
     *KmpTools manage routes
     */
    export class Routes {
        private controllers: { [key: string]: object; } = {}
        private pathObjectTab: Array<string> | null = null

        /**
         * Constructor that initialize all routes when this class is instenced
         * @param app Express.Application
         * @param options OptionsKmpRoutes
         */
        constructor(app: Express.Application, options: OptionsKmpRoutes) {
            options = extend(true, {
                routingFile: __dirname + '/../../app/config/routes.yml',
                controllerPath: __dirname + '/../../app/controllers',
                helperName: 'url'
            }, options || {})

            expressReverse(app, {
                helperName: options.helperName
            })

            this.initRoutes(app, options)
        }

        /**
         * Initialize all routes of application
         * @param app Express.Application
         * @param options OptionsKmpRoutes
         * @private
         */
        private initRoutes = (app: Express.Application, options: OptionsKmpRoutes) => {
            options.controllerPath.forEach((dir) => {
                console.log(dir)
                fs.readdirSync(dir).forEach((file: string) => {
                    if (file.indexOf('.js') !== -1) {
                        const name = file.substr(0, file.indexOf('.'))
                        const controllerCurrent = require(dir + '/' + file)
                        this.pathObjectTab = []
                        const pathObjectString = this.depthOf(controllerCurrent, this.pathObjectTab).join('.')
                        this.controllers[pathObjectString + '.' + name] = controllerCurrent
                    }
                })
            })

            //Load YAML
            this.parseYML(options.routingFile, app, null)
        }

        /**
         * Load Yaml config file and build all routes of application
         * @param file string
         * @param app Express.Application
         * @param prefix string|null
         * @private
         */
        private parseYML = (file: string, app: Express.Application, prefix: string | null) => {
            prefix = prefix || ''
            let routesYaml = yaml.safeLoad(fs.readFileSync(file, 'utf8'))

            for (const key in routesYaml) {
                const obj = routesYaml[key]

                if (obj.resource) {
                    this.parseYML(path.dirname(file) + '/' + obj.resource, app, obj.prefix)
                    continue
                }

                const split = obj.controller.split(':'),
                    bundle = split.slice(0, -1).join('.') + 'Controller',
                    action = split.slice(-1) + 'Action'

                if (!obj.methods) {
                    throw new Error('No methods defined for controller ' + obj.controller)
                }

                obj.methods.forEach((method: string) => {
                    // @ts-ignore
                    const c = bundle.split('.').reduce((o: object, i: string) => o[i], this.controllers[bundle])
                    // @ts-ignore
                    const actionFunction = new c()[action]

                    if (!actionFunction) {
                        throw new Error('No action found for ' + obj.controller)
                    }
                    //@ts-ignore
                    app[method.toLowerCase()](key + '_' + method, prefix + obj.pattern, actionFunction)
                })
            }
        }

        /**
         * Build the complete class name in string
         * @param object  { [key: string]: object; }
         * @param pathObject Array<string>
         * @return Array<string>
         * @private
         */
        private depthOf(object: { [key: string]: object; }, pathObject: Array<string>): Array<string> {
            for (let key in object) {
                if (!object.hasOwnProperty(key)) {
                    continue
                }

                if (typeof object[key] == 'object') {
                    pathObject.push(key)
                    //@ts-ignore
                    this.depthOf(object[key], pathObject)
                }
            }

            return pathObject
        }
    }
}
import { KmpTools } from '../index';
import express from 'express';

describe('KmpTools', () => {
    describe('Routes', () => {
        const appPath        = require('./config/app.json')
        const controllerPath = appPath.map((p: string) => { return __dirname + '/src/' + p + 'controllers'})
        const app = express();
        const options = {
            routingFile: './test/config/testRoutes.yml',
            controllerPath: controllerPath,
            helperName: 'testHelper'
        };
        const routes = new KmpTools.Routes(app, options);

        it('should initialize routes correctly', () => {
              expect(routes).toBeDefined();
        });

        it('should parse YML and set up routes correctly', () => {
            const expressRoutes = app._router.stack.filter((r: any) => r.route).map((r: any) => r.route.path);
            expect(expressRoutes.length).toBeGreaterThan(0);
        });

        it('should calculate depth correctly', () => {
            const object = {
                some: {
                    nested: {
                        object: {}
                    }
                }
            };
            
            let pathObject: string[] = [];
                const depth = routes['depthOf'](object, pathObject);
                expect(depth.length).toBe(3);
         
        });
    });
});

import { KmpTools } from '../index';
import express from 'express';

describe('KmpTools', () => {
    describe('Routes', () => {
        it('should initialize routes correctly', () => {
            const app = express();
            const options = {
                routingFile: 'testRoutes.yml',
                controllerPath: ['src/**/'],
                helperName: 'testHelper'
            };
            const routes = new KmpTools.Routes(app, options);
            // Add assertions for initialization
        });

        it('should parse YML and set up routes correctly', () => {
            const app = express();
            const options = {
                routingFile: 'testRoutes.yml',
                controllerPath: ['testControllerPath'],
                helperName: 'testHelper'
            };
            const routes = new KmpTools.Routes(app, options);
            // Add assertions for parsing YML and setting up routes
        });

        it('should calculate depth correctly', () => {
            const routes = new KmpTools.Routes(express(), {
                routingFile: 'testRoutes.yml',
                controllerPath: ['testControllerPath'],
                helperName: 'testHelper'
            });
            const object = {
                some: {
                    nested: {
                        object: {}
                    }
                }
            };
            // @ts-ignore
            let pathObject: string[] = [];
            try {
                const depth = routes['depthOf'](object, pathObject);
                // Add assertions for calculating depth
            } catch (error) {
                // Ignore the error
            }
        });
    });
});

import express from 'express';

const app = express();
const appPath        = require('./config/app.json')
        const controllerPath = appPath.map((p: string) => { return __dirname + '/src/' + p + 'controllers'})
        const options = {
            routingFile: './test/config/testRoutes.yml',
            controllerPath: controllerPath,
            helperName: 'testHelper'
        };
        const routes = new KmpTools.Routes(app, options);
export default app;
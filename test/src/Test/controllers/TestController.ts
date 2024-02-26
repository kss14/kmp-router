import * as Express from 'express';

export namespace Test {
    export class TestController {
        constructor() {}
        public indexAction = (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
            res.send('Test response');
        }
    }
}
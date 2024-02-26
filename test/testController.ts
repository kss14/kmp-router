import  * as Express  from 'express';
export class TestController {
    action(req: Express.Request, res: Express.Response) {
        res.send('Test response');
    }
}
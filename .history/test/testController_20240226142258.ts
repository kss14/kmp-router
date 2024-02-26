import  * as Express  from 'express';
export class TestController {
    action(req: Express.Request, res: Express.Re) {
        res.send('Test response');
    }
}
import  * as Express  from 'express';
export class TestController {
    action(req: Express.R, res: Express) {
        res.send('Test response');
    }
}
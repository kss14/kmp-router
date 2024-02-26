import  * as Express  from 'express';
export class TestController {
    action(req: Express., res: Express) {
        res.send('Test response');
    }
}
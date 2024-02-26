import  * as Express  from 'express';
export class TestController {
    action(req: Express, res: E) {
        res.send('Test response');
    }
}
import  * as Express  from 'express';
export class TestController {
    action(req: Express, res: any) {
        res.send('Test response');
    }
}
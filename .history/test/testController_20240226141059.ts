import { * asExpress } from 'express';
export class TestController {
    action(req: *asExpress, res: any) {
        res.send('Test response');
    }
}
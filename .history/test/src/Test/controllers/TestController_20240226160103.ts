import * as Express from 'express';
import {KmpTools} from "@kss14/kmp-full-classname";

export namespace Test {
    export class TestController {
        constructor() {}
        public indexAction = (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
            let nameResolve = new KmpTools.NameResolver();
            // console.log(nameResolve.getFullClassNameFromInstance(this,global))
            // const result = unfurl('https://www.basketsession.com/actu/les-jeunes-stars-canadiennes-motivees-pour-cet-ete-465324/')
            // result.then((a: any) =>
            // {
            //     console.log(a.open_graph.images)
            // })

            return res.send('index');
        }
    }
}
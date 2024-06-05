import type { Request, Response, NextFunction } from "express";
import * as Nsp from "../Service/UserService";


export namespace Api.Controller {
  export class UserController {
    constructor(
      private _UserService: Nsp.Api.Service.UserService
    ) { }
    public banAction = async (req: Request, res: Response, next: NextFunction) => {
      const isBan = await this._UserService.ban(parseInt(req.params.id))

      if (isBan) {
        return res.json({ "success": "Banned!" })
      }

      return res.json({ "error": "While banning!" });
    };

    public resurrectedAction = async (req: Request, res: Response, next: NextFunction) => {
      const isResurrected = await this._UserService.resurrected(parseInt(req.params.id))

      if (isResurrected) {
        return res.json({ "success": "Resurrected!" })
      }

      return res.json({ "error": "While resurrecting!" });
    };
  }
}

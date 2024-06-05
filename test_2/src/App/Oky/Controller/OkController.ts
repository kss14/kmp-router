import type { Request, Response, NextFunction } from "express";
import UtilsService from "../../../UtilsService";
import { UserConnected } from "../../../types/User";
export namespace App.Oky.Controller {
  export class OkController {
    constructor(private _UtilsService: UtilsService) {}

    public indexAction = (req: Request, res: Response, next: NextFunction) => {
      const user: UserConnected | null = this._UtilsService.StoreUser;

      return res.send(`OK ${user?.username ?? ""} on app1!`);
    };
  }
}

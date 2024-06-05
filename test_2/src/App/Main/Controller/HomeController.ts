import type { Request, Response, NextFunction } from "express";
import UtilsService from "../../../UtilsService";
import { UserConnected } from "../../../types/User";

export namespace App.Main.Controller {
  export class HomeController {
    constructor(      
      private _UtilsService: UtilsService
    ) {}

    public indexAction = (req: Request, res: Response, next: NextFunction) => {
      const user:UserConnected | null= this._UtilsService.StoreUser

      return res.send(
        `Welcome ${
          user?.firstname
            ? user?.firstname + " " + user?.lastname
            : ""
        }  on app1!  ${user?.id ? '<a style="margin: 0 10px;" href="/profile">profile</a><a href="/logout">logout</a>' : '<a href="/login">login</a>'}`
      );
    };

    public profileAction = (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      const user:UserConnected | null= this._UtilsService.StoreUser

      if (!user?.id) {
        return res.status(401).send(`not authorize  on app1`);
      }

      return res.send(
        `Profile ${
          user?.firstname + " " + user?.lastname
        }  on app1! This is a protected route.   <a href="/">home</a>
        <hr/>
        <div>${user?.birthsex === "M" ? "Mister" : "Miss"}</div>
        <div>${user?.lastname + " " + user?.firstname}</div>
        <div>BirthDay: ${user?.birthday}</div>
        <div>Email: ${user?.email}</div>
        `
      );
    };

    public subscribeAction = (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      return res.send(`Subscribe on app1!`);
    };
  }
}
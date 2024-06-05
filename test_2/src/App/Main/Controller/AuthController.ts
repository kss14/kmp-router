import type { Request, Response, NextFunction } from "express";
import * as Nsp from "../Service/AuthService";

export namespace App.Main.Controller {
  export class AuthController {
    constructor(
      private readonly _AuthService: Nsp.App.Main.Service.AuthService
    ) {}
    public loginAction = async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      if (req.method === "POST") {
        const isAuth = await this._AuthService.authenticate(req.body);

        if (isAuth) {
          return res.redirect("/profile");
        } else {
          return res.redirect("/login?conexion=0");
        }
      }

      return res.send(this._AuthService.loginPage);
    };

    public logoutAction = (req: Request, res: Response, next: NextFunction) => {
      this._AuthService.disconnect();

      return res.redirect("/");
    };
  }
}

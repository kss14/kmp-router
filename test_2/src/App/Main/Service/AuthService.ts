import type { UserId, UserLogin } from "../../../types/User";
import type JsonDataHandlerService from "../../../JsonDataHandlerService";
import UtilsService from "../../../UtilsService";

export namespace App.Main.Service {
  export class AuthService {
    constructor(
      private readonly _JsonService: JsonDataHandlerService,
      private _UtilService: UtilsService
    ) { }

    public authenticate = async (body: UserLogin): Promise<boolean> => {
      const user = await this._JsonService.credentialUser(body.username, body.password);

      if (
        user &&
        user.activated === true
      ) {
        user.connected = true;
        const isUserUpdated = await this._JsonService.addUserUpadted(user);

        if (isUserUpdated) {
          this._UtilService.StoreUser = user;

          return true;
        }
      }

      return false;
    };

    public disconnect = async (): Promise<boolean> => {
      const user = this._UtilService.StoreUser

      if (user) {
        user.connected = false;
        const isUserUpdated = await this._JsonService.addUserUpadted(user);

        if (isUserUpdated) {
          this._UtilService.StoreUser = null;
          this.removeUserIdOfConnectionsBan(user.id)

          return true;
        }
      }

      return false;
    };

    private removeUserIdOfConnectionsBan = (userId: UserId) => {
      const connectionsBan = this._UtilService.ConnectionsBan;
      const index = connectionsBan.indexOf(userId);
      if (index >= 0) {
        this._UtilService.ConnectionsBan = [
          ...connectionsBan.slice(0, index),
          ...connectionsBan.slice(index + 1),
        ];
      }
    }

    public loginPage = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login</title>
    </head>
    <body>
      <h2>Login</h2>
      <form action="/login" method="post">
        <label for="username">Username:</label><br>
        <input type="text" id="username" name="username"><br>
        <label for="password">Password:</label><br>
        <input type="password" id="password" name="password"><br><br>
        <input type="submit" value="Login">
      </form>
    </body>
    </html>
  `;
  }
}

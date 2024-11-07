import type JsonDataHandlerService from "../../JsonDataHandlerService";
import UtilsService from "../../UtilsService";

export namespace Api.Service {
  export class UserService {
    constructor(
      private readonly _JsonService: JsonDataHandlerService,
      private _UtilsService: UtilsService
    ) { }

    public ban = async (userId: number): Promise<boolean> => {
      const user = await this._JsonService.findDataJsonUser(userId);
      if (user) {
        user.activated = false;

        const isUserUpdated = await this._JsonService.addUserUpadted(user)

        if(isUserUpdated){
          this._UtilsService.ConnectionsBan.push(user.id);

          return true;
        }
        
      }

      return false;
    };

    public resurrected = async (userId: number): Promise<boolean> => {
      const user = await this._JsonService.findDataJsonUser(userId);

      if (user) {
        user.activated = true;
        this._UtilsService.ConnectionsBan = this._UtilsService.ConnectionsBan.filter((UserId) => UserId !== userId);

        return await this._JsonService.addUserUpadted(user)
      }

      return false;
    };
  }
}
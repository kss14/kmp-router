import fs from "fs";
import util from "util";
import type UtilsService from "./UtilsService";
import { UserData, UserConnected } from "./types/User";

const readFileAsync = util.promisify(fs.readFile);

export default class JsonDataHandlerService {
  constructor(private readonly _UtilsService: UtilsService) {}

  private  _readUsersFromFile = async (): Promise<UserData[] | null> => {
    const pathJson = this._UtilsService.SourceDirectory + '/config/user.json';

    try {
      const data = await readFileAsync(pathJson, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      console.error("Error reading file:", err);
      return null;
    }
  }

  public getDataJsonUsers= async(): Promise<UserData[] | null> => {
    return this._readUsersFromFile();
  }

  public  findDataJsonUser = async(id: number): Promise<UserData | null> => {
    const users = await this._readUsersFromFile();

    if (users) {
      return users.find(user => user.id === id) || null;
    }
    
    return null;
  }

  public  credentialUser = async(username: string, password: string): Promise<UserData | false> => {
    const users = await this._readUsersFromFile();

    if (users) {
      return users.find(user => user.username === username && user.password ===password) || false;
    }
    
    return false;
  }

  public  findIndexUser = async (id: number): Promise<number | null> => {
    const users = await this._readUsersFromFile();

    if (users) {
      const index = users.findIndex(user => user.id === id)

      if(index !== -1){
        return index;
      }

      return null ;
    }
    
    return null;
  } 

  public addUserUpadted = async (user:UserData): Promise<boolean> => {
    const users = await this.getDataJsonUsers()
    const userIndex = await this.findIndexUser(user.id);

    if(users && userIndex !== null){
      users[userIndex] = user
      void this.setDataJsonUser(users);
      
      return true;
    }

    return false;
  }

  public setDataJsonUser = async (jsonData: UserData[] | null): Promise<void> => {
    const pathJson =
      this._UtilsService.SourceDirectory + "/config/user.json";

    try {
      await fs.promises.writeFile(pathJson, JSON.stringify(jsonData));
      console.log("Data successfully written to user.json");
    } catch (err) {
      console.error("Error writing to file:", err);
    }
  }

  public restrictUserData = (jsonDataUser: UserData): UserConnected | null => {
    if (!jsonDataUser || typeof jsonDataUser !== "object") {
      return null;
    }

    const restrictedData: Partial<UserConnected>  = {};

    for (const key in jsonDataUser) {
      if (Object.prototype.hasOwnProperty.call(jsonDataUser, key)) {
        if (this.isValidKey(key)) {
          //@ts-ignore
          restrictedData[key] = jsonDataUser[key];
        }
      }
    }

    return restrictedData as UserConnected;
  }

  public isValidKey = (key: string): key is keyof UserConnected => {
    const allKeys = Object.keys({} as UserConnected);
    console.log(allKeys, key,{} as UserConnected)
    return allKeys.includes(key);
  }
}

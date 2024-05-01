import path from "path";
import { UserData, UserId } from "./types/User";
import { ContainerBuilder } from "kmp-di";

export default class UtilsService {
  private storeUser: UserData | null;
  private connectionsBan: UserId[];
  private container: ContainerBuilder | null;

  constructor() {
    this.storeUser = null;
    this.connectionsBan = [];
    this.container = null
  }

  get SourceDirectory(): string {
    return path.resolve(__dirname.replace(path.sep + "src", ""));
  }

  set StoreUser(user: UserData | null) {
    this.storeUser = user;
  }
  get StoreUser(): UserData | null {
    return this.storeUser;
  }

  set ConnectionsBan(userIds: UserId[]) {
    this.connectionsBan = userIds;
  }
  get ConnectionsBan(): UserId[] {
    return this.connectionsBan;
  }

  set Container(container: ContainerBuilder) {
    this.container = container;
  }
  get Container(): ContainerBuilder | null {
    return this.container;
  }
}

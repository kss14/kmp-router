import type { Request, Response, NextFunction, Express } from "express";
import { ContainerBuilder, YamlFileLoader } from "kmp-di";
import { KmpTools } from "../index";
import bodyParser from "body-parser";
import express from "express";
import path from "path";
import type JsonDataHandlerService from "./src/JsonDataHandlerService";
import { UserConnected, UserId } from "./src/types/User";

declare global {
  namespace Express {
    interface Request {
      container: ContainerBuilder;
      user: UserConnected | null;
    }
  }
}

class MyApp {
  protected app: Express;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
  }

  private initializeMiddlewares() {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));

    this.app.use(async (req: Request, res: Response, next: NextFunction) => {
      const container: ContainerBuilder = this.app.get("container");
      const utilsService = container.get("UtilsService");
      utilsService.Container = container;
      const storeUser: UserConnected | null = utilsService.StoreUser;
      const connectionsBan: UserId[] = utilsService.ConnectionsBan;
      const JsonDataHandlerService: JsonDataHandlerService = container.get(
        "JsonDataHandlerService"
      );

      if (
        connectionsBan.length !== 0 &&
        storeUser &&
        connectionsBan.includes(storeUser.id) &&
        req.path !== "/logout"
      ) {
        return res.redirect("/logout");
      } else if (!storeUser && req.path !== "/logout") {
        const user = await JsonDataHandlerService.findDataJsonUser(parseInt(req.params.id));

        if (user && user.connected === true) {
          utilsService.storeUser =
            JsonDataHandlerService.restrictUserData(user);
        }
      } else if (req.path === "/logout"){
        utilsService.storeUser = null
      }

      next();
    });
  }

  private async initializeRoutes() {
    const sourceDirectory = path.resolve(__dirname);
    const container = new ContainerBuilder(true, sourceDirectory + "/src");
    let loader = new YamlFileLoader(container);
    await loader.load(sourceDirectory + "/config/services.yml");
    await container.compile();

    this.app.set("container", container);
    
    const srcDir = path.join(__dirname, "src");
    const folderPaths = new KmpTools.Controller().getFolderPaths(srcDir, srcDir);
    const controllerPath = folderPaths.map((p: string) => {
      return __dirname + "/src/" + p + "Controller";
    });
    const options = {
      routingFile: "./test_2/config/routes.yml",
      controllerPath: controllerPath,
      helperName: "helper",
    };
    const routes = new KmpTools.Routes(this.app, options);
    this.app.get("*", function (req, res) {
      res.status(404).send("Page not found");
    });
  }

  public async start(): Promise<Express> {
    return this.app;
  }
}

export default MyApp;

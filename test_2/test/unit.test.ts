import { Request, Response, NextFunction } from "express";
import * as Nsp1 from "../src/App/Main/Controller/HomeController";
import UtilsService from "../src/UtilsService";
import { UserData, UserId } from "../src/types/User";
import JsonDataHandlerService from "../src/JsonDataHandlerService";
import { UserLogin } from "../src/types/User";
import * as Nsp2 from "../src/App/Main/Controller/AuthController";
import * as Nsp3 from "../src/App/Main/Service/AuthService";
import * as Nsp4 from "../src/Api/Controller/UserController";
import * as Nsp5 from "../src/Api/Service/UserService";
import fs from "fs";

jest.mock("fs");

describe("HomeController", () => {
  let utilsServiceMock: jest.Mocked<UtilsService>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let homeController: Nsp1.App.Main.Controller.HomeController;

  beforeEach(() => {
    utilsServiceMock = {
      StoreUser: null,
    } as jest.Mocked<UtilsService>;

    req = {};
    res = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    next = jest.fn();

    homeController = new Nsp1.App.Main.Controller.HomeController(utilsServiceMock);
  });

  describe("indexAction", () => {
    it("should send a welcome message with login link if user is not connected", () => {
      utilsServiceMock.StoreUser = null;

      homeController.indexAction(req as Request, res as Response, next);

      expect(res.send).toHaveBeenCalledWith('Welcome   on app1!  <a href=\"/login\">login</a>');
    });

    it("should send a welcome message with user info and profile/logout links if user is connected", () => {
      const user: UserData = {
        id: 1,
        username: "test",
        password: "test",
        firstname: "John",
        lastname: "Doe",
        birthsex: "M",
        birthday: new Date("1990-01-01"),
        email: "j.doe@example.com",
        role: ["user"],
        access: ["app1", "app2"],
        connected: true,
        activated: true
      };

      utilsServiceMock.StoreUser = user;

      homeController.indexAction(req as Request, res as Response, next);

      expect(res.send).toHaveBeenCalledWith('Welcome John Doe  on app1!  <a style="margin: 0 10px;" href="/profile">profile</a><a href="/logout">logout</a>');
    });
  });

  describe("profileAction", () => {
    it("should send a not authorized message if user is not connected", () => {
      utilsServiceMock.StoreUser = null;

      homeController.profileAction(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith('not authorize  on app1');
    });

    it("should send user profile information if user is connected", () => {
      const user: UserData = {
        id: 1,
        username: "test",
        password: "test",
        firstname: "John",
        lastname: "Doe",
        birthsex: "M",
        birthday: new Date("1990-01-01"),
        email: "j.doe@example.com",
        role: ["user"],
        access: ["app1", "app2"],
        connected: true,
        activated: true
      };

      utilsServiceMock.StoreUser = user;

      homeController.profileAction(req as Request, res as Response, next);

      expect(res.send).toHaveBeenLastCalledWith(
        `Profile ${user?.firstname + " " + user?.lastname
        }  on app1! This is a protected route.   <a href="/">home</a>
        <hr/>
        <div>${user?.birthsex === "M" ? "Mister" : "Miss"}</div>
        <div>${user?.lastname + " " + user?.firstname}</div>
        <div>BirthDay: ${user?.birthday}</div>
        <div>Email: ${user?.email}</div>
        `
      );
    });
  });//<div>BirthDay: ${user.birthday}</div>
  describe("subscribeAction", () => {
    it("should send subscribe message", () => {
      homeController.subscribeAction(req as Request, res as Response, next);

      expect(res.send).toHaveBeenCalledWith('Subscribe on app1!');
    });
  });
});

describe("AuthController", () => {
  let authServiceMock: jest.Mocked<Nsp3.App.Main.Service.AuthService>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let authController: Nsp2.App.Main.Controller.AuthController;

  beforeEach(() => {
    authServiceMock = {
      authenticate: jest.fn(),
      loginPage: '<html>Login Page</html>',
      disconnect: jest.fn(),
    } as unknown as jest.Mocked<Nsp3.App.Main.Service.AuthService>;

    req = {};
    res = {
      send: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    next = jest.fn();

    authController = new Nsp2.App.Main.Controller.AuthController(authServiceMock);
  });

  describe("loginAction", () => {
    it("should render the login page if method is not POST", async () => {
      req.method = "GET";

      await authController.loginAction(req as Request, res as Response, next);

      expect(res.send).toHaveBeenCalledWith(authServiceMock.loginPage);
    });

    it("should redirect to /profile if authentication is successful", async () => {
      req.method = "POST";
      req.body = { username: "test", password: "test" };
      authServiceMock.authenticate.mockResolvedValue(true);

      await authController.loginAction(req as Request, res as Response, next);

      expect(authServiceMock.authenticate).toHaveBeenCalledWith(req.body);
      expect(res.redirect).toHaveBeenCalledWith("/profile");
    });

    it("should redirect to /login?conexion=0 if authentication fails", async () => {
      req.method = "POST";
      req.body = { username: "test", password: "test" };
      authServiceMock.authenticate.mockResolvedValue(false);

      await authController.loginAction(req as Request, res as Response, next);

      expect(authServiceMock.authenticate).toHaveBeenCalledWith(req.body);
      expect(res.redirect).toHaveBeenCalledWith("/login?conexion=0");
    });
  });

  describe("logoutAction", () => {
    it("should disconnect the user and redirect to /", () => {
      authController.logoutAction(req as Request, res as Response, next);

      expect(authServiceMock.disconnect).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith("/");
    });
  });
});

describe("AuthService", () => {
  let jsonDataHandlerServiceMock: jest.Mocked<JsonDataHandlerService>;
  let utilsServiceMock: jest.Mocked<UtilsService>;
  let authService: Nsp3.App.Main.Service.AuthService;

  beforeEach(() => {
    jsonDataHandlerServiceMock = {
      credentialUser: jest.fn(),
      addUserUpadted: jest.fn(),
    } as unknown as jest.Mocked<JsonDataHandlerService>;

    utilsServiceMock = {
      StoreUser: null,
      ConnectionsBan: [],
    } as unknown as jest.Mocked<UtilsService>;

    authService = new Nsp3.App.Main.Service.AuthService(jsonDataHandlerServiceMock, utilsServiceMock)

  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("authenticate", () => {
    it("should authenticate the user and update the connected status", async () => {
      const body: UserLogin = { username: "test", password: "test" };
      const user: UserData = { id: 1, username: "test", password: "test", firstname: "John", lastname: "Doe", birthsex: "M", birthday: new Date("1990-01-01"), email: "j.doe@kmp.com", role: ["user"], access: ["app1", "app2"], connected: false, activated: true };

      jsonDataHandlerServiceMock.credentialUser.mockResolvedValue(user);
      jsonDataHandlerServiceMock.addUserUpadted.mockResolvedValue(true);
      utilsServiceMock.StoreUser = user

      const result = await authService.authenticate(body);

      expect(result).toBe(true);
      expect(user.connected).toBe(true);
      expect(jsonDataHandlerServiceMock.credentialUser).toHaveBeenCalledWith(body.username, body.password);
      expect(jsonDataHandlerServiceMock.addUserUpadted).toHaveBeenCalledWith(user);
      expect(utilsServiceMock.StoreUser).toBe(user);
    });

    it("should return false if user is not found", async () => {
      const body: UserLogin = { username: "testuser", password: "testpassword" };

      jsonDataHandlerServiceMock.credentialUser.mockResolvedValue(false);

      const result = await authService.authenticate(body);
      expect(result).toBe(false);
      expect(jsonDataHandlerServiceMock.credentialUser).toHaveBeenCalledWith("testuser", "testpassword");
    });

    it("should return false if user is not activated", async () => {
      const body: UserLogin = { username: "testuser", password: "testpassword" };
      const user: UserData = { id: 1, username: "testuser", password: "testpassword", firstname: "John", lastname: "Doe", birthsex: "M", birthday: "1990-01-01", email: "j.doe@kmp.com", role: ["user"], connected: false, activated: false };

      jsonDataHandlerServiceMock.credentialUser.mockResolvedValue(user);

      const result = await authService.authenticate(body);
      expect(result).toBe(false);
      expect(jsonDataHandlerServiceMock.credentialUser).toHaveBeenCalledWith("testuser", "testpassword");
    });
  });

  describe("disconnect", () => {
    it("should disconnect the user and update the connected status", async () => {
      const user: UserData = { id: 1, username: "test", password: "test", firstname: "John", lastname: "Doe", birthsex: "M", birthday: new Date("1990-01-01"), email: "j.doe@kmp.com", role: ["user"], access: ["app1", "app2"], connected: true, activated: true };

      utilsServiceMock.StoreUser = user;
      jsonDataHandlerServiceMock.addUserUpadted.mockResolvedValue(true);
      utilsServiceMock.ConnectionsBan = [0]
      const result = await authService.disconnect();

      expect(result).toBe(true);
      expect(user.connected).toBe(false);
      expect(jsonDataHandlerServiceMock.addUserUpadted).toHaveBeenCalledWith(user);
      expect(utilsServiceMock.StoreUser).toBeNull();
    });

    it("should return false if no user is stored", async () => {
      utilsServiceMock.StoreUser = null;

      const result = await authService.disconnect();
      expect(result).toBe(false);
    });

    it("should return false if updating user fails", async () => {
      const user: UserData = { id: 1, username: "testuser", password: "testpassword", firstname: "John", lastname: "Doe", birthsex: "M", birthday: "1990-01-01", email: "j.doe@kmp.com", role: ["user"], connected: true, activated: true };

      utilsServiceMock.StoreUser = user;
      jsonDataHandlerServiceMock.addUserUpadted.mockResolvedValue(false);

      const result = await authService.disconnect();
      expect(result).toBe(false);
      expect(jsonDataHandlerServiceMock.addUserUpadted).toHaveBeenCalledWith(user);
    });
  });

  describe("removeUserIdOfConnectionsBan", () => {
    it("should remove the user id from connections ban list", () => {
      const userId: UserId = 1;
      utilsServiceMock.ConnectionsBan = [1, 2, 3];

      authService["removeUserIdOfConnectionsBan"](userId);
      console.log('ninjaaaaaaaaaaaaa', utilsServiceMock.ConnectionsBan)
      expect(utilsServiceMock.ConnectionsBan).toEqual([2, 3]);
    });

    it("should not change the connections ban list if user id is not found", () => {
      const userId: UserId = 4;
      utilsServiceMock.ConnectionsBan = [1, 2, 3];
      authService["removeUserIdOfConnectionsBan"](userId);
      expect(utilsServiceMock.ConnectionsBan).toEqual([1, 2, 3]);
    });
  });

  describe("loginPage", () => {
    it("should return the login page HTML", () => {
      const loginPage = authService.loginPage;
      expect(loginPage).toContain("<title>Login</title>");
      expect(loginPage).toContain('<form action="/login" method="post">');
    });
  });
});

describe("UserController", () => {
  let userServiceMock: jest.Mocked<Nsp5.Api.Service.UserService>;
  let userController: Nsp4.Api.Controller.UserController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    userServiceMock = {
      ban: jest.fn(),
      resurrected: jest.fn(),
    } as unknown as jest.Mocked<Nsp5.Api.Service.UserService>;

    userController = new Nsp4.Api.Controller.UserController(userServiceMock);

    req = {params: {id: "1"}};
    res = {
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe("banAction", () => {
    it("should respond with success when user is banned", async () => {
      userServiceMock.ban.mockResolvedValue(true);

      await userController.banAction(req as Request, res as Response, next);
      
      expect(userServiceMock.ban).toHaveBeenCalledWith(parseInt(req?.params?.id ?? ""));
      expect(res.json).toHaveBeenCalledWith({ success: "Banned!" });
    });

    it("should respond with error when banning fails", async () => {
      userServiceMock.ban.mockResolvedValue(false);

      await userController.banAction(req as Request, res as Response, next);

      expect(userServiceMock.ban).toHaveBeenCalledWith(parseInt(req?.params?.id ?? ""));
      expect(res.json).toHaveBeenCalledWith({ error: "While banning!" });
    });
  });

  describe("resurrectedAction", () => {
    it("should respond with success when user is resurrected", async () => {
      userServiceMock.resurrected.mockResolvedValue(true);

      await userController.resurrectedAction(req as Request, res as Response, next);

      expect(userServiceMock.resurrected).toHaveBeenCalledWith(parseInt(req?.params?.id ?? ""));
      expect(res.json).toHaveBeenCalledWith({ success: "Resurrected!" });
    });

    it("should respond with error when resurrecting fails", async () => {
      userServiceMock.resurrected.mockResolvedValue(false);

      await userController.resurrectedAction(req as Request, res as Response, next);

      expect(userServiceMock.resurrected).toHaveBeenCalledWith(parseInt(req?.params?.id ?? ""));
      expect(res.json).toHaveBeenCalledWith({ error: "While resurrecting!" });
    });
  });
});

describe("JsonDataHandlerService", () => {
let utilsServiceMock: jest.Mocked<UtilsService>;
let jsonDataHandlerService: JsonDataHandlerService;

beforeEach(() => {
  utilsServiceMock = {
    SourceDirectory: ".."
  } as jest.Mocked<UtilsService>;

  fs.promises = {
    writeFile: jest.fn()
  } as any;

  jsonDataHandlerService = new JsonDataHandlerService(utilsServiceMock);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("_readUsersFromFile", () => {
  const normalizeDates = (users: any[]): any[] => {
    return users.map(user => ({
      ...user,
      birthday: user.birthday instanceof Date ? user.birthday.toISOString() : user.birthday
    }));
  };
  it("should read users from file", async () => {
    const users: UserData[] = [{ id: 1, username: "test", password: "test", firstname: "John", lastname: "Doe", birthsex: "M", birthday: new Date("1990-01-01"), email: "j.doe@kmp.com", role: ["user"], access: ["app1", "app2"], connected: true, activated: true }];
    const encoding = 'utf-8';
    const path = utilsServiceMock.SourceDirectory + 'config/user.json';
    (fs.readFile as unknown as jest.Mock).mockImplementation((path, encoding, callback) => {
      callback(null, JSON.stringify(users));
    });

    const result = await jsonDataHandlerService["_readUsersFromFile"]();
    expect(result).toEqual(normalizeDates(users));
  });

  it("should return null if there is an error reading the file", async () => {
    const encoding = 'utf-8';
    const path = utilsServiceMock.SourceDirectory + 'config/user.json';
    (fs.readFile as unknown as jest.Mock).mockImplementation((path, encoding, callback) => {
      callback(new Error("Error reading file"), null);
    });

    const result = await jsonDataHandlerService["_readUsersFromFile"]();
    expect(result).toBeNull();
  });
});

describe("getDataJsonUsers", () => {
  it("should return users", async () => {
    const users: UserData[] = [{ id: 1, username: "test", password: "test", firstname: "John", lastname: "Doe", birthsex: "M", birthday: new Date("1990-01-01"), email: "j.doe@kmp.com", role: ["user"], access: ["app1", "app2"], connected: true, activated: true }];
    jest.spyOn(jsonDataHandlerService, "_readUsersFromFile").mockResolvedValue(users);

    const result = await jsonDataHandlerService.getDataJsonUsers();
    expect(result).toEqual(users);
  });
});

describe("findDataJsonUser", () => {
  it("should return the user with the given id", async () => {
    const users: UserData[] = [{ id: 1, username: "test", password: "test", firstname: "John", lastname: "Doe", birthsex: "M", birthday: new Date("1990-01-01"), email: "j.doe@kmp.com", role: ["user"], access: ["app1", "app2"], connected: true, activated: true }];
    jest.spyOn(jsonDataHandlerService, "_readUsersFromFile").mockResolvedValue(users);

    const result = await jsonDataHandlerService.findDataJsonUser(1);
    expect(result).toEqual(users[0]);
  });

  it("should return null if the user is not found", async () => {
    const users: UserData[] = [{ id: 2, username: "test2", password: "test2", firstname: "Jane", lastname: "Doe", birthsex: "F", birthday: new Date("1991-02-02"), email: "jane.doe@kmp.com", role: ["user"], access: ["app1", "app2"], connected: true, activated: true }];
    jest.spyOn(jsonDataHandlerService, "_readUsersFromFile").mockResolvedValue(users);

    const result = await jsonDataHandlerService.findDataJsonUser(1);
    expect(result).toBeNull();
  });
});

describe("credentialUser", () => {
  it("should return the user with the given username and password", async () => {
    const users: UserData[] = [{ id: 1, username: "test", password: "test", firstname: "John", lastname: "Doe", birthsex: "M", birthday: new Date("1990-01-01"), email: "j.doe@kmp.com", role: ["user"], access: ["app1", "app2"], connected: true, activated: true }];
    jest.spyOn(jsonDataHandlerService, "_readUsersFromFile").mockResolvedValue(users);

    const result = await jsonDataHandlerService.credentialUser("test", "test");
    expect(result).toEqual(users[0]);
  });

  it("should return false if the username or password do not match", async () => {
    const users: UserData[] = [{ id: 1, username: "test", password: "wrong", firstname: "John", lastname: "Doe", birthsex: "M", birthday: new Date("1990-01-01"), email: "j.doe@kmp.com", role: ["user"], access: ["app1", "app2"], connected: true, activated: true }];
    jest.spyOn(jsonDataHandlerService, "_readUsersFromFile").mockResolvedValue(users);

    const result = await jsonDataHandlerService.credentialUser("test", "test");
    expect(result).toBe(false);
  });
});

describe("findIndexUser", () => {
  it("should return the index of the user with the given id", async () => {
    const users: UserData[] = [{ id: 1, username: "test", password: "test", firstname: "John", lastname: "Doe", birthsex: "M", birthday: new Date("1990-01-01"), email: "j.doe@kmp.com", role: ["user"], access: ["app1", "app2"], connected: true, activated: true }];
    jest.spyOn(jsonDataHandlerService, "_readUsersFromFile").mockResolvedValue(users);

    const result = await jsonDataHandlerService.findIndexUser(1);
    expect(result).toBe(0);
  });

  it("should return null if the user is not found", async () => {
    const users: UserData[] = [{ id: 1, username: "test2", password: "test2", firstname: "Jane", lastname: "Doe", birthsex: "F", birthday: new Date("1990-02-02"), email: "jane.doe@kmp.com", role: ["user"], access: ["app1", "app2"], connected: true, activated: true }];
    jest.spyOn(jsonDataHandlerService, "_readUsersFromFile").mockResolvedValue(users);
    const userId = 7;
    const result = await jsonDataHandlerService.findIndexUser(userId);
    expect(result).toBeNull();
  });
});

describe("addUserUpadted", () => {
  it("should update the user and save to file", async () => {
    const users: UserData[] = [{ id: 1, username: "test", password: "test", firstname: "John", lastname: "Doe", birthsex: "M", birthday: new Date("1990-01-01"), email: "j.doe@kmp.com", role: ["user"], access: ["app1", "app2"], connected: true, activated: true }];
    jest.spyOn(jsonDataHandlerService, "getDataJsonUsers").mockResolvedValue(users);
    jest.spyOn(jsonDataHandlerService, "findIndexUser").mockResolvedValue(0);
    jest.spyOn(jsonDataHandlerService, "setDataJsonUser").mockResolvedValue();

    const userToUpdate = { ...users[0], activated: false };
    const result = await jsonDataHandlerService.addUserUpadted(userToUpdate);

    expect(jsonDataHandlerService.findIndexUser).toHaveBeenCalledWith(1);
    expect(jsonDataHandlerService.setDataJsonUser).toHaveBeenCalledWith([userToUpdate]);
    expect(result).toBe(true);
  });

  it("should return false if user not found", async () => {
    jest.spyOn(jsonDataHandlerService, "getDataJsonUsers").mockResolvedValue([]);
    jest.spyOn(jsonDataHandlerService, "findIndexUser").mockResolvedValue(null);

    const userToUpdate: UserData = { id: 1, username: "test", password: "test", firstname: "John", lastname: "Doe", birthsex: "M", birthday: new Date("1990-01-01"), email: "j.doe@kmp.com", role: ["user"], access: ["app1", "app2"], connected: true, activated: true };
    const result = await jsonDataHandlerService.addUserUpadted(userToUpdate);

    expect(result).toBe(false);
  });
});

describe("setDataJsonUser", () => {
  it("should write data to user.json", async () => {
    const users: UserData[] = [{ id: 1, username: "test", password: "test", firstname: "John", lastname: "Doe", birthsex: "M", birthday: new Date("1990-01-01"), email: "j.doe@kmp.com", role: ["user"], access: ["app1", "app2"], connected: true, activated: true }];
    await jsonDataHandlerService.setDataJsonUser(users);

    expect(fs.promises.writeFile).toHaveBeenCalledWith("../config/user.json", JSON.stringify(users));
  });

  it("should log an error if writing to file fails", async () => {
    const error = new Error("Error writing to file");
    (fs.promises.writeFile as jest.Mock).mockRejectedValue(error);
    console.error = jest.fn();

    await jsonDataHandlerService.setDataJsonUser([]);

    expect(console.error).toHaveBeenCalledWith("Error writing to file:", error);
  });
});
});
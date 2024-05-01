export type UserLogin = Pick<UserData,  "username" | "password">;

export type UserConnected = Omit<UserData, "password" | "connected" | "activated">;

type UserRole = "user" | "admin" | "superadmin" | "guest";

type UniqueArray<T extends string> = T extends any
  ? { [K in T]: K }[T][]
  : never;
export type UserId = number

export type UserData = {
  id: UserId;
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  birthsex: "M" | "F";
  birthday: Date;
  email: string;
  role: UniqueArray<UserRole>;
  access: ["app1", "app2"];
  connected: boolean;
  activated: boolean;
};

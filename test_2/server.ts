import MyApp from "./app";

class Server {
  private myApp: MyApp;

  constructor() {
    this.myApp = new MyApp();
  }

  async start() {
    const port = process.env.PORT || 3000;
    const app = await this.myApp.start();

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }
}

void new Server().start();

export default Server
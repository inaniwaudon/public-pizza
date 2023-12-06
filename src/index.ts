import { address } from "./address";
import { getMenuList } from "./menu";
import { server } from "./mocks/node";
import { order } from "./order";
import { orderStatus } from "./order-status";
import { select } from "./select";
import { getWelcome } from "./welcome";

(async () => {
  // 開発環境ではモックサーバを起動
  if (process.env.NODE_ENV === "development") {
    server.listen();
  }

  try {
    let result = "";
    switch (process.argv[2]) {
      case "welcome":
        result = getWelcome();
        break;
      case "menu":
        result = await getMenuList();
        break;
      case "select":
        result = await select(process.argv[3], parseInt(process.argv[4]));
        break;
      case "address":
        result = await address(process.argv[3], parseInt(process.argv[4]));
        break;
      case "order":
        result = await order(process.argv[3], parseInt(process.argv[4]));
        break;
      case "order-status":
        result = await orderStatus(process.argv[3], parseInt(process.argv[4]));
        break;
    }
    console.log(result);
  } catch (e) {
    console.log(`不正なリクエストです。新たに Issue を立ててください。\n${e}`);
  }
})();

import { v4 as uuidV4 } from "uuid";

import {
  InitializeVariableBasketLine,
  InitializeVariableOption,
  VariableDeliveryAddress,
  mutateInitialiseOrder,
} from "./graphql/initialize-order";
import { getOrder } from "./graphql/order";
import { mutatePlaceOrder } from "./graphql/place-order";
import { closeIssue, getComment, getIssueComments } from "./libs/github";
import { parseAddressCustomer, parseOrderId } from "./libs/parse";

export const order = async (ownerRepo: string, issueNo: number) => {
  const [owner, repo] = ownerRepo.split("/");

  try {
    const comments = await getIssueComments(owner, repo, issueNo);

    // ID を取得
    const confirmComment = getComment("## 注文確認", true, comments);
    if (!confirmComment) {
      throw new Error("address: no comment with id found");
    }
    const id = parseOrderId(confirmComment);
    const order = await getOrder(id);
    if (!order.order.details.header.customer) {
      throw Error("address: customer is not found");
    }

    // 住所を取得
    const comment = getComment("- 配達指示：", false, comments);
    if (!comment) {
      throw new Error("address: no comment with address found");
    }
    const { address } = parseAddressCustomer(comment);

    const orderAddress = order.order.details.header.deliveryAddress;
    const deliveryAddress: VariableDeliveryAddress = {
      address: {
        postCode: orderAddress.address.postCode,
        state: orderAddress.address.state,
        streetNo: orderAddress.address.streetNo ?? "",
        street: orderAddress.address.street,
        suburb: orderAddress.address.suburb,
        buildingName: orderAddress.buildingName ?? "",
        unitNo: "",
      },
      displayAddress: orderAddress.displayAddress,
      deliveryInstructions: address.deliveryInstructions,
    };

    // 選択された商品を取得
    const selectedComment = getComment("## 選択されたメニュー", true, comments);
    if (!selectedComment) {
      throw new Error("address: no comment with swaps found");
    }

    const amount = order.order.details.basket.total;
    const advanceOrderId = uuidV4();
    const orderPaymentId = uuidV4();

    const lines: InitializeVariableBasketLine[] =
      order.order.details.basket.lines.map((line) => {
        const options: InitializeVariableOption[] = line.options.map(
          (option) => ({
            action: "Add",
            code: option.code,
            quantity: option.quantity,
          }),
        );
        return {
          lineNo: line.itemNo,
          price: line.totalPrice,
          sizeCode: line.sizeCode ?? undefined,
          productCode: line.productCode,
          quantity: 1,
          toppings: [],
          options,
          portions: [],
        };
      });

    await mutateInitialiseOrder(
      id,
      advanceOrderId,
      orderPaymentId,
      order.order.store.storeNo,
      deliveryAddress,
      order.order.details.header.customer,
      amount,
      lines,
    );

    await mutatePlaceOrder(id, orderPaymentId, amount);

    return [
      "## 注文完了",
      "| 項目 | 内容 |",
      "| --- | --- |",
      `| id | ${id} |`,
      `| advanceOrderId | ${advanceOrderId} |`,
      `| orderPaymentId | ${orderPaymentId} |`,
    ].join("\n");
  } catch (e) {
    await closeIssue(owner, repo, issueNo);
    throw e;
  }
};

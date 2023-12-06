import { OrderStatus, getOrder } from "./graphql/order";
import { getComment, getIssueComments } from "./libs/github";
import { parseOrderId } from "./libs/parse";
import { displayDateTime } from "./libs/utils";

const statusLabels: Record<OrderStatus, string> = {
  Basket: "注文中",
  Pending: "待機中",
  SentToStore: "店舗へ送信中",
  Making: "調理中",
  Cooking: "焼成中",
  Ready: "配達準備中",
  Leaving: "配達中",
  Complete: "配達完了",
} as const;

export const getOrderStatus = async (id: string) => {
  const order = await getOrder(id);
  const eta = order.order.eta
    ? `${displayDateTime(
        order.order.eta.min.substring(0, 19),
      )}–${displayDateTime(order.order.eta.max.substring(0, 19))}`
    : "未定";
  const orderTime = order.order.details.header.orderTime
    ? displayDateTime(order.order.details.header.orderTime)
    : "–";

  return [
    "## ピザトラッカー",
    "| 項目 | 内容 |",
    "| --- | --- |",
    `| 状況 | ${statusLabels[order.order.status.status]} |`,
    `| 到着予定時刻 | ${eta} |`,
    `| 注文時刻 | ${orderTime} |`,
    `| 経過時間 | ${order.order.status.elapsedTime} 秒 |`,
  ].join("\n");
};

export const orderStatus = async (ownerRepo: string, issueNo: number) => {
  const [owner, repo] = ownerRepo.split("/");

  try {
    const comments = await getIssueComments(owner, repo, issueNo);
    const confirmComment = getComment("## 注文確認", true, comments);
    if (!confirmComment) {
      return "";
    }
    const id = parseOrderId(confirmComment);
    return getOrderStatus(id);
  } catch (e) {
    return "";
  }
};

if (require.main === module) {
  (async () => {
    const result = await getOrderStatus(process.argv[2]);
    console.log(result);
  })();
}

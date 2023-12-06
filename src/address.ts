import { v4 as uuidV4 } from "uuid";

import { getDeliverySearch } from "./graphql/delivery-search";
import { VariableDeliveryAddress } from "./graphql/initialize-order";
import { getStore } from "./graphql/store";
import { mutateValidateBasket } from "./graphql/validate-basket";
import { closeIssue, getComment, getIssueComments } from "./libs/github";
import { parseAddressCustomer, parseSwapsSelectionCode } from "./libs/parse";
import { halfToFull } from "./libs/utils";

export const address = async (ownerRepo: string, issueNo: number) => {
  const [owner, repo] = ownerRepo.split("/");

  try {
    const comments = await getIssueComments(owner, repo, issueNo);

    // 住所・連絡先を取得
    const comment = getComment("- 配達指示：", false, comments);
    if (!comment) {
      return "住所・連絡先が入力されたコメントが見つかりませんでした。再度入力してください。";
    }
    const { address, customer } = parseAddressCustomer(comment);

    // 配達店舗を検索
    const searched = await getDeliverySearch(address.postCode);
    const displayAddress =
      address.address +
      (address.chome ? `${halfToFull(address.chome.toString())}丁目` : "");

    const deliverySearch = searched.deliverySearch.find(
      (a) => a.media.displayAddress === displayAddress,
    );
    if (!deliverySearch) {
      return "配達店舗が見つかりませんでした。再度入力してください。";
    }
    const store = await getStore(deliverySearch.storeNo);

    const deliveryAddress: VariableDeliveryAddress = {
      address: {
        postCode: deliverySearch.rawAddress.postCode,
        state: deliverySearch.rawAddress.state,
        suburb: deliverySearch.rawAddress.suburb,
        street: deliverySearch.rawAddress.street,
        streetNo: address.streetNo,
        buildingName: address.buildingName,
        unitNo: "",
      },
      displayAddress: `${address.postCode} ${deliverySearch.rawAddress.state} ${deliverySearch.rawAddress.suburb} ${deliverySearch.rawAddress.street} ${address.streetNo} ${address.buildingName}`,
      deliveryInstructions: address.deliveryInstructions,
    };

    // 選択された商品を取得
    const selectedComment = getComment("## 選択されたメニュー", true, comments);
    if (!selectedComment) {
      throw new Error("address: no comment with swaps found");
    }
    const selectionCode = parseSwapsSelectionCode(selectedComment);

    const id = uuidV4();
    const validated = await mutateValidateBasket(
      id,
      null,
      deliverySearch.storeNo,
      deliveryAddress,
      customer,
      [selectionCode],
    );

    // 画面表示
    const line = validated.validateBasket.basket.lines[0];
    const size = line.media.size ? ` ${line.media.size}` : "";
    const options = line.options.map(
      (option) => `  - ${option.media.name} × ${option.quantity}`,
    );
    const fullAddress = `${deliverySearch.rawAddress.state}${deliverySearch.rawAddress.suburb}${deliverySearch.rawAddress.street}${address.streetNo} ${address.buildingName}`;

    return [
      "## 注文確認",
      "以下の内容で注文します。確定する場合は「注文」と入力してください。",
      `注文 ID：${id}`,
      "",
      "### 商品",
      `- ${line.media.name}${size} × ${line.quantity}（￥${line.totalPrice}）`,
      ...options,
      `- 注文総額：￥${validated.validateBasket.basket.total}（税込）`,
      "",
      "### 配達先住所・連絡先",
      "| 項目 | 内容 |",
      "| --- | --- |",
      `| 郵便番号 | ${address.postCode} |`,
      `| 住所 | ${fullAddress} |`,
      `| 配達指示 | ${address.deliveryInstructions} |`,
      `| 氏名 | ${customer.name}（${customer.alternateName}） |`,
      `| 電話番号 | ${customer.phoneNumber} |`,
      `| E-mail | ${customer.email} |`,
      `| 配達店舗 | ドミノ・ピザ ${store.store.media.name}店（No. ${store.store.storeNo}） |`,
      "",
      "### 決済手段",
      "- 現金",
    ].join("\n");
  } catch (e) {
    await closeIssue(owner, repo, issueNo);
    throw e;
  }
};

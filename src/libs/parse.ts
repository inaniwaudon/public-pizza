import { AddressAndCustomer, SelectionCode } from "./pizza";
import { fullToHalf } from "./utils";

/**
 * コメントからチェックボックスで選択されたメニューを取得する
 */
export const parseItemSelectionCodes = (comment: string): SelectionCode[] => {
  const lines = comment.split("\n");

  const searchItem = (i: number) => {
    const sizeResult = /- \[x\] ((.+?): .+)?（￥\d+）/.exec(lines[i]);
    if (!sizeResult) {
      return;
    }
    for (let j = i - 1; j >= 0; j--) {
      const itemResult = /#### (\d+): .+/.exec(lines[j]);
      if (itemResult) {
        return {
          item: itemResult[1],
          size: sizeResult[1] ? sizeResult[2] : null,
        };
      }
    }
  };

  return lines.flatMap((_, i) => searchItem(i) ?? []);
};

/**
 * コメントからチェックボックスで選択されたオプションを取得する
 */
export const parseSwapsSelectionCode = (comment: string): SelectionCode => {
  const lines = comment.split("\n");

  const item = /- (\w+):/g.exec(lines[2]);
  if (!item) {
    throw new Error("parseSelectionCodes: no item found");
  }
  const size = /- ([\w.]+):/g.exec(lines[3]);

  const swaps = lines.flatMap((line) => {
    // チェックボックスが存在しない場合は確定
    const result = /-( \[x\])? ([\w.]+)/g.exec(line);
    return result ? result[2] : [];
  });
  const bases = swaps.filter((swap) => swap.startsWith("Crust."));
  const sauces = swaps.filter((swap) => swap.startsWith("Sauce."));
  const toppings = swaps.filter((swap) => swap.startsWith("Topping."));
  const options = swaps.filter((swap) => swap.startsWith("Option."));

  return {
    item: item[1],
    size: size ? size[1] : null,
    swaps: {
      bases,
      sauces,
      toppings,
      options,
    },
  };
};

/**
 * コメントから住所・連絡先を取得する
 */
export const parseAddressCustomer = (comment: string): AddressAndCustomer => {
  const lines = comment.split("\n");

  const getLine = (label: string) => {
    const left = `- ${label}：`;
    const found = lines.find((line) => line.startsWith(left));
    return found ? found.replace(left, "").trim() : "";
  };

  // 郵便番号は3桁目にハイフンを挿入
  const postCodeLine = fullToHalf(getLine("郵便番号"));
  const postCodeNo = postCodeLine.replace("-", "");
  if (!/^\d{7}$/.test(postCodeNo)) {
    throw new Error("parseAddressCustomer: invalid post code");
  }
  const postCode = `${postCodeNo.slice(0, 3)}-${postCodeNo.slice(3)}`;

  // 電話番号はハイフンを削除
  const phoneNumber = fullToHalf(getLine("電話番号")).replace(/[-–]/g, "");
  if (!/^\d{10,11}$/.test(phoneNumber)) {
    throw new Error("parseAddressCustomer: invalid phone number");
  }

  // メールアドレスのバリデーション
  const email = fullToHalf(getLine("E-mail"));
  if (!/^[^@]+@[^@]+$/.test(email)) {
    throw new Error("parseAddressCustomer: invalid email");
  }

  // 丁目
  const chomeLine = getLine("丁目");
  const chome = chomeLine ? parseInt(fullToHalf(chomeLine)) : null;

  return {
    address: {
      postCode,
      address: getLine("都道府県・市区町村名"),
      chome,
      streetNo: fullToHalf(getLine("番地")),
      buildingName: fullToHalf(getLine("建物名")),
      deliveryInstructions: getLine("配達指示"),
    },
    customer: {
      name: getLine("氏名"),
      alternateName: getLine("氏名カナ"),
      phoneNumber,
      email,
    },
  };
};

/**
 * コメントから注文 ID を取得する
 */
export const parseOrderId = (comment: string): string => {
  const lines = comment.split("\n");
  const prefix = "注文 ID：";

  const line = lines.find((line) => line.startsWith(prefix));
  if (!line) {
    throw new Error("parseId: no id found");
  }
  return line.replace(prefix, "").trim();
};

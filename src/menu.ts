import { MenuPage, MenuSize, getMenu } from "./graphql/menu";

const processSize = (size: MenuSize) => {
  const display = size.code ? `${size.code}: ${size.media.name ?? ""}` : "";
  return `- [ ] ${display}（￥${size.price}）`;
};

const processPage = (page: MenuPage) => {
  const lines: string[] = [];

  for (const section of page.sections) {
    const productMenuItems = section.items.filter(
      (item) => item.__typename === "ProductMenuItemOld",
    );
    if (productMenuItems.length === 0) {
      continue;
    }
    lines.push(
      "<details>",
      "<summary>",
      "",
      `### ピザ：${section.media.name}`,
      "</summary>",
      "",
    );
    if (section.media.description) {
      lines.push(`${section.media.description}\n`);
    }

    // item
    for (const item of productMenuItems) {
      lines.push(
        `#### ${item.code}: ${item.media.name}`,
        `- ${item.media.description}`,
        ...item.sizes.map((size) => processSize(size)),
        "",
      );
    }
    lines.push("</details>");
  }
  return lines;
};

export const getMenuList = async () => {
  const menu = await getMenu();

  // マイ・ドミノに限定する
  const myBoxPage = menu.menuTransitional.pages.find(
    (page) => page.code === "Menu.MyBox",
  )!;
  const lines: string[] = [
    "## メニューを選択",
    "注文するメニューを**一つのみ**選択し、「次へ」とコメントしてください。",
    ...processPage(myBoxPage),
  ];
  return lines.join("\n");
};

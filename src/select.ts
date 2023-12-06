import { closeIssue, getComment, getIssueComments } from "./libs/github";
import { parseItemSelectionCodes, parseSwapsSelectionCode } from "./libs/parse";
import { displaySwaps, getItemFromCode, validateSwaps } from "./libs/pizza";

export const selectSwaps = async (comment: string) => {
  const code = parseSwapsSelectionCode(comment);
  const { size, swaps } = await getItemFromCode(code);

  // swaps の個数が不足な場合はエラー
  if (await validateSwaps(size, swaps)) {
    return `オプションは ${size.swaps.options!.rule.min}–${
      size.swaps.options!.rule.max
    } 個で選択する必要があります。オプションを選択して、「次へ」と再度入力してください。`;
  }

  return [
    "## 住所・連絡先を入力",
    "次のテンプレートに配達先住所・名前を入力した上で、新たなコメントとして投稿してください。",
    "建物名や配達指示がない場合はそのまま空欄にしてください。",
    "```",
    "- 郵便番号：305-0006",
    "- 都道府県・市区町村名：茨城県つくば市天王台",
    "- 丁目：1",
    "- 番地：1-1",
    "- 建物名：筑波大学 ＊棟",
    "- 配達指示：",
    "- 氏名：",
    "- 氏名カナ：",
    "- 電話番号：",
    "- E-mail：",
    "```",
  ].join("\n");
};

export const selectMenu = async (comment: string) => {
  const code = parseItemSelectionCodes(comment);
  if (code.length === 0) {
    return "選択されたメニューはありません。メニューを選択して、「次へ」と再度入力してください。";
  }
  if (code.length > 1) {
    return "選択できるメニューは一つのみです。メニューを選択して、「次へ」と再度入力してください。";
  }
  const { item, size } = await getItemFromCode(code[0]);
  const sizeDisplay = size.code ? `${size.code}: ${size.media.name ?? ""}` : "";
  const swapLines = await displaySwaps(size);
  return [
    "## 選択されたメニュー",
    "オプションを選択して、「次へ」と入力してください。",
    `- ${item.code}: ${item.media.name}`,
    `  - ${sizeDisplay}（￥${size.price}）`,
    "",
    ...swapLines,
  ].join("\n");
};

export const select = async (ownerRepo: string, issueNo: number) => {
  const [owner, repo] = ownerRepo.split("/");

  try {
    // 候補選択を検知
    const comments = await getIssueComments(owner, repo, issueNo);
    const selectedComment = getComment("## 選択されたメニュー", true, comments);
    if (selectedComment) {
      return await selectSwaps(selectedComment);
    }

    // メニュー選択を検知
    const selectionComment = getComment("## メニューを選択", true, comments);
    if (selectionComment) {
      return await selectMenu(selectionComment);
    }

    throw new Error("get: no enabled comment is found");
  } catch (e) {
    await closeIssue(owner, repo, issueNo);
    throw e;
  }
};

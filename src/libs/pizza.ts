import { Ingredient, IngredientSet, MenuSize, getMenu } from "../graphql/menu";

export interface SelectionCode {
  item: string;
  size: string | null;
  swaps?: {
    bases: string[];
    sauces: string[];
    toppings: string[];
    options: string[];
  };
}

interface SwapsIngredient {
  bases: Ingredient[];
  sauces: Ingredient[];
  toppings: Ingredient[];
  options: Ingredient[];
}

export interface AddressAndCustomer {
  address: Address;
  customer: Customer;
}

export interface Address {
  postCode: string;
  address: string;
  chome: number | null;
  streetNo: string;
  buildingName: string;
  deliveryInstructions: string;
}

export interface Customer {
  phoneNumber: string;
  email: string;
  name: string;
  alternateName: string; // 氏名（フリガナ）
}

/**
 * SelectionCode から商品情報を取得する
 */
export const getItemFromCode = async (selection: SelectionCode) => {
  const menu = await getMenu();
  const items = menu.menuTransitional.pages
    .flatMap((page) => page.sections)
    .flatMap((section) => section.items);

  // item
  const item = items.find((item) => item.code === selection.item);
  if (!item) {
    throw new Error("getItemFromCode: item is not found");
  }

  // size
  let size: MenuSize;
  const selectionSize = selection.size;
  if (!selectionSize) {
    size = item.sizes[0];
  } else {
    const matched = item.sizes.find((size) => size.code === selectionSize);
    if (!matched) {
      throw new Error("getItemFromCode: size is not found");
    }
    size = matched;
  }

  if (!selection.swaps) {
    return { item, size };
  }

  // swaps
  const match = (
    ingredientSet: { ingredients: Ingredient[] } | null,
    codes: string[],
  ) =>
    ingredientSet?.ingredients?.filter((ingredient) =>
      codes.includes(ingredient.code),
    ) ?? [];

  return {
    item,
    size,
    swaps: {
      bases: match(size.swaps.bases, selection.swaps.bases),
      sauces: match(size.swaps.sauces, selection.swaps.sauces),
      toppings: match(size.swaps.toppings, selection.swaps.toppings),
      options: match(size.swaps.options, selection.swaps.options),
    },
  };
};

/**
 * swaps の候補を出力する
 */
export const displaySwaps = async (size: MenuSize) => {
  // 候補を出力する
  const displayIngredientSet = (
    set: IngredientSet | null,
    label: string,
    optional: boolean,
  ) => {
    if (!set) {
      return [];
    }
    const { ingredients, rule } = set;

    const displayIngredient = (ingredient: Ingredient) => {
      const name = ingredient.media.name.replace(/ \+￥[0-9]+/, "");
      const price = ingredient.price ? `（＋￥${ingredient.price}）` : "";
      return `${ingredient.code}: ${name}${price}`;
    };

    // 選択の余地がない場合はチェックボックスを出力しない
    if (ingredients.length === 1 && rule.min === 1) {
      return [`### ${label}`, `- ${displayIngredient(ingredients[0])}`];
    }

    return [
      `### ${label}を選択`,
      optional
        ? `- 最大 ${rule.max} 個まで選択可能（任意）`
        : `- 最小でも ${rule.min} 個は選択してください（最大 ${rule.max} 個）`,
      ...ingredients.map(
        (ingredient) => `- [ ] ${displayIngredient(ingredient)}`,
      ),
    ];
  };

  return [
    ...displayIngredientSet(size.swaps.bases, "生地", false),
    ...displayIngredientSet(size.swaps.sauces, "ソース", false),
    ...displayIngredientSet(size.swaps.toppings, "トッピング", true),
    ...displayIngredientSet(size.swaps.options, "オプション", false),
  ];
};

/**
 * swaps の選択個数を検証する
 */
export const validateSwaps = async (
  size: MenuSize,
  swaps?: SwapsIngredient,
) => {
  // マイ・ドミノに限定するため options のみの処理を行う
  return (
    size.swaps.options &&
    (!swaps ||
      swaps.options.length < size.swaps.options.rule.min ||
      swaps.options.length > size.swaps.options.rule.max)
  );
};

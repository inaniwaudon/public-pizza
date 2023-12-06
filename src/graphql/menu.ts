import { gql } from "graphql-request";

import { getClient, getVariables } from "./dominos";

interface MenuTransitional {
  menuTransitional: {
    pages: MenuPage[];
  };
}

type MenuCode =
  | "Menu.Pizza"
  | "Menu.MyBox"
  | "Menu.Subs"
  | "Menu.Side"
  | "Menu.BestSeller";

export interface MenuPage {
  code: MenuCode;
  sections: {
    code: string;
    media: {
      name: string;
      description: string;
    };
    items: ProductMenuItem[];
  }[];
}

export interface ProductMenuItem {
  code: string;
  type: string;
  defaultSize: string;
  halfNHalfEnabled: string;
  media: {
    name: string;
    description: string;
  };
  sizes: MenuSize[];
  __typename: string;
}

export interface MenuSize {
  code: string;
  price: number;
  salePrice: number;
  promoPrice: number;
  availability: boolean;
  media: {
    name: string;
  };
  swaps: {
    bases: IngredientSet | null;
    sauces: IngredientSet | null;
    toppings: IngredientSet | null;
    options: IngredientSet | null;
  };
  recipe: {
    base: Ingredient;
    sauce: Ingredient;
    toppings: {
      ingredient: Ingredient;
      quantity: number;
    };
    options: {
      ingredient: Ingredient;
      quantity: number;
    };
  };
}

export interface IngredientSet {
  rule: ProductRule;
  ingredients: Ingredient[];
}

export interface Ingredient {
  code: string;
  media: {
    name: string;
  };
  price: number;
}

interface ProductRule {
  min: number;
  max: number;
  maxPerIngredient: number;
  locked: boolean;
  allowAdd: boolean;
  allowRemove: boolean;
}

const query = gql`
  fragment ProductRuleFields on ProductRuleOld {
    min
    max
    maxPerIngredient
    locked
    allowAdd
    allowRemove
  }

  fragment IngredientFields on IngredientOld {
    code
    media {
      name
    }
    price
  }

  fragment IngredientSetFields on IngredientSetOld {
    rule {
      ...ProductRuleFields
    }
    ingredients {
      ...IngredientFields
    }
  }

  fragment ProductMenuItemFields on ProductMenuItemOld {
    code
    type
    defaultSize
    halfNHalfEnabled
    media {
      name
      description
    }
    sizes {
      code
      price
      salePrice
      promoPrice
      availability
      media {
        name
      }
      swaps {
        bases {
          ingredients {
            ...IngredientFields
          }
          rule {
            ...ProductRuleFields
          }
        }
        sauces {
          ...IngredientSetFields
        }
        toppings {
          ...IngredientSetFields
        }
        options {
          ...IngredientSetFields
        }
      }
      recipe {
        base {
          ...IngredientFields
        }
        sauce {
          ...IngredientFields
        }
        toppings {
          ingredient {
            ...IngredientFields
          }
          quantity
        }
        options {
          ingredient {
            ...IngredientFields
          }
          quantity
        }
      }
    }
  }

  query menu(
    $storeNo: Int!
    $serviceMethod: ServiceMethodEnum!
    $requestTime: DateTime
  ) {
    menuTransitional(
      storeNo: $storeNo
      serviceMethod: $serviceMethod
      requestTime: $requestTime
    ) {
      pages {
        code
        sections {
          code
          media {
            name
            description
          }
          items {
            ... on ProductMenuItemOld {
              ...ProductMenuItemFields
            }
            __typename
          }
        }
      }
    }
  }
`;

export const getMenu = async () => {
  const variables = getVariables();
  return await getClient().request<MenuTransitional>(query, variables);
};

if (require.main === module) {
  (async () => {
    const result = await getMenu();
    console.log(result);
  })();
}

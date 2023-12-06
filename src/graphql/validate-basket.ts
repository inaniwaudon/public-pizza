import { gql } from "graphql-request";
import { v4 as uuidV4 } from "uuid";

import { getClient } from "./dominos";
import { VariableDeliveryAddress } from "./initialize-order";

import { Customer, SelectionCode } from "../libs/pizza";

interface ValidateBasket {
  validateBasket: {
    basket: {
      id: string;
      advanceOrderId: string | null;
      lines: BasketLine[];
      total: number;
    };
    validationErrors: {
      code: string;
      message: string;
    }[];
  };
}

interface BasketLine {
  itemNo: number;
  productCode: string;
  sizeCode: string;
  media: {
    name: string;
    size: string;
  };
  totalPrice: number;
  quantity: number;
  options: Option[];
}

interface Option {
  code: string;
  quantity: number;
  media: {
    name: string;
  };
}

// variables
interface Variables {
  input: {
    id: string;
    advanceOrderId?: string;
    header: {
      serviceMethod: "Delivery";
      storeNo: number;
      time: string | null; // 日時を指定しない場合は null
      deliveryAddress: VariableDeliveryAddress;
      customer: Customer;
    };
    body: {
      lines: VariableBasketLine[];
      coupons: [];
    };
    payment: [
      {
        paymentMethod: "Cash";
        providerCode: "Cash";
      },
    ];
  };
}

interface VariableBasketLine {
  lineNo: number;
  sizeCode: string | null;
  productCode: string;
  quantity: number;
  options?: {
    action: string;
    code: string;
    quantity: number;
  }[];
}

const mutation = gql`
  mutation validateBasket($input: ValidateBasketInput!) {
    validateBasket(input: $input) {
      basket {
        id
        advanceOrderId
        lines {
          ... on BasketLine {
            itemNo
            productCode
            sizeCode
            media {
              name
              size
            }
            totalPrice
            quantity
            options {
              code
              quantity
              media {
                name
              }
            }
            __typename
          }
        }
        total
      }
      validationErrors {
        code
        message
      }
    }
  }
`;

export const mutateValidateBasket = async (
  id: string,
  advanceOrderId: string | null,
  storeNo: number,
  deliveryAddress: VariableDeliveryAddress,
  customer: Customer,
  selectionCodes: SelectionCode[],
) => {
  const lines = selectionCodes.map((code, index) => {
    const line: VariableBasketLine = {
      lineNo: index + 1,
      sizeCode: code.size,
      productCode: code.item,
      quantity: 1,
    };
    if (code.swaps) {
      line.options = code.swaps.options.map((option) => ({
        action: "Add",
        code: option,
        quantity: 1,
      }));
    }
    return line;
  });

  const variables: Variables = {
    input: {
      id,
      advanceOrderId: advanceOrderId ?? undefined,
      header: {
        serviceMethod: "Delivery",
        storeNo,
        time: null,
        deliveryAddress,
        customer,
      },
      body: {
        lines,
        coupons: [],
      },
      payment: [
        {
          paymentMethod: "Cash",
          providerCode: "Cash",
        },
      ],
    },
  };

  return await getClient().request<ValidateBasket>(
    mutation,
    variables as Record<string, any>,
  );
};

if (require.main === module) {
  (async () => {
    const id = uuidV4();

    const deliveryAddress = {
      address: {
        buildingName: "筑波大学 ＊棟",
        streetNo: "1-1",
        street: "天王台1-",
        postCode: "305-0006",
        state: "茨城県",
        suburb: "つくば市",
        unitNo: "",
      },
      displayAddress: "305-0006 茨城県 つくば市 天王台1- 1-1 筑波大学 ＊棟",
      deliveryInstructions: "テスト",
    };
    const customer = {
      phoneNumber: "0000000000",
      email: "test@example.com",
      name: "サンプル太郎",
      alternateName: "サンプルタロウ",
    };
    const lines = [
      {
        item: "7001",
        size: null,
        swaps: {
          bases: [],
          sauces: [],
          toppings: [],
          options: ["Option.B9", "Option.Ci"],
        },
      },
    ];
    const result = await mutateValidateBasket(
      id,
      null,
      86852,
      deliveryAddress,
      customer,
      lines,
    );
    console.log(result);
  })();
}

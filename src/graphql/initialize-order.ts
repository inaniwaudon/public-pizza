import { gql } from "graphql-request";

import { getClient } from "./dominos";

import { Customer } from "../libs/pizza";

export type VariableDeliveryAddress = {
  address: {
    postCode: string; // 305-0006
    state: string; // 茨城県
    suburb: string; // つくば市
    street: string; // 天王台1-
    streetNo: string; // 1-1
    buildingName: string; // 筑波大学 ＊棟
    unitNo: string; // 不明。空文字で OK
  };
  displayAddress: string; // 305-0006 茨城県 つくば市 天王台1- 1-1 筑波大学 ＊棟
  deliveryInstructions: string; // 配達指示
};

export interface InitializeVariableBasketLine {
  lineNo: number;
  price: number;
  productCode: string;
  sizeCode?: string;
  quantity: number;
  toppings: InitializeVariableOption[];
  options?: InitializeVariableOption[];
  portions: InitializeVariableOption[];
}

export interface InitializeVariableOption {
  action: "Add" | "Remove";
  code: string;
  quantity: number;
}

const query = gql`
  mutation initiateOrderMutation($input: InitialiseOrderInput!) {
    initialiseOrder(input: $input) {
      orderId
      basketId
      paymentDetails {
        orderPaymentId
        providerCode
        paymentMethod
        transactionToken
        amount
        properties {
          key
          value
        }
      }
    }
  }
`;

export const mutateInitialiseOrder = async (
  id: string,
  advanceOrderId: string | null,
  orderPaymentId: string,
  storeNo: number,
  deliveryAddress: VariableDeliveryAddress,
  customer: Customer,
  amount: number,
  lines: InitializeVariableBasketLine[],
) => {
  const variables = {
    input: {
      header: {
        storeNo,
        serviceMethod: "Delivery",
        deliveryAddress: deliveryAddress,
        customer: customer,
        channel: "web application",
        eclub: { optInEmails: false, optInSMS: false },
        charitySurcharge: false,
      },
      payment: {
        paymentMethod: "Cash",
        providerCode: "Cash",
        amount,
        orderPaymentId,
      },
      basket: {
        total: amount,
        totalDiscount: 0,
        surcharges: [],
        minimumPrice: 0,
        coupons: [],
        lines,
      },
      id,
      advanceOrderId,
    },
  };

  return await getClient().request(query, variables);
};

if (require.main === module) {
  (async () => {
    /*const result = await mutateInitialiseOrder(
      process.argv[2],
      process.argv[3],
    );
    console.log(result);*/
  })();
}

import { gql } from "graphql-request";

import { getClient } from "./dominos";

import { Customer } from "../libs/pizza";

export type OrderStatus =
  | "Basket"
  | "Pending"
  | "SentToStore"
  | "Making"
  | "Cooking"
  | "Ready"
  | "Leaving"
  | "Complete";

interface Order {
  order: {
    id: string;
    status: {
      status: OrderStatus;
      estimatedDuration: number;
      elapsedTime: number;
    };
    eta: {
      min: string;
      max: string;
    } | null;
    details: {
      header: {
        orderTime: string | null;
        serviceMethod: string;
        deliveryAddress: {
          displayAddress: string;
          buildingName: string | null;
          address: {
            postCode: string;
            state: string;
            suburb: string;
            street: string;
            streetNo: string | null;
          };
        };
        customer: Customer | null;
      };
      basket: {
        total: number;
        lines: OrderBusketLine[];
      };
      payments: {
        media: {
          displayName: string;
        };
        amount: number;
        orderPaymentId: string;
        paymentMethod: string;
        providerCode: string;
      };
    };
    store: {
      storeNo: number;
      media: {
        name: string;
        displayAddress: string;
      };
      phoneNo: string;
    };
  };
}

export interface OrderBusketLine {
  itemNo: number;
  productCode: string;
  sizeCode: string | null;
  totalPrice: number;
  quantity: number;
  options: {
    action: "Add" | "Remove";
    code: string;
    quantity: number;
    media: {
      name: string;
    };
  }[];
  media: {
    name: string;
    size: number | null;
  };
}

const query = gql`
  query orderQuery($id: String!) {
    order(id: $id) {
      id
      status {
        status
        estimatedDuration
        elapsedTime
      }
      eta {
        min
        max
      }
      details {
        header {
          orderTime
          serviceMethod
          deliveryAddress {
            displayAddress
            buildingName
            address {
              postCode
              state
              suburb
              street
              streetNo
            }
          }
          customer {
            name
            alternateName
            phoneNumber
            email
          }
        }
        basket {
          total
          lines {
            ... on OrderDetailsBasketProductLine {
              itemNo
              productCode
              sizeCode
              totalPrice
              quantity
              options {
                action
                code
                quantity
                media {
                  name
                }
              }
              media {
                name
                size
              }
            }
          }
        }
        payments {
          media {
            displayName
          }
          amount
          orderPaymentId
          paymentMethod
          providerCode
        }
      }
      store {
        storeNo
        media {
          name
          displayAddress
        }
        phoneNo
      }
    }
  }
`;

export const getOrder = async (id: string) => {
  const variables = { id };
  return await getClient().request<Order>(query, variables);
};

if (require.main === module) {
  (async () => {
    const result = await getOrder(process.argv[2]);
    console.log(result);
  })();
}

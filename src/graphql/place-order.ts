import { gql } from "graphql-request";

import { getClient } from "./dominos";

const query = gql`
  mutation placeOrder($input: PlaceOrder!) {
    placeOrder(input: $input) {
      orderId
      nextStep {
        nextStepType
        nextStepActionPayload
        outstandingBalance
      }
    }
  }
`;

export const mutatePlaceOrder = async (
  orderId: string,
  orderPaymentId: string,
  amount: number,
) => {
  const variables = {
    input: {
      orderId,
      saveDeliveryAddress: false,
      favouritePickupStore: false,
      payment: {
        properties: [{ key: "returnUrl", value: "returnUrl" }],
        paymentMethod: "Cash",
        providerCode: "Cash",
        amount,
        orderPaymentId,
      },
    },
  };
  return await getClient().request(query, variables);
};

if (require.main === module) {
  (async () => {
    const result = await mutatePlaceOrder(
      process.argv[2],
      process.argv[3],
      parseInt(process.argv[4]),
    );
    console.log(result);
  })();
}

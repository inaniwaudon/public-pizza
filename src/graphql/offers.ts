import { gql } from "graphql-request";

import { getClient, getVariables } from "./dominos";

interface Offers {
  offers: {
    offerId: string;
    name: string;
    disclaimers: { text: string }[];
    items: {
      id: string;
      name: string;
      linkedItem: {
        itemType: string;
        itemCode: string;
        subItemCode: string;
      };
    };
  }[];
}

const query = gql`
  query offers(
    $storeNo: Int!
    $tradingTime: String
    $serviceMethod: ServiceMethodEnum!
    $orderId: String
    $deliveryAddress: DeliveryAddressInput
    $layouts: [Layouts]
  ) {
    offers(
      storeNo: $storeNo
      tradingTime: $tradingTime
      serviceMethod: $serviceMethod
      orderId: $orderId
      deliveryAddress: $deliveryAddress
      layouts: $layouts
    ) {
      offerId
      name
      disclaimers {
        text
      }
      items {
        id
        name
        linkedItem {
          itemType
          itemCode
          subItemCode
        }
      }
    }
  }
`;

export const getOffers = async () => {
  const variables = getVariables();
  return await getClient().request<Offers>(query, variables);
};

if (require.main === module) {
  (async () => {
    const result = await getOffers();
    console.log(result);
  })();
}

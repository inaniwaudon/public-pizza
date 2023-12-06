import { gql } from "graphql-request";

import { getClient } from "./dominos";

interface DeliverySearch {
  deliverySearch: {
    storeNo: number;
    media: {
      displayAddress: string;
    };
    rawAddress: {
      street: string;
      suburb: string;
      postCode: string;
      state: string;
    };
  }[];
}

const query = gql`
  query (
    $buildingName: String
    $floorNo: String
    $unitNo: String
    $streetNo: String
    $streetName: String
    $suburb: String
    $postCode: String!
  ) {
    deliverySearch(
      buildingName: $buildingName
      floorNo: $floorNo
      unitNo: $unitNo
      streetNo: $streetNo
      streetName: $streetName
      suburb: $suburb
      postCode: $postCode
    ) {
      storeNo
      media {
        displayAddress
      }
      rawAddress {
        street
        suburb
        postCode
        state
      }
    }
  }
`;

export const getDeliverySearch = async (postCode: string) => {
  const variables = {
    postCode,
  };
  return await getClient().request<DeliverySearch>(query, variables);
};

if (require.main === module) {
  (async () => {
    const result = await getDeliverySearch(process.argv[2]);
    console.log(result);
  })();
}

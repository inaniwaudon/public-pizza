import { gql } from "graphql-request";

import { getClient } from "./dominos";

interface Store {
  store: {
    storeNo: number;
    media: {
      name: string;
      displayAddress: string;
    };
  };
}

const query = gql`
  query storeQuery($storeNo: Int!, $orderTime: String, $locationId: String) {
    store(storeNo: $storeNo, orderTime: $orderTime, locationId: $locationId) {
      storeNo
      media {
        name
        displayAddress
      }
    }
  }
`;

export const getStore = async (storeNo: number) => {
  return await getClient().request<Store>(query, { storeNo });
};

if (require.main === module) {
  (async () => {
    const result = await getStore(parseInt(process.argv[2]));
    console.log(result);
  })();
}

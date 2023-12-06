import { GraphQLClient } from "graphql-request";

export const dominoEndpoint = "https://olo-graph-at.dominos.jp/graphql";

export const getClient = () => {
  const headers = {
    Accept: "*/*",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'",
    "dpe-application": "MobileWeb",
    "dpe-country": "JP",
    "dpe-language": "ja",
  };
  return new GraphQLClient(dominoEndpoint, {
    headers,
  });
};

export const getVariables = () => ({
  serviceMethod: "Delivery",
  storeNo: 87208,
  tradingTime: "2023-11-16T11:30:00+09:00",
});

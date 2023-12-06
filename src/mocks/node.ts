import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";

import { menuMockData } from "./menu";

import { dominoEndpoint } from "../graphql/dominos";

const handler = http.post(dominoEndpoint, () => {
  return HttpResponse.json(menuMockData);
});

export const server = setupServer(handler);

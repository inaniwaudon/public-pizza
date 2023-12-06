import { getOffers } from "./graphql/offers";

export const getOfferList = async () => {
  const offers = await getOffers();
  const lines: string[] = ["## キャンペーンを選択"];

  for (const offer of offers.offers) {
    lines.push(`- [ ] ${offer.offerId}: ${offer.name}`);
    for (const disclaimer of offer.disclaimers) {
      lines.push(`  - ${disclaimer.text}`);
    }
  }
  return lines.join("\n");
};

import { displaySwaps, getItemFromCode } from "./pizza";

import { server } from "../mocks/node";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("getItemFromCode", () => {
  it("コードからピザ（swaps なし）を取得できる", async () => {
    const result = await getItemFromCode({
      item: "1047",
      size: "Pizza.Regular.R",
    });
    expect(result.item.code).toEqual("1047");
    expect(result.size.code).toEqual("Pizza.Regular.R");
  });

  it("コードからマイドミノ（swaps なし）を取得できる", async () => {
    const result = await getItemFromCode({
      item: "7005",
      size: null,
    });
    expect(result.item.code).toEqual("7005");
    expect(result.size.code).toEqual(null);
  });

  it("コードからピザ（swaps あり）を取得できる", async () => {
    const result = await getItemFromCode({
      item: "1741",
      size: "Pizza.Medium.M",
      swaps: {
        bases: ["Crust.O"],
        sauces: [],
        toppings: ["Topping.63", "Topping.02"],
        options: [],
      },
    });
    expect(result.item.code).toEqual("1741");
    expect(result.size.code).toEqual("Pizza.Medium.M");
    expect(result.swaps!.bases![0].code).toEqual("Crust.O");
    expect(result.swaps!.toppings!.map(({ code }) => code)).toEqual([
      "Topping.02",
      "Topping.63",
    ]);
  });

  it("コードからマイドミノ（swaps あり）を取得できる", async () => {
    const result = await getItemFromCode({
      item: "7009",
      size: null,
      swaps: {
        bases: [],
        sauces: [],
        toppings: [],
        options: ["Option.B9", "Option.Ci"],
      },
    });
    expect(result.item.code).toEqual("7009");
    expect(result.size.code).toEqual(null);
    expect(result.swaps!.options!.map(({ code }) => code)).toEqual([
      "Option.B9",
      "Option.Ci",
    ]);
  });
});

describe("displaySwaps", () => {
  it("ピザの候補を表示できる", async () => {
    const { size } = await getItemFromCode({
      item: "1047",
      size: "Pizza.Regular.R",
    });
    const result = await displaySwaps(size);

    const expected = [
      "### 生地を選択",
      "- 最小でも 1 個は選択してください（最大 1 個）",
      "- [ ] Crust.F: ミルフィーユ（＋￥460）",
      "- [ ] Crust.N: チーズンロール（＋￥390）",
      "- [ ] Crust.P: パンピザ",
      "- [ ] Crust.R: ハンドトス（レギュラークラスト）",
      "- [ ] Crust.S: セサミガーリッククラスト（＋￥99）",
      "- [ ] Crust.U: ウルトラクリスピークラスト",
      "- [ ] Crust.X: トッピング2倍盛（ハンドトス）（＋￥460）",
      "- [ ] Crust.Y: トッピング2倍盛（ウルトラクリスピー）（＋￥460）",
      "### トッピングを選択",
      "- 最大 9 個まで選択可能（任意）",
      "- [ ] Topping.02: カマンベールチーズソース（＋￥410）",
      "- [ ] Topping.03: 粗挽きソーセージ（＋￥410）",
      "- [ ] Topping.05: ペパロニ（＋￥410）",
      "- [ ] Topping.06: イタリアンソーセージ（＋￥410）",
      "- [ ] Topping.07: ハム（＋￥410）",
      "- [ ] Topping.08: 燻しベーコン（＋￥410）",
      "- [ ] Topping.51: ガーリック（＋￥270）",
      "- [ ] Topping.52: マヨソース（＋￥270）",
      "- [ ] Topping.57: マッシュルーム（＋￥270）",
      "- [ ] Topping.59: コーン（＋￥270）",
      "- [ ] Topping.60: オニオン（＋￥270）",
      "- [ ] Topping.62: ハラピニオ（＋￥270）",
      "- [ ] Topping.63: パイナップル（＋￥270）",
      "- [ ] Topping.65: ピーマン（＋￥270）",
      "- [ ] Topping.66: ほうれん草（＋￥270）",
      "- [ ] Topping.67: チェリートマト（＋￥270）",
      "- [ ] Topping.70: ダブルチーズ（＋￥330）",
    ];
    expect(result).toEqual(expected);
  });

  it("マイドミノの候補を表示できる", async () => {
    const { size } = await getItemFromCode({
      item: "7005",
      size: null,
    });
    const result = await displaySwaps(size);

    const expected = [
      "### オプションを選択",
      "- 最小でも 2 個は選択してください（最大 2 個）",
      "- [ ] Option.1n: チキンナゲット（3ピース） ※BBQソースなし",
      "- [ ] Option.B9: ジューシーからあげ（3ピース）",
      "- [ ] Option.Ci: のび～るチーズ棒（2本）（＋￥30）",
      "- [ ] Option.Eg: エッグタルト（2個）（＋￥30）",
      "- [ ] Option.Fn: 骨付きフライドチキン（2ピース）",
      "- [ ] Option.Fr: 炙り焼きチキン（2ピース）（＋￥50）",
      "- [ ] Option.Pa: 焼きたて プチパンケーキ（4個）",
      "- [ ] Option.Py: ポテトフライ（100g） ※ケチャップなし",
    ];
    expect(result).toEqual(expected);
  });
});

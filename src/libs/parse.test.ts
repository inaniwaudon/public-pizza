import {
  parseAddressCustomer,
  parseItemSelectionCodes,
  parseOrderId,
  parseSwapsSelectionCode,
} from "./parse";

describe("parseItemSelectionCodes", () => {
  it("単一のピザの選択を取得できる", () => {
    const comment = `#### 1602: ドミノ・デラックス
- ペパロニ、イタリアンソーセージ、マッシュルーム、ピーマン、オニオン、トマトソース
- [ ] Pizza.Medium.M: Sサイズ (23cm、8ピース)（￥2480）
- [ ] Pizza.Regular.R: Mサイズ (27cm、8ピース)（￥3079）
- [ ] Pizza.Large.L: Lサイズ (32cm、12ピース)（￥3730）
- [ ] Pizza.BigBox.B: Sサイズ (ビッグボックス用)（￥2480）

#### 1604: マルゲリータ
- イタリア産ボッコンチーニ、バジル、チェリートマト、トマトソース
- [ ] Pizza.Medium.M: Sサイズ (23cm、8ピース)（￥2370）
- [x] Pizza.Regular.R: Mサイズ (27cm、8ピース)（￥2969）
- [ ] Pizza.Large.L: Lサイズ (32cm、12ピース)（￥3620）
- [ ] Pizza.BigBox.B: Sサイズ (ビッグボックス用)（￥2370）`;

    const result = parseItemSelectionCodes(comment);
    expect(result).toEqual([
      {
        item: "1604",
        size: "Pizza.Regular.R",
      },
    ]);
  });

  it("複数のピザの選択を取得できる", () => {
    const comment = `#### 1602: ドミノ・デラックス
- ペパロニ、イタリアンソーセージ、マッシュルーム、ピーマン、オニオン、トマトソース
- [ ] Pizza.Medium.M: Sサイズ (23cm、8ピース)（￥2480）
- [ ] Pizza.Regular.R: Mサイズ (27cm、8ピース)（￥3079）
- [x] Pizza.Large.L: Lサイズ (32cm、12ピース)（￥3730）
- [ ] Pizza.BigBox.B: Sサイズ (ビッグボックス用)（￥2480）

#### 1604: マルゲリータ
- イタリア産ボッコンチーニ、バジル、チェリートマト、トマトソース
- [ ] Pizza.Medium.M: Sサイズ (23cm、8ピース)（￥2370）
- [x] Pizza.Regular.R: Mサイズ (27cm、8ピース)（￥2969）
- [ ] Pizza.Large.L: Lサイズ (32cm、12ピース)（￥3620）
- [ ] Pizza.BigBox.B: Sサイズ (ビッグボックス用)（￥2370）`;

    const result = parseItemSelectionCodes(comment);
    expect(result).toEqual([
      {
        item: "1602",
        size: "Pizza.Large.L",
      },
      {
        item: "1604",
        size: "Pizza.Regular.R",
      },
    ]);
  });

  it("複数サイズのピザの選択を取得できる", () => {
    const comment = `#### 1602: ドミノ・デラックス
- ペパロニ、イタリアンソーセージ、マッシュルーム、ピーマン、オニオン、トマトソース
- [ ] Pizza.Medium.M: Sサイズ (23cm、8ピース)（￥2480）
- [x] Pizza.Regular.R: Mサイズ (27cm、8ピース)（￥3079）
- [x] Pizza.Large.L: Lサイズ (32cm、12ピース)（￥3730）
- [ ] Pizza.BigBox.B: Sサイズ (ビッグボックス用)（￥2480）`;

    const result = parseItemSelectionCodes(comment);
    expect(result).toEqual([
      {
        item: "1602",
        size: "Pizza.Regular.R",
      },
      {
        item: "1602",
        size: "Pizza.Large.L",
      },
    ]);
  });

  it("複数のマイドミノの選択を取得できる", () => {
    const comment = `#### 7001: ドミノ・デラックス＋お好きなサイド2個
- おひとり様用ピザ（18cm） ペパロニ、イタリアンソーセージ、マッシュルーム、ピーマン、オニオン、トマトソース
- [x] （￥1380）

#### 7007: マルゲリータ＋お好きなサイド2個
- おひとり様用ピザ（18cm） イタリア産ボッコンチーニ、バジル、チェリートマト、トマトソース
- [ ] （￥1380）

#### 7025: ガーリック・マスター＋お好きなサイド2個
- おひとり様用ピザ（18cm） ガーリック（ダブル）、粗挽きソーセージ、燻しベーコン、ブラックペッパー、トマトソース
- [x] （￥1310）`;

    const result = parseItemSelectionCodes(comment);
    expect(result).toEqual([
      {
        item: "7001",
        size: null,
      },
      {
        item: "7025",
        size: null,
      },
    ]);
  });
});

describe("parseSwapsSelectionCode", () => {
  it("選択されたピザ（swaps なし）を取得できる", async () => {
    const comment = `## 選択されたメニュー
オプションを選択して、「次へ」と入力してください。
- 1047: クワトロ・2ハッピー
  - Pizza.Medium.M: Sサイズ (23cm、8ピース)（2810）`;

    const result = parseSwapsSelectionCode(comment);
    expect(result).toEqual({
      item: "1047",
      size: "Pizza.Medium.M",
      swaps: {
        bases: [],
        sauces: [],
        toppings: [],
        options: [],
      },
    });
  });

  it("選択されたマイドミノ（swaps なし）を取得できる", async () => {
    const comment = `## 選択されたメニュー
オプションを選択して、「次へ」と入力してください。
- 7001: ドミノ・デラックス＋お好きなサイド2個
  - （1380）`;

    const result = parseSwapsSelectionCode(comment);
    expect(result).toEqual({
      item: "7001",
      size: null,
      swaps: {
        bases: [],
        sauces: [],
        toppings: [],
        options: [],
      },
    });
  });

  it("swaps を取得できる", async () => {
    const comment = `## 選択されたメニュー
オプションを選択して、「次へ」と入力してください。
- 1047: クワトロ・2ハッピー
  - Pizza.Medium.M: Sサイズ (23cm、8ピース)（2810）

### 生地を選択
- 最小でも 1 個は選択してください（最大 1 個）
- [ ] Crust.F: ミルフィーユ（＋￥340）
- [ ] Crust.N: チーズンロール（＋￥290）
- [ ] Crust.P: パンピザ
- [ ] Crust.R: ハンドトス（レギュラークラスト）
- [ ] Crust.S: セサミガーリッククラスト（＋￥99）
- [x] Crust.U: ウルトラクリスピークラスト
- [ ] Crust.X: トッピング2倍盛（ハンドトス）（＋￥390）
- [ ] Crust.Y: トッピング2倍盛（ウルトラクリスピー）（＋￥390）
### ソース
- Sauce.Sn: トマトソース
### トッピングを選択
- 最大 9 個まで選択可能（任意）
- [ ] Topping.02: カマンベールチーズソース（＋￥320）
- [ ] Topping.03: 粗挽きソーセージ（＋￥320）
- [ ] Topping.05: ペパロニ（＋￥320）
- [ ] Topping.06: イタリアンソーセージ（＋￥320）
- [x] Topping.07: ハム（＋￥320）
- [ ] Topping.08: 燻しベーコン（＋￥320）
- [ ] Topping.51: ガーリック（＋￥220）
- [x] Topping.52: マヨソース（＋￥220）
- [ ] Topping.57: マッシュルーム（＋￥220）
- [ ] Topping.59: コーン（＋￥220）
- [x] Topping.60: オニオン（＋￥220）
- [ ] Topping.62: ハラピニオ（＋￥220）
- [ ] Topping.63: パイナップル（＋￥220）
- [ ] Topping.65: ピーマン（＋￥220）
- [ ] Topping.66: ほうれん草（＋￥220）
- [ ] Topping.67: チェリートマト（＋￥220）
- [ ] Topping.70: ダブルチーズ（＋￥230）
### オプションを選択
- 最小でも 2 個は選択してください（最大 2 個）
- [ ] Option.1n: チキンナゲット（3ピース） ※BBQソースなし
- [ ] Option.B9: ジューシーからあげ（3ピース）
- [x] Option.Ci: のび～るチーズ棒（2本）（＋￥30）
- [ ] Option.Eg: エッグタルト（2個）（＋￥30）
- [ ] Option.Fn: 骨付きフライドチキン（2ピース）
- [x] Option.Fr: 炙り焼きチキン（2ピース）（＋￥50）
- [ ] Option.Py: ポテトフライ（100g） ※ケチャップなし`;

    const result = parseSwapsSelectionCode(comment);
    expect(result).toEqual({
      item: "1047",
      size: "Pizza.Medium.M",
      swaps: {
        bases: ["Crust.U"],
        sauces: ["Sauce.Sn"],
        toppings: ["Topping.07", "Topping.52", "Topping.60"],
        options: ["Option.Ci", "Option.Fr"],
      },
    });
  });
});

describe("parseAddressCustomer", () => {
  const expected = {
    address: {
      postCode: "305-0006",
      address: "茨城県つくば市天王台",
      chome: 1,
      streetNo: "1-1",
      buildingName: "筑波大学 3C棟",
      deliveryInstructions: "玄関前で受け取ります。",
    },
    customer: {
      name: "サンプル太郎",
      alternateName: "サンプルタロウ",
      phoneNumber: "09011112222",
      email: "me@example.com",
    },
  };

  it("住所・連絡先（半角）を取得できる", async () => {
    const comment = `- 郵便番号：305-0006
- 都道府県・市区町村名：茨城県つくば市天王台
- 丁目：1
- 番地：1-1
- 建物名：筑波大学 3C棟
- 配達指示：玄関前で受け取ります。

- 氏名：サンプル太郎
- 氏名カナ：サンプルタロウ
- 電話番号：09011112222
- E-mail：me@example.com`;

    const result = parseAddressCustomer(comment);
    expect(result).toEqual(expected);
  });

  it("住所・連絡先（全角）を取得できる", async () => {
    const comment = `- 郵便番号：３０５ー０００６
- 都道府県・市区町村名：茨城県つくば市天王台
- 丁目：１
- 番地：１−１
- 建物名：筑波大学 ３Ｃ棟
- 配達指示：玄関前で受け取ります。

- 氏名：サンプル太郎
- 氏名カナ：サンプルタロウ
- 電話番号：０９０１１１１２２２２
- E-mail：ｍｅ＠ｅｘａｍｐｌｅ．ｃｏｍ`;

    const result = parseAddressCustomer(comment);
    expect(result).toEqual(expected);
  });
});

describe("parseOrderId", () => {
  it("注文ID を取得できる", async () => {
    const comment = `注文確認
以下の内容で注文します。確定する場合は「注文」と入力してください。
注文 ID：5565fd91-9f67-a3c4-6c8f-914dfaa76431`;

    const result = parseOrderId(comment);
    expect(result).toEqual("5565fd91-9f67-a3c4-6c8f-914dfaa76431");
  });
});

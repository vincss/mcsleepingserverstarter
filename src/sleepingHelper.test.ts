import { getMOTD } from "./sleepingHelper";
import { DefaultSettings } from "./sleepingSettings";

describe("getMOTD", () => {
  it("converts Minecraft color codes to status JSON", () => {
    expect(
      getMOTD({ ...DefaultSettings, serverName: "§aGreen §lBold" }, "json"),
    ).toEqual({
      text: "",
      extra: [
        { text: "Green ", extra: [], color: "green" },
        { text: "Bold", extra: [], bold: true, color: "green" },
      ],
    });
  });
});

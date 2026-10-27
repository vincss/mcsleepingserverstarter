import { getMOTD } from "./sleepingHelper";
import { DefaultSettings } from "./sleepingSettings";

describe("getMOTD", () => {
  it("converts Minecraft color codes to status JSON", () => {
    expect(
      getMOTD({ ...DefaultSettings, serverName: "§aGreen §lBold" }, "json"),
    ).toEqual({
      text: "Green ",
      extra: [{ text: "Bold", bold: true, color: "green" }],
      color: "green",
    });
  });

  it("omits empty component extras for an unformatted server name", () => {
    expect(
      getMOTD({ ...DefaultSettings, serverName: "Server name" }, "json"),
    ).toEqual({ text: "Server name" });
  });
});

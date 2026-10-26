import {
  encodePacket,
  encodeString,
  encodeVarInt,
} from "./sleepingMcJavaProtocol";
import { readPacket, readString, readVarInt } from "./sleepingMcJavaParser";

test("reads fragmented packets and protocol strings", () => {
  const frame = encodePacket(0, encodeString("Prince"));

  expect(readPacket(frame.subarray(0, 1))).toBeUndefined();

  const packet = readPacket(frame);
  expect(packet?.id).toBe(0);
  expect(readString(packet!.payload, 0)?.value).toBe("Prince");
});

test("encodes and reads multi-byte VarInts", () => {
  expect(readVarInt(encodeVarInt(765))?.value).toBe(765);
});

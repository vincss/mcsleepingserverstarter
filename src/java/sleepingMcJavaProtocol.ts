export const encodeVarInt = (value: number): Buffer => {
  const bytes: number[] = [];
  while ((value & 0xffffff80) !== 0) {
    bytes.push((value & 0x7f) | 0x80);
    value >>>= 7;
  }
  bytes.push(value & 0x7f);
  return Buffer.from(bytes);
};

export const encodeString = (value: string): Buffer => {
  const text = Buffer.from(value, "utf8");
  return Buffer.concat([encodeVarInt(text.length), text]);
};

export const encodePacket = (id: number, payload: Buffer): Buffer => {
  const packet = Buffer.concat([encodeVarInt(id), payload]);
  return Buffer.concat([encodeVarInt(packet.length), packet]);
};

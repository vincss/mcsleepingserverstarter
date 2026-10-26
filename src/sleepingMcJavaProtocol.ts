export type DecodedPacket = {
  id: number;
  payload: Buffer;
  bytesRead: number;
};

export const encodeVarInt = (value: number): Buffer => {
  const bytes: number[] = [];
  while ((value & 0xffffff80) !== 0) {
    bytes.push((value & 0x7f) | 0x80);
    value >>>= 7;
  }
  bytes.push(value & 0x7f);
  return Buffer.from(bytes);
};

export const readVarInt = (
  buffer: Buffer,
  offset = 0,
): { value: number; bytesRead: number } | undefined => {
  let value = 0;
  let position = 0;
  while (offset + position < buffer.length) {
    const byte = buffer[offset + position];
    value |= (byte & 0x7f) << (position * 7);
    position += 1;
    if ((byte & 0x80) === 0) {
      return { value, bytesRead: position };
    }
    if (position === 5) {
      throw new Error("VarInt is too large");
    }
  }
  return undefined;
};

export const encodeString = (value: string): Buffer => {
  const text = Buffer.from(value, "utf8");
  return Buffer.concat([encodeVarInt(text.length), text]);
};

export const readString = (
  buffer: Buffer,
  offset: number,
): { value: string; bytesRead: number } | undefined => {
  const length = readVarInt(buffer, offset);
  if (!length) {
    return undefined;
  }
  if (length.value < 0 || length.value > 32767 * 4) {
    throw new Error("String length is invalid");
  }
  const start = offset + length.bytesRead;
  const end = start + length.value;
  if (end > buffer.length) {
    return undefined;
  }
  return {
    value: buffer.toString("utf8", start, end),
    bytesRead: length.bytesRead + length.value,
  };
};

export const encodePacket = (id: number, payload: Buffer): Buffer => {
  const packet = Buffer.concat([encodeVarInt(id), payload]);
  return Buffer.concat([encodeVarInt(packet.length), packet]);
};

export const readPacket = (buffer: Buffer): DecodedPacket | undefined => {
  const length = readVarInt(buffer);
  if (!length) {
    return undefined;
  }
  if (length.value < 1 || length.value > 2 * 1024 * 1024) {
    throw new Error("Packet length is invalid");
  }
  const packetEnd = length.bytesRead + length.value;
  if (packetEnd > buffer.length) {
    return undefined;
  }
  const id = readVarInt(buffer, length.bytesRead);
  if (!id) {
    throw new Error("Packet ID is missing");
  }
  const payloadStart = length.bytesRead + id.bytesRead;
  return {
    id: id.value,
    payload: buffer.subarray(payloadStart, packetEnd),
    bytesRead: packetEnd,
  };
};

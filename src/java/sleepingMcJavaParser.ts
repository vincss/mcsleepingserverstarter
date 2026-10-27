export type DecodedPacket = {
  id: number;
  payload: Buffer;
  bytesRead: number;
};

export type JavaHandshake = {
  protocolVersion: number;
  nextState: "status" | "login";
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

export const parseHandshake = (
  packet: DecodedPacket,
): JavaHandshake | undefined => {
  if (packet.id !== 0) {
    return undefined;
  }

  const protocol = readVarInt(packet.payload);
  const host = protocol && readString(packet.payload, protocol.bytesRead);
  if (!protocol || !host) {
    return undefined;
  }

  const nextState = readVarInt(
    packet.payload,
    protocol.bytesRead + host.bytesRead + 2,
  );
  if (!nextState || (nextState.value !== 1 && nextState.value !== 2)) {
    return undefined;
  }

  return {
    protocolVersion: protocol.value,
    nextState: nextState.value === 1 ? "status" : "login",
  };
};

export const isStatusRequest = (packet: DecodedPacket) =>
  packet.id === 0 && packet.payload.length === 0;

export const parseStatusPing = (packet: DecodedPacket) =>
  packet.id === 1 && packet.payload.length === 8 ? packet.payload : undefined;

export const parseLoginStart = (packet: DecodedPacket) => {
  if (packet.id !== 0) {
    return undefined;
  }
  const username = readString(packet.payload, 0)?.value;
  return username && /^[A-Za-z0-9_]{1,16}$/.test(username)
    ? username
    : undefined;
};

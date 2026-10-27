export const RakNetMagic = Buffer.from(
  "00ffff00fefefefefdfdfdfd12345678",
  "hex",
);

export type BedrockPacket =
  | { type: "ping"; timestamp: Buffer }
  | { type: "open_connection_request_1"; mtuSize: number }
  | { type: "open_connection_request_2"; mtuSize: number }
  | {
      type: "frame_set";
      sequenceNumber: number;
      packets: RakNetControlPacket[];
    };

export type RakNetControlPacket =
  | { type: "connection_request"; timestamp: bigint }
  | { type: "new_incoming_connection" };

const RakNetProtocolVersion = 11;
const MaxMtuSize = 1492;
const ReliableFrameTypes = new Set([2, 3, 4, 6, 7]);
const SequencedFrameTypes = new Set([1, 4]);
const OrderedFrameTypes = new Set([1, 3, 4, 7]);

export const parseBedrockDatagram = (
  message: Buffer,
): BedrockPacket | undefined => {
  switch (message[0]) {
    case 0x01:
    case 0x02:
      return message.length >= 25 && isRakNetMagic(message, 9)
        ? { type: "ping", timestamp: message.subarray(1, 9) }
        : undefined;
    case 0x05:
      return message.length >= 18 &&
        isRakNetMagic(message, 1) &&
        message[17] === RakNetProtocolVersion
        ? {
            type: "open_connection_request_1",
            mtuSize: Math.min(message.length + 28, MaxMtuSize),
          }
        : undefined;
    case 0x07:
      return message.length >= 34 && isRakNetMagic(message, 1)
        ? {
            type: "open_connection_request_2",
            mtuSize: message.readUInt16BE(24),
          }
        : undefined;
    default:
      if ((message[0] & 0xf0) === 0x80) {
        return parseFrameSet(message);
      }
  }
};

const parseFrameSet = (message: Buffer): BedrockPacket | undefined => {
  if (message.length < 7) {
    return undefined;
  }

  const packets: RakNetControlPacket[] = [];
  let offset = 4;
  while (offset + 3 <= message.length) {
    const header = message[offset++];
    const reliability = (header & 0xe0) >> 5;
    const payloadLength = Math.ceil(message.readUInt16BE(offset) / 8);
    offset += 2;

    if (ReliableFrameTypes.has(reliability)) offset += 3;
    if (SequencedFrameTypes.has(reliability)) offset += 3;
    if (OrderedFrameTypes.has(reliability)) offset += 4;
    if ((header & 0x10) !== 0) return undefined;
    if (offset + payloadLength > message.length) return undefined;

    const payload = message.subarray(offset, offset + payloadLength);
    if (payload[0] === 0x09 && payload.length >= 18) {
      packets.push({
        type: "connection_request",
        timestamp: payload.readBigInt64BE(9),
      });
    } else if (payload[0] === 0x13 && payload.length >= 164) {
      packets.push({ type: "new_incoming_connection" });
    }
    offset += payloadLength;
  }

  return {
    type: "frame_set",
    sequenceNumber: message.readUIntLE(1, 3),
    packets,
  };
};

const isRakNetMagic = (buffer: Buffer, offset: number) =>
  buffer.length >= offset + RakNetMagic.length &&
  buffer.subarray(offset, offset + RakNetMagic.length).equals(RakNetMagic);

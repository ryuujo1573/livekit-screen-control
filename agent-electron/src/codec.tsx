//
// 0         8.      ...      24.       ...     40.
// |<buttons>| <cursor-x> + 16 | <cursor-y> + 16 |
// |L|R|M|B|F|                                   |

export function encodePointer(buttons: number, x: number, y: number) {
  const encoder = new TextEncoder();
  const str = JSON.stringify({ buttons, x, y });
  return encoder.encode(str);
  const data = new Uint8Array(5);
  const view = new DataView(data.buffer);
  view.setUint8(0, buttons);
  view.setUint16(1, x);
  view.setUint16(3, y);
  return data;
}

export function decodePointer(data: Uint8Array) {
  const decoder = new TextDecoder();
  const str = decoder.decode(data);
  return JSON.parse(str);

  if (data.byteLength < 5) {
    throw new Error("malformed data");
  }

  const view = new DataView(data.buffer);
  const buttons = view.getUint8(0);
  const x = view.getUint16(1);
  const y = view.getUint16(3);
  return { buttons, x, y };
}

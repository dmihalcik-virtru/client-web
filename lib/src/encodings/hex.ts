export function encode(str: string): string {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (256 <= c) {
      throw Error('unsupported character');
    }
    hex += `${c.toString(16)}`;
  }
  return hex;
}

export function decode(hex: string): string {
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16));
  }
  return str;
}

export function decodeToArrayBuffer(hex: string): ArrayBuffer | never {
  if (hex.length & 1) {
    throw new Error('Invalid Argument');
  }
  const byteArray = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    byteArray[i >> 1] = parseInt(hex.slice(i, i + 2), 16);
  }
  return byteArray.buffer;
}


export function encodeArrayBuffer(arrayBuffer: ArrayBuffer): string | never {
  if (typeof arrayBuffer !== 'object') {
    throw new TypeError('Expected input to be an ArrayBuffer Object');
  }

  const byteArray = new Uint8Array(arrayBuffer);
  let hexString = '';
  let nextHexByte;

  for (let i = 0; i < byteArray.byteLength; i++) {
    nextHexByte = byteArray[i].toString(16);

    if (nextHexByte.length < 2) {
      nextHexByte = '0' + nextHexByte;
    }

    hexString += nextHexByte;
  }

  return hexString;
}

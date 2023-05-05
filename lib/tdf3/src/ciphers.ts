import { Buffer } from 'buffer';
import { Binary } from './binary.js';

import {
  type CryptoService,
  type DecryptResult,
  type EncryptResult,
} from './crypto/declarations.js';

const KEY_LENGTH = 32;
const IV_LENGTH = 12;

type ProcessGcmPayload = {
  payload: Binary;
  payloadIv: Binary;
  payloadAuthTag: Binary;
};
// Should this be a Binary, Buffer, or... both?
function processGcmPayload(buffer: Buffer): ProcessGcmPayload {
  // Read the 12 byte IV from the beginning of the stream
  const payloadIv = Binary.fromBuffer(buffer.slice(0, 12));

  // Slice the final 16 bytes of the buffer for the authentication tag
  const payloadAuthTag = Binary.fromBuffer(buffer.slice(-16));

  return {
    payload: Binary.fromBuffer(buffer.slice(12, -16)),
    payloadIv,
    payloadAuthTag,
  };
}

export const Algorithms = {
  AES_256_CBC: 'http://www.w3.org/2001/04/xmlenc#aes256-cbc',
  AES_256_GCM: 'http://www.w3.org/2009/xmlenc11#aes256-gcm',
};

export type SymmetricCipher = {
  name: string;

  generateInitializationVector(): Uint8Array;

  generateKey(): Uint8Array;

  encrypt(payload: Binary, key: Binary, iv: Binary): Promise<EncryptResult>;

  decrypt(buffer: Buffer, key: Binary, iv?: Binary): Promise<DecryptResult>;
};

export class AesGcmCipher implements SymmetricCipher {
  cryptoService: CryptoService;
  name: string;
  ivLength: number;
  keyLength: number;

  constructor(cryptoService: CryptoService) {
    this.cryptoService = cryptoService;
    this.name = 'AES-256-GCM';
    this.ivLength = IV_LENGTH;
    this.keyLength = KEY_LENGTH;
  }

  generateInitializationVector(): Uint8Array {
    if (!this.ivLength) {
      throw Error('No iv length');
    }
    return this.cryptoService.randomBytes(this.ivLength);
  }

  generateKey(): Uint8Array {
    if (!this.keyLength) {
      throw Error('No key length');
    }
    return this.cryptoService.randomBytes(this.keyLength);
  }

  /**
   * Encrypts the payload using AES w/ GCM mode.  This function will take the
   * result from the crypto service and construct the payload automatically from
   * it's parts.  There is no need to process the payload.
   */
  async encrypt(payload: Binary, key: Binary, iv: Binary): Promise<EncryptResult> {
    const toConcat: Buffer[] = [];
    const result = await this.cryptoService.encrypt(payload, key, iv, Algorithms.AES_256_GCM);
    toConcat.push(iv.asBuffer());
    toConcat.push(result.payload.asBuffer());
    if (result.authTag) {
      toConcat.push(result.authTag.asBuffer());
    }
    // console.error(
    //   `len(iv) = ${iv.length()}, len(payload) = ${payload.length()}, len(result.payload) = ${result.payload.length()}, len(result.authTag) = ${result.authTag?.length()}`
    // );
    result.payload = Binary.fromBuffer(Buffer.concat(toConcat));
    return result;
  }

  /**
   * Encrypts the payload using AES w/ CBC mode
   * @returns
   */
  async decrypt(buffer: Buffer, key: Binary, iv?: Binary): Promise<DecryptResult> {
    const { payload, payloadIv, payloadAuthTag } = processGcmPayload(buffer);

    return this.cryptoService.decrypt(
      payload,
      key,
      payloadIv,
      Algorithms.AES_256_GCM,
      payloadAuthTag
    );
  }
}

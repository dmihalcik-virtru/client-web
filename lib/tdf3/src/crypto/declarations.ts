import { Binary } from '../binary.js';

export type SymmetricAlgorithmUri =
  | 'http://www.w3.org/2001/04/xmlenc#aes256-cbc'
  | 'http://www.w3.org/2009/xmlenc11#aes256-gcm';

export type SymmetricAlgorithmName = 'AES_256_CBC' | 'AES_256_GCM';

export const Algorithms: Record<SymmetricAlgorithmName, SymmetricAlgorithmUri> = {
  AES_256_CBC: 'http://www.w3.org/2001/04/xmlenc#aes256-cbc',
  AES_256_GCM: 'http://www.w3.org/2009/xmlenc11#aes256-gcm',
};

export type EncryptResult = {
  /** Encrypted payload. */
  payload: Binary;
  /** Auth tag, if generated/ */
  authTag?: Binary;
};

export type DecryptResult = {
  payload: Binary;
};

export type PemKeyPair = {
  publicKey: string;
  privateKey: string;
};

/**
 * The minimum acceptable asymetric key size, currently 2^11.
 */
export const MIN_ASYMMETRIC_KEY_SIZE_BITS = 2048;

export type CryptoService = {
  /**
   * Try to decrypt content with the default or handed algorithm. Throws on
   * most failure, if auth tagging is implemented for example.
   */
  decrypt: (payload: Binary, key: Binary, iv: Binary, authTag: Binary) => Promise<DecryptResult>;

  decryptWithPrivateKey: (encryptedPayload: Binary, privateKey: string) => Promise<Binary>;

  /**
   * Encrypt content with the default or handed algorithm.
   */
  encrypt: (payload: Binary, key: Binary, iv: Binary) => Promise<EncryptResult>;

  encryptWithPublicKey: (payload: Binary, publicKey: string) => Promise<Binary>;

  /**
   * Generate an RSA key pair
   * @param size in bits, defaults to a reasonable size for the default method
   */
  generateKeyPair: (size?: number) => Promise<CryptoKeyPair>;

  /**
   * Create an HMAC SHA256 hash
   */
  hmac: (key: string, content: string) => Promise<string>;

  randomBytes: (byteLength: number) => Uint8Array;

  /** Compute the hex-encoded SHA hash of a UTF-16 encoded string. */
  sha256: (content: string) => Promise<string>;
};

import { assert, expect } from 'chai';

import {
  cryptoToPemPair,
  decrypt,
  decryptWithPrivateKey,
  encrypt,
  encryptWithPublicKey,
  generateKeyPair,
  hex2Ab,
  hmac,
  sha256,
} from '../../../../tdf3/src/crypto/index.js';
import { Binary } from '../../../../tdf3/src/binary.js';
import { decodeArrayBuffer, encodeArrayBuffer } from '../../../../src/encodings/base64.js';
import { randomBytes } from 'crypto';

describe('Crypto Service', () => {
  describe('hmac', () => {
    it('a', async () => {
      const hash = await hmac('0b', 'a');
      assert.equal(hash, '481294b9ead3f3c62cab40bbfda108e6678f8536d03264e37a583babbfacafc9');
    });
    it('content', async () => {
      const hash = await hmac('00', 'content');
      assert.equal(hash, '2cc732a9b86e2ff403e8c0e07ee82e69dcb1820e424d465efe69c63eacb0ee95');
    });
    it('content', async () => {
      const hash = await hmac('000000', 'content');
      assert.equal(hash, '2cc732a9b86e2ff403e8c0e07ee82e69dcb1820e424d465efe69c63eacb0ee95');
    });
    it('random string', async () => {
      const hash = await hmac(
        'd3d71c8ad8dd6e99be3eea609f69fd92a2903e2e2f0f064293997cff06ea4a6d',
        'e12e1b9689c9f3f56f8c185269391577'
      );
      assert.equal(hash, '185fe0d7324b01a3fbf30e56cd7f868689b3f9c2904642603b6bb969c790ccfc');
    });
  });

  it('should create hex to array buffer', () => {
    const ab = hex2Ab('22');
    expect(ab).to.have.property('byteLength');
  });

  describe('sha256', () => {
    it('a', async () => {
      const hash = await sha256('a');
      assert.equal(hash, 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb');
    });
    it('content', async () => {
      const hash = await sha256('content');
      assert.equal(hash, 'ed7002b439e9ac845f22357d822bac1444730fbdb6016d3ec9432297b9ec9f73');
    });
  });

  describe('generateKeyPair', () => {
    it('should generate pair with undefined', async () => {
      const obj = await generateKeyPair(undefined);
      expect(obj).to.have.own.property('publicKey');
    });

    it('should generate pair', async () => {
      const res = await generateKeyPair(2056);
      expect(res).to.have.own.property('publicKey');
    });

    it('should generate pair 2049', async () => {
      const res = await generateKeyPair(2049);
      expect(res).to.have.own.property('publicKey');
    });

    describe('throws when', () => {
      it('short length', async () => {
        try {
          await generateKeyPair(1);
          assert.fail();
        } catch (e) {
          expect(e.message).to.match(/Invalid key size requested/);
        }
      });
      it('invalid length', async () => {
        try {
          await generateKeyPair(2000);
          assert.fail();
        } catch (e) {
          expect(e.message).to.match(/Invalid key size requested/);
        }
      });
    });
  });

  it('should encrypt with public key and decrypt with private key', async () => {
    const ckp = await generateKeyPair(2056);
    const { publicKey, privateKey } = await cryptoToPemPair(ckp);
    const rawData = '1';
    const payload = Binary.fromString(rawData);

    const encrypted = await encryptWithPublicKey(payload, publicKey);
    const decrypted = await decryptWithPrivateKey(encrypted, privateKey);

    expect(decrypted.asString()).to.equal(rawData);
  });

  it('should encrypt with publicKey', async () => {
    const ckp = await generateKeyPair(2056);
    const { publicKey, privateKey } = await cryptoToPemPair(ckp);
    const rawData = '1';
    const payload = Binary.fromString(rawData);

    const encrypted = await encryptWithPublicKey(payload, publicKey);
    const decrypted = await decryptWithPrivateKey(encrypted, privateKey);

    expect(decrypted.asString()).to.equal(rawData);
  });

  it('should encrypt file', async () => {
    const rawData = '1';
    const binaryKey = Binary.fromArrayBuffer(
      // crypto.scryptSync('test', 'salt', 32) =>
      decodeArrayBuffer('cvR6X2vLG5ap13ssLxRjOV1KOjJfraYpD8D+97zdtY4=')
    );
    const payload = Binary.fromString(rawData);
    const iv = '0'.repeat(32);
    const binaryIV = Binary.fromString(iv);

    const encrypted = await encrypt(payload, binaryKey, binaryIV);
    expect(encodeArrayBuffer(encrypted.payload.asArrayBuffer())).to.eql('8Q==');
    const expectArrayBuffer = (encrypted.authTag as Binary).asArrayBuffer();
    expect(encodeArrayBuffer(expectArrayBuffer)).to.eql('d0HF3e42QRxb5nnvFl57ZQ==');
  });

  it('should encrypt with pub key and decrypt with private', async () => {
    const ckp = await generateKeyPair(2056);
    const { publicKey, privateKey } = await cryptoToPemPair(ckp);
    const rawData = '1';
    const payload = Binary.fromString(rawData);

    const encrypted = await encryptWithPublicKey(payload, publicKey);
    const decrypted = await decryptWithPrivateKey(encrypted, privateKey);

    expect(encrypted.asString()).to.not.eql('1');
    expect(decrypted.asString()).to.equal(rawData);
  });

  it('should encrypt with aes_256_gcm and decrypt', async () => {
    const rawData = '1';
    const payload = Binary.fromString(rawData);

    const key = Binary.fromArrayBuffer(
      // crypto.scryptSync('test', 'salt', 32) =>
      decodeArrayBuffer('cvR6X2vLG5ap13ssLxRjOV1KOjJfraYpD8D+97zdtY4=')
    );
    const iv = Binary.fromArrayBuffer(randomBytes(16));

    const encrypted = await encrypt(payload, key, iv);
    expect(encrypted).to.have.property('authTag');
    expect(encrypted.authTag).to.exist;
    if (!encrypted.authTag) throw new Error();
    const decrypted = await decrypt(encrypted.payload, key, iv, encrypted.authTag);
    expect(decrypted.payload.asString()).to.be.equal(rawData);
  });
});

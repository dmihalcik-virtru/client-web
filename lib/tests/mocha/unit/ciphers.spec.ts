import { expect } from 'chai';

import * as cryptoService from '../../../tdf3/src/crypto/index.js';
import { AesGcmCipher } from '../../../tdf3/src/ciphers.js';

describe('ciphers', () => {
  describe('generateInitializationVector', () => {
    it('iv - just one byte', async () => {
      const a = new AesGcmCipher(cryptoService);
      a.ivLength = 1;
      expect(a.generateInitializationVector()).to.have.lengthOf(1);
    });
    it('iv - standard length (12)', () => {
      const iv = new AesGcmCipher(cryptoService).generateInitializationVector();
      expect(iv).to.have.lengthOf(12);
    });
  });

  describe('generateKey', () => {
    it('must have length', () => {
      const a = new AesGcmCipher(cryptoService);
      a.keyLength = 0;
      expect(() => a.generateKey()).to.throw('No key length');
    });
    it('short', () => {
      const a = new AesGcmCipher(cryptoService);
      a.keyLength = 1;
      const key = a.generateKey();
      expect(key).to.be.a('UInt8Array');
      expect(key).to.have.lengthOf(1);
    });
    it('reasonable bytes', () => {
      const a = new AesGcmCipher(cryptoService);
      a.keyLength = 20;
      const key = a.generateKey();
      expect(key).to.be.a('UInt8Array');
      expect(key).to.have.lengthOf(20);
    });
    it('undefined bytes', () => {
      const a = new AesGcmCipher(cryptoService);
      const key = a.generateKey();
      expect(key).to.be.a('UInt8Array');
      expect(key).to.have.lengthOf(32);
    });
  });
});

import { expect } from 'chai';

import { bxor, keySplit, keyMerge } from '../../../tdf3/src/utils/keysplit.js';
import { randomBytes } from '../../../tdf3/src/crypto/index.js';
import { Binary } from '../../../tdf3/src/binary.js';

describe('keysplits', () => {
  it('binary xor', () => {
    expect(bxor(Buffer.from([0x0f]), Buffer.from([0xf0]))).to.eql(Buffer.from([0xff]));
    expect(bxor(Buffer.from([0x0f]), Buffer.from([0x0f]))).to.eql(Buffer.from([0x00]));
  });

  it('should return the original byte array with split set to one part', () => {
    const expected = new Uint8Array([1, 2, 3, 4]);
    const splits = keySplit(expected, 1);
    expect(splits[0]).to.eql(expected);
    expect(keyMerge(splits)).to.eql(expected);
  });

  it('should return the original byte array with split set to three parts', () => {
    const expected = new Uint8Array([1, 2, 3, 4]);
    const splits = keySplit(expected, 3);
    expect(expected).to.not.be.oneOf(splits);
    expect(keyMerge(splits)).to.eql(expected);
  });

  it(`random round trip no split`, () => {
    const key = randomBytes(4);

    const unwrappedKeyBinary = Binary.fromArrayBuffer(key);
    const splits = keySplit(unwrappedKeyBinary.asBuffer(), 1);

    expect(splits[0]).to.eql(key);
  });
});

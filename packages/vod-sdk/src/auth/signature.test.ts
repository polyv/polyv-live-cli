import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import {
  buildMd5SignString,
  buildSha1SignString,
  callbackSignCandidates,
  compactParams,
  createUploadSignature,
  signMd5,
  signSha1,
  verifyCallbackSignature
} from './signature.js';

describe('compactParams', () => {
  it('drops undefined, null and empty strings and stringifies the rest', () => {
    expect(compactParams({ a: undefined, b: null, c: '', d: 0, e: false, f: 12, g: 'x' })).toEqual({ d: '0', e: 'false', f: '12', g: 'x' });
  });
});

describe('signSha1', () => {
  it('builds the plain string from the signature docs', () => {
    expect(buildSha1SignString({ userid: '1b448be323', ptime: 1621997347695, date: '2020-10-13' }, 'abc')).toBe(
      'date=2020-10-13&ptime=1621997347695&userid=1b448be323abc'
    );
  });

  it('hashes it with an uppercase SHA1', () => {
    expect(signSha1({ userid: '1b448be323', ptime: 1621997347695, date: '2020-10-13' }, 'abc')).toBe(
      '3CA490D29AB54D97FD61B94443D4AD5D819511D0'
    );
  });

  it('signs values raw, never URL-encoded', () => {
    expect(signSha1({ a: 1, b: '测试' }, 'secret')).toBe('8532613263BEA19F336B8898DA086E25EEDE6F19');
  });

  it('leaves empty parameters out', () => {
    expect(buildSha1SignString({ a: undefined, b: null, c: '', d: 0, e: false }, 's')).toBe('d=0&e=falses');
    expect(buildSha1SignString({}, 's')).toBe('s');
  });
});

describe('signMd5', () => {
  it('matches the sandwich vector the PolyV Live CLI test pins down', () => {
    expect(signMd5({ appId: 'test123', timestamp: 1609459200000 }, 'mySecret')).toBe('EFF0E886F37955B5767430D5A0F4824D');
  });

  it('sorts by key and concatenates key and value without separators', () => {
    expect(buildMd5SignString({ b: 2, a: 1, skip: '' }, 's')).toBe('sa1b2s');
  });
});

describe('createUploadSignature', () => {
  it('uses lowercase md5 and keeps the millisecond ptime', () => {
    expect(createUploadSignature('sk', 'wt', 1700000000000)).toEqual({
      ptime: 1700000000000,
      sign: '1e32fd65ca82ed8d62dafdf6bd352eda',
      hash: '60ac7cc1b3997863705fd4b74d259b98'
    });
  });

  it('defaults ptime to now', () => {
    const before = Date.now();
    expect(createUploadSignature('sk', 'wt').ptime).toBeGreaterThanOrEqual(before);
  });
});

describe('verifyCallbackSignature', () => {
  const vid = 'e2e84a738302f20a4f6eb202976f5c63_e';
  const secretKey = '7UagtQOq2A';

  // Every case is the worked example of docs/vod/api/callBack.md.
  it.each([
    ['upload complete', { type: 'upload', vid }, 'b245e3e65aa45b60dc02337b5cd914a7'],
    ['single-clearness transcode', { type: 'encode', format: 'mp4', vid, df: '1' }, 'f6a7f9b3dce47c4c8d5bfbc96af79720'],
    ['audit result', { type: 'pass', vid }, '8ebb91d444ce53fafa3256670fb65d84']
  ])('accepts the documented %s example', (_name, input, sign) => {
    expect(verifyCallbackSignature({ sign, ...input }, secretKey)).toBe(true);
  });

  it('accepts the async-upload failure example', () => {
    expect(verifyCallbackSignature({ sign: 'c2f168b96d882c1a03f1021c29208916', type: 'async_upload', fileUrl: 'http://a.mp4' }, 'kXmHMLeX6M')).toBe(true);
  });

  it('accepts the event-type-only events', () => {
    const sign = md5(`DeleteMediaComplete${secretKey}`);
    expect(verifyCallbackSignature({ sign, eventType: 'DeleteMediaComplete' }, secretKey)).toBe(true);
  });

  it('accepts the all-clearness event that signs eventType, vid and secretkey', () => {
    const sign = md5(`encodeComplete${vid}${secretKey}`);
    expect(verifyCallbackSignature({ sign, eventType: 'encodeComplete', vid }, secretKey)).toBe(true);
  });

  it('rejects a signature made with another secret', () => {
    expect(verifyCallbackSignature({ sign: 'b245e3e65aa45b60dc02337b5cd914a7', type: 'upload', vid }, 'other')).toBe(false);
  });

  it('rejects an empty or unknown signature shape', () => {
    expect(verifyCallbackSignature({ sign: '', type: 'upload', vid }, secretKey)).toBe(false);
    expect(verifyCallbackSignature({ sign: 'deadbeef', type: 'something-else' }, secretKey)).toBe(false);
  });

  it('lists every plain string a callback could have signed', () => {
    expect(callbackSignCandidates({ sign: '', type: 'encode', vid: 'v', format: 'mp4', df: 1 }, 's')).toEqual([
      'encodemp4v1s',
      'encodevs',
      'manageencodevs'
    ]);
    expect(callbackSignCandidates({ sign: '', type: 'upload', vid: 'v' }, 's')).toEqual(['uploadvs', 'uploadvs', 'manageuploadvs']);
  });
});

function md5(text: string): string {
  return createHash('md5').update(text, 'utf8').digest('hex');
}

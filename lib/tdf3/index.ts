import { TDF, Client, FileClient } from './src/index.js';
import {
  NanoTDFClient,
  NanoTDFDatasetClient,
  AuthProviders,
  version,
  clientType,
} from '../src/index.js';

import fetch from 'node-fetch';
import { webcrypto as crypto } from 'node:crypto';

globalThis.crypto ??= crypto as unknown as Crypto;
globalThis.fetch ??= fetch as typeof globalThis.fetch;

export {
  TDF,
  Client,
  version,
  clientType,
  NanoTDFClient,
  NanoTDFDatasetClient,
  AuthProviders,
  FileClient,
};

export default {
  TDF,
  Client,
  version,
  clientType,
  NanoTDFClient,
  NanoTDFDatasetClient,
  AuthProviders,
  FileClient,
};

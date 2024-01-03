#!/usr/bin/env node

import path from 'path';
import uploadAsset from '../lib.mjs';

const log  = console.log,
      argc = process.argv.length;

if(argc !== 4) {
  log('Usage: cmd bucket directory');
  process.exit(1);
}

if(process.env.QINIU_AK === undefined) {
  log('process.env.QINIU_AK is undefined');
  process.exit(2);
}

if(process.env.QINIU_SK === undefined) {
  log('process.env.QINIU_SK is undefined');
  process.exit(3);
}

const options = {
  cwd:    process.cwd(),
  bucket: process.argv[2],
  asset:  process.argv[3],
};

uploadAsset(options, path.join(options.cwd, options.asset));

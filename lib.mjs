import fs from 'fs';
import mime from 'mime';
import path from 'path';
import qiniu from 'qiniu';

const log = console.log;

const {QINIU_AK: ak, QINIU_SK: sk} = process.env;

const opt = {scope: process.argv[2]},
      mac = new qiniu.auth.digest.Mac(ak, sk),
      putPolicy = new qiniu.rs.PutPolicy(opt),
      uploadToken = putPolicy.uploadToken(mac),
      config = new qiniu.conf.Config(),
      uploader = new qiniu.form_up.FormUploader(config),
      client = new qiniu.rs.BucketManager(mac, config),
      extra = new qiniu.form_up.PutExtra();

function uploadFile(localFile, options) {
  const assetDir = path.join(options.cwd, options.asset),
        newMime = mime.getType(localFile),
        key = localFile.slice(assetDir.length + 1);

  client.delete(options.bucket, key, err => {
    (!err) && log('Delete old file success! >>> ', key);
    (err)  && log('Delete old file error! >>> ', key, err.message);

    uploader.putFile(uploadToken, key, localFile, extra, err => {
      (!err) && log('upload success! >>> ', key);
      (err)  && log(err);

      client.changeMime(options.bucket, key, newMime, err => {
        (!err) && log('change mime success! >>> ', key);
        (err)  && log(err);
      });
    });
  });
}

function uploadAsset(options, dir) {
  if(!fs.existsSync(dir)) {
    log(`[ERROR] >>> ${dir} is not exists!`);
    return;
  }

  if(fs.statSync(dir).isFile()) {
    uploadFile(dir, options);
    return;
  }

  if(!fs.statSync(dir).isDirectory()) {
    log(`[ERROR] >>> ${dir} is not a directory or file!`);
    return;
  }

  const files = fs.readdirSync(dir);

  for(let i=0; i<files.length; i++) {
    const file = path.join(dir, files[i]);
    fs.statSync(file).isDirectory()
      ? uploadAsset(options, file)
      : uploadFile(file, options);
  }
}

export default uploadAsset;

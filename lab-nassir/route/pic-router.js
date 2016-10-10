'use strict';

const path = require('path');
const fs = require('fs');

const AWS = require('aws-sdk');
const multer = require('multer');
const createError = require('http-errors');
const debug = require('debug')('cuttlefish:pic-router');

const bearerAuth = require('../lib/bearer-auth-middleware');
const Pic = require('../model/pic');
const Gallery = require('../model/gallery');

const s3 = new AWS.S3();
const upload = multer({dest: `${__dirname}/../data`});
const picRouter = module.exports = require('express').Router();

picRouter.post('/api/gallery/:galleryID/pic', upload.single('image'), function(req, res, next) {
  debug('Hit POST /api/gallery/:galleryID/pic');
  if(!req.file) return next(createError(400, 'No file found'));
  if(!req.file.path) return next(createError(500, 'File was not saved'));

  let ext = path.extname(req.file.originalname);

  let params = {
    ACL: 'public-read',
    Bucket: 'octopus-cuttlefish',
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path),
  };

  s3.upload(params, function(err, s3Data) {
    debug('Hit s3.upload' + s3Data);
    if (err) return next(err);
    Gallery.findById(req.params.galleryID)
    .then(gallery => {
      debug('Found gallery?' + gallery);
      let picData = {
        name: req.body.name,
        desc: req.body.desc,
        imageURI: s3Data.Location,
        galleryID: gallery._id,
      };
      return new Pic(picData).save();
    })
    .then(pic => res.json(pic))
    .catch(next);
  });
});

picRouter.delete('/api/gallery/:galleryID/pic/:picID', bearerAuth, function(req, res, next) {
  debug('Hit DELETE /api/gallery/:galleryID/pic/:picID');

  Pic.findById(req.params.picID)
  .catch(err => Promise.reject(createError(404, err.message)))
  .then(pic => {
    if(pic.galleryID.toString() !== req.params.galleryID)
      return Promise.reject(createError(400, 'Bad request! Wrong gallery.'));
    if(pic.userID.toString() !== req.user._id.toString())
      return Promise.reject(createError(401, 'Bad request! User not authorized.'));

    let params = {
      Bucket: 'octopus-cuttlefish',
      Key: pic.objectKey,
    };

    return s3.deleteObject(params).promise();
  })
  .catch(err => Promise.reject(createError(500, err.message)))
  .then(s3Data => {
    console.log('s3Data:   ', s3Data);
    return Pic.findByIdAndRemove(req.params.picID);
  })
  .then(() => res.sendStatus(204))
  .catch(next);
});

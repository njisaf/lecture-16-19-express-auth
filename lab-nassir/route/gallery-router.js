'use strict';

const Router = require('express').Router;
const createError = require('http-errors');
const debug = require('debug')('cuttlefish:gallery-router');
const jsonParser = require('body-parser').json();

const Gallery = require('../model/gallery');
const bearerAuth = require('../lib/bearer-auth-middleware');

const galleryRouter = module.exports = Router();

galleryRouter.post('/api/gallery', bearerAuth, jsonParser, function(req, res, next) {
  debug('Hit POST /api/gallery');
  req.body.userID = req.user._id;
  new Gallery(req.body).save()
  .then(gallery => res.json(gallery))
  .catch(next);
});

galleryRouter.get('/api/gallery/:id', bearerAuth, function(req, res, next) {
  debug('Hit GET /api/gallery/:id');
  Gallery.findById(req.params.id)
  .then(gallery => {
    if(gallery.userID.toString() !== req.user._id.toString()) return next(createError(401, 'Invalid user'));
    res.json(gallery);
  })
  .catch(next);
});

'use strict';

const jwt = require('jwt');
const createError = require('http-errors');
const debug = require('debug')('cuttlefish:bearer-auth-middleware');

const User = require('../model/user');

module.exports = function(req, res, next) {
  debug('bearer-auth-middleware');
  let authHeader = req.headers.authorization;
  if(!authHeader) return next(createError(401, 'Requires auth header'));
  let token = authHeader.split('Bearer ')[1];
  if (!token) return next(createError(401, 'Requires token'));
  jwt.verify(token, process.env.APP_SECRET, (err, decoded) => {
    if (err) return next(err);
    User.findOne({findHash: decoded.token})
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => next(createError(401, err.message)));
  });
};
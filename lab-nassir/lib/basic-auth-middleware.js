'use strict';

const debug = require('debug')('cuttlefish:basic-auth-middleware');
const createError = require('http-errors');

module.exports = function(req, res, next){
  debug('basic-auth-middleware');
  var authHeader = req.headers.authorization;
  if(!authHeader) return next(createError(401, 'Requires authorization header'));

  let base64string = authHeader.split('Basic ')[1];
  if(!base64string) return next(createError(401, 'Requires username and password'));

  let utf8String = new Buffer(base64string, 'base64').toString();
  let authArray = utf8String.split(':');
  req.auth = {
    username: authArray[0],
    password: authArray[1],
  };

  if(!req.auth.username) return next(createError(401, 'Basic auth requires username'));
  if(!req.auth.password) return next(createError(401, 'Basic auth requires password'));

  next();
};

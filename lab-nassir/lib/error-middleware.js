'use strict';

const createError = require('http-errors');
const debug = require('debug')('cuttlefish:error-middleware');

module.exports = function(err, req, res, next) {
  debug('Hit error middleware');
  console.error(err.message);
  console.error('Middleware err.name: ', err.name);
  console.error('Middleware err.status: ', err.status);

  if (err.status) {
    res.status(err.status).send(err.name);
    next();
    return;
  }
  if (err.name === 'ValidationError') {
    err = createError(400, err.message);
    res.status(err.status).send(err.name);
    next();
    return;
  }
  err = createError(500, err.message);
  res.status(err.status).send(err.name);
  next();
};

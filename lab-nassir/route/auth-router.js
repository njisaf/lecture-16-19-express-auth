'use strict';

const Router = require('express').Router;
const debug = require('debug')('cuttlefish:auth-router');
const jsonParser = require('body-parser').json();
const basicAuth = require('../lib/basic-auth-middleware');

const User = require('../model/user');

const authRouter = module.exports = Router();

authRouter.post('/api/signup', jsonParser, function(req, res, next){
  debug('Hit POST /api/signup');
  let password = req.body.password;
  delete req.body.password;
  let user = new User(req.body);

  user.generatePasswordHash(password)
  .then(user => {
    debug('User returned, ' + user);
    return user.save();
  })
  .then(user => user.generateToken())
  .then(token => res.send(token))
  .catch(next);
});

authRouter.get('/api/signin', basicAuth, function(req, res, next){
  debug('Hit GET /api/signin');
  User.findOne({username: req.auth.username})
  .then(user => user.comparePasswordHash(req.auth.password))
  .then(user => user.generateToken())
  .then(token => res.send(token))
  .catch(next);
});

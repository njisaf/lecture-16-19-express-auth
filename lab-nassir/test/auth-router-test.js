'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');
const mongoose = require('mongoose');
const User = require('../model/user');

mongoose.Promise = Promise;

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'busta',
  password: '123',
  email: 'b.fish@fish.com',
};

describe('Testing auth-router', function(){
  describe('Testing POST routes', function(){
    describe('Testing POST with VALID BODY', function(){

      after(done => {
        User.remove({})
        .then(() => done())
        .catch(done);
      });

      it('Should return a token', (done) => {
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(!!res.text).to.equal(true);
          done();
        });
      });
    });
  });
});

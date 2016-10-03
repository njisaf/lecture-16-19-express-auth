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

    describe('Testing POST with INVALID BODY', function(){

      after(done => {
        User.remove({})
        .then(() => done())
        .catch(done);
      });

      it('Should return a 401 error', (done) => {
        request.post(`${url}/api/signup`)
        .set('Content-type', 'application/json')
        .send('{')
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(!!res.text).to.equal(true);
          done();
        });
      });
    });

  });

  describe('Testing GET /api/signin', function(){
    describe('Testing GET with VALID BODY', function(){

      before(done => {
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then(user => {
          this.tempuser = user;
          done();
        })
        .catch(done);
      });

      after(done => {
        User.remove({})
        .then(() => done())
        .catch(done);
      });

      it('Should return a token', (done) => {
        request.get(`${url}/api/signin`)
        .auth('busta', '123')
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(!!res.text).to.equal(true);
          done();
        });
      });
    });

    describe('Testing GET with INVALID BODY', function(){

      before(done => {
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then(user => {
          this.tempuser = user;
          done();
        })
        .catch(done);
      });

      after(done => {
        User.remove({})
        .then(() => done())
        .catch(done);
      });

      it('Should return a 401 error', (done) => {
        request.get(`${url}/api/signin`)
        .auth('busta', '1234')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(!!res.text).to.equal(true);
          done();
        });
      });
    });

  });

  describe('Testing unregistered routes', function(){
    it('Should return a 404 status and an error message', function(done){
      request.get(`${url}/api/apples`)
      .end((err, res) => {
        expect(res.status).to.equal(404);
        expect(res.text).to.equal('Cannot GET /api/apples\n');
        expect(err).to.not.equal(null);
        done();
        res.end();
      });
    });
  });
});

'use strict';

const fs = require('fs');
const expect = require('chai').expect;
const debug = require('debug')('cuttlefish:pic-router-test');
const Promise = require('bluebird');

const formRequest = require('./lib/form-request');
const Gallery = require('../model/gallery');
const User = require('../model/user');

const server = require('../server');

const url = 'http://localhost:3000';

const exampleUser = {
  username: 'busta',
  password: '123',
  email: 'b.fish@fish.com',
};

const exampleGallery = {
  name: 'Experiment 15 (partial failure)',
  desc: 'Suppurating pit',
};

const examplePic = {
  name: 'Dr. Samson',
  desc: 'Lead Researcher of Project Cuttlefish',
  image: fs.createReadStream(`${__dirname}/data/baby_rhino.jpg`),
};

describe('Testing pic router', function() {

  before(done => {
    if(!server.isRunning){
      server.listen(process.env.PORT, () => {
        server.isRunning = true;
        debug('Server is up on PORT ' + process.env.PORT);
        done();
      });
      return;
    }
    done();
  });

  after(done => {
    if(server.isRunning){
      server.close(err => {
        if (err) return done(err);
        server.isRunning = false;
        debug('Server is down!!');
        done();
      });
      return;
    }
    done();
  });

  afterEach(done => {
    debug('Cleaning all afterEach');
    Promise.all([
      User.remove({}),
      Gallery.remove({}),
    ])
    .then(() => done())
    .catch(done);
  });

  describe('Testing POST /api/gallery/:id/pic', function() {
    describe('With VALID token and data', function() {

      before(done => {
        debug('Creating tempuser and temptoken');
        new User(exampleUser).generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then(user => {
          this.tempuser = user;
          return user.generateToken();
        })
        .then(token => {
          this.temptoken = token;
          done();
        })
        .catch(done);
      });

      before(done => {
        debug('Creating tempgallery');
        exampleGallery.userID = this.tempuser._id.toString();
        new Gallery(exampleGallery).save()
        .then(gallery => {
          this.tempgallery = gallery;
          done();
        })
        .catch(done);
      });

      after(() => {
        debug('Cleaning exampleGallery');
        delete exampleGallery.userID;
      });


      it('Should return a pic', done => {
        formRequest(`${url}/api/gallery/${this.tempgallery._id}/pic`, this.temptoken, examplePic)
        .then(res => {
          console.log('should be pic', res.body);
          expect(res.statusCode).to.equal(200);
          expect(res.body.name).to.equal(examplePic.name);
          expect(res.body.desc).to.equal(examplePic.desc);
          expect(res.body.galleryID).to.equal(this.tempgallery._id.toString());
          // expect(res.body._id).to.equal(this.tempuser._id.toString());
          // expect(res.body.imageURI).to.equal('http://lulwat/img.pic');
          done();
        })
        .catch(done);
      });
    });
  });

  describe('Testing DELETE /api/gallery/:galleryId/pic/:picID', function() {
    describe('With VALID PIC ID and VALID GALLERY ID', function() {

      before(done => {
        debug('Creating tempuser and temptoken');
        new User(exampleUser).generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then(user => {
          this.tempuser = user;
          return user.generateToken();
        })
        .then(token => {
          this.temptoken = token;
          done();
        })
        .catch(done);
      });

      before(done => {
        debug('Creating tempgallery');
        exampleGallery.userID = this.tempuser._id.toString();
        new Gallery(exampleGallery).save()
        .then(gallery => {
          this.tempgallery = gallery;
          done();
        })
        .catch(done);
      });

      after(() => {
        debug('Cleaning exampleGallery');
        delete exampleGallery.userID;
      });

      it('Should return a 204 status code', done => {
        formRequest(`${url}/api/gallery/${this.tempgallery._id}/pic`, this.temptoken
      })
    });
  });
});

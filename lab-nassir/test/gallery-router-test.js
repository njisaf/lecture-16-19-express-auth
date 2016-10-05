'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');

const server = require('../server');
const Gallery = require('../model/gallery');
const User = require('../model/user');

mongoose.Promise = Promise;

require('../server');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'busta',
  password: '123',
  email: 'b.fish@fish.com',
};

const exampleGallery = {
  name: 'Terrible pit',
  desc: 'Experiment 15 (partial failure)',
};

describe('Testing /api/gallery/', function() {

  before(done => {
    if(!server.isRunning){
      server.listen(process.env.PORT, () => {
        server.isRunning = true;
        console.log('Server is up on PORT ', PORT);
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
        console.log('Server is down!!');
        done();
      });
      return;
    }
    done();
  });

  afterEach(done => {
    Promise.all([
      User.remove({}),
      Gallery.remove({}),
    ])
    .then(() => done())
    .catch(done);
  });

  describe('Testing POST /api/gallery', function(){
    before(done => {
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

    it('Should return a gallery', (done) => {
      request.post(`${url}/api/gallery`)
      .send(exampleGallery)
      .set({
        authorization: `Bearer ${this.temptoken}`,
      })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.name).to.equal(exampleGallery.name);
        expect(res.body.desc).to.equal(exampleGallery.desc);
        expect(res.body.userID).to.equal(this.tempuser._id.toString());
        let date = new Date(res.body.created).toString();
        expect(date).to.not.equal('Invalid Date');
        done();
      });
    });
  });

  describe('Testing GET /api/gallery', function() {

    before(done => {
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
      exampleGallery.userID = this.tempuser._id.toString();
      new Gallery(exampleGallery).save()
      .then(gallery => {
        this.tempgallery = gallery;
        done();
      })
      .catch(done);
    });

    after(() => {
      delete exampleGallery.userID;
    });

    it('Should return a gallery', (done) => {
      request.get(`${url}/api/gallery/${this.tempgallery._id}`)
      .set({
        authorization: `Bearer ${this.temptoken}`,
      })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.name).to.equal(exampleGallery.name);
        expect(res.body.desc).to.equal(exampleGallery.desc);
        expect(res.body.userID).to.equal(this.tempuser._id.toString());
        let date = new Date(res.body.created).toString();
        expect(date).to.not.equal('Invalid Date');
        done();
      });
    });      
  });
});

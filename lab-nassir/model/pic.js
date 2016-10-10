'use strict';

const debug = require('debug')('cuttlefish:pic');
const createError = require('http-errors');

const mongoose = require('mongoose');

const picSchema = mongoose.Schema({
  name: {type: String, required: true},
  desc: {type: String, required: true},
  galleryID: {type: mongoose.Schema.Types.ObjectId, required: true},
  imageURI: {type: String, required: true, unique: true},
  created: {type: Date, default: Date.now},
});

picSchema.methods.findByIdAndUpdate = function(id, _pic) {
  debug('Hit findByIdAndUpdate');
  Pic.findById(id)
  .catch(err => Promise.reject(createError(404, err.message)))
  .then(pic => {
    for (var key in pic) {
      if (key === 'imageURI') continue;
      if (_pic[key]) pic[key] = _pic[key];
    }
  });
};

module.exports = mongoose.model('pic', picSchema);

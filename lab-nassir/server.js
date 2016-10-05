'use strict';

const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const Promise = require('bluebird');
const debug = require('debug')('cuttlefish:server');

const picRouter = require('./route/pic-router');
const authRouter = require('./route/auth-router');
const galleryRouter = require('./route/gallery-router');
const errorMiddleware = require('./lib/error-middleware');

dotenv.load();

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI);

const PORT = process.env.PORT;
const app = express();

app.use(cors());
app.use(morgan('dev'));

app.use(picRouter);
app.use(authRouter);
app.use(galleryRouter);
app.use(errorMiddleware);

const server = module.exports = app.listen(PORT, () => {
  debug('Server active on PORT ' + PORT);
});

server.isRunning = true;

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config()
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger_output.json')

var indexRouter = require('./routes/index');
var keysRouter = require('./routes/keys');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/keys', keysRouter);
app.use('/apidoc', swaggerUi.serve, swaggerUi.setup(swaggerFile))

module.exports = app;

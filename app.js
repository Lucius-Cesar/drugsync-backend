require('dotenv').config();
require('./models/connection');


var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var cors = require('cors');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var drugsRouter = require('./routes/drugs');
var interactionsRouter = require('./routes/interactions');
var pathologiesRouter = require('./routes/pathologies');

var patientsRouter = require('./routes/patients');


var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/drugs', drugsRouter);
app.use('/interactions', interactionsRouter);
app.use('/pathologies', pathologiesRouter);

app.use('/patients',patientsRouter);



module.exports = app;

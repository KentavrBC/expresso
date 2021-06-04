const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const errorhandler = require('errorhandler');
const cors = require('cors');

const apiRouter = require('./api/api');

const port = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));

app.use('/api', apiRouter);


app.use(errorhandler());

app.listen(port, () => console.log("Server listen at: " + port));

module.exports = app;
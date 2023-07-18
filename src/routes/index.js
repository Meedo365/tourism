const express = require('express');
const app = express.Router();

require('./endpoints/auth')(app);
require('./endpoints/tourist')(app);
require('./endpoints/bookings')(app);

module.exports = app;
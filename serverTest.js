const express = require('express');
const app = express();
const hello = require('./hello');
console.log(hello('foo'));
app.listen(3000, () => {console.log("listening on port 3000")});
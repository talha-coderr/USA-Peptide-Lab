require('./app-global');
const config = require(`${__config}/config`);
require('dotenv').config();
  app = require(`${__config}/express`),
  
 server = require('http').Server(app);
//import db 
require(`${__config}/dbConn`);
// server.listen(`${config.port}`);
server.listen(config.port, () => {
  console.log(`🚀 Server is running on port: ${config.port}`);
});

module.exports = server;
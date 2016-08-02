//******************************
// Default configuration file
//******************************
module.exports = 
{
  "server": { //Express server settings
    "url": "http://localhost:8080", //The public URL of the server
    "name": "pasteful", //The server name set in HTTP headers
    "port": 8080,
    "trustProxy": ["loopback"], //The value of the app.set('trust proxy') setting
    "raw": {
      //The settings for the raw socket server
      enabled: true, //Whether to enable it or not
      port: 7777, //Port to bind to (should be different from HTTP server port)
      timeout: 200
    }
  },
  "paste": {
    "seed": null, //Integer seed used to generate URL slugs (optional)
    "ttl": "2d", //ms time string (see "ms" on NPM) before a paste is deleted
    "checkInterval": "10s", //ms time string for how often to check for and delete old pastes
    "maxSize": 1024*1024*12, //Max paste size, in bytes
    "large": {
      "maxSize": 1024*1024*100 //Max large paste size, in bytes
    }
  },
  "db": { //MongoDB settings
    "uri": "mongodb://localhost/pasteful",
    "options": {} //Options for mongoose.connect (optional)
  },

  "logger": {
    "server": {
      "console": {
        "level": "silly",
        "colorize": true,
        "label": "Server"
      },
      "logToFile": true,
      "file": {
        "level": "debug",
        "colorize": "false",
        "dirname": "logs",
        "filename": "site.",
        "datePattern": "yyyy-MM-dd.log",
        "label": "Server"
      }
    },
    "db": {
      "console": {
        "level": "silly",
        "colorize": true,
        "label": "MongoDB"
      },
      "logToFile": true,
      "file": {
        "level": "debug",
        "colorize": "false",
        "dirname": "logs",
        "filename": "site.",
        "datePattern": "yyyy-MM-dd.log",
        "label": "MongoDB"
      }
    },
    "socket": {
      "console": {
        "level": "silly",
        "colorize": true,
        "label": "Socket"
      },
      "logToFile": true,
      "file": {
        "level": "debug",
        "colorize": "false",
        "dirname": "logs",
        "filename": "site.",
        "datePattern": "yyyy-MM-dd.log",
        "label": "Socket"
      }
    }
  }
};
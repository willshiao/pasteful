pasteful
====
[![Build Status](https://travis-ci.org/willshiao/pasteful.svg?branch=master)](https://travis-ci.org/willshiao/pasteful)
[![Coverage Status](https://coveralls.io/repos/github/willshiao/transcript-parser/badge.svg?branch=master)](https://coveralls.io/github/willshiao/transcript-parser?branch=master)
[![license](https://img.shields.io/github/license/willshiao/pasteful.svg)]()

A feature-rich pastebin site written in Node.js using [Express](https://github.com/expressjs/express) and [MongoDB](https://www.mongodb.com/).

Supports both small (<= ~16 MB) pastes and large pastes (any size). It uses MongoDB's [GridFS](https://docs.mongodb.com/manual/core/gridfs/) to store and read large files.

Files can be uploaded through the web server from two different endpoints: `/pastes/new` and `/large/new`. `/pastes/new` is for small pastes, while `/large/new` is for larger pastes. `/large/new` requires the file to be attached as an attachment to allow for streaming to the DB.

`/pastes/new` accepts both JSON (`application/json`) and plain text (`text/plain`) requests.

The server also supports raw socket requests (enabled by default in the configuration). For example, you can upload a file like this:

    $ cat file.txt | nc localhost 7777
    http://localhost:8080/large/rJlqo8iRu

or like this:

    $ nc localhost 7777 < file.txt
    http://localhost:8080/large/rJlqo8iRu

Currently in early development. Pull requests are welcome.


## Setup

The setting files are located in the `config` folder. The [node-config](https://github.com/lorenwest/node-config) module is used to parse the config files and allows for different configurations to be loaded depending on environmental variables. For example, the `test.js` configuration is loaded when `NODE_ENV=TEST`.

The server can be installed and run like this:

    $ git clone https://github.com/willshiao/pasteful.git
    $ npm install
    $ npm run

Make sure you have [MongoDB](https://www.mongodb.com/download-center) installed and have changed the config settings to the correct DB URL.
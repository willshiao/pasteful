'use strict'

//******************************
// Logger module using Winston
//******************************
const winston = require('winston')
const config = require('config')
const mkdirp = require('mkdirp')
const RotateTransport = require('winston-daily-rotate-file')

const server = config.get('logger.server')
const serverConfig = {
  console: server.console
}

if (server.logToFile) {
  mkdirp.sync(server.file.dirname)
  serverConfig.transports = [new RotateTransport(server.file)]
}
winston.loggers.add('server', serverConfig)

const db = config.get('logger.db')
const dbConfig = {
  console: db.console
}
if (db.logToFile) {
  mkdirp.sync(db.file.dirname)
  dbConfig.transports = [new RotateTransport(db.file)]
}
winston.loggers.add('db', dbConfig)

const socket = config.get('logger.socket')
const socketConfig = {
  console: socket.console
}
if (socket.logToFile) {
  mkdirp.sync(socket.file.dirname)
  socketConfig.transports = [new RotateTransport(socket.file)]
}
winston.loggers.add('socket', socketConfig)

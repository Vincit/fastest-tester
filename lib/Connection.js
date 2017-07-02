const _ = require('lodash');
const url = require('url');
const request = require('yaquest');

class Connection {

  constructor({serverUrl}) {
    if (serverUrl.charAt(serverUrl.length - 1) !== '/') {
      serverUrl += '/';
    }

    this.serverUrl = serverUrl;
  }

  post({path, data}) {
    return request.post(this.path(path)).send(data);
  }

  get({path}) {
    return request.get(this.path(path));
  }

  delete({path}) {
    return request.delete(this.path(path));
  }

  path(path) {
    return `${this.url}wd/hub/${path}`;
  }

  get url() {
    return this.serverUrl;
  }
}

module.exports = {
  Connection
};
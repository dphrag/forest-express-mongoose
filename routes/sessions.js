'use strict';
var _ = require('lodash');
var auth = require('../services/auth');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

module.exports = function (app, opts) {

  function login(req, res) {
    var user = _.find(auth.allowedUsers, function (allowedUser) {
      return allowedUser.email === req.body.email &&
        allowedUser.outlines.indexOf(req.body.outlineId) > -1 &&
        bcrypt.compareSync(req.body.password, allowedUser.password);
    });

    if (user) {
      var token = jwt.sign({
        id: user.id,
        type: 'users',
        data: {
          email: user.email,
          // jshint sub: true
          'first_name': user['first_name'],
          'last_name': user['last_name']
        },
        relationships: {
          outlines: {
            data: [{
              type: 'outlines',
              id: req.body.outlineId
            }]
          }
        }
      }, opts.authKey, {
        expiresIn: '14 days'
      });

      res.send({ token: token });
    } else {
      res.status(401).send();
    }
  }

  this.perform = function () {
    app.post('/forest/sessions', login);
  };
};

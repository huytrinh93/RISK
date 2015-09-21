/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var bcrypt = require('bcrypt');

module.exports =
  {
    attributes:
      {
    	   name:
          {
    		      type: 'string',
    		      required: true
  	      },
  	     title:
          {
  		        type: 'string'
  	      },
  	     email:
          {
        		type: 'string',
        		email: true,
        		required: true,
        		unique: true
  	      },
  	     password:
          {
  		      type: 'string'
  	      },
  	     online:
          {
        		type: 'boolean',
        		defaultsTo: false
  	      },
  	     admin:
          {
        		type: 'boolean',
        		defaultsTo: false
  	      },
  	     games:
          {
        		collection: 'games',
        		via: 'players'
  	      }
     },

  beforeCreate: function (attrs, cb)
    {
      bcrypt.genSalt(10, function(err, salt)
        {
          if (err) return cb(err);
          bcrypt.hash(attrs.password, salt, function(err, hash)
            {
              if (err) return cb(err);
              attrs.password = hash;
              cb();
            });
        });
   }
};

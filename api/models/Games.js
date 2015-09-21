/**
* Games.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

    name: {
      type: 'string',
      required: true,
      unique: true
    },

  	numPlayers: {
  		type: 'integer',
      required: true,
      min: 2,
      max: 6
  	},

  	round: {
  		type: 'integer',
      defaultsTo: 0
  	},

  	currentUserTurn: {
  		type: 'integer',
      required: true
  	},

  	startDate: {
  		type: 'datetime'
  	},

  	endDate: {
  		type: 'datetime'
  	},

  	winner: {
  		type: 'integer'
  	},

    password: {
      type: 'string'
    },

    tempGameID: {
      type: 'integer'
    },

    inProgress: {
      type: 'boolean',
      defaultsTo: false
    },

    startingArmies: {
      type: 'integer'
    },

    regions: {
      collection: 'region',
      via: 'game'
    },

    players: {
      collection: 'user',
      via: 'games',
      dominant: true
    },

    phase: {
      type: 'integer',
      defaultsTo: 0
    },

    armiesRemaining: {
      type: 'integer'
    },

    moves : {
      type: 'integer',
      defaultsTo: 0
    }
  },

  beforeCreate: function (values, cb) {
    values.startDate = new Date().toISOString();
    var startingArmies = 0;

    switch (values.numPlayers) {
      case 2:
        startingArmies = 100;
        break;
      case 3:
        startingArmies = 105;
        break;
      case 4:
        startingArmies = 120;
        break;
      case 5:
        startingArmies = 125;
        break;
      case 6:
        startingArmies = 120;
        break;
    }
    values.startingArmies = startingArmies;
    //console.log(values);
    //console.log(players);
    cb();
  },

  afterCreate: function (values, cb) {
    /*
    console.log(values);
    Games.publishUpdate(values.id, {
      numPlayers: values.numPlayers,
      startDate: values.startDate,
      password: values.password,
      inProgress: values.inProgress
    });
    */
    cb();
  }
};

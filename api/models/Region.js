/**
* Region.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
module.exports = {
	attributes:{
		armyCount:{
			type:'integer',
			defaultsTo:0
		},
		controlledBy:{
			type:'integer',
			defaultsTo:0,
			required: true
		},
		game: {
			model: 'games'
		},
		region: {
			model: 'regions'
		}
	}
};

/**
* Regions.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	regionID: {
  		type: 'integer',
  		required: true,
  		unique: true
  	},
  	name: {
  		type: 'string',
  		required: true,
  		unique: true
  	},
  	continent: {
  		type: 'string',
  		required: true
  	},
    region: {
        collection: 'region',
        via: 'region'
    }
  }
};

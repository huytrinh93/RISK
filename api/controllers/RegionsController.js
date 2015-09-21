/**
 * RegionsController
 *
 * @description :: Server-side logic for managing Regions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

	fillWithRegions: function (req, res) {
		Regions.create({
			regionID: 1,
			name: 'Alaska',
			continent: 'North America'
		}).exec(function(err, region) {
			//console.log(region);
		});
		Regions.create({
			regionID: 2,
			name: 'Alberta',
			continent: 'North America'
		}).exec(function(err, region) {
			//console.log(region);
		});
		Regions.create({
			regionID: 3,
			name: 'Central America',
			continent: 'North America'
		}).exec(function(err, region) {
			//console.log(region);
		});
		Regions.create({
			regionID: 4,
			name: 'Eastern United States',
			continent: 'North America'
		}).exec(function(err, region) {
			//console.log(region);
		});
		Regions.create({
			regionID: 5,
			name: 'Greenland',
			continent: 'North America'
		}).exec(function(err, region) {
			//console.log(region);
		});
		Regions.create({
			regionID: 6,
			name: 'North West Territory',
			continent: 'North America'
		}).exec(function(err, region) {
			//console.log(region);
		});
		Regions.create({
			regionID: 7,
			name: 'Ontario',
			continent: 'North America'
		}).exec(function(err, region) {
			//console.log(region);
		});
		Regions.create({
			regionID: 8,
			name: 'Quebec',
			continent: 'North America'
		}).exec(function(err, region) {
			//console.log(region);
		});
		Regions.create({
			regionID: 9,
			name: 'Western United States',
			continent: 'North America'
		}).exec(function(err, region) {
			//console.log(region);
		});
		Regions.create({
			regionID: 10,
			name: 'Argentina',
			continent: 'South America'
		}).exec(function(err, region) {
			//console.log(region);
		});
		Regions.create({
			regionID: 11,
			name: 'Brazil',
			continent: 'South America'
		}).exec(function(err, region) {
			//console.log(region);
		});

		Regions.create({
			regionID: 12,
			name: 'Peru',
			continent: 'South America'
		}).exec(function(err, region) {
			//console.log(region);
		});

		Regions.create({
			regionID: 13,
			name: 'Venezuela',
			continent: 'South America'
		}).exec(function(err, region) {
			//console.log(region);
		});

		Regions.create({
			regionID: 14,
			name: 'Great Britain',
			continent: 'Europe'
		}).exec(function(err, region) {
			//console.log(region);
		});
		Regions.create({
			regionID: 15,
			name: 'Iceland',
			continent: 'Europe'
		}).exec(function(err, region) {
			//console.log(region);
		});
		Regions.create({
			regionID: 16,
			name: 'Northern Europe',
			continent: 'Europe'
		}).exec(function(err, region) {
			//console.log(region);
		});
		Regions.create({
			regionID: 17,
			name: 'Scandinavia',
			continent: 'Europe'
		}).exec(function(err, region) {
			//console.log(region);
		});
		Regions.create({
			regionID: 18,
			name: 'Southern Europe',
			continent: 'Europe'
		}).exec(function(err, region) {
			//console.log(region);
		});
		Regions.create({
			regionID: 19,
			name: 'Ukraine',
			continent: 'Europe'
		}).exec(function(err, region) {
			//console.log(region);
		});
		Regions.create({
			regionID: 20,
			name: 'Western Europe',
			continent: 'Europe'
		}).exec(function(err, region) {
			//console.log(region);
		});
		Regions.create({
			regionID: 21,
			name: 'Congo',
			continent: 'Africa'
		}).exec(function(err, region) {
			//console.log(region);
		});
		Regions.create({
			regionID: 22,
			name: 'East Africa',
			continent: 'Africa'
		}).exec(function(err, region) {
			//console.log(region);
		});

		Regions.create({
			regionID: 23,
			name: 'Egypt',
			continent: 'Africa'
		}).exec(function(err, region) {
			//console.log(region);
		});

		Regions.create({
			regionID: 24,
			name: 'Madagascar',
			continent: 'Africa'
		}).exec(function(err, region) {
			//console.log(region);
		});

		Regions.create({
			regionID: 25,
			name: 'North Africa',
			continent: 'Africa'
		}).exec(function(err, region) {
			//console.log(region);
		});

		Regions.create({
			regionID: 26,
			name: 'South Africa',
			continent: 'Africa'
		}).exec(function(err, region) {
			//console.log(region);
		});

		Regions.create({
			regionID: 27,
			name: 'Afghanistan',
			continent: 'Asia'
		}).exec(function(err, region) {
			//console.log(region);
		});
	Regions.create({
			regionID: 28,
			name: 'China',
			continent: 'Asia'
		}).exec(function(err, region) {
			//console.log(region);
		});

	Regions.create({
			regionID: 29,
			name: 'India',
			continent: 'Asia'
		}).exec(function(err, region) {
			//console.log(region);
		});

	Regions.create({
			regionID: 30,
			name: 'Irkutsk',
			continent: 'Asia'
		}).exec(function(err, region) {
			//console.log(region);
		});

	Regions.create({
			regionID: 31,
			name: 'Japan',
			continent: 'Asia'
		}).exec(function(err, region) {
			//console.log(region);
		});

	Regions.create({
			regionID: 32,
			name: 'Kamchatka',
			continent: 'Asia'
		}).exec(function(err, region) {
			//console.log(region);
		});

	Regions.create({
			regionID: 33,
			name: 'Middle East',
			continent: 'Asia'
		}).exec(function(err, region) {
			//console.log(region);
		});

	Regions.create({
			regionID: 34,
			name: 'Mongolia',
			continent: 'Asia'
		}).exec(function(err, region) {
			//console.log(region);
		});

	Regions.create({
			regionID: 35,
			name: 'Siam',
			continent: 'Asia'
		}).exec(function(err, region) {
			//console.log(region);
		});

	Regions.create({
			regionID: 36,
			name: 'Siberia',
			continent: 'Asia'
		}).exec(function(err, region) {
			//console.log(region);
		});

	Regions.create({
			regionID: 37,
			name: 'Ural',
			continent: 'Asia'
		}).exec(function(err, region) {
			//console.log(region);
		});

	Regions.create({
			regionID: 38,
			name: 'Yakutsk',
			continent: 'Asia'
		}).exec(function(err, region) {
			//console.log(region);
		});
	Regions.create({
			regionID: 39,
			name: 'Eastern Australia',
			continent: 'Asia'
		}).exec(function(err, region) {
			//console.log(region);
		});
	Regions.create({
			regionID: 40,
			name: 'Indonesia',
			continent: 'Australia'
		}).exec(function(err, region) {
			//console.log(region);
		});
	Regions.create({
			regionID: 41,
			name: 'New Guinea',
			continent: 'Australia'
		}).exec(function(err, region) {
			//console.log(region);
		});
	Regions.create({
			regionID: 42,
			name: 'Western Australia',
			continent: 'Australia'
		}).exec(function(err, region) {
			//console.log(region);
		});
	}

};

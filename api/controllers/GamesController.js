/**
 * GamesController
 *
 * @description :: Server-side logic for managing Games
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	gameState: function (req, res) {
		//Will Report Game, Players, Regions
		//Requires GET with gameID
		var gameID = req.query.gameID;


		Games.findOne({	 id: gameID}).populate('regions').populate('players').then(function(game){

			/*
			http://stackoverflow.com/questions/23446484/sails-js-populate-nested-associations
			var regions = Region.find({id: _.pluck(game.regions, 'region')
			}).then(function(regions) {
				return regions;
			});
			return [game, players, regions];
			*/

			return [game];
		}).spread(function (game) {
			/*
			var regions = _.indexBy(regions, 'id');
			game.regions = _.map(game.region, function(region) {
				region.region = regions[region.region];
			});*/
			return res.json(game)
		}).catch(function (err){
			console.log(err);
			return res.json({
				gameState: 'WIP'
			});
		});
	},

	initMap : function (req, res) {

		console.log(req.body);

	},

	addTroops : function (req , res){

		//get game and playerID
		var gameID = req.body.gameID;
		var playerID = req.body.playerID;
		var army = parseInt(req.body.army);
		var regionID = req.body.regionID;

		//find game
		Games.findOne(gameID).populate('players').exec (function (err,game){
			if(err){
				//console.log(err);
				res.send('Game Not Found With Given ID');
			}
			//if(playerID == game.currentUserTurn){
				Region.findOne({game : gameID, region : regionID}).exec(function(err, region) {
					if (err) {
						res.send('Region Not Found');
						//console.log('Not found region');
					}

					if (typeof region === 'undefined') {
						//Region Doesn't Exist
						//Give Region To Player
						Region.create({game: gameID, region : regionID, armyCount : army, controlledBy : playerID}).exec(function(err,newRegion){
							if(err){
								//console.log(err);
								res.send('Could Not Create Region');
							}
							Games.publishUpdate(gameID, {id: gameID, update: 'region', status: 'create', region: newRegion, armyCount: army});
							//res.send(newRegion);
							res.send('New Region Created');
						});
					}
					else {
						//Region Exists, Check If Belong To Player
						//If So Add Troops To Region
						if (region.controlledBy == playerID) {
							region.armyCount = region.armyCount + army;
							region.save(function(err) {
								if (err) {
									res.send('Region Could Not Be Added');
								}
								Games.publishUpdate(gameID, {id: gameID, update: 'region', status: 'add', region: region, armyCount: army});
								//res.send(region);
								res.send('Army Added To Region');
							});
						}
						else {
							return res.send('Region Not Controlled By Player');
						}
					}
				});
			//}
		});
	},

	attack : function (req, res){
		var gameID = req.body.gameID;
		var playerID = req.body.playerID;
		var regionIDFrom = req.body.regionIDFrom;
		var regionIDTo = req.body.regionIDTo;
		var changeControl = false;
		var originalRegionOwner = 0;
		Games.findOne(gameID).populate('players').exec(function(err,game){
			if(err){
				res.send('Game Not Found With Given ID');
			}
			if(playerID == game.currentUserTurn){
				Region.findOne({game : gameID, region: regionIDFrom, controlledBy: playerID}).exec(function(err, region1) {
					if (err) {
						res.send('Region Not Found');
					}

					Region.findOne({game : gameID, region: regionIDTo, controlledBy: {'!': playerID}}).exec(function(err, region2) {
						if (err) {
							res.send('Region Not Found');
						}

					var random_num_dice1 = Math.floor(Math.random() * 6)+1;
					var random_num_dice2 = Math.floor(Math.random() * 6)+1;

					//check adj list territory
					AdjRegions.findOne({region: regionIDFrom, adjRegion: regionIDTo}).exec(function(err, adjRegion) {
						if(err){
							res.send('You Did Not Choose Adj Region');
						}
						if (typeof adjRegion === 'undefined') {
							res.send('Regions Are Not Adjacent')
						}
						else {
							if (region1.armyCount >= region2.armyCount && region2.controlledBy != playerID){
								if (region1.armyCount > 1){
									if(random_num_dice1>random_num_dice2){
										region2.armyCount=region2.armyCount - 1;
										if(region2.armyCount<=0){
											//This Is Where Player Loses!
											originalRegionOwner = region2.controlledBy
											changeControl = true;
											region2.controlledBy = playerID;
											region2.armyCount = 1;
											region1.armyCount = region1.armyCount - 1;
										}
									}
									else {
										region1.armyCount=region1.armyCount - 1;
									}
								}
							}
							else{
								res.send('You Cannot Fight');
							}

							//save 2 regions
							region1.save(function(err) {
								if (err) {
									res.send(err);
								}
								Games.publishUpdate(gameID, {id: gameID, update: 'region', status: 'attackUpdate', region : regionIDFrom, armyCount: region1.armyCount, controlledBy : region1.controlledBy});
								region2.save(function(err) {
									if (err) {
										res.send(err);
									}
									//error happend at save, on last attack only (can't save undefined when referring to region2)
									Games.publishUpdate(gameID, {id: gameID, update: 'region', status: 'attackUpdate', region: regionIDTo, armyCount: region2.armyCount, controlledBy : region2.controlledBy});
									if (changeControl == true) {
										game.moves = game.moves + 1;
										game.save(function(err) {
											if (err) {
												console.log(err);
											}
											Games.publishUpdate(gameID, {id: gameID, update:'changeControl', status:'changed', region: regionIDTo, armyCount: region2.armyCount, controlledBy: region2.controlledBy, moves: game.moves});
											sails.controllers.games.playerMightHaveLost(gameID, originalRegionOwner);
											res.send('Attack Successful');
										});
									}
									else {
										res.send('Attack Successful');
									}
								});
							});
							//close 2 save functions
						}
					});
				});
			});
		}
		});
	},

	move : function (req, res) {
		var gameID = req.body.gameID;
		var playerID = req.body.playerID;
		var armyMove = parseInt(req.body.armyMove);
		var regionIDFrom = req.body.regionIDFrom;
		var regionIDTo = req.body.regionIDTo;
		var regionFrom;
		var regionTo;
		Games.findOne(gameID).populate('players').exec(function(err,game){
			if(err){
				res.send('Game Not Found With Given ID');
			}
			if(playerID == game.currentUserTurn){
				Region.find({game : gameID, region: [regionIDFrom, regionIDTo], controlledBy: playerID}).exec(function(err, regions) {
					if (err) {
						res.send('Region Not Found');
					}
					//check adj list territory
					AdjRegions.findOne({region: regionIDFrom, adjRegion: regionIDTo}).exec(function(err, adjRegion) {
						if(err){
							res.send('You Did Not Choose Adj Region');
						}
						if (typeof adjRegion === 'undefined') {
							res.send('Regions Are Not Adjacent')
						}
						else {
						if(regions.length==2){
							//Do logic here
							if (regions[0].region == regionIDFrom) {
								regionFrom = 0;
								regionTo = 1;
							}
							else {
								regionFrom = 1;
								regionTo = 0;
							}
							if(regions[regionFrom].armyCount > 1 ){
								if (regions[regionFrom].armyCount - 1 < armyMove) {
									armyMove = regions[regionFrom].armyCount - 1;
								}
								regions[regionFrom].armyCount = regions[regionFrom].armyCount - armyMove;
								regions[regionTo].armyCount = regions[regionTo].armyCount + armyMove;

								regions[regionFrom].save(function(err) {
										if (err) {
											res.send(err);
										}
										Games.publishUpdate(gameID, {id: gameID, update: 'region', status: 'moveUpdate',  region: regionIDFrom, armyCount: regions[regionFrom].armyCount, controlledBy : regions[regionFrom].controlledBy});

										regions[regionTo].save(function(err) {
											if (err) {
												res.send(err);
											}
											Games.publishUpdate(gameID, {id: gameID, update: 'region', status: 'moveUpdate', region: regionIDTo, armyCount: regions[regionTo].armyCount, controlledBy : regions[regionTo].controlledBy});
											game.moves = game.moves - 1;
											game.save(function(err) {
												if (err) {
													console.log(err);
												}
												Games.publishUpdate(gameID, {id: gameID, update: 'moved', moves: game.moves});
												res.send(regions);
											});
										});
								});
							}
							else {
								res.send('Player Not Have Enough Troop To Move');
							}
						}
						else{
							res.send('Region Not Belong Player');
						}
					}
				});
				});
			}
		});
	},

	startGame: function (req, res) {
		//Starts Game
		//Requires gameID

		var gameID = req.body.gameID;
		//console.log('Starting Game #'+gameID);

		Games.findOne(gameID).exec(function(err, game) {
			if (err) {
				console.log(err);
				return res.send('Game Not Found');
			}

			game.inProgress = true;
			game.save(function(err) {
				//console.log(err);
				Games.publishUpdate(game.id, {
					id: game.id,
					update: 'inProgress',
					status: 'true'
				});

				return res.send('Game Started');
			})
		})
	},


	gamesList: function (req, res) {
					Games.find().exec(function (err, games) {
					Games.subscribe(req.socket, games);
					return res.json({
						games: games
					});
				});
				Games.publishUpdate(games);
	},

	endGame: function (req, res) {

		var gameID = req.body.gameID;
		Games.destroy(gameID).exec(function(err, games){
			Games.publishDestroy(gameID);
			res.send('Game '+gameID+' Destroyed');
		});
	},

	addPlayer: function (req, res) {
		//Will Add Player To Game
		//Requires POST with gameID / playerID

		var gameID = req.body.gameID;
		var playerID = req.body.playerID;

		Games.findOne(gameID).exec(function(err, game) {

			if (err) {
				//console.log('first stop');
			}
			game.players.add(playerID);

			game.save(function(err) {
				//console.log('second stop');
				//console.log(err);

				Games.findOne(gameID).populate('players').exec(function(err, game){

					Games.publishUpdate(game.id, {
						id: game.id,
						update: 'player',
						status: 'add'

					});

					return res.json(game);
				});
				//Error goes Here
			});
		});
	},

	removePlayer: function (req, res) {
		//Will Remove Player From Game
		//Requires POST with gameID / playerID
		var gameID = req.body.gameID;
		var playerID = req.body.playerID;

		Games.findOne(gameID).exec(function(err, game) {

			if (err) {

			}

			game.players.remove(playerID);

			game.save(function(err) {
				//console.log('second stop');
				//console.log(err);

				Games.findOne(gameID).populate('players').exec(function(err, game){

					Games.publishUpdate(game.id, {
						id: game.id,
						update: 'player',
						status: 'remove'
					});

					return res.json(game);
				});
			});
		});
	},

	joinGame: function (req, res) {
		//Requires GameID, PlayerID, Password
		var gameID = parseInt(req.body.gameID);
		var playerID = parseInt(req.body.playerID);
		var password = req.body.password;
		var curPlayers = 0;
		//var roomName = 'game'+gameID+'info';

		/*
		console.log('gameID: '+gameID);
		console.log('playerID: '+playerID);
		console.log('password: '+password);
		console.log(typeof playerID);
		*/

		//Error Out For Invalid Player ID / Game ID
		if (typeof playerID === 'object' || typeof gameID === 'object') {
			return res.send('Invalid Player Or GameID');
		}

		Games.findOne(gameID).populate('players').exec(function(err, game) {

			if (err) {
				//console.log(err);
			}

			/*
			console.log(game);
			console.log(password);
			console.log(game.password);
			*/

			//Make Sure Password Is Correct
			if (game.password == password || game.password == null) {
				//Make Sure Lobby Isn't Full
				if (game.players.length < game.numPlayers) {

					//Should only add if it does not already exist
					//Incomplete
					game.players.add(playerID);

					if (playerID < game.currentUserTurn) {
						game.currentUserTurn = playerID;
					}

					game.save(function(err) {
						curPlayers = game.players.length + 1;
						//curPlayers = curPlayers.toString();
						//This Line Causes Error That Does No Harm On Join, But Doesn't When Game Is Created Through Postman, Really Frustrating, Appears Fixed For Now, Not It Was Pretending
						Games.publishUpdate(game.id, {id: game.id, currentPlayers: curPlayers, status: 'add', update: 'player', numPlayers: game.numPlayers, playerID: playerID});

						//.subscribe maybe not necesscary?
						//Games.subscribe(req.socket, game.id);
						//console.log('done');
						return res.send({join: true});
					});

				}
				else {
					return res.send('Game Is Full');
				}
			}
			else {
				return res.send('Password Incorrect');
			}

		});
	},

	enterLobby: function (req, res) {
		var gameID = parseInt(req.query.gameID);
		var playerID = parseInt(req.session.user);
		var isFull = 'false';
		var match = 'false';
		//var roomName = req.param('game'+gameID+'info');

		if (typeof playerID === 'undefined') {
			return res.view('static/error', {error: 'PlayerID Is Not Logged In'});
		}

		//Find Game
		Games.findOne(gameID).populate('players').exec(function(err, game) {
			//Error Check
			if (err) {
				return res.view('static/error', {error: err});
			}

			if (typeof game === 'undefined') {
				return res.view('static/error', {error: 'Game Doesnt Exist'});
			}

			//console.log('numPlayers: '+game.numPlayers);
			//console.log('players in game: '+game.players.length);

			//Check If Game Is Full
			else {
				if (game.numPlayers == game.players.length) {
					isFull = 'true';
				}

				game.players.forEach(function (player, index, array) {
					//console.log('Player ID: '+player.id+' - Player ID: '+playerID);
					//console.log(typeof player.id+' - '+typeof playerID);
					//Ensure Player Is In Game
					if (player.id == playerID) {
						//console.log('Match');
						match = 'true';
					}
				});

				if (match == 'true') {

					if (game.inProgress == true) {
						return res.view('map', {gameID: gameID});
					}

					return res.view('static/gamelobby', {isFull: isFull, gameID: gameID});
				}
				else {
					return res.view('static/error', {error: 'Player Not In Game'});
				}
			}
		});
	},

	changeTurn: function (req, res) {

		var gameID = req.body.gameID;
		var playerID = req.body.playerID;
		var playerIDs = [];
		var currentIndex;
		var newRound = false;

		Games.findOne(gameID).populate('players').populate('regions').exec(function(err, game){

			if (err) {
				console.log(err);
				res.send('Game Not Found With Given ID');
			}

			if(playerID == game.currentUserTurn) {
				game.players.forEach(function (player, index, array) {
					playerIDs.push(player.id);
				});

				currentIndex = playerIDs.indexOf(parseInt(playerID));

				/*
				console.log(currentIndex);
				console.log(playerIDs[currentIndex + 0]);
				console.log(playerIDs[currentIndex + 1]);
				console.log(playerIDs[currentIndex + 2]);
				*/

				if (typeof playerIDs[currentIndex + 1] === 'undefined') {
					//console.log('Change Round, Reset To First Player');
					game.currentUserTurn = playerIDs[0];
					newRound = true;

					if (currentIndex == 0) {
						console.log('Declare Winner');
					}
				}
				else {
					game.currentUserTurn = playerIDs[currentIndex+1];
				}

				game.phase = 1;
				game.moves = 1;

				if(game.startingArmies == 1){
					game.startingArmies = 0;
				}

				if (game.round == 0 && game.startingArmies > 1){
					game.phase = 0;
					game.moves = 0;
					newRound = false;
					game.startingArmies = game.startingArmies - 1;
				}

				else {
					//Calculate Armies For Next Turn
					//console.log(game.regions);
					var counter = 0;
					for (i = 0; i < game.regions.length; i++) {
						if (game.regions[i].controlledBy == game.currentUserTurn) {
							counter = counter + 1;
						}
					}
					game.armiesRemaining = parseInt(counter / 3);

					if (game.armiesRemaining < 3) {
						game.armiesRemaining = 3;
					}
				}

				if(newRound == true){
					game.round = game.round + 1;
				}

				//console.log(playerIDs);

				//Change Turn

				game.save(function(err){
					//emit new players turn
					Games.publishUpdate(game.id, {
						id: game.id,
						playerID: game.currentUserTurn,
						update: 'changeTurn',
						armiesRemaining: game.armiesRemaining,
						startingArmies: game.startingArmies,
						phase: game.phase,
						round: game.round,
						moves: game.moves
					});

					if (err) {
						console.log(err);
						res.send('Database Was Not Able To Save Change');
					}

					if (newRound == true) {
						//Emit New Round Message
						Games.publishUpdate(game.id, {
							id: game.id,
							round: game.round,
							update: 'changeRound',
							phase: game.phase,
							moves: game.moves
						});
					}
					res.send(game);
				});
			}

			else {
				res.send('It Is Not Players Turn');
			}
		});
	},

	createGame: function (req, res) {

		var gameName = req.body.gameName;
		var password = req.body.password;
		var numPlayers = req.body.numPlayers;
		var playerID = req.session.user;

		if (typeof playerID === 'undefined') {
			res.send('User Is Not Logged In!');
		}

		if (password == '') {
			password = null;
		}

		//console.log(gameName+' '+password+' '+numPlayers+' '+playerID);

		Games.create({
			name: gameName,
			password: password,
			numPlayers: numPlayers,
			players: playerID,
			currentUserTurn: playerID
		}).exec(function(err, game) {
			if (err) {
				res.send('Database Error: Couldnt Create Game');
			}
			if (typeof game === 'undefined') {
				res.send({create: false});
			}
			else {
				Games.publishCreate({id: game.id, name: game.name, password: game.password, numPlayers: game.numPlayers, currentPlayers: 1});
				res.send({create: true, id: game.id});
			}
		});
	},

	sendChatMessage: function (req, res) {
		var gameID = req.body.gameID;
		var playerID = req.session.user;
		var playerName = req.session.name;
		var message = req.body.message;
		var chatMessage = playerName+' - '+message;

		Games.findOne(gameID).exec(function(err, game){
			if (err) {
				res.send('Game Not Found');
			}

			Games.message(gameID, {message: chatMessage, update: 'chat', status: 'message'});
			res.send('Message Sent');
		});
	},

	reinforceToAttackPhase: function (req, res) {
		var gameID = req.body.gameID;

		Games.findOne(gameID).exec(function(err, game){
			if (err) {
				res.send('Game Not Found');
			}

			game.phase = 2;
			game.armiesRemaining = 0;

			game.save(function(err){
				if (err) {
					res.send("Game Phase Couldn't Be Saved");
				}

				Games.publishUpdate(game.id, {
					id: game.id,
					phase: game.phase,
					update: 'phaseChange',
					status: 'update',
					moves: game.moves
				});

				res.send({phase: game.phase});
			});
		});
	},

	attackToMovePhase: function (req, res) {
		var gameID = req.body.gameID;

		Games.findOne(gameID).exec(function(err, game){
			if (err) {
				res.send('Game Not Found');
			}

			game.phase = 3;

			game.save(function(err){
					if (err) {
						res.send("Game Phase Couldn't Be Saved");
					}

					Games.publishUpdate(game.id, {
						id: game.id,
						phase: game.phase,
						update: 'phaseChange',
						status: 'update',
						moves: game.moves
					});

					res.send({phase: game.phase});
			});
		});
	},

	playerMightHaveLost: function (gameID, playerID) {
		gameID = parseInt(gameID);
		playerID = parseInt(playerID);
		var counter = 0;
		var PIG = false;

		Games.findOne(gameID).populate('regions').populate('players').exec(function(err, game){
			if (typeof game === 'undefined') {
				console.log('Game Doesnt Exist');
			}
			else {
				for (i = 0; i < game.players.length; i++) {
					if (game.players[i].id == playerID) {
						PIG = true;
						for (j = 0; j < game.regions.length; j++) {
							if (game.regions[j].controlledBy == playerID) {
								counter = counter + 1;
							}
						}
					}
				}
				if (PIG == true && counter == 0){
					//Player Lost
					game.players.remove(playerID);
					game.save(function(err) {
						if (err) {
							console.log(err);
						}
						console.log(game.players.length - 1);
						Games.publishUpdate(game.id, {
							id: game.id,
							player: playerID,
							update: 'removePlayer',
							playersLeft: game.players.length - 1
						});
					});
				}
			}
		});
	}
};

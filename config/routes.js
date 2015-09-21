/*
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': {
    view: 'static/index'
  },
  '/register': {
    view: 'user/new'
  },
  'post /login': 'UserController.login',
  '/logout': 'UserController.logout',
  '/gameState': 'GamesController.gameState',
  'post /addUserToGame': 'GamesController.addPlayer',
  'post /removeUserFromGame': 'GamesController.removePlayer',
  'post /attack': 'GamesController.attack',
  'post /move': 'GamesController.move',
  'post /game/changeTurn': 'GamesController.changeTurn',
  'post /game/addTroops': 'GamesController.addTroops',
  'post /game/move': 'GamesController.move',
  'post /game/attack': 'GamesController.attack',
  'post /game/reinforceToAttackPhase': 'GamesController.reinforceToAttackPhase',
  'post /game/attackToMovePhase': 'GamesController.attackToMovePhase',
  'post /game/end': 'GamesController.endGame',
  '/chat': {
	  view: 'real_time'
	},
  '/fakeGameList': {
    view: 'static/fakeGameList'
  },
  '/getGamesList' : 'GamesController.gamesList',
  '/mainroom' : 'sPractice/mainroom',
  '/gameboard': {
	  view: 'map'
  },
  '/gamelist': {
    view: 'gamelist'
  },
  '/game/lobby': {
    view: 'static/gamelobby'
  },
  '/game/join': 'GamesController.joinGame',
  '/game': 'GamesController.enterLobby',

  'get /game/create':{
    view: 'static/gameCreate'
  },

  '/gamescontrollerAddtroops' : '/GamesController.addTroops',

  'post /game/create': 'GamesController.createGame',

  'post /game/start': 'GamesController.startGame',

  'post /game/chat': 'GamesController.sendChatMessage',

  'get /game/winner' : {
    view: 'static/winner'
  },

  'get /game/loser' : {
    view: 'static/loser'
  },


  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  *  If a request to a URL doesn't match any of the custom routes above, it  *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/

};

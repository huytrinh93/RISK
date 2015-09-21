io.socket.on('connect', function socketConnected() {
  gameID = parseInt($('#gameID').text());
  userID = parseInt($('#userID').text());

  io.socket.get("/games/"+gameID, function(resData, jwres) {
    console.log(resData);
    loadPlayers(resData);

    io.socket.get("/regions", function(regionsData, jwres) {
      loadRegions(resData, regionsData);
      io.socket.get("/adjRegions", function(adjRegionsData, jwres) {
        console.log(adjRegionsData);
        loadAdjRegions(adjRegionsData);
        loadInitialState(resData);
      });
    });
  });

  io.socket.on('games', function gameDataReceived(message) {
    console.log(message);
    if (message.verb == "destroyed") {
      window.location.href = 'http://'+window.location.host+'/game/winner';
    }
    else {
      if (message.data.update == "region") {
        regionUpdate(message.data);
        loadRegionInfo('');
        //Update Army Count
        //Should Call loadRegionInfo Here
      }
      else if (message.data.update == "changeTurn") {
        changeTurn(message.data);
      }
      else if (message.data.update == "changeRound") {
        round = message.data.round;
        phase = message.data.phase;
        moves = message.data.moves;
        changeText('currentPhase', phase);
        changeText('currentRound', round);
        changeText('currentMoves', moves);
      }
      else if (message.data.update == "phaseChange") {
        phase = message.data.phase;
        remainingArmies = 0;
        moves = message.data.moves;
        changeText('currentMoves', moves);
        changeText('currentPhase', phase);
        changeText('remainingArmies', '0');
      }
      else if (message.data.update == "changeControl") {
        //Notify User Continent Changed Control
        moves = message.data.moves;
        changeText('currentMoves', moves);
      }
      else if (message.data.update == "moved") {
        moves = message.data.moves;
        changeText('currentMoves', moves);
      }
      else if (message.data.update == "removePlayer") {
        if (userID == message.data.player) {
          window.location.href = 'http://'+window.location.host+'/game/loser';
        }
        else {
          $('#player'+message.data.player+'panel').remove();
          if (message.data.playersLeft == 1) {
            io.socket.post("/game/end", {gameID: gameID}, function (data, jwres) {
              if (data == 'Game '+gameID+' Destroyed') {
                window.location.href = 'http://'+window.location.host+'/game/winner';
              }
            });
          }
        }
      }
    }
  });


});

$(document).ready(function() {
  //Click Handlers
  //Place Army
  $('#placeArmyBtn').click(function() {
    var regionID = parseInt($('#regionID').text());
    var postData = {
      gameID : gameID,
      playerID : userID,
      army : 1,
      regionID : regionID
    }
    io.socket.post("/game/addTroops", postData, function (data, jwres) {
      console.log(data);
      //If It Is Initial Phase
      if (phase == 0) {
        disableButtons();
        //End Turn
        var postData = {
          gameID : gameID,
          playerID : userID
        }
        io.socket.post("/game/changeTurn", postData, function (data, jwres) {
          console.log(data);
          var existRegion = _.findWhere(regions, {id: regionID});
          //Probably Better To Reload Info For Everyone
          //loadRegionInfo(existRegion.name);
        });
      }
      else {
        if (remainingArmies < 1) {
          disableButtons();
        }
        var existRegion = _.findWhere(regions, {id: regionID});
        //Probably Better To Reload Info For Everyone
        //loadRegionInfo(existRegion.name);
      }
    });
  });
  //Attack Button
  $('#attackArmyBtn').click(function() {
    var regionID = parseInt($('#regionID').text());
    var currAdjRegions = _.where(adjRegions, {region: regionID});
    //console.log(adjRegions);
    //console.log(currAdjRegions);
    var attackableRegions = [];
    for (i = 0; i < currAdjRegions.length; i++) {
      var currRegion = _.findWhere(regions, {id: currAdjRegions[i].adjRegion});
      if (currRegion.controlledBy != userID) {
        //Can Attack
        attackableRegions.push(currRegion);
      }
      currRegion = {};
    }
    //console.log(attackableRegions);
    attack(attackableRegions);
  });
  //Actual Attack Button
  $(document).delegate(".actualAttackBtn", "click", function(event){
    event.stopPropagation();
    //console.log(event);
    var regionID = parseInt($('#regionID').text());
    var regionFrom = parseInt($('#regionID').text());
    var regionTo = this.getAttribute("value");

    //console.log('attacking!!!');

    postData = {
      gameID : gameID,
      playerID : userID,
      regionIDFrom : regionFrom,
      regionIDTo : regionTo
    }

    io.socket.post("/game/attack", postData, function (data, jwres) {
      console.log(data);
      $('#attackModal').modal('toggle');
      var existRegion = _.findWhere(regions, {id: regionID});
      //loadRegionInfo(existRegion.name);
    });
  });
  //Move Army Button
  $('#moveArmyBtn').click(function() {
    var regionID = parseInt($('#regionID').text());
    var regionForMoveable = _.findWhere(regions, {id: regionID});
    var currAdjRegions = _.where(adjRegions, {region: regionID});
    var amountMoveable = regionForMoveable.armyCount - 1;
    //console.log(adjRegions);
    //console.log(currAdjRegions);
    var moveableRegions = [];
    for (i = 0; i < currAdjRegions.length; i++) {
      var currRegion = _.findWhere(regions, {id: currAdjRegions[i].adjRegion});
      if (currRegion.controlledBy == userID) {
        //Can Attack
        moveableRegions.push(currRegion);
      }
      currRegion = {};
    }
    //console.log(attackableRegions);
    move(moveableRegions, amountMoveable);
  });
  $(document).delegate(".moveAmountBtn", "click", function(event){
    $('#movesModal').modal('toggle');
    $('#moveAmountModal').modal();
    $('#moveAmountModalBody').html('');
    var id = this.getAttribute("value");
    var amountMoveable = this.getAttribute("amountMoveable");
    var select = "<select id='valOfAmountMoveable'>";
    for (i = 1; i <= amountMoveable; i++) {
      select = select+"<option value='"+i+"'>"+i+"</option>";
    }
    select = select+"</select>";
    $('<div class="moveBlock">'+select+' - <button class="actualMoveBtn" value="'+id+'" amountMoveable="'+amountMoveable+'">Move!</button></div>').appendTo('#moveAmountModalBody');
  });
  //Actual move Button
  $(document).delegate(".actualMoveBtn", "click", function(event){
    event.stopPropagation();
    //console.log(event);
    var regionID = parseInt($('#regionID').text());
    var regionFrom = parseInt($('#regionID').text());
    var regionTo = this.getAttribute("value");
    var armyMove = parseInt($('#valOfAmountMoveable').val());

    //console.log('attacking!!!');

    postData = {
      gameID : gameID,
      playerID : userID,
      regionIDFrom : regionFrom,
      regionIDTo : regionTo,
      armyMove : armyMove
    }

    io.socket.post("/game/move", postData, function (data, jwres) {
      console.log(data);
      $('#moveAmountModal').modal('toggle');
      var existRegion = _.findWhere(regions, {id: regionID});
      if (moves < 1) {
        disableButtons();
      }
      $('#moveModal').modal('toggle');
      //loadRegionInfo(existRegion.name);
    });
  });
  //End Phase Button
  $('#endPhaseBtn').click(function() {
    if (phase == 1) {
      io.socket.post("/game/reinforceToAttackPhase", {gameID: gameID}, function (data, jwres) {
        console.log(data);
        if (data.phase == 2) {
          //Phase 2 Logic
          disableButtons();
        }
      });
    }
    if (phase == 2) {
      io.socket.post("/game/attackToMovePhase", {gameID: gameID}, function (data, jwres) {
        console.log(data);
        if (data.phase == 3) {
          disableButtons();
          $('#endPhaseBtn').addClass("disabled").prop("disabled", true);
          $('#endTurnBtn').removeClass("disabled").prop("disabled", false);
        }
      });
    }
  });
  //End Turn Button
  $('#endTurnBtn').click(function() {
    var postData = {
      gameID : gameID,
      playerID : userID
    }
    io.socket.post("/game/changeTurn", postData, function (data, jwres) {
      console.log(data);
      $('#endTurnBtn').addClass("disabled").prop("disabled", true);
    });
  });
});

function recolorTerritory(territory, color) {
  Risk.Territories[territory].path.setFill(color);
  Risk.Territories[territory].path.setOpacity(0.4);
  Risk.mapLayer.draw();
}

function loadPlayers(resData) {
  colors = ['#36FF7C', '#FF36B9', '#52A3FF', '#FFAE52', '#E8FF52', '#FF0000'];
  players = [];
  var currPlayer = {};
  for (i = 0; i < resData.players.length; i++) {
    currPlayer.id = resData.players[i].id;
    currPlayer.name = resData.players[i].name;
    currPlayer.color = colors[i];
    players[i] = currPlayer;
    addPlayerToUI(i+1, currPlayer.name, currPlayer.id);
    currPlayer = {};
  }

  //console.log(players);
}

function loadRegions(resData, regionsData) {
  //console.log(resData);
  //console.log(regionsData);
  regions = [];
  var currRegion = {};

  for (i = 0; i < regionsData.length; i++) {
    //console.log(regionsData[i]);
    currRegion.id = regionsData[i].regionID;
    currRegion.name = regionsData[i].name.replace(/\s+/g, '');
    currRegion.nameOrig = regionsData[i].name;
    currRegion.controlledBy = null;
    currRegion.controlledByName = null;
    currRegion.armyCount = null;
    regions[i] = currRegion;
    currRegion = {};
  }

  //Next Add resData Region Info To regions
  //console.log(regions);
  //Then Draw Map With New Colors
}

function loadAdjRegions(data) {
  adjRegions = [];
  var currAdjRegion = {};

  for (i = 0; i < data.length; i++) {
    currAdjRegion.region = data[i].region;
    currAdjRegion.adjRegion = data[i].adjRegion;
    adjRegions[i] = currAdjRegion;
    currAdjRegion = {};
  }
}

function loadRegionInfo(name) {
  var regionID = parseInt($('#regionID').text());
  if (isNaN(regionID) == true && name == '') {
    //console.log('what');
    return 0;
  }
  if (name == '') {
    //console.log(regionID);
    var existRegion = _.findWhere(regions, {id: regionID});
    name = existRegion.name;
  }

  var result = $.grep(regions, function(e){ return e.name == name; });
  //console.log(result);
  //console.log(result[0].name);
  var cb = result[0].controlledByName;
  var armyCount = result[0].armyCount;
  if (cb == null) {
    cb = 'N/A';
  }
  if (armyCount == null) {
    armyCount = 'N/A';
  }
  $('#regionName').text(result[0].nameOrig);
  $('#regionCB').text(cb);
  $('#regionArmies').text(armyCount);
  $('#regionID').text(result[0].id);
  $('#regionNameDB').text(result[0].name);

  //Now Call Button Control
  modifyButton(result);
}

function loadInitialState(resData) {
  currentUserTurn = resData.currentUserTurn;
  //Should have phase there too, need to use it in server logic
  phase = resData.phase;
  round = resData.round;
  moves = resData.moves;
  loadInitialRegions(resData);
  loadGameName(resData.name);
  var existPlayer = _.findWhere(players, {id: currentUserTurn});
  changeText('userTurn', existPlayer.name);
  changeText('currentRound', round);
  changeText('currentPhase', phase);
  changeText('currentMoves', moves);
  if (resData.round > 0) {
    changeText('remainingArmies', resData.armiesRemaining);
    remainingArmies = resData.armiesRemaining;
  }
  else {
    changeText('remainingArmies', resData.startingArmies);
    startingArmies = resData.startingArmies;
  }

  if (currentUserTurn == userID && round > 0) {
    if (phase == 1 || phase == 2) {
      enableEndPhase();
    }
    else {
      enableEndTurn();
    }
  }
}

function loadInitialRegions(resData) {
  var initialRegions = resData.regions;
  //console.log(initialRegions);
  //console.log('IR Length: '+initialRegions.length);

  if (initialRegions.length > 0) {
    //InitialRegions To Fill
    for (i = 0; i < initialRegions.length; i++) {
      //console.log(initialRegions[i]);
      var regionID = initialRegions[i].region;
      var playerID = initialRegions[i].controlledBy;
      var existRegion = _.findWhere(regions, {id: regionID});
      var existPlayer = _.findWhere(players, {id: playerID});
      existRegion.controlledBy = initialRegions[i].controlledBy;
      existRegion.controlledByName = existPlayer.name;
      existRegion.armyCount = initialRegions[i].armyCount;
      recolorTerritory(existRegion.name ,existPlayer.color);
      $('#armyCount'+existRegion.name).text(initialRegions[i].armyCount);
    }
  }
}

function updateRegionInfo(regionID, playerID, armyCount) {
  var existRegion = _.findWhere(regions, {id: regionID});
  var existPlayer = _.findWhere(players, {id: playerID});
  existRegion.controlledBy = playerID;
  existRegion.armyCount = armyCount;
  existRegion.controlledByName = existPlayer.name;
  existRegion.color = existPlayer.color;
  $('#armyCount'+existRegion.name).text(armyCount);
}

function modifyButton(region) {
  //Disable Buttons By Default
  $('#placeArmyBtn').addClass("disabled").prop("disabled", true);
  $('#moveArmyBtn').addClass("disabled").prop("disabled", true);
  $('#attackArmyBtn').addClass("disabled").prop("disabled", true);

  if (userID != currentUserTurn) {
    return 0;
  }
  //Initial Phase Unclaimed Territory
  if (phase == 0) {
    var currRegions = _.every(regions, regionsFullTest);
    //console.log('currRegions '+currRegions);
    if (region[0].controlledBy == null || (region[0].controlledBy == userID && currRegions == true)) {
      $('#placeArmyBtn').removeClass("disabled").prop("disabled", false);
    }
  }
  else {
    if (region[0].controlledBy == userID && remainingArmies > 0 && phase == 1) {
      $('#placeArmyBtn').removeClass("disabled").prop("disabled", false);
    }
    else if (region[0].controlledBy == userID && region[0].armyCount > 1 && phase == 2) {
      $('#attackArmyBtn').removeClass("disabled").prop("disabled", false);
    }
    else if (region[0].controlledBy == userID && region[0].armyCount > 1 && phase == 3 && moves > 0) {
      $('#moveArmyBtn').removeClass("disabled").prop("disabled", false);
    }
  }
}

function disableButtons() {
  $('#placeArmyBtn').addClass("disabled").prop("disabled", true);
  $('#moveArmyBtn').addClass("disabled").prop("disabled", true);
  $('#attackArmyBtn').addClass("disabled").prop("disabled", true);
}

function regionUpdate(data) {
  if (data.status == 'create') {
    var regionID = data.region.region;
    var playerID = data.region.controlledBy;
    var armyCount = data.region.armyCount;
    var region = $.grep(regions, function(e){ return e.id == regionID; });
    var player = $.grep(players, function(e){ return e.id == playerID; });
    var territory = region[0].name;
    var color = player[0].color;
    updateRegionInfo(regionID, playerID, armyCount);
    recolorTerritory(territory, color);
  }
  else if (data.status == 'add') {
    var regionID = data.region.region;
    var armyCount = data.region.armyCount;
    var playerID = data.region.controlledBy;
    console.log(armyCount);
    updateRegionInfo(regionID, playerID, armyCount);

    remainingArmies = remainingArmies - 1;
    changeText('remainingArmies', remainingArmies);
  }

  else if (data.status == 'attackUpdate') {
    var regionID = parseInt(data.region);
    var armyCount = data.armyCount;
    var playerID = data.controlledBy;

    updateRegionInfo(regionID, playerID, armyCount);
    var region = $.grep(regions, function(e){ return e.id == regionID; });
    var player = $.grep(players, function(e){ return e.id == playerID; });
    var territory = region[0].name;
    var color = player[0].color;
    recolorTerritory(territory, color);
  }

  else if (data.status == 'moveUpdate') {
    var regionID = parseInt(data.region);
    var armyCount = data.armyCount;
    var playerID = data.controlledBy;

    updateRegionInfo(regionID, playerID, armyCount);
    var region = $.grep(regions, function(e){ return e.id == regionID; });
    var player = $.grep(players, function(e){ return e.id == playerID; });
  }
}

function changeTurn(data) {
  if (data.round > 0) {
    remainingArmies = data.armiesRemaining;
  }
  else {
    remainingArmies = data.startingArmies;
  }
  currentUserTurn = data.playerID;
  round = data.round;
  phase = data.phase;
  moves = data.moves;
  updateGameInfo(currentUserTurn, round, phase, remainingArmies, moves);
  disableButtons();
  if ((phase == 1 || phase == 2) && (currentUserTurn == userID)) {
    enableEndPhase();
  }
}

function regionsFullTest(region) {
  if (region.controlledBy != null) {
    return true;
  }
  else {
    return false;
  }
}

function loadGameName(name) {
  $('#gameName').text(name);
}

function addPlayerToUI(number, name, pid) {
  $('<div class="playerInPanel" id="player'+pid+'panel"><div id="p'+number+'Color" class="playerColor"></div><span id="p'+number+'Name" class="playerName">'+name+'</span></div>').appendTo('#playersInGame');
}

function changeText(id, text) {
  $('#'+id).text(text);
}

function enableEndPhase() {
  $('#endPhaseBtn').removeClass("disabled").prop("disabled", false);
}

function enableEndTurn() {
  $('#endTurnBtn').removeClass("disabled").prop("disabled", false);
}

function updateGameInfo(currentUserTurn, round, phase, remainingArmies, moves) {
  var existPlayer = _.findWhere(players, {id: currentUserTurn});
  changeText('userTurn', existPlayer.name);
  changeText('currentRound', round);
  changeText('currentPhase', phase);
  changeText('remainingArmies', remainingArmies);
  changeText('currentMoves', moves);
}

function attack(attackableRegions) {
  $('#attackModalBody').text('');
  if (attackableRegions.length == 0) {
    $('#attackModalBody').text('No Attackable Regions');
  }
  else {
    for (i = 0; i < attackableRegions.length; i++) {
      var name = attackableRegions[i].name;
      var id = attackableRegions[i].id;
      $('<div class="attackBlock">'+name+' - <button class="actualAttackBtn" value="'+id+'">Attack!</button></div>').appendTo('#attackModalBody');
    }
  }
  $('#attackModal').modal();
}

function move(moveableRegions, amountMoveable) {
  $('#moveModalBody').text('');
  if (moveableRegions.length == 0) {
    $('#moveModalBody').text('No Moveable Regions');
  }
  else {
    for (i = 0; i < moveableRegions.length; i++) {
      var name = moveableRegions[i].name;
      var id = moveableRegions[i].id;
      $('<div class="moveBlock">'+name+' - <button class="moveAmountBtn" value="'+id+'" amountMoveable="'+amountMoveable+'">Move!</button></div>').appendTo('#moveModalBody');
    }
  }
  $('#moveModal').modal();
}

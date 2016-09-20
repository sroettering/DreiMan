import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { RoomsSchema } from './rooms_schema.js';

import { Dreiman } from '/imports/api/dreiman_rules.js';

export const Rooms = new Mongo.Collection('rooms');

Rooms.attachSchema(RoomsSchema);

if(Meteor.isServer){
  // create an index for room names
  Rooms._ensureIndex({name: 1});

  Meteor.publish('current-room', function(roomId) {
    check(roomId, String);

    return Rooms.find({_id: roomId, "players.userId": this.userId}, {fields: {password: 0}});
  });

  // publish all user related rooms
  Meteor.publish('my-rooms', function() {
    return Rooms.find({"players.userId": this.userId}, {fields: {password: 0, gamestate: 0}});
  });

  // publish all rooms only with their name for display purposes
  Meteor.publish('rooms', function() {
    return Rooms.find({}, {fields: {name: 1, createdAt: 1}});
  });

  // publish rooms where the name matches a search query
  Meteor.publish('rooms-search', function(searchQuery) {
    check(searchQuery, Match.OneOf(String, null, undefined));

    const projection = {fields: {password: 0, gamestate: 0}, sort: {createdAt: 1, name: 1}};

    if(searchQuery) {
      const regex = new RegExp(searchQuery, 'i');
      const query = {name: regex, "players.userId": {$ne: this.userId}};

      return Rooms.find(query, projection);
    }
  });

}

Meteor.methods({
  'createRoom'(name, passwordHash) {
    check(name, String);
    check(passwordHash, String);
    if(!this.userId) throw new Meteor.Error('Sorry! Du bist nicht eingeloggt.');

    // a user can only be admin of one room at a time
    let room = Rooms.findOne({admin: this.userId});
    if(room) return;

    const user = Meteor.users.findOne({_id: this.userId});

    room = {
      name: name,
      password: passwordHash,
      admin: this.userId,
      players: [{
        userId: this.userId,
        username: user.username,
        gulps: 0,
        isDreiman: false,
      }],
      gamestate: {},
    }

    check(room, RoomsSchema);

    const id = Rooms.insert(room, function(error, result) {
      if(error) console.log(error);
      else return result;
    });

    return id;
  },
  'leaveRoom'(roomId) {
    check(roomId, String);
    if(!this.userId) throw new Meteor.Error('Sorry! Du bist nicht eingeloggt.');

    const room = Rooms.findOne({_id: roomId, "players.userId": this.userId});
    if(!room) return;
    if(room.admin === this.userId) {
      Rooms.remove({_id: roomId});
    } else {
      Rooms.update({_id: roomId}, {$pull: {"players": {userId: this.userId}}});
    }
  },
  'enterRoomWithPwd'(roomId, passwordHash) {
    check(roomId, String);
    check(passwordHash, String);
    if(!this.userId) throw new Meteor.Error('Sorry! Du bist nicht eingeloggt.');

    const room = Rooms.findOne({_id: roomId});
    if(!room) return;

    // if game is running, dont allow entries
    if(room.gamestate.state !== 'gathering') return;

    // check if password is correct
    if(room.password !== passwordHash) return;

    // update player array in room
    const user = Meteor.users.findOne({_id: this.userId});
    const player = {
      userId: this.userId,
      username: user.username,
    }

    //only updates, if room is present. addToSet only adds the player if array did not contain it before.
    Rooms.update({_id: roomId}, {$addToSet: {players: player }});

    // check for pending invitation for this room and this user and delete it
    Meteor.call('removeInvitationForRoom', roomId);

    // return the roomId
    return roomId;
  },
  'addDummyPlayer'(playerName) {
    check(playerName, String);
    if(!this.userId) throw new Meteor.Error('Sorry! Du bist nicht eingeloggt.');

    const room = Rooms.findOne({admin: this.userId, "players.username": {$ne: playerName}});
    if(!room) return;
    if(room.players.length >= 10) return;

    const player = {
      //userId: 00000, // dummy players dont have a userid
      username: playerName,
      gulps: 0,
      isDreiman: false,
    };

    Rooms.update({_id: room._id}, {$addToSet: {players: player }});
  },
  'startGame'(roomId) {
    check(roomId, String);
    if(!this.userId) throw new Meteor.Error('Sorry! Du bist nicht eingeloggt.');

    const room = Rooms.findOne({_id: roomId, admin: this.userId});
    if(!room) return;

    // reset complete gamestate
    let gamestate = room.gamestate;
    gamestate.rolling = 0;
    gamestate.state = 'dreiman-round';
    gamestate.firstDie = 3;
    gamestate.secondDie = 3;
    gamestate.gulpsToDistribute = 0;

    // reset gulps
    let players = room.players;
    for(let i = 0; i < players.length; i++) {
      players[i].currentGulps = 0;
      players[i].gulps = 0;
      players[i].dreimanCount = 0;
    }

    Meteor.call('removeInvitationsForRoom', roomId);

    Rooms.update({_id: roomId}, {$set: {gamestate: gamestate, players: players}});
  },
  'rollDice'(roomId) {
    check(roomId, String);
    if(!this.userId) throw new Meteor.Error('Sorry! Du bist nicht eingeloggt.');
    if(!Meteor.isServer) return;

    const room = Rooms.findOne({_id: roomId,
      $or: [
        {"players.userId": this.userId}, // logged in user
        {admin: this.userId} // dummy player
      ]
    });
    if(!room) return;

    let gamestate = room.gamestate;

    // if gamestate is other than dreiman-round or drinking-round no dice roll is allowed
    if(gamestate.state !== 'dreiman-round' && gamestate.state !== 'drinking-round') return;

    // if a player did not distribute his gulps from a double prevent the roll
    if(gamestate.gulpsToDistribute > 0) return;

    let currentPlayer = gamestate.rolling;
    const userId = room.players[currentPlayer].userId;

    // check if player is allowed to roll
    if(userId && userId !== this.userId) return;
    else if(!userId && this.userId !== room.admin) return;

    let d1 = Math.floor(Math.random() * 6) + 1;
    let d2 = Math.floor(Math.random() * 6) + 1;
    gamestate.firstDie = d1;
    gamestate.secondDie = d2;
    const sum = d1 + d2;

    let players = room.players;

    if(gamestate.state === 'dreiman-round') {
      Dreiman.determineDreiman(d1, d2, currentPlayer, players);
      gamestate.rolling = ++currentPlayer;
      if(gamestate.rolling >= players.length) {
        for(let i = 0; i < players.length; i++) {
          if(players[i].dreimanCount > 0) {
            gamestate.state = 'drinking-round';
            break;
          }
        }
        gamestate.rolling = 0;
      }
    } else if(gamestate.state === 'drinking-round') {
      // add all gulps from last roll to total count and reset the current gulps
      for(let i = 0; i < players.length; i++) {
        players[i].gulps = players[i].gulps + players[i].currentGulps;
        players[i].currentGulps = 0;
      }

      // apply dreiman rules
      Dreiman.handleNeighbours(d1, d2, currentPlayer, players);
      Dreiman.handleDreiman(d1, d2, players);

      // if player rolled a double set the gamestate
      if(d1 === d2) {
        gamestate.gulpsToDistribute = d1;
      }

      // if no player has to drink, it's the next ones turn
      if((sum === 6 || sum === 8 || sum === 10) && d1 !== 3 && d2 !== 3 && d1 !== d2) {
        gamestate.rolling = ++currentPlayer
        if(gamestate.rolling >= players.length) {
          gamestate.state = 'dreiman-round';
          gamestate.rolling = 0;
        }
      }
    }

    Rooms.update({_id: roomId}, {$set: {gamestate: gamestate, players: players}});
  },
  'giveGulpToPlayer'(roomId, playerIndex) {
    check(playerIndex, Number);
    check(roomId, String);
    if(!this.userId) throw new Meteor.Error('Sorry! Du bist nicht eingeloggt.');

    const room = Rooms.findOne({_id: roomId, admin: this.userId});
    if(!room) return;

    // check if there are gulps left and if its drinking round
    let gamestate = room.gamestate;
    if(gamestate.gulpsToDistribute <= 0 || gamestate.state !== 'drinking-round') return;

    const currentPlayer = gamestate.rolling;
    const players = room.players;
    const userId = players[currentPlayer].userId;

    // check if player is allowed to roll
    if(userId && userId !== this.userId) return;
    else if(!userId && this.userId !== room.admin) return;

    let targetPlayer = players[playerIndex];
    if(!targetPlayer) return;

    players[playerIndex].currentGulps++;
    gamestate.gulpsToDistribute = Math.max(0, --gamestate.gulpsToDistribute);

    Rooms.update({_id: roomId}, {$set: {players: players, gamestate: gamestate}});
  },
  'endGame'(roomId) {
    check(roomId, String);
    if(!this.userId) throw new Meteor.Error('Sorry! Du bist nicht eingeloggt.');

    const room = Rooms.findOne({_id: roomId, admin: this.userId});
    if(!room) return;

    // set to gathering to show lobby for all players
    let gamestate = room.gamestate;
    gamestate.state = 'gathering';

    Rooms.update({_id: roomId}, {$set: {gamestate: gamestate}});
  },
});

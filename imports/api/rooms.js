import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { RoomsSchema } from './rooms_schema.js';
//import { Inviations } from './invitations.js';

export const Rooms = new Mongo.Collection('rooms');

Rooms.attachSchema(RoomsSchema);

// TODO publish stuff

if(Meteor.isServer){
  // create an index for room names
  Rooms._ensureIndex({name: 1});

  Meteor.publish('current-room', function(roomId) {
    check(roomId, String);

    return Rooms.find({_id: roomId}, {fields: {password: 0}});
  });

  // publish all user related rooms
  Meteor.publish('my-rooms', function() {
    return Rooms.find({"players.userId": this.userId}, {fields: {password: 0}});
  });

  Meteor.publish('rooms', function() {
    return Rooms.find({}, {fields: {password: 0}});
  });

  // publish rooms where the name matches a search query
  Meteor.publish('rooms-search', function(searchQuery) {
    check(searchQuery, Match.OneOf(String, null, undefined));

    const projection = {fields: {password: 0}, sort: {createdAt: 1, name: 1}};

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

    room = {
      name: name,
      password: passwordHash,
      admin: this.userId,
      players: [{
        userId: this.userId,
        gulps: 0,
        isDreiman: false,
      }],
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

    // check if password is correct
    if(room.password !== passwordHash) return;

    // update player array in room
    const player = {
      userId: this.userId,
      gulps: 0,
      isDreiman: false,
    }

    //only updates, if room is present. addToSet only adds the player if array did not contain it before.
    Rooms.update({_id: roomId}, {$addToSet: {players: player }});

    // check for pending invitation for this room and this user and delete it
    //Meteor.call('removeInvitationFor', roomId, this.userId);
    console.log(roomId);
    // return the roomId
    return roomId;
  },
});

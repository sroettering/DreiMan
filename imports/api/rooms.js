import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { RoomsSchema } from './rooms_schema.js';

export const Rooms = new Mongo.Collection('rooms');

Rooms.attachSchema(RoomsSchema);

// TODO publish stuff

Meteor.methods({
  'createRoom'(name) {
    check(name, String);
    if(!this.userId) throw new Meteor.Error('Sorry! Du bist nicht eingeloggt.');

    // a user can only be admin of one room at a time
    let room = Rooms.findOne({admin: this.userId});
    if(room) return;

    room = {
      name: name,
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

    Rooms.update({_id: roomId}, {$pull: {"players": {userId: this.userId}}});
  },
});

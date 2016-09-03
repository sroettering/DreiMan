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

    if(!this.userId) throw new Meteor.Error('Sorry! You are not logged in');

    const room = {
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
});

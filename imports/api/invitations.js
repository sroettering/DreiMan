import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { InvitationsSchema } from './invitations_schema.js';

import { Rooms } from './rooms.js';

export const Invitations = new Mongo.Collection('invitations');

Invitations.attachSchema(InvitationsSchema);

Meteor.methods({
  'sendRoomInvitation'(inviteeId) {
    check(inviteeId, String);
    if(!this.userId) throw new Meteor.Error('Sorry! You are not logged in');

    let room = Rooms.findOne({admin: this.userId, "players.userId": inviteeId});
    if(room) return;

    room = Rooms.findOne({admin: this.userId});
    if(!room) return;

    let invitation = Invitations.findOne({invitee: inviteeId, room: room._id});
    if(invitation) return;

    invitation = {
      invitee: inviteeId,
      sender: this.userId,
      type: 'game',
      room: room._id,
    };

    check(invitation, InvitationsSchema);

    Invitations.insert(invitation, function(error, result) {
      if(error) console.log(error);
    });
  },
  'acceptRoomInvitation'(invitationId) {
    check(invitationId, String);
    if(!this.userId) throw new Meteor.Error('Sorry! You are not logged in');

    const invitation = Invitations.findOne({_id: invitationId});
    if(!invitation) return;
    if(invitation.invitee !== this.userId) return;

    const player = {
      userId: invitation.invitee,
      gulps: 0,
      isDreiman: false,
    }

    //only updates, if room is present. addToSet only adds the player if array did not contain it before.
    Rooms.update({_id: invitation.room}, {$addToSet: {players: player }});
    Invitations.remove({_id: invitationId});
  }
});

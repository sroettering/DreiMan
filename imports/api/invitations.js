import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { InvitationsSchema } from './invitations_schema.js';

import { Rooms } from './rooms.js';

export const Invitations = new Mongo.Collection('invitations');

Invitations.attachSchema(InvitationsSchema);

if(Meteor.isServer) {
  // Collection Hook: After room deletion, every associated invitation is removed too.
  Rooms.after.remove(function (userId, doc) {
    Invitations.remove({room: doc._id});
  });

  // publish all user related invitations
  Meteor.publish('myInvitations', function() {
    return Invitations.find({invitee: this.userId});
  });
}

Meteor.methods({
  'sendRoomInvitation'(invitee) {
    check(invitee, String);
    if(!this.userId) throw new Meteor.Error('Sorry! You are not logged in');

    const user = Meteor.users.findOne({$or: [{"profile.name": invitee},
                                             {"services.facebook.email": invitee},
                                             {"services.twitter.screenName": invitee},
                                             {"services.google.name": invitee},
                                             {username: invitee}] });
    if(!user) return;

    let room = Rooms.findOne({admin: this.userId, "players.userId": user._id});
    if(room) return;

    room = Rooms.findOne({admin: this.userId});
    if(!room) return;

    let invitation = Invitations.findOne({invitee: user._id, room: room._id});
    if(invitation) return;

    invitation = {
      invitee: user._id,
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
  },
  'declineRoomInvitation'(invitationId) {
    check(invitationId, String);
    if(!this.userId) throw new Meteor.Error('Sorry! You are not logged in');

    const invitation = Invitations.findOne({_id: invitationId});
    if(!invitation) return;
    if(invitation.invitee !== this.userId) return;

    Invitations.remove({_id: invitationId});
  },
  'cancelRoomInvitation'(invitationId) {
    check(invitationId, String);
    if(!this.userId) throw new Meteor.Error('Sorry! You are not logged in');

    const invitation = Invitations.findOne({_id: invitationId});
    if(!invitation) return;
    if(invitation.sender !== this.userId) return;

    Invitations.remove({_id: invitationId});
  },
});

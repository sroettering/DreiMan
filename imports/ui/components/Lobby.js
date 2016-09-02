import './Lobby.html';
import './Lobby.css';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Rooms } from '/imports/api/rooms.js';
import { Invitations } from '/imports/api/invitations.js';

Template.Lobby.helpers({
  activeRooms: function() {
    const rooms = Rooms.find({"players.userId": Meteor.userId()});
    return rooms;
  },
});

Template.Lobby.events({
  'click #createRoom': function() {
    console.log(Meteor.userId());
    Rooms.insert({
      admin: Meteor.userId(),
      players: [{
        userId: Meteor.userId(),
        gulps: 0,
        isDreiman: false,
      }],
    }, function(error, result) {
      if(error) console.log(error);
    });
  },
  'click #inviteToGame': function(event, template) {
    console.log('inviting a friend');
    const inviteeName = template.find('#invitee-name').value;
    console.log('inviting a drinking buddy');
    Invitations.insert({
      invitee: Meteor.users.findOne({$or: [{username: inviteeName}, {"profile.name": inviteeName}] })._id,
      sender: Meteor.userId(),
      type: 'game',
      room: Rooms.findOne({admin: Meteor.userId()})._id,
    }, function(error, result) {
      if(error) console.log(error);
    });
  },
});

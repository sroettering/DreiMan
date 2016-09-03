import './Lobby.html';
import './Lobby.css';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { moment } from 'meteor/momentjs:moment';

import { Rooms } from '/imports/api/rooms.js';
import { Invitations } from '/imports/api/invitations.js';

Template.Lobby.helpers({
  activeRooms: function() {
    const rooms = Rooms.find({"players.userId": Meteor.userId()});
    return rooms;
  },
  date: function() {
    const date = moment(this.createdAt).format("D.M.YY - HH:mm");
    return date;
  },
});

Template.Lobby.events({
  'click #createRoom': function(event, template) {
    event.preventDefault();
    const roomName = template.find('#room-name').value;
    template.find('#room-name').value = "";
    console.log(Meteor.userId());
    console.log(roomName);
    if(roomName !== "") {
      Meteor.call('createRoom', roomName, function(error, result) {
        if(error) console.log(error);
        else FlowRouter.go('/room/'+result);
      });
    }
  },
  'click #inviteToGame': function(event, template) {
    const inviteeName = template.find('#invitee-name').value;
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

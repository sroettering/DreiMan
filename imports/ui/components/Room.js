import './Room.html';
import './Room.css';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Rooms } from '/imports/api/rooms.js';

/*
TODO:
- add check to room route whether user is allowed in
*/

Template.Room.helpers({
  room: function() {
    const id = FlowRouter.getParam('id');
    return Rooms.findOne({_id: id});
  },
  otherPlayers: function() {
    const id = FlowRouter.getParam('id');
    const room = Rooms.findOne({_id: id});
    if(room) {
      const players = room.players;
      const otherPlayers = players.filter(function(elem) {
        return elem.userId !== room.admin;
      });
      return otherPlayers;
    }
  },
  adminName: function() {
    const id = FlowRouter.getParam('id');
    const room = Rooms.findOne({_id: id});
    if(room) {
      const adminId = room.admin;
      const admin = Meteor.users.findOne({_id: adminId});
      const adminName = admin.username ? admin.username : admin.profile.name;
      return adminName;
    }
  },
  isAdmin: function() {
    const id = FlowRouter.getParam('id');
    const room = Rooms.findOne({_id: id});
    if(room) {
      return room.admin === Meteor.userId();
    }
  },
  userName: function() {
    const id = this.userId;
    const user = Meteor.users.findOne({_id: id});
    if(user) {
      const name = user.username ? user.username : user.profile.name;
      return name;
    }
  },
});

Template.Room.events({
  'click #inviteButton': function(event, template) {
    event.preventDefault();
    const invitee = template.find('#invitee-name').value;
    const user = Meteor.users.findOne({$or: [{"profile.name": invitee},
                                             {"services.facebook.email": invitee},
                                             {"services.twitter.screenName": invitee},
                                             {"services.google.name": invitee},
                                             {username: invitee}] });
    console.log(user);
    if(user) {
      Meteor.call('sendRoomInvitation', user._id);
    }
  }
});

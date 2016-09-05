import './Lobby.html';
import './Lobby.css';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Rooms } from '/imports/api/rooms.js';
import { Invitations } from '/imports/api/invitations.js';

/*
TODO:
- allow only invited users into the lobby (maybe with template level subscriptions)
*/

Template.Lobby.helpers({
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
      if(admin) {
        const adminName = admin.username ? admin.username : admin.profile.name;
        return adminName;
      }
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
  invitations: function() {
    const id = Meteor.userId();
    const room = Rooms.findOne({admin: id});
    if(!room) return;

    const invitations = Invitations.find({type: 'game', room: room._id, sender:id});
    return invitations;
  },
  inviteeName: function() {
    const user = Meteor.users.findOne({_id: this.invitee});
    if(user) return user.username ? user.username : user.profile.name;
  },
});

Template.Lobby.events({
  'click #inviteButton': function(event, template) {
    event.preventDefault();
    const invitee = template.find('#invitee-name').value;
    const user = Meteor.users.findOne({$or: [{"profile.name": invitee},
                                             {"services.facebook.email": invitee},
                                             {"services.twitter.screenName": invitee},
                                             {"services.google.name": invitee},
                                             {username: invitee}] });
    template.find('#invitee-name').value = "";
    if(user) {
      Meteor.call('sendRoomInvitation', user._id);
    }
  },
  'click .cancelRoomInvitation': function(event, template) {
    event.preventDefault();
    Meteor.call('cancelRoomInvitation', this._id);
  }
});

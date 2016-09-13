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

Template.Lobby.onCreated( () => {
  let template = Template.instance();

  template.autorun( () => {
    // subscribe to my rooms
    template.subscribe('current-room', FlowRouter.getParam('id'));

    // subscribe to my sent invitations
    template.subscribe('room-invitations', FlowRouter.getParam('id'));
  });
});

Template.Lobby.helpers({
  invitations: function() {
    const id = Meteor.userId();
    const room = Rooms.findOne({admin: id});
    if(!room) return;

    const invitations = Invitations.find({type: 'game', room: room._id, sender:id});
    return invitations.fetch();
  },
  maximumReached: function() {
    const players = this.room.players;
    if(players) {
      if(players.length >= 10) return {disabled: 'disabled'};
    }
  },
});

Template.Lobby.events({
  'click #inviteButton': function(event, template) {
    event.preventDefault();
    const invitee = template.find('#invitee-name').value;
    template.find('#invitee-name').value = "";
    Meteor.call('sendRoomInvitation', invitee);
  },
  'click .cancelRoomInvitation': function(event, template) {
    event.preventDefault();
    Meteor.call('cancelRoomInvitation', this._id);
  },
  'click #add-dummy-player': function(event, template) {
    const playerName = template.find('#dummy-name').value;
    if(playerName && playerName !== "") {
      Meteor.call('addDummyPlayer', playerName);
      template.find('#dummy-name').value = "";
    }
  },
});

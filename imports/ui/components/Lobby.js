import './Lobby.html';
import './Lobby.css';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Rooms } from '/imports/api/rooms.js';
import { Invitations } from '/imports/api/invitations.js';

Template.Lobby.onCreated( () => {
  let template = Template.instance();

  template.searchQuery = new ReactiveVar();

  template.autorun( () => {
    // subscribe to my rooms
    template.subscribe('current-room', FlowRouter.getParam('id'));

    // subscribe to my sent invitations
    template.subscribe('room-invitations', FlowRouter.getParam('id'));

    // subscribe to user search results
    template.subscribe('user-search-results', template.searchQuery.get());
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
  userSearchResults: function() {
    const searchQuery = Template.instance().searchQuery.get();
    check(searchQuery, Match.OneOf(String, null, undefined));

    const projection = {fields: {username: 1, _id: 1}, limit: 5};

    if(searchQuery) {
      const regex = new RegExp(searchQuery, 'i');
      const query = {username: regex};
      return Meteor.users.find(query, projection);
    }
  },
  searching: function() {
    const query = Template.instance().searchQuery.get();
    return query && query !== '';
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
  'click #startButton': function(event, template) {
    Meteor.call('startGame', this.room._id);
  },
  'keyup #invitee-name': function(event, template ) {
    let value = event.target.value.trim();
    template.searchQuery.set(value);
  },
  'click .user-item-clickable': function(event, template) {
    template.searchQuery.set('');
    template.find('#invitee-name').value = this.username;
  },
});

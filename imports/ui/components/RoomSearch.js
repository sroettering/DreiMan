import './RoomSearch.html';
import './RoomSearch.css';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { Rooms } from '/imports/api/rooms.js';

import './RoomEntryModal.js';

Template.RoomSearch.onCreated( () => {
  let template = Template.instance();

  template.currentRoom = new ReactiveVar();

  template.searchQuery = new ReactiveVar();
  template.searching = new ReactiveVar(false);

  template.autorun( () => {
    // subscribe to room-search publications
    template.subscribe('rooms-search', template.searchQuery.get(), () => {
      Meteor.setTimeout(function(){
         template.searching.set(false);
      }, 300);
    });
  });

  template.resetCurrentRoom = function() {
    template.currentRoom.set(null);
  }
});

Template.RoomSearch.helpers({
  searching: function() {
    return Template.instance().searching.get();
  },
  roomSearchResults: function() {
    const searchQuery = Template.instance().searchQuery.get();
    const projection = {sort: {createdAt: 1, name: 1}};

    if(searchQuery) {
      const regex = new RegExp(searchQuery, 'i');
      const query = {name: regex, "players.userId": {$ne: Meteor.userId()}};

      return Rooms.find(query, projection);
    }
  },
  adminName: function() {
    const sender = Meteor.users.findOne({_id: this.admin});
    if(sender) {
      return sender.username;
    }
  },
  currentRoom: function() {
    // on click add clicked room as reactiveVar and retrieve it
    const template = Template.instance();
    return template.currentRoom.get();
  },
});

Template.RoomSearch.events({
  'keyup #room-search-name': function(event, template ) {
    let value = event.target.value.trim();

    if (value !== '') {// && event.keyCode === 13 ) { // 13 = Enter
      template.searchQuery.set(value);
      if(value.length === 1) {
        template.searching.set(true);
      }
    }

    if (value === '') {
      template.searchQuery.set( value );
    }
  },
  'click .modal': function(event, template) {
    if(template.currentRoom.get() && event.target.getAttribute('class') === 'modal') {
      template.resetCurrentRoom();
    }
  },
  'click .room-item-clickable': function(event, template) {
    template.currentRoom.set(this);
  },
  'keyup': function(event, template) {
    if(event.keyCode === 27) { // 27 === Escape
      template.resetCurrentRoom();
    }
  },
});
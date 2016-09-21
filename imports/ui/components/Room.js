import './Room.html';
import './Room.css';
import './Lobby.js';
import './Game.js';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Rooms } from '/imports/api/rooms.js';

Template.Room.onCreated(function() {
  let template = Template.instance();

  template.autorun(() => {
    template.subscribe('current-room', FlowRouter.getParam('id'));
  });
});

Template.Room.helpers({
  room: function() {
    const id = FlowRouter.getParam('id');
    return Rooms.findOne({_id: id});
  },
  hasStarted: function() {
    const id = FlowRouter.getParam('id');
    const room = Rooms.findOne({_id: id});
    if(room && room.gamestate) {
      return room.gamestate.state !== 'gathering';
    } else {
      return false;
    }
  },
});

Template.Room.events({
  'click #back-to-lobby': function(event, template){
    event.preventDefault();
    const id = FlowRouter.getParam('id');
    Meteor.call('endGame', id);
  },
  'click #back-to-overview': function(event, template) {
    event.preventDefault();
    FlowRouter.go('overview');
  }
});

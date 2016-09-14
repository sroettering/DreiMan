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
});

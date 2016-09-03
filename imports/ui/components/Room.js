import './Room.html';
import './Room.css';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Rooms } from '/imports/api/rooms.js';

Template.Room.helpers({
  room: function() {
    const id = FlowRouter.getParam('id');
    return Rooms.findOne({_id: id});
  }
});

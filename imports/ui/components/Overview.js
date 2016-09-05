import './Overview.html';
import './Overview.css';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { moment } from 'meteor/momentjs:moment';

import { Rooms } from '/imports/api/rooms.js';
import { Invitations } from '/imports/api/invitations.js';

Template.Overview.helpers({
  activeRooms: function() {
    //query for all rooms, where the current user is participating
    const rooms = Rooms.find({"players.userId": Meteor.userId()});
    return rooms;
  },
  openInvitations: function() {
    const invitations = Invitations.find({invitee: Meteor.userId()});
    return invitations;
  },
  roomName: function() {
    const room = Rooms.findOne({_id: this.room});
    if(room) {
      return room.name;
    }
  },
  senderName: function() {
    const sender = Meteor.users.findOne({_id: this.sender});
    if(sender) {
      return sender.username ? sender.username : sender.profile.name;
    }
  },
  date: function() {
    const date = moment(this.createdAt).format("D.M.YY - HH:mm");
    return date;
  },
});

Template.Overview.events({
  'click #createRoom': function(event, template) {
    event.preventDefault();
    const roomName = template.find('#room-name').value;
    template.find('#room-name').value = "";
    if(roomName !== "") {
      Meteor.call('createRoom', roomName, function(error, result) {
        if(error) console.log(error);
        else if(result) FlowRouter.go('/room/'+result);
        else console.log('Sorry, du bist bereits Admin einer Saufrunde.');
      });
    }
  },
  'click .leaveRoom': function(event, template) {
    event.preventDefault();
    Meteor.call('leaveRoom', this._id);
  },
  'click .acceptRoomInvitation': function(event, template) {
    event.preventDefault();
    Meteor.call('acceptRoomInvitation', this._id);
  },
  'click .declineRoomInvitation': function(event, template) {
    event.preventDefault();
    Meteor.call('declineRoomInvitation', this._id);
  },
});

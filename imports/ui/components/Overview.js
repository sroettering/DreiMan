import './Overview.html';
import './Overview.css';

import './RoomSearch.js';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { moment } from 'meteor/momentjs:moment';
import { CryptoJS } from 'meteor/jparker:crypto-core';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Rooms } from '/imports/api/rooms.js';
import { Invitations } from '/imports/api/invitations.js';
import { ReactiveVar } from 'meteor/reactive-var';

Template.Overview.onCreated( () => {
  let template = Template.instance();

  template.autorun( () => {
    // subscribe to my invitations
    template.subscribe('myInvitations');

    // subscribe to my rooms
    template.subscribe('my-rooms'); // why subscribe to all rooms????
  });
});

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
      return sender.username;
    }
  },
  date: function() {
    const date = moment(this.createdAt).format("D.M.YY"); // - HH:mm");
    return date;
  },
});

Template.Overview.events({
  'click #createRoom': function(event, template) {
    event.preventDefault();
    const roomName = template.find('#room-name').value;
    const roomPassword = template.find('#room-password').value;
    template.find('#room-name').value = "";
    template.find('#room-password').value = "";
    if(roomName !== "" && roomPassword !== "") {
      const encryptedPassword = CryptoJS.SHA256(roomPassword).toString();
      const id = Meteor.apply(
          'createRoom',
          [roomName, encryptedPassword],
          {returnStubValue: true}
      );
      if(id) {
        Meteor.defer(function() {
            FlowRouter.go('/room/'+id);
        });
      }
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

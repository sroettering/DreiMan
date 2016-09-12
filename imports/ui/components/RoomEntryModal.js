import './RoomEntryModal.html';
import './RoomEntryModal.css';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { CryptoJS } from 'meteor/jparker:crypto-core';

Template.RoomEntryModal.onCreated(function() {
  let template = Template.instance();

  template.enterRoomWithPwd = function(roomId, password) {
    const encryptedPassword = CryptoJS.SHA256(password).toString();

    Meteor.call('enterRoomWithPwd', roomId, encryptedPassword, function(error, result) {
      if(error) return;
      else if(result) {
        Meteor.defer(function() {
            FlowRouter.go('/room/'+result);
        });
      }
    });
  };
});

Template.RoomEntryModal.helpers({
  adminName: function(adminId) {
    check(adminId, String);
    const admin = Meteor.users.findOne({_id: adminId});
    if(admin) {
      return admin.username;
    }
  },
});

Template.RoomEntryModal.events({
  'keyup #room-entry-password': function(event, template) {
    if(event.keyCode === 13) { // 13 === Enter
      const password = event.target.value;
      template.enterRoomWithPwd(this.room._id, password);
    }
  },
  'click #enter-room-with-pwd': function(event, template) {
    const password = template.find('#room-entry-password').value;
    template.enterRoomWithPwd(this.room._id, password);
  },
  'click #close-modal': function(event, template) {
    
  },
});

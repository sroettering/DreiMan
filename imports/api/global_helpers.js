import { Template } from 'meteor/templating';

import { Rooms } from '/imports/api/rooms.js';

Template.registerHelper('isAdmin', function(roomId, user){
  const room = Rooms.findOne({_id: roomId, admin: user._id});
  return room && room !== null;
});

Template.registerHelper('usernameForId', function(userId){
  const user = Meteor.users.findOne({_id: userId});
  return user.username;
});

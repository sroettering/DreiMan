import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import '/imports/ui/layouts/PublicLayout.js';
import '/imports/ui/components/Header.js';
import '/imports/ui/components/Login.js';
import '/imports/ui/components/Lobby.js';

FlowRouter.triggers.enter([function() {
  if(!Meteor.userId()) {
    FlowRouter.go('home');
  }
}]);

FlowRouter.route('/', {
  name: 'home',
  action() {
    if(Meteor.userId()) {
      FlowRouter.go('lobby');
    }
    BlazeLayout.render("PublicLayout", {header: "Header", main: "Login"});
  }
});

FlowRouter.route('/lobby', {
  name: 'lobby',
  action() {
    BlazeLayout.render("PublicLayout", {header: "Header", main: "Lobby"});
  }
});

FlowRouter.route('/room/:id', {
  name: 'room',
  action() {
    BlazeLayout.render("PublicLayout", {header: "Header", main: "Room"});
  }
});

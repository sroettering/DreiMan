import './Header.html';
import './Header.css';

import { Template } from 'meteor/templating';

Template.Header.events({
  'click #navigation_toggle': function(event) {
    event.preventDefault();
    console.log('logging out');
    if(Meteor.userId()) {
      AccountsTemplates.logout();
    }
  },
});

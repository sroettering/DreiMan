import '/imports/startup/useraccounts-configuration.js';
import '/imports/startup/client/routes.js';
import '/imports/api/collections.js';

// subscribe to users collection
Tracker.autorun(function(){
  Meteor.subscribe("users");
});

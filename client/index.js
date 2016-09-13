import '/imports/startup/useraccounts-configuration.js';
import '/imports/startup/client/routes.js';
import '/imports/api/collections.js';
import '/imports/api/global_helpers.js';

// subscribe to users collection
Tracker.autorun(function(){
  Meteor.subscribe("users");
});

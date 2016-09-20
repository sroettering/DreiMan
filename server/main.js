import '/imports/startup/useraccounts-configuration.js';
import '/imports/api/collections.js';

// publish all users with id and username
// user search depends on this publication
Meteor.publish('users', function() {
    return Meteor.users.find({}, {fields: {_id: 1, username: 1}});
});

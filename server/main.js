import '/imports/startup/useraccounts-configuration.js';
import '/imports/api/collections.js';

// publish all users with id and username
Meteor.publish('users', function() {
    return Meteor.users.find({}, {fields: {_id: 1, username: 1}});
});

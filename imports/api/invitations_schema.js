import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const InvitationsSchema = new SimpleSchema({
  invitee: {
    type: String,
  },
  sender: {
    type: String,
  },
  type: {
    type: String,
    allowedValues: ['game', 'buddy'],
  },
  room: {
    type: String,
    optional: true,
  },
  createdAt: {
    type: Date,
    optional: true,
    autoValue: function() {
      if(this.isInsert) {
        return new Date;
      } else if (this.isUpsert) {
        return {$setOnInsert: new Date};
      } else {
        this.unset();  // Prevent user from supplying their own value
      }
    },
  },
});

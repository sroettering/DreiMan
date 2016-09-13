import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { moment } from 'meteor/momentjs:moment';

const PlayerSchema = new SimpleSchema({
  userId: {
    type: String,
    optional: true,
  },
  username: { // can be real or dummy player
    type: String,
  },
  gulps: {
    type: Number,
    min: 0,
  },
  isDreiman: {
    type: Boolean,
  }
});

export const RoomsSchema = new SimpleSchema({
  name: {
    type: String,
    max: 20,
  },
  password: {
    type: String,
  },
  admin: {
    type: String,
  },
  players: {
    type: [PlayerSchema],
    minCount: 1,
    maxCount: 10,
  },
  createdAt: {
    type: Date,
    optional: true,
    autoValue: function() {
      if(this.isInsert) {
        return moment().toDate();
      } else if (this.isUpsert) {
        return {$setOnInsert: moment().toDate()};
      } else {
        this.unset();  // Prevent user from supplying their own value
      }
    },
  },
  isActive: {
    type: Boolean,
    optional: true,
    autoValue: function() {
      if(this.isInsert) {
        return true;
      }
    }
  },
});

import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const PlayerSchema = new SimpleSchema({
  userId: {
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
  admin: {
    type: String,
  },
  players: {
    type: [PlayerSchema],
  },
  createdAt: {
    type: Date,
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
  isActive: {
    type: Boolean,
    autoValue: function() {
      if(this.isInsert) {
        return true;
      }
    }
  },
});

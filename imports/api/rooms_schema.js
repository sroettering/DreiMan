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
    autoValue: function() {
      if(this.isInsert) {
        return 0;
      }
    },
  },
  isDreiman: {
    type: Boolean,
    autoValue: function() {
      if(this.isInsert) {
        return false;
      }
    },
  }
});

const GameSchema = new SimpleSchema({
  rolling: { // index of current player
    type: Number,
    optional: true,
    autoValue: function() {
      if(this.isInsert) {
        return 0;
      }
    }
  },
  state: {
    type: String,
    optional: true,
    allowedValues: ['gathering', 'dreiman-round', 'drinking-round', 'finished'],
    autoValue: function() {
      if(this.isInsert) {
        return 'gathering';
      }
    },
  },
  firstDie: {
    type: Number,
    optional: true,
    min: 1,
    max: 6,
    autoValue: function() {
      if(this.isInsert) {
        return 3;
      }
    }
  },
  secondDie: {
    type: Number,
    optional: true,
    min: 1,
    max: 6,
    autoValue: function() {
      if(this.isInsert) {
        return 3;
      }
    }
  },
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
  gamestate: {
    type: GameSchema,
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

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { RoomsSchema } from './rooms_schema.js';

export const Rooms = new Mongo.Collection('rooms');

Rooms.attachSchema(RoomsSchema);

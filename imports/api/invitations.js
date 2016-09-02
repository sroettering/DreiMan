import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { InvitationsSchema } from './invitations_schema.js';

export const Invitations = new Mongo.Collection('invitations');

Invitations.attachSchema(InvitationsSchema);

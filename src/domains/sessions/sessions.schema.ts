import { MAGIC_NUMBERS, MONGODB_CONSTANTS } from '@shared/constants';
import { setIncrementalVersion } from '@shared/helpers';
import { IndexDirection, Schema, Types } from 'mongoose';
import { ISession } from './sessions.interface';

const SCHEMA_DEFINITION = {
  user: {
    type: Types.ObjectId,
    ref: MONGODB_CONSTANTS.USERS.MODEL,
    autopopulate: true,
    required: true
  },
  jti: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  isRevoked: {
    type: Boolean,
    required: true,
    default: false,
  },
  revokedAt: {
    type: Date,
    required: false,
    default: null,
  }
};

export const SESSION_SCHEMA = new Schema<ISession>(
  SCHEMA_DEFINITION,
  { timestamps: true },
);

SESSION_SCHEMA.index({ user: MAGIC_NUMBERS.N_1 as IndexDirection }, { unique: false });
SESSION_SCHEMA.index({ jti: MAGIC_NUMBERS.N_1 as IndexDirection }, { unique: true });
SESSION_SCHEMA.index({ user: MAGIC_NUMBERS.N_1 as IndexDirection, isRevoked: MAGIC_NUMBERS.N_1 as IndexDirection }, { unique: false });
SESSION_SCHEMA.plugin(require('mongoose-autopopulate'));
SESSION_SCHEMA.plugin(setIncrementalVersion);

export const REFRESH_SESSION_SCHEMA = new Schema<ISession>(
  SCHEMA_DEFINITION,
  { timestamps: true },
);

REFRESH_SESSION_SCHEMA.index({ user: MAGIC_NUMBERS.N_1 as IndexDirection }, { unique: false });
REFRESH_SESSION_SCHEMA.index({ jti: MAGIC_NUMBERS.N_1 as IndexDirection }, { unique: true });
REFRESH_SESSION_SCHEMA.index({ user: MAGIC_NUMBERS.N_1 as IndexDirection, isRevoked: MAGIC_NUMBERS.N_1 as IndexDirection }, { unique: false });
REFRESH_SESSION_SCHEMA.plugin(require('mongoose-autopopulate'));
REFRESH_SESSION_SCHEMA.plugin(setIncrementalVersion);
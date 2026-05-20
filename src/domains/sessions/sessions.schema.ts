import { setIncrementalVersion } from '@core/mongodb';
import { MAGIC_NUMBERS } from '@core/shared/constants';
import { COLLECTIONS } from '@shared/constants';
import { ISession } from '@shared/interfaces';
import { IndexDirection, Schema, Types } from 'mongoose';

const SCHEMA_DEFINITION = {
  user: {
    type: Types.ObjectId,
    ref: COLLECTIONS.USERS.MODEL,
    autopopulate: true,
    required: true
  },
  accessJti: {
    type: String,
    required: true,
  },
  accessExpiresAt: {
    type: Date,
    required: true,
  },
  refreshJti: {
    type: String,
    required: false,
    default: undefined,
  },
  refreshExpiresAt: {
    type: Date,
    required: false,
    default: undefined,
  },
  isRevoked: {
    type: Boolean,
    required: true,
    default: false,
  },
  isAccessRevoked: {
    type: Boolean,
    required: true,
    default: false,
  },
  isRefreshRevoked: {
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
SESSION_SCHEMA.index({ accessJti: MAGIC_NUMBERS.N_1 as IndexDirection }, { unique: true });
SESSION_SCHEMA.index({ refreshJti: MAGIC_NUMBERS.N_1 as IndexDirection }, { unique: true, sparse: true });
SESSION_SCHEMA.index({ user: MAGIC_NUMBERS.N_1 as IndexDirection, isRevoked: MAGIC_NUMBERS.N_1 as IndexDirection }, { unique: false });
SESSION_SCHEMA.plugin(require('mongoose-autopopulate'));
SESSION_SCHEMA.plugin(setIncrementalVersion);

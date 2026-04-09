import { MAGIC_NUMBERS, MONGODB_CONSTANTS } from '@shared/constants';
import { setIncrementalVersion } from '@shared/helpers';
import { IndexDirection, Schema, Types } from 'mongoose';
import { IToken } from './tokens.interface';

export const TOKENS_SCHEMA = new Schema<IToken>(
  {
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
    accessExpiresAt: {
      type: Date,
      required: true,
    },
    refreshExpiresAt: {
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
  },
  {
    timestamps: true,
  },
);

TOKENS_SCHEMA.index({ user: MAGIC_NUMBERS.N_1 as IndexDirection }, { unique: false });
TOKENS_SCHEMA.plugin(require('mongoose-autopopulate'));
TOKENS_SCHEMA.plugin(setIncrementalVersion);
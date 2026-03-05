import { MAGIC_NUMBERS, MONGODB_CONSTANTS } from '@shared/constants';
import { setIncrementalVersion } from '@shared/helpers';
import * as bcrypt from 'bcrypt';
import { IndexDirection, Schema, Types } from 'mongoose';
import { IRefreshToken } from './refresh-token.interface';

export const REFRESH_TOKENS_SCHEMA = new Schema<IRefreshToken>(
  {
    user: {
      type: Types.ObjectId,
      ref: MONGODB_CONSTANTS.USERS.MODEL,
      autopopulate: true,
      required: true
    },
    tokenHash: {
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
    },
  },
  {
    timestamps: true,
  },
);

REFRESH_TOKENS_SCHEMA.index({ user: MAGIC_NUMBERS.N_1 as IndexDirection }, { unique: false });
REFRESH_TOKENS_SCHEMA.plugin(require('mongoose-autopopulate'));
REFRESH_TOKENS_SCHEMA.plugin(setIncrementalVersion);

REFRESH_TOKENS_SCHEMA.pre<IRefreshToken>('save', async function () {
  const salt = await bcrypt.genSalt(MAGIC_NUMBERS.N_10);
  const hash = await bcrypt.hash(this.tokenHash, salt);
  this.tokenHash = hash;
});

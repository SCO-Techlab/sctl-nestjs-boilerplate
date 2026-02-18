import { MAGIC_NUMBERS, MONGODB_CONSTANTS } from '@shared/constants';
import { setIncrementalVersion } from '@shared/helpers';
import * as bcrypt from 'bcrypt';
import { IndexDirection, Schema, Types } from 'mongoose';
import { IUser } from './users.interface';

export const USERS_SCHEMA = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: false,
      lowercase: true
    },
    personalName: {
      type: String,
      required: false,
      lowercase: true
    },
    active: {
      type: Boolean,
      required: true,
      default: false,
    },
    emailConfirmed: {
      type: Boolean,
      required: false,
      default: false,
    },
    role: {
      type: Types.ObjectId,
      ref: MONGODB_CONSTANTS.ROLES.MODEL,
      autopopulate: true,
      required: true
    },
    pwdRecoveryToken: {
      type: String,
      required: false,
      default: null,
    },
    pwdRecoveryDate: {
      type: Date,
      required: false,
      default: null,
    },
    extension: {
      type: Schema.Types.Mixed,
      required: false,
      default: {},
    }
  },
  {
    timestamps: true,
  },
);

USERS_SCHEMA.index({ email: MAGIC_NUMBERS.N_1 as IndexDirection }, { unique: true });
USERS_SCHEMA.index({ userName: MAGIC_NUMBERS.N_1 as IndexDirection }, { unique: true });
USERS_SCHEMA.plugin(require('mongoose-autopopulate'));
USERS_SCHEMA.plugin(setIncrementalVersion);

USERS_SCHEMA.pre<IUser>('save', async function () {
  const salt = await bcrypt.genSalt(MAGIC_NUMBERS.N_10);
  const hash = await bcrypt.hash(this.password, salt);
  this.password = hash;
});

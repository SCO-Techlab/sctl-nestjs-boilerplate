import { MONGODB_CONSTANTS, setIncrementalVersion } from '@core/mongodb';
import { MAGIC_NUMBERS } from '@shared/constants';
import { IndexDirection, Schema, Types } from 'mongoose';
import { IRole } from './roles.interface';

export const ROLES_SCHEMA = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      uppercase: true
    },
    permissions: {
      type: [Types.ObjectId],
      ref: MONGODB_CONSTANTS.PERMISSIONS.MODEL,
      autopopulate: true,
      required: false,
      default: []
    }
  },
  {
    timestamps: true,
  },
);

ROLES_SCHEMA.index({ name: MAGIC_NUMBERS.N_1 as IndexDirection }, { unique: true });
ROLES_SCHEMA.plugin(require('mongoose-autopopulate'));
ROLES_SCHEMA.plugin(setIncrementalVersion);
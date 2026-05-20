import { setIncrementalVersion } from '@core/mongodb/helpers';
import { MAGIC_NUMBERS } from '@core/shared/constants';
import { COLLECTIONS } from '@shared/constants';
import { IRole } from '@shared/interfaces';
import { IndexDirection, Schema, Types } from 'mongoose';

export const ROLES_SCHEMA = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      uppercase: true
    },
    permissions: {
      type: [Types.ObjectId],
      ref: COLLECTIONS.PERMISSIONS.MODEL,
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
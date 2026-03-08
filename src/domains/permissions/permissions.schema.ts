import { MAGIC_NUMBERS } from '@shared/constants';
import { setIncrementalVersion } from '@shared/helpers';
import { IndexDirection, Schema } from 'mongoose';
import { PERMISSION_TYPE } from './permissions.enum';
import { IPermission } from './permissions.interface';

export const PERMISSIONS_SCHEMA = new Schema<IPermission>(
  {
    name: {
      type: String,
      required: true,
      uppercase: true
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(PERMISSION_TYPE),
      index: true
    }
  },
  {
    timestamps: true,
  },
);

PERMISSIONS_SCHEMA.index(
  {
    name: MAGIC_NUMBERS.N_1 as IndexDirection,
    type: MAGIC_NUMBERS.N_1 as IndexDirection
  },
  { unique: true }
);
PERMISSIONS_SCHEMA.plugin(setIncrementalVersion);
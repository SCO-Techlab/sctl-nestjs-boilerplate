import { setIncrementalVersion } from '@core/mongodb';
import { MAGIC_NUMBERS } from '@core/shared/constants';
import { PERMISSION_TYPE } from '@shared/enums';
import { IPermission } from '@shared/interfaces';
import { IndexDirection, Schema } from 'mongoose';

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
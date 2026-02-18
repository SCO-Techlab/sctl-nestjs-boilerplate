import { Schema } from 'mongoose';
import { IPermission } from './permissions.interface';
import { PERMISSION_TYPE } from './permissions.enum';

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

PERMISSIONS_SCHEMA.index({ name: 1, type: 1 }, { unique: true });
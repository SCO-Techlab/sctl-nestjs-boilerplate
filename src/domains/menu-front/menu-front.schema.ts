import { MONGODB_CONSTANTS, setIncrementalVersion } from '@core/mongodb';
import { MAGIC_NUMBERS } from '@shared/constants';
import { IndexDirection, Schema, Types } from 'mongoose';
import { IMenuFront } from './menu-front.interface';

export const MENU_FRONT_SCHEMA = new Schema<IMenuFront>(
  {
    label: {
      type: String,
      required: false,
      default: null
    },
    separator: {
      type: Boolean,
      required: false,
      default: false
    },
    icon: {
      type: String,
      required: false,
      default: null
    },
    routerLink: {
      type: String,
      required: false,
      default: null
    },
    items: {
      type: [Schema.Types.Mixed],
      required: false,
      default: null
    },
    roles: {
      type: [Types.ObjectId],
      ref: MONGODB_CONSTANTS.ROLES.MODEL,
      autopopulate: true,
      required: false,
      default: null
    },
    order: {
      type: Number,
      required: true,
    }
  },
  {
    timestamps: true,
  },
);

MENU_FRONT_SCHEMA.index({ order: MAGIC_NUMBERS.N_1 as IndexDirection }, { unique: true });
MENU_FRONT_SCHEMA.plugin(require('mongoose-autopopulate'));
MENU_FRONT_SCHEMA.plugin(setIncrementalVersion);
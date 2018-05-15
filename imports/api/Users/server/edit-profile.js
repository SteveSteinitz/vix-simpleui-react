/* eslint-disable consistent-return */

import { Meteor } from 'meteor/meteor';
import {updateUser} from './updateUser';

let action;

const editProfile = ({ userId, profile }, promise) => {
  try {
    action = promise;
    updateUser(userId, profile, action);
    action.resolve();
  } catch (exception) {
    action.reject(`[editProfile.handler] ${exception}`);
  }
};

export default options =>
  new Promise((resolve, reject) =>
    editProfile(options, { resolve, reject }));

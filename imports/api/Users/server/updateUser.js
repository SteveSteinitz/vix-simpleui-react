/* eslint-disable consistent-return */

import { Meteor } from 'meteor/meteor';

export const updateUser = (userId, { emailAddress, profile }, action) => {
  try {
    Meteor.users.update(userId, {
      $set: {
        'emails.0.address': emailAddress,
        profile,
      },
    });
  } catch (exception) {
    action.reject(`[editProfile.updateUser] ${exception}`);
  }
};

// SJS - for updating a single key in the user profile
// note key can be dot notation, e.g. profile.name.first
export const updateUserField = (action, userId, key, value) => {
  const objectForUpdate = {};
  if (value) {
    objectForUpdate[`${key}`] = value;
  }
  else {
    objectForUpdate[`${key}`] = true;
  }
  objectForUpdate[`${key}`] = value;
  try {
    if (value) {
      Meteor.users.update(userId, {$set: objectForUpdate});
    }
    else {
      Meteor.users.update(userId, {$unset: objectForUpdate});
    }
  } catch (exception) {
    action.reject(`[editProfile.updateUserProfileItem] ${exception}`);
  }
};

let action;

// Save GreenID Verification ID
const saveGreenidVerificationId = ({ userId, verificationId }, promise) => {
  try {
    action = promise;
    updateUserField(action, userId, 'profile.greenidVerificationId', verificationId);
    action.resolve();
  } catch (exception) {
    action.reject(`[saveGreenidVerificationId.handler] ${exception}`);
  }
};

export const saveGreenidVerificationIdPromise = options =>
  new Promise((resolve, reject) =>
    saveGreenidVerificationId(options, { resolve, reject }));

// Save GreenID Outcome State
const saveGreenidOutcomeState = ({ userId, outcome }, promise) => {
  try {
    action = promise;
    updateUserField(action, userId, 'profile.greenidOutcomeState', outcome);
    action.resolve();
  } catch (exception) {
    action.reject(`[saveGreenidOutcomeState.handler] ${exception}`);
  }
};

export const saveGreenidOutcomeStatePromise = options =>
  new Promise((resolve, reject) =>
    saveGreenidOutcomeState(options, { resolve, reject }));

// Update User Details
const addDetails = ({ userId, userDetails }, promise) => {
  try {
    action = promise;
    updateUser(userId, userDetails, action);
    action.resolve();
  } catch (exception) {
    action.reject(`[addDetails.handler] ${exception}`);
  }
};

export const addDetailsPromise = options =>
  new Promise((resolve, reject) =>
    addDetails(options, { resolve, reject }));


/*

obsolete

const saveTempPasswordUnencrypted = ({ userId, password }, promise) => {
  console.log('saveTempPasswordUnencrypted running');
  try {
    action = promise;
    updateUserField(userId, 'tempPassword', password, action);
    action.resolve();
  } catch (exception) {
    action.reject(`[saveTempPasswordUnencrypted.handler] ${exception}`);
  }
};

export const saveTempPasswordUnencryptedPromise = options =>
  new Promise((resolve, reject) =>
    saveTempPasswordUnencrypted(options, { resolve, reject }));

*/

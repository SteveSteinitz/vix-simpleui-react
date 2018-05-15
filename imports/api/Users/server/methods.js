import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';

import editProfile from './edit-profile';
import {
  saveGreenidVerificationIdPromise,
  saveGreenidOutcomeStatePromise,
  addDetailsPromise
} from './updateUser';
import sendContactFormEmail from './send-contact-form-email';
import rateLimit from '../../../modules/rate-limit';

function userDetailsCheckFormat () {
  return {
    emailAddress: String,
    profile: {
      name: {
        first: String,
        last: String,
      },
      dob: Match.Maybe(String),
      flatNumber: Match.Maybe(String),
      streetNumber: String,
      streetName: String,
      streetType: String,
      suburb: String,
      state: String,
      greenidVerificationId: Match.Maybe(String),
      greenidOutcomeState: Match.Maybe(String),
    },
  };
}

Meteor.methods({
  // these two supplied by Pup
  'users.sendVerificationEmail':
  function usersSendVerificationEmail() {
    return Accounts.sendVerificationEmail(this.userId);
  },

  'users.editProfile':
  function usersEditProfile(profile) {
    check(profile, {
      emailAddress: String,
      profile: {
        name: {
          first: String,
          last: String,
        },
      },
    });

    return editProfile({ userId: this.userId, profile })
      .then(response => response)
      .catch(
        (exception) => {
          throw new Meteor.Error('500', exception);
        }
      );
  },

  // for SettingsTwo where we get name, address, date of birth
  'users.addDetails':
  function usersAddDetails(userDetails) {
    check(
      userDetails,
      userDetailsCheckFormat()
    );

    return addDetailsPromise({ userId: this.userId, userDetails })
      .then(response => response)
      .catch(
        (exception) => {
          throw new Meteor.Error('500', exception);
        }
      );
  },

  // for SettingsTwo where GreenID returns a verification id
  'users.saveGreenidVerificationId':
  function usersSaveGreenidVerificationId(verificationId) {
    check(verificationId, Match.Maybe(String));
    return saveGreenidVerificationIdPromise({ userId: this.userId, verificationId })
      .then(response => response)
      .catch(
        (exception) => {
          throw new Meteor.Error('500', exception);
        }
      );
  },

  // for SettingsTwo to save (or clear) the GreenID 'Outcome State'
  'users.saveGreenidOutcomeState':
  function saveGreenidOutcomeState(outcome) {
    check(outcome, Match.Maybe(String));
    return saveGreenidOutcomeStatePromise({ userId: this.userId, outcome })
      .then(response => response)
      .catch(
        (exception) => {
          throw new Meteor.Error('500', exception);
        }
      );
  },

  'contact.sendMessage':
  function doSendContactFormEmail(emailObject) {
    check(
      emailObject,
      {
        emailFrom: String,
        firstNameFrom: String,
        to: String,
        subject: String,
        message: String,
      },
    );

    return sendContactFormEmail(emailObject)
      .then(response => response)
      .catch(
        (exception) => {
          throw new Meteor.Error('500', exception);
        }
      );

    // return sendContactFormEmail(emailObject);
  },
});

rateLimit({
  methods: [
    'users.sendVerificationEmail',
    'users.editProfile',
  ],
  limit: 5,
  timeRange: 1000,
});

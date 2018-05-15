import { Meteor } from 'meteor/meteor';

Meteor.publish(
  'users.editProfile',
  function usersProfile() {
    const result = Meteor.users.find(
      this.userId,
      {
        fields: {
          emails: 1,
          greenidVerificationId: 1, // SJS
          profile: 1,
          services: 1,
        },
      }
    );
    return result;
  }
);

Meteor.publish(
  'users.greenidVerificationId',
  function usersProfile() {
    const result = Meteor.users.find(
      this.userId,
      {
        fields: {
          greenidVerificationId: 1, // SJS
        },
      }
    );
    return result;
  }
);

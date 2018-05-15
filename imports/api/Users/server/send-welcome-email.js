import { Meteor } from 'meteor/meteor';
import sendEmail from '../../../modules/server/send-email';
import getOAuthProfile from '../../../modules/get-oauth-profile';

export default (options, user) => {
  const OAuthProfile = getOAuthProfile(options, user);

  const applicationName = Meteor.settings.public.applicationName; // 'Application Name';
  const returnAddress = Meteor.settings.public.email;

  const firstName = OAuthProfile ? OAuthProfile.name.first : options.profile.name.first;
  const emailAddress = OAuthProfile ? OAuthProfile.email : options.email;
  const tempPassword = OAuthProfile ? null : options.tempPassword;

  return sendEmail(
    {
      to: emailAddress,
      from: `${applicationName} <${returnAddress}>`,
      subject: `[${applicationName}] Welcome, ${firstName}!`,
      template: 'welcome',
      templateVars: {
        applicationName,
        firstName,
        tempPassword,
        welcomeUrl: Meteor.absoluteUrl('identify'), // documents'), // e.g., returns http://localhost:3000/documents
      },
    }
  )
    .catch((error) => {
      throw new Meteor.Error('500', `${error}`);
    });
};

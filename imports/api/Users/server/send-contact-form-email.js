import { Meteor } from 'meteor/meteor';
import sendEmail from '../../../modules/server/send-email';

export default (
  emailObject,
  // user
) => {
  const applicationName = Meteor.settings.public.applicationName;
  const firstName = emailObject.firstNameFrom;
  const subject = `${emailObject.subject} (from ${firstName} via ${applicationName} contact form)`;

  return sendEmail(
    {
      to: emailObject.to,
      from: emailObject.emailFrom,
      subject,
      template: 'contact',
      templateVars: {
        applicationName,
        firstName: emailObject.firstNameFrom,
        message: emailObject.message,
      },
    }
  ).catch((error) => {throw new Meteor.Error('500', `${error}`);});
};


/*
export const sendContactFormEmailPromise = options =>
  new Promise((resolve, reject) =>
    sendContactFormEmail(options, { resolve, reject }));
*/

/*
  const OAuthProfile = getOAuthProfile(options, user);

  const applicationName = Meteor.settings.public.applicationName; // 'Application Name';
  const returnAddress = Meteor.settings.public.email;

  const firstName = OAuthProfile ? OAuthProfile.name.first : options.profile.name.first;
  const emailAddress = OAuthProfile ? OAuthProfile.email : options.email;
  const tempPassword = OAuthProfile ? null : options.tempPassword;
  */

import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import getPrivateFile from './get-private-file';
import templateToText from './handlebars-email-to-text';
import templateToHTML from './handlebars-email-to-html';

const sendEmail = (options, { resolve, reject }) => {
  /*
  console.log (
    'sendEmail-function options - \n',
    `to: ${options.to}\n`,
    `from: ${options.from}\n`,
    `text: ${options.text.substring(0, 34)}\n`,
    `html: ${options.html.substring(0, 55)}\n`,
    `template: ${options.template}\n`,
    `templateVars: ${options.templateVars}\n`,
  );
  */
  try {
    Meteor.defer(
      () => {
        Email.send(options);
        resolve();
      }
    );
  }
  catch (exception) {
    reject(exception);
  }
};

export default (
  {
    text,
    html,
    template,
    templateVars,
    ...rest
  }
) => {
  /*
  console.log (
    'sendEmail-promise arguments - \n',
    `to: ${rest.to}\n`,
    `from: ${rest.from}\n`,
    `subject: ${rest.subject}\n`,
    `text: ${text ? text.substring(0, 34) : 'undefined'}\n`,
    `html: ${html ? html.substring(0, 55) : 'undefined'}\n`,
    `template: ${template}\n`,
    `templateVars: ${templateVars}\n`,
  );
  */
  if (text || html || template) {
    return new Promise((resolve, reject) => {
      const calculatedText =
        template ?
          templateToText(
            getPrivateFile(`email-templates/${template}.txt`),
            (templateVars || {})
          ) :
          text;
      const calculatedHtml =
        template ?
          templateToHTML(
            getPrivateFile(`email-templates/${template}.html`),
            (templateVars || {})
          ) :
          html;
      /*
      console.log (
        'sendEmail-promise calculated arguments - \n',
        `calculatedText: ${calculatedText.substring(0, 34)}\n`,
        `calculatedHtml: ${calculatedHtml.substring(0, 55)}\n`
      );
      */
      sendEmail({
        ...rest,
        text: calculatedText,
        html: calculatedHtml,
      }, { resolve, reject });
    });
  }
  console.log ('sendEmail - throwing');
  throw new Error('Please pass an HTML string, text, or template name to compile for your message\'s body.');
};

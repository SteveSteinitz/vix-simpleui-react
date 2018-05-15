import seeder from '@cleverbeagle/seeder';
import xml2json from 'xml2json';
import objectPath from 'object-path';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { HTTP } from 'meteor/http';
import Documents from '../../api/Documents/Documents';

const documentsSeed = userId => ({
  collection: Documents,
  environments: ['development', 'staging'],
  noLimit: true,
  modelCount: 5,
  model(dataIndex) {
    return {
      owner: userId,
      title: `Document #${dataIndex + 1}`,
      body: `This is the body of document #${dataIndex + 1}`,
    };
  },
});

seeder(Meteor.users, {
  environments: ['development', 'staging'],
  noLimit: true,
  data: [{
    email: 'admin@admin.com',
    password: 'password',
    profile: {
      name: {
        first: 'Andy',
        last: 'Warhol',
      },
    },
    roles: ['admin'],
    data(userId) {
      return documentsSeed(userId);
    },
  }],
});

const greenIDSoapRequest = function greenIDSoapRequest (
  shouldUseTestingEnvironment,
  accountName,
  password,
  soapBody
) {
  let greenidServiceUrl;
  const soapEnvelope = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
        xmlns:dyn="http://dynamicform.services.registrations.edentiti.com/"> 
        <soapenv:Header/> 
        <soapenv:Body> 
        ${soapBody}
        </soapenv:Body> 
      </soapenv:Envelope>`
  if (shouldUseTestingEnvironment) {
    greenidServiceUrl = 'https://test-au.vixverify.com/Registrations-Registrations/DynamicFormsServiceV3?WSDL';
  }
  else {
    greenidServiceUrl = 'https://au.vixverify.com/Registrations-Registrations/DynamicFormsServiceV3?wdsl';
  }
  try {
    let response = HTTP.call(
      'POST',
      greenidServiceUrl,
      {
        headers: {
          'content-type': 'text/xml'
        },
        content: soapEnvelope
      }
    );
    const responseJson = xml2json.toJson(response.content, {object: true});
    return responseJson;
  }
  catch (exception) {
    throw new Meteor.Error('500', exception);
  }
};

Meteor.methods (
  {
    recaptcha: function recaptchaVerify(clientGoogleRecaptchaResponse) {
      check(clientGoogleRecaptchaResponse, String);
      // console.log ('client recaptcha response =', clientGoogleRecaptchaResponse);
      const googleRecaptchaApiSecretKey = Meteor.settings.private.reCaptcha.secretKey;
      const googleRecaptchaApiVerifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
      const googleRecaptchaApiVerifyParams = `?secret=${googleRecaptchaApiSecretKey}&response=${clientGoogleRecaptchaResponse}`

      const serverGoogleRecaptchaResponse = HTTP.call(
        'POST',
        `${googleRecaptchaApiVerifyUrl}${googleRecaptchaApiVerifyParams}`
      );
      // console.log ('recaptcha server result =', serverGoogleRecaptchaResponse);
      const result = !!serverGoogleRecaptchaResponse.data.success;
      return result;
    },

    getGreenidVerificationToken: function getGreenidVerificationToken (verificationId) {
      check(verificationId, String);
      const shouldUseTestEnv = true;
      const accountName = Meteor.settings.public.GreenID.name;
      const password = Meteor.settings.public.GreenID.name
      const soapBody = `
        <dyn:getVerificationToken> 
          <accountId>${accountName}</accountId> 
          <password>${password}</password> 
          <verificationId>${verificationId}</verificationId> 
           <extraData> 
            <name/> 
            <value/> 
          </extraData> 
        </dyn:getVerificationToken>
      `;

      const verificationTokenResponse =
            greenIDSoapRequest(
              shouldUseTestEnv,
              accountName,
              password,
              soapBody
            );
      const verificationToken =
        objectPath.get(   // https://github.com/mariocasciaro/object-path
          verificationTokenResponse,
          [
            'env:Envelope',
            'env:Body',
            'ns2:getVerificationTokenResponse',
            'return'
          ]
        );
      return verificationToken;
    }
  }
);

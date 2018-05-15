### Vix Verify GreenID SimpleUI Rect

Integrating with the soap-based Vix Verify 'SimpleUI' person-identification system can present challenges in a React environment.  Hopefully, this example will save someone some time and headaches.

See the Identify component located in /imports/ui/pages/Identify.  In particular see GreenIdSimpleUI class which abstracts the SimpleUI making it more friendly to React.  Also see the server utility methods in /imports/startup/server/fixtures.js, greenIDSoapRequest and getGreenidVerificationToken.

Indentify and IdentifyPresentation are the actual React components (using the container-presentation idea).

DateOfBirth is a bit of fun to simplify birthdate entry.

Besides my custom Contact form and the Google reacaptcha, the authentication components are modified versions of the delightful [Pup](http://cleverbeagle.com/pup) default components.

Built on the Meteor-based framework, [Pup](http://cleverbeagle.com/pup)

User Schema
```
  "emails": [
    {
      "address": "test.com.au",
      "verified": true|false
    }
  ],
  "profile": {
    "name": {
      "first": "John Henry",
      "last": "Doe"
    },
    "dob": "05/11/1986",
    "flatNumber": "optional",
    "streetNumber": "100",
    "streetName": "Happy",
    "streetType": "Lane",
    "suburb": "Chatswood",
    "state": "NSW"
  },
  "greenidVerificationId": "8CHARS08"
```

For development MAIL_URL is defined in serttings, but for deployment it needs to be in the env section of mup.js

### Install and Run

You'll need some account credentials to run this: 
- Google Recaptcha (for the signup page etc)
- SMTP server (for the welcome email, forgot password...)
- Vix GreenID test account (not sure how easy this is to get)

Put the credentials in the development and deployment settings.
- settings-development.json
- deploy/settings.json

Make copies of these files as starting points for the above:
- default.settings-development.json
- default.deploy/settings.json

Note that the former files are included in .gitignore to avoid accidently pushing credentials.


Then

[install meteor](https://www.meteor.com/install) 

and finally

```
npm install
meteor  --settings settings-development.json
```

### Deployment

```cd .deploy```

check configuration in mup.js then

```../node_modules/.bin/mup deploy```

to view logs

```../node_modules/.bin/mup logs -f```

feel free to add path-to-project/node_modules/.bin to .bashprofile

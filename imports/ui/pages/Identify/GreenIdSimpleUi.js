import { Meteor } from 'meteor/meteor';

export class GreenIdSimpleUi
{
  constructor(
    accountName,
    password,
    formId,
    divId,
    errorCallback,
    registerCallback,
    validationCallback,
    sessionCompleteCallback,
    submitCallback,
    sessionCancelCallback,
    isConfigurationCompleteCallback,
    messageForNoOutcomeStatus,
    debug
  ) {
    this.accountName = accountName;
    this.password = password;
    this.formId = formId;
    this.divId = divId;
    this.onError = errorCallback;
    this.onRegister = registerCallback;
    this.onValidation = validationCallback;
    this.onSessionComplete = sessionCompleteCallback;
    this.onSubmit = submitCallback;
    this.onSessionCancel = sessionCancelCallback;
    this.onConfigurationComplete = isConfigurationCompleteCallback;
    this.noIdStatusMessage = messageForNoOutcomeStatus;
    this.debug = debug;
  }

  loadScripts() {
    function loadScriptPromise(scriptPath) {
      return new Promise((resolve, reject) => {
        $.getScript(
          scriptPath,
          (err, script) => {
            if (err) {
              reject(err); // promise reject
              console.log('loadScriptPromise error:', err);
            }
            else {
              resolve(script); // promise resolve
            }
          }
        );
      });
    }

    const greenidJQueryUrl = 'https://code.jquery.com/jquery-1.11.1.min.js';
    const greenidConfigUrl = 'https://simpleui-au.vixverify.com/df/javascripts/greenidConfig.js';
    const greenidUiUrl = 'https://simpleui-au.vixverify.com/df/javascripts/greenidui.min.js';
    const self = this;
    loadScriptPromise(greenidJQueryUrl)
      .then(() => loadScriptPromise(greenidConfigUrl))
      .then(() => loadScriptPromise(greenidUiUrl))
      .then(() => {self.greenidLoaded = true;})
      .catch(error => console.log('caught loadScriptPromise error:', error));
    this.outcomes = {
      VERIFIED: [
        'Verified',
        'Identity successfully verified'],
      VERIFIED_ADMIN: [
        'Verified (by admin)',
        'manually verified through the admin panel'],
      VERIFIED_WITH_CHANGES: [
        'Verified with changes',
        'Verified against the specified rule set, however some minor changes were made to the data in order to get the result.'],
      IN_PROGRESS: [
        'In progress',
        'Not yet verified, but further checks may be attempted'],
      PENDING: [
        'Pending review',
        'Verified pending further action by an administrato'],
      LOCKED_OUT: [
        'Locked out',
        'Locked out for further attempts. Depends on customer lock out rules. By default there are no lock out rules'],
    };
    this.noIdStatusMessage = this.noIdStatusMessage;
  }

  setOptions () {
    // Use greenidConfig.setOverrides() to override values from the greenidConfig.js file
    // greenidConfig.setOverrides({'enable_save_and_complete_later' : false});
    window.greenidConfig.setOverrides({enable_upload: false});
    window.greenidConfig.setOverrides({showDialogWhenNoSourcesLeft: false});
    window.greenidConfig.setOverrides({intro_title: '<h2>Identity Verification</h2>'});
    window.greenidConfig.setOverrides(
      {
        medicaredvs_showBlueCard: false,
        medicaredvs_showYellowCard: false
      }
    );
    window.greenidConfig.setOverrides({cancel_button_text: 'Complete your application Offline'});
  }

  configureUIDoIt() {
    // The setup function initialises the greenID Simple UI and passes in key variables,
    // such as the div ID where Simple UI will be injected and the ID of your form.
    // A full list of parameters is available at https://vixverify.atlassian.net/wiki/spaces/GREEN/pages/8880338/Using+the+SimpleUI

    // console.log ('GreenidSimpleUI setting up for new Registration');
    window.greenidUI.setup({
      environment: 'test',
      formId: this.formId,
      frameId: this.divId,
      errorCallback: this.onError,
      registerCallback: this.onRegister,
      sessionCompleteCallback: this.onSessionComplete,
      country: 'usethiscountry',
      debug: this.debug,
      preSubmitValidationCallback: this.onValidation,
      submitCallback: this.onSessionComplete,
    });
    this.setOptions();
    this.onConfigurationComplete();
  }

  configureForNewRegistration() {
    const self = this;
    const interval = setInterval(
      () => {
        // if(document.readyState === 'complete') {
        if (self.greenidLoaded) {
          clearInterval(interval);
          self.configureUIDoIt();
        }
      },
      144
    );
  }

  showDoIt(verificationToken) {
    console.log ('GreenidSimpleUI setting up for resuming individual');
    window.greenidUI.setup({
      environment: 'test',
      frameId: this.divId,
      debug: this.debug,
      errorCallback: this.onError,
      sessionCompleteCallback: this.onSessionComplete,
      // sourceAttemptCallback: onSourceAttempt,
      sessionCancelledCallback: this.onSessionCancel,
      // preSubmitValidationCallback: myValidator
    });
    this.setOptions();

    window.greenidUI.show(this.accountName, this.password, verificationToken);
  }

  show(verificationToken) {
    const self = this;
    const interval = setInterval(
      () => {
        // if(document.readyState === 'complete') {
        if (self.greenidLoaded) {
          clearInterval(interval);
          self.showDoIt(verificationToken);
        }
      },
      144
    );
  }

  getVerificationToken (verificationId, callback) {
    console.log('calling meteor method getGreenidVerificationToken');
    Meteor.call('getGreenidVerificationToken', verificationId, (error, response) => {
      if (error) {
        console.log('greenid.getVerificationToken: error getting Greenid Verification Token:', error);
        callback(error);
      } else {
        console.log('greenid.getVerificationToken: got Greenid Verification Token:', response);
        callback(null, response);
        // Loads over the GreenID loading modal - Bert.alert('Details Added', 'success');
      }
    });
  }

  humanReadableOutcomeState(outcome, shouldReturnLongDescription) {
    const outcomeIndex = shouldReturnLongDescription ? 1 : 0;
    const selectedOutcome = this.outcomes[outcome];
    let result = this.noIdStatusMessage;
    if (selectedOutcome) {
      result = selectedOutcome[outcomeIndex];
    }
    return result;
  }
}

/* eslint-disable no-underscore-dangle */

import React from 'react';
// import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Row, Col, Button } from 'react-bootstrap';
import Spinner from 'react-spinner';
import _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import {
  // createContainer
  withTracker
} from 'meteor/react-meteor-data';
import {DT} from '/imports/modules/utilities';
import {IdentifyPresentation} from './IdentifyPresentation';

import {valid, validate} from '../../../modules/validate';
import {GreenIdSimpleUi} from './GreenIdSimpleUi';

import './Identify.scss';

class Identify extends React.Component {
  constructor(props) {
    super(props);
    // const {user} = props;
    DT.autoBind (this, React.Component.prototype); // make sure 'this' is the instance, for all methods

    this.detailsFormId = 'detailsFormId';
    this.greenidDivId = 'greenid-div';
    this.detailsFormIdToBlockGreenid = 'notDetailsFormID';

    this.isFormValid = false; // instantaneous version of state variable - for GreenID race conditions

    // this.debugPreventResume = false;

    this.state = {forceRedrawKey: 1};
    /*
    this.state = {
      isGreenidConfigurationComplete: false,
      isGreenidLoading: false,
      isFormValid: this.isFormValid,

      givenNames: profile.name.first,
      surname: profile.name.last,
      dob: profile.dob,
      flatNumber: profile.flatNumber,
      streetNumber: profile.streetNumber,
      streetName: profile.streetName,
      streetType: profile.streetType,
      suburb: profile.suburb,
      state: profile.state,
      greenidVerificationId: profile.greenidVerificationId,
      greenidOutcomeState: profile.greenidOutcomeState || 'No Outcome',
      showingGreenid: false,
      isUserDataDirty: false,
    };
    */

    this.greenidSettings = Meteor.settings.public.GreenID; // this should be moved to private, server-only.  Maybe the server creates and returns a configured greenid object

    this.greenid = new GreenIdSimpleUi(
      this.greenidSettings.name,
      this.greenidSettings.password,
      this.detailsFormId,
      this.greenidDivId,
      this.greenidOnError,
      this.greenidOnRegister,
      this.greenidOnValidation,
      this.greenidOnSessionComplete,
      this.greenidOnSubmit,
      this.greenidOnSessionCancel,
      this.greenidOnConfigurationComplete,
      'Add Identifying Information',
      false, // debug-level verbose logging
    );

    this.greenid.loadScripts();
  }

  incrementForceRedrawKey () {
    let {forceRedrawKey} = this.state;
    forceRedrawKey += 1; // force creating a new dob component
    this.setState (
      {
        forceRedrawKey,
      }
    );
    console.log (
      'setStateToUserValues - forceRedrawKey incremented to ',
      forceRedrawKey
    );
  }

  setStateToUserValues() {
    const {profile} = this.props.user;
    this.incrementForceRedrawKey ();
    this.setState (
      {
        givenNames: profile.name.first,
        surname: profile.name.last,
        flatNumber: profile.flatNumber,
        streetNumber: profile.streetNumber,
        streetName: profile.streetName,
        streetType: profile.streetType,
        suburb: profile.suburb,
        addressState: profile.state,
        greenidVerificationId: profile.greenidVerificationId,
        greenidOutcomeState: profile.greenidOutcomeState,
        // showingGreenid: false,
        isUserDataDirty: false,
        // isReturningIndividual: !!profile.greenidVerificationId,

        dob: profile.dob,
      }
    );
    // if (profile.greenidVerificationI) {
    //   this.setState ({isReturningIndividual: true});
    // }
  }

  componentWillMount() {
    this.setStateToUserValues();
  }

  componentDidMount() {
    this.greenid.configureForNewRegistration(); // otherwise Submit button never replaces spinner
    this.setupFormValidation();
  }

  onChange(event) {
    // const field = event.target.name;
    const {name, value} = event.target;
    this.setIsFormValid (valid(this.form));
    this.setUserDataDirty (true);
    // console.log ('onChange = isFormValid = ', this.isFormValid);
    return this.setState ({[name]: value});
  }

  dobDidChange(dob) {
    this.setState({dob});
    this.setUserDataDirty(true);
  }

  getUserType(user) {
    const userToCheck = user;
    delete userToCheck.services.resume;
    const service = Object.keys(userToCheck.services)[0];
    return service === 'password' ? 'password' : 'oauth';
  }

  greenidOnRegister (
    verificationId,
    // verificationTokenObject // single key: 'verificationToken' 'for future expansion'
  ) {
    // console.log(
    // 'greenID registered:',
    // verificationId,
    // verificationTokenObject.verificationToken);
    if (verificationId) {
      this.greenidKeepVerificationId(
        verificationId,
        true // save to DB
      );
    }
  }

  greenidKeepVerificationId(
    verificationId, // don't leave verificationId undefined, use null to clear
    shouldSaveToDatabase
  ) {
    this.setState ({greenidVerificationId: verificationId});
    if (shouldSaveToDatabase) {
      Meteor.call(
        'users.saveGreenidVerificationId',
        verificationId,
        (error) => {
          if (error) {
            Bert.alert(`error saving greenidVerificationId ${error.reason}`, 'danger');
          }
          else {
            // console.log(
            // `greenidRegister: success ${verificationId === null ?
            // 'clearing' : 'saving'} greenidVerificationId`);
          }
        },
      );
    }
  }

  greenidKeepOutcomeState(
    outcome, // don't leave outcome undefined, use null to clear
    shouldSaveToDatabase
  ) {
    this.setState({greenidOutcomeState: outcome});
    if (shouldSaveToDatabase) {
      Meteor.call(
        'users.saveGreenidOutcomeState',
        outcome,
        (error) => {
          if (error) {
            Bert.alert(`error saving greenidOutcomeState ${error.reason}`, 'danger');
            console.log('error saving greenidOutcomeState', error.reason);
          }
          else {
            // console.log('greenidRegister: success saving greenidOutcomeState');
          }
        },
      );
    }
  }

  greenidSharedReturnHandling() {
    // Does housekeeping on return from GreenID.
    // This must only(?) be called on the last callback
    // otherwise, it never redraws our content and the
    // submit button never replaces the spinner
    // this.setState ({showingGreenid: false});
    this.contentDiv.style.visibility = 'initial'; // unhide - the whole content area is hidden when GreenId takes over
    this.greenid.configureForNewRegistration(); // otherwise Submit button never replaces spinner
    this.incrementForceRedrawKey ();
    this.setupFormValidation();
  }

  // GreenID Callbacks

  greenidOnValidation () {
    let result = false;
    if (this.greenidShouldStartRegistration()) {
      this.setState ({isGreenidLoading: false});
      // returning false aborts the GreenID session
      result = this.isFormValid && !this.greenidShouldShowReturningIndividual();
      /*
      console.log(
        'greenidOnValidation callback: \nthis.state.dob =',
        this.state.dob,
        '\nthis.isFormValid =',
        this.isFormValid,
        '\nresult =',
        result
      );
      */
    }
    return result;
  }

  greenidOnSessionComplete (verificationToken, overallState) {
    // console.log('greenidOnSessionComplete:', verificationToken, overallState);
    this.greenidKeepOutcomeState(
      overallState,
      true // save to DB
    );
    this.greenidSharedReturnHandling();
  }

  greenidOnSubmit (verificationToken, overallState) {
    // console.log('greenidOnSubmit token:', verificationToken, 'state:', overallState);
    this.greenidKeepOutcomeState(
      overallState,
      true // save to DB
    );
  }

  greenidOnSessionCancel (verificationToken, overallState) {
    console.log('greenidOnSessionCancel :', verificationToken, overallState);
    this.greenidKeepOutcomeState(
      overallState,
      true // save to DB
    );
    this.greenidSharedReturnHandling();
  }

  greenidOnError (verificationToken, errorName) {
    // console.log('greenidOnError token:', verificationToken, 'error:', errorName);
    Bert.alert(`Identification System Error: ${errorName}`, 'warning');
    this.greenidSharedReturnHandling();
  }

  // End GreenID Callbacks

  greenidExistingVerificationId() {
    const verificationId = this.state.greenidVerificationId;
    return verificationId;
  }

  greenidOnConfigurationComplete() {
    // console.log(
    // 'greenidOnConfigurationComplete - setting isGreenidConfigurationComplete true');
    this.setState (
      {
        isGreenidConfigurationComplete: true,
      },
    );
  }

  greenidShowReturningIndividual() {
    let verificationToken;
    // console.log('greenidExistingVerificationId = ', this.verificationId);
    const getVerificationTokenCallback = (error, response) => {
      if (error) {
        console.log('error getting verification token');
      }
      else {
        verificationToken = response;
        this.greenid.show(verificationToken);
      }
    };
    this.greenid.getVerificationToken(
      this.state.greenidVerificationId,
      getVerificationTokenCallback);
  }

  greenidHumanReadableOutcomeState (shouldReturnLongDescription) {
    return this.greenid.humanReadableOutcomeState(
      this.state.greenidOutcomeState,
      shouldReturnLongDescription
    );
  }

  userInfo () {
    const {user} = this.props;
    const profile = {
      name: {
        first: this.state.givenNames,
        last: this.state.surname,
      },
      dob: this.state.dob,
      flatNumber: this.state.flatNumber,
      streetNumber: this.state.streetNumber,
      streetName: this.state.streetName,
      streetType: this.state.streetType,
      suburb: this.state.suburb,
      state: this.state.addressState,
      greenidVerificationId: this.state.greenidVerificationId || undefined,
      greenidOutcomeState: this.state.greenidOutcomeState || undefined,
    };
    const userInfo = {
      emailAddress: user.emails[0].address, // need the existing email or it fails with Match Error
      profile,
    };
    return userInfo;
  }

  setUserDataDirty (isDirty) {
    if (isDirty !== this.state.isUserDataDirty) {
      this.setState(
        {
          isUserDataDirty: isDirty,
          // isReturningIndividual: false,
        }
      );
      if (isDirty) {
        // clear resume info and save (and maybe configure
        // greenid to show registration on submit)
        // Will need to save these if we allow form reset, or,
        // null them at a later point
        this.greenidKeepVerificationId(
          null,
          false // don't write it to DB
        );
        this.greenidKeepOutcomeState(
          null,
          false // don't write it to DB
        );
      }
    }
  }

  setupFormValidation () {
    const component = this;

    validate(
      component.form,
      {
        rules: component.validatorRules(),
        messages: component.validatorMessages(),
        submitHandler(form, event) {
          event.preventDefault();
          component.handleSubmit(form, event);
        },
      },
    );

    this.setIsFormValid (valid(this.form));
  }

  setIsFormValid (isValid) {
    this.isFormValid = isValid;
    this.setState ({isFormValid: isValid});
  }

  validatorRules() {
    const rules = {
      givenNames: {
        required: true,
      },
      surname: {
        required: true,
      },
      dobYear: {
        required: true,
        minlength: '4',
        maxlength: '4'
      },
      streetNumber: {
        required: true,
      },
      streetName: {
        required: true,
      },
      streetType: {
        required: true,
      },
      suburb: {
        required: true,
      },
      addressState: {
        required: true,
      },
    };
    return rules;
  }

  validatorMessages() {
    const messages = {
      givenNames: {
        required: 'What\'s your first name?',
      },
      surname: {
        required: 'What\'s your last name?',
      },
      dobDay: {
        min: 'Date - 1 to 31',
        max: 'Date - 1 to 31',
      },
      dobYear: {
        required: 'Year of birth',
        minlength: 'Four digits: 1985',
        maxlength: 'Four digits: 1985',
      },
      streetNumber: {
        required: 'What\'s your street number?',
      },
      streetName: {
        required: 'What\'s your street name?',
      },
      streetType: {
        required: 'What\'s your street type?',
      },
      suburb: {
        required: 'What\'s your suburb?',
      },
      addressState: {
        required: 'What\'s your state?',
      },
    };
    return messages;
  }

  // These three methods determine what form submit does and the Submit button title

  greenidShouldShowReturningIndividual () {
    const result = (
      this.state.greenidVerificationId &&
      !this.debugPreventResume &&
      !this.shouldSaveUserDetails ()
    );
    return result;
  }

  greenidShouldStartRegistration () {
    const result = (
      !this.shouldSaveUserDetails() &&
      !this.greenidShouldShowReturningIndividual ()
    );
    return result;
  }

  shouldSaveUserDetails () {
    const result = this.state.isUserDataDirty;
    return result;
  }

  // End of methods determining what form submit does and the Submit button title

  submitButtonTitle() {
    let result;
    if (
      this.state.isFormValid &&
      this.shouldSaveUserDetails()
    ) {
      result = 'Save Details';
    }
    else if (this.greenidShouldShowReturningIndividual()) {
      result = 'Resume Identification Process';
    }
    else if (this.greenidShouldStartRegistration()) {
      result = 'Begin Identification Process';
    }
    else {
      result = 'Please Correct Errors';
    }
    return result;
  }

  handleSubmit( // jquery-validation calls this only if the form is valid
    form,
    event
  ) {
    if (this.shouldSaveUserDetails()) {
      event.preventDefault();
      Meteor.call(
        'users.addDetails',
        this.userInfo(),
        (error) => {
          if (error) {
            Bert.alert(error.reason, 'warning');
          }
          else {
            this.setUserDataDirty (false);
            // console.log('handleSubmit: success saving details');
            // Alert loads over the top of the GreenID loading modal
            Bert.alert('Save Successful', 'success', 'fixed-bottom');
          }
        }
      );
    }
    else {
      this.contentDiv.style.visibility = 'hidden'; // display = 'none'; doesn't ever re-appear
      // this.setState ({showingGreenid: true});
    }
  }

  handleSubmitButtonClick(event) { // runs regardless of validation state
    event.preventDefault();
    if (this.greenidShouldShowReturningIndividual()) {
      // console.log('showing returning individual');
      this.greenidShowReturningIndividual();
    }
    /*
    else {
      console.log (
        'handleSubmitButtonClick - not showing returning individual,'
        'isReturningIndividual =',
        this.state.isReturningIndividual,
        'greenidVerificationId =',
        this.state.greenidVerificationId);
    }
    */
    const component = this;
    this.setIsFormValid(valid(component.form));
  }

  cancelChanges(event) {
    event.preventDefault();
    // console.log ('Identify.cancelChanges');
    this.setStateToUserValues();
  }

  // For Signin with Facebook, Google... Not currently used
  renderOAuthUser(subscriptionLoading, user) {
    return !subscriptionLoading ? (
      <div className="OAuthProfile">
        {Object.keys(user.services).map(service => (
          <div key={service} className={`LoggedInWith ${service}`}>
            <img src={`/${service}.svg`} alt={service} />
            <p>{`You're logged in with ${_.capitalize(service)} using the email address ${user.services[service].email}.`}</p>
            <Button
              className={`btn btn-${service}`}
              href={{
                facebook: 'https://www.facebook.com/settings',
                google: 'https://myaccount.google.com/privacy#personalinfo',
                github: 'https://github.com/settings/profile',
              }[service]}
              target="_blank"
            >
              Edit Profile on {_.capitalize(service)}
            </Button>
          </div>
        ))}
      </div>) : <div />;
  }

  renderPasswordUser(subscriptionLoading) {
    const {
      givenNames,
      surname,
      flatNumber,
      streetNumber,
      streetName,
      streetType,
      suburb,
      addressState,
      forceRedrawKey,
      dob,
      isGreenidLoading,
      isGreenidConfigurationComplete,
      isUserDataDirty
    } = this.state;
    // dob can be some kind of proxy object after a change
    // console.log ('renderPasswordUser - dob = ', dob);
    return !subscriptionLoading ? (
      <div>
        <IdentifyPresentation
          givenNames={givenNames || ''}
          surname={surname || ''}

          flatNumber={flatNumber || ''}
          streetNumber={streetNumber || ''}
          streetName={streetName || ''}
          streetType={streetType || ''}
          suburb={suburb || ''}
          addressState={addressState || ''}

          onChange={this.onChange}

          forceRedrawKey={forceRedrawKey}
          dob={typeof dob === 'string' ? dob : ''}
          onDobChange={this.dobDidChange}
        />

        <Row>
          <Col xs={8}>
            <div style={{height: '55px', width: '55px'}}>
              { isGreenidLoading ||
                !isGreenidConfigurationComplete ? <Spinner /> :
                <Button
                  type="submit"
                  bsStyle="success"
                >
                  {this.submitButtonTitle()}
                </Button>
              }
            </div>
          </Col>
          <Col xs={4}>
            <div className="pull-right">
              { isUserDataDirty &&
                <Button
                  type="button"
                  onClick={this.cancelChanges}
                  bsStyle="default"
                >
                  Cancel Changes
                </Button>
              }
            </div>
          </Col>
        </Row>
      </div>
    ) : (
      <div style={{height: '144px', width: '144px'}}>
        <Spinner />
      </div>
    );
  }

  renderProfileFormFields(subscriptionLoading, user) {
    return !subscriptionLoading ? ({
      password: this.renderPasswordUser,
      oauth: this.renderOAuthUser,
    }[this.getUserType(user)])(subscriptionLoading, user) : <div />;
  }

  renderForm(subscriptionLoading, user) {
    return (
      <div
        key={this.state.forceRedrawKey}
        className="Profile"
        ref={(contentDiv) => {this.contentDiv = contentDiv;}}
      >
        <Row>
          <Col xs={12} sm={8} md={6}>
            <h4 className="page-header">Name, Date of Birth, Address</h4>
            <form
              id={this.detailsFormId}
              ref={(form) => {this.form = form;}}
              onSubmit={event => this.handleSubmitButtonClick(event)}
            >
              {this.renderProfileFormFields(subscriptionLoading, user)}

              <input
                type="hidden"
                id="accountId"
                name="accountId"
                value={this.greenidSettings.name}
              />
              <input
                type="hidden"
                id="apiCode"
                name="apiCode"
                value={this.greenidSettings.password}
              />
              <input
                type="hidden"
                id="ruleId"
                name="ruleId"
                value="default"
              />
              <input
                type="hidden"
                id="usethiscountry"
                value="AU"
                name="country"
              />
            </form>
            <p>
              Identity Verification Status:&nbsp;
              <strong>
                {this.greenidHumanReadableOutcomeState()}
              </strong>
            </p>
          </Col>
        </Row>
      </div>
    );
  }

  render() {
    const { subscriptionLoading, user } = this.props;
    return (
      <div>
        <div id={this.greenidDivId} />
        {this.renderForm(subscriptionLoading, user)}
      </div>
    );
  }
}

Identify.propTypes = {
  subscriptionLoading: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired,
};

function createIdentifyContainer() {
  const result = withTracker(
    () => {
      const subscription = Meteor.subscribe('users.editProfile');
      return {
        subscriptionLoading: !subscription.ready(),
        user: Meteor.user(),
      };
    }
  )(Identify);
  return result;
}

export default createIdentifyContainer();


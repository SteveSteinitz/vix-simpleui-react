import React from 'react';
import { Row, Col, FormGroup, ControlLabel, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
// import { Link } from 'react-router-dom';
import Recaptcha from 'react-recaptcha';
import Spinner from 'react-spinner';

import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Bert } from 'meteor/themeteorchef:bert';
import {DT} from '/imports/modules/utilities';
// import OAuthLoginButtons from '../../components/OAuthLoginButtons/OAuthLoginButtons';
// import AccountPageFooter from '../../components/AccountPageFooter/AccountPageFooter';
import {
  // valid,
  validate
} from '../../../modules/validate';

import './Contact.scss';

class Contact extends React.Component {
  constructor(props) {
    super(props);

    DT.autoBind (this, React.Component.prototype); // make sure 'this' is the instance, for all methods

    $.getScript('http://www.google.com/recaptcha/api.js'); // without this react-recaptcha doesn't work

    this.state = {
      isValidCaptcha: false,
      formKey: 0,
    };
  }

  componentDidMount() {
    this.setUpValidation();
  }

  doSetUpValidation (interval) {
    const component = this;

    const theForm = component.form;

    if (!theForm) {
      console.warn('doSetupValidation - undefined form');
    }
    else {
      // console.log('doSetupValidation - configuring');
      this.isValidationInitialized = true;
      clearInterval(interval);
      validate(
        theForm,
        {
          rules: {
            firstName: {
              required: true,
            },
            emailAddress: {
              required: true,
              email: true,
            },
            subject: {
              required: true,
            },
            message: {
              required: true,
            },
          },
          messages: {
            firstName: {
              required: 'What is your first name.',
            },
            emailAddress: {
              required: 'Need an email address here.',
              email: 'Is this email address correct?',
            },
            subject: {
              required: 'Please summarize your message.',
            },
            message: {
              required: 'Please provide details.',
            },
          },
          submitHandler() { component.handleSubmit(); },
        }
      );
    }
  }

  setUpValidation() {
    const self = this;
    const interval = setInterval(
      () => {
        if (!this.props.subscriptionLoading && !this.isValidationInitialized) {
          self.doSetUpValidation(interval);
        }
      },
      144
    );
  }

  clearSubjectAndMessage () {
    this.subject.value = '';
    this.message.value = '';
    this.setState({formKey: this.state.formKey + 1});
  }

  handleSubmit() {
    const { history } = this.props;
    const self = this;

    const emailFrom = `${this.firstName.value} <${this.emailAddress.value}>`;
    const to = `${Meteor.settings.public.applicationName} <${Meteor.settings.public.email}>`;

    const emailObject = {
      to,
      firstNameFrom: this.firstName.value,
      emailFrom,
      subject: this.subject.value,
      message: this.message.value,
    };

    // T'would be nice to work out how to get a response back from the server
    // currently the response is undefined - which isn't surprising given the odd
    // server promise then handling: .then(response => response)

    Meteor.call (
      'contact.sendMessage',
      emailObject,
      (
        error,
        // response
      ) => {
        if (error) {
          console.warn(error);
          Bert.alert('Error sending message.', 'danger');
        }
        else {
          // console.log ('Contact form send repsponse =', response); // always null
          Bert.alert('Message sent. Thank you.', 'success');
          self.clearSubjectAndMessage();

          history.push(this.props.user ? '/identify' : '/');
        }
      }
    );
  }

  shouldEnableSubmitButton() {
    const result = (
      this.state.isValidCaptcha ||
      this.props.user
    );
    return result; // && this.state.didAcceptTerms;
  }

  render() {
    // reCaptcha callbacks
    const self = this;
    const { subscriptionLoading, user } = this.props;

    function captchaComplete (userResponseToken) {
      // console.log ('recaptcha response = ', userResponseToken);
      Meteor.call (
        'recaptcha',
        userResponseToken,
        (error, response) => {
          if (error) {
            console.warn(error);
          } else {
            // console.log ('google server recaptcha response =', response);
            self.setState({ isValidCaptcha: !!response });
          }
        }
      );
    }

    function onloadCallback () {
      // console.log ('recaptcha loaded');
    }

    function expiredCallback () {
      self.setState({ isValidCaptcha: false });
    }

    return !subscriptionLoading ?
      (
        <Row>
          <Col xs={12} sm={6} md={5} lg={4}>
            <h4 className="page-header">Contact Us</h4>
            <form
              ref={(form) => {this.form = form;}}
              onSubmit={event => event.preventDefault()}
              key={this.state.formKey}
            >
              <FormGroup>
                <ControlLabel>First Name</ControlLabel>
                <input
                  type="text"
                  name="firstName"
                  defaultValue={user ? user.profile.name.first : ''}
                  ref={(firstName) => {this.firstName = firstName;}}
                  className="form-control"
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Email Address</ControlLabel>
                <input
                  type="email"
                  name="emailAddress"
                  defaultValue={user ? user.emails[0].address : ''}
                  ref={(emailAddress) => {this.emailAddress = emailAddress;}}
                  className="form-control"
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Subject</ControlLabel>
                <input
                  type="text"
                  name="subject"
                  ref={(subject) => {this.subject = subject;}}
                  className="form-control"
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Message</ControlLabel>
                <textarea
                  name="message"
                  ref={(message) => {this.message = message;}}
                  className="form-control"
                />
              </FormGroup>
              {!user && (
                <div className="rc-container">
                  <Recaptcha
                    sitekey={Meteor.settings.public.reCaptcha.siteKey}
                    render="explicit"
                    verifyCallback={captchaComplete}
                    onloadCallback={onloadCallback}
                    expiredCallback={expiredCallback}
                  />
                </div>)
              }
              <div className="clearfix" />
              <FormGroup>
                <Button
                  disabled={!this.shouldEnableSubmitButton()}
                  type="submit"
                  bsStyle="success"
                >
                  Send
                </Button>
              </FormGroup>
            </form>
          </Col>
        </Row>
      ) :
      (
        <div style={{height: '144px', width: '144px'}}>
          <Spinner />
        </div>
      );
  }
}

Contact.propTypes = {
  subscriptionLoading: PropTypes.bool,
  user: PropTypes.object,
  history: PropTypes.object.isRequired,
};

function createContactContainer() {
  const result = withTracker(
    () => {
      const subscription = Meteor.subscribe('users.editProfile');
      return {
        subscriptionLoading: !subscription.ready(),
        user: Meteor.user(),
      };
    }
  )(Contact);
  return result;
}

export default createContactContainer();

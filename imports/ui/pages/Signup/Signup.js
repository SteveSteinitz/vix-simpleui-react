import React from 'react';
import { Row, Col, FormGroup, ControlLabel, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Recaptcha from 'react-recaptcha';
import generator from 'generate-password';

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Bert } from 'meteor/themeteorchef:bert';
import {DT} from '/imports/modules/utilities';
import OAuthLoginButtons from '../../components/OAuthLoginButtons/OAuthLoginButtons';
import AccountPageFooter from '../../components/AccountPageFooter/AccountPageFooter';
import {
  // valid,
  validate
} from '../../../modules/validate';

import './Signup.scss';

class Signup extends React.Component {
  constructor(props) {
    super(props);

    DT.autoBind (this, React.Component.prototype); // make sure 'this' is the instance, for all methods

    $.getScript('http://www.google.com/recaptcha/api.js'); // without this react-recaptcha doesn't work

    this.state = {
      isValidCaptcha: false,
      // didAcceptTerms: false,
    };
  }

  componentDidMount() {
    const component = this;

    validate(component.form, {
      rules: {
        emailAddress: {
          required: true,
          email: true,
        },
      },
      messages: {
        emailAddress: {
          required: 'Need an email address here.',
          email: 'Is this email address correct?',
        },
      },
      submitHandler() { component.handleSubmit(); },
    });
  }

  handleSubmit() {
    const { history } = this.props;

    const password = generator.generate(
      {
        length: 10,
        numbers: true,
        symbols: false,
        uppercase: true,
        excludeSimilarCharacters: true, // like upper case i and l
        exclude: '',
        strict: false, // include chars from each pool
      },
    );
    // console.log('auto-generated password =', password);

    Accounts.createUser(
      {
        email: this.emailAddress.value,
        password,
        tempPassword: password, // needed to immediately email it to the user, I think, because 'password' gets encrypted by the time onCreateUser is called
        profile: {
          name: {
            first: 'customer', // this.firstName.value,
            last: '', // this.lastName.value,
          },
        },
      },
      (createUserError) => {
        if (createUserError) {
          Bert.alert(createUserError.reason, 'danger');
          console.warn('call to Accounts.createUser gave', createUserError);
        }
        else {
          Meteor.call('users.sendVerificationEmail');
          Bert.alert('Welcome', 'success');
          history.push('/identify'); // '/documents');
        }
      }
    );
  }

  // Decided not to have an accept terms checkbox.  Clicking signup will do the trick.
  // handleAcceptTerms(event) {
  //   console.log('handleAcceptTerms - event =', event);
  //   this.setState({ didAcceptTerms: event.target.checked });
  // }

  // later validate reCaptcha and terms agree instead of disabling submit button
  shouldEnableSubmitButton() {
    return this.state.isValidCaptcha; // && this.state.didAcceptTerms;
  }

  render() {
    // reCaptcha callbacks
    const self = this;

    function captchaComplete (userResponseToken) {
      console.log ('recaptcha response = ', userResponseToken);
      Meteor.call (
        'recaptcha',
        userResponseToken,
        (error, response) => {
          if (error) {
            console.warn(error);
          } else {
            console.log ('google server recaptcha response =', response);
            self.setState({ isValidCaptcha: response });
          }
        }
      );
    }

    function onloadCallback () {
      console.log ('recaptcha loaded');
    }

    function expiredCallback () {
      self.setState({ isValidCaptcha: false });
    }

    return (<div className="Signup">
      <Row>
        <Col xs={12} sm={6} md={5} lg={4}>
          <h4 className="page-header">Sign Up</h4>
          <Row>
            <Col xs={12}>
              <OAuthLoginButtons
                services={[/* 'facebook', 'google' */]}
                emailMessage={{
                  offset: 97,
                  text: 'Sign Up with an Email Address',
                }}
              />
            </Col>
          </Row>
          <form
            ref={(form) => {this.form = form;}}
            onSubmit={event => event.preventDefault()}
          >
            <FormGroup>
              <ControlLabel>Email Address</ControlLabel>
              <input
                type="email"
                name="emailAddress"
                ref={(emailAddress) => {this.emailAddress = emailAddress;}}
                className="form-control"
              />
            </FormGroup>
            <div className="rc-container">
              <Recaptcha
                sitekey={Meteor.settings.public.reCaptcha.siteKey}
                render="explicit"
                verifyCallback={captchaComplete}
                onloadCallback={onloadCallback}
                expiredCallback={expiredCallback}
              />
            </div>
            <div className="clearfix" />
            <FormGroup>
              <ControlLabel>
                I agree to the <Link to="/terms">Terms of Service</Link>
              </ControlLabel>
              <Button
                type="submit"
                disabled={!this.shouldEnableSubmitButton()}
                bsStyle="success"
              >
                Sign Up
              </Button>
            </FormGroup>
            <AccountPageFooter>
              <p>Already have an account? <Link to="/login">Log In</Link>.</p>
            </AccountPageFooter>
          </form>
        </Col>
      </Row>
    </div>);
  }
}

Signup.propTypes = {
  history: PropTypes.object.isRequired,
};

export default Signup;

import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'react-bootstrap';
import { Accounts } from 'meteor/accounts-base';
import { Bert } from 'meteor/themeteorchef:bert';

class VerifyEmail extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  componentDidMount() {
    const { match, history } = this.props;
    Accounts.verifyEmail(match.params.token, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
        this.setState({ onError: `${error.reason}. Please try again.` });
      } else {
        setTimeout(() => {
          Bert.alert('All set, thank you', 'success');
          history.push('/identify'); // documents');
        }, 1500);
      }
    });
  }

  render() {
    return (<div className="VerifyEmail">
      <Alert bsStyle={!this.state.onError ? 'info' : 'danger'}>
        {!this.state.onError ? 'Verifying...' : this.state.onError}
      </Alert>
    </div>);
  }
}

VerifyEmail.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default VerifyEmail;

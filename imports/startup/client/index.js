import React from 'react';
import { render } from 'react-dom';
import { Meteor } from 'meteor/meteor';
import App from '../../ui/layouts/App/App';
import '../both/api';

import '../../ui/stylesheets/app.scss';

Meteor.startup(() => {
    // delete window.webkitStorageInfo; // doesn't help with the warnings
    // delete window.webkitIndexedDB; // ditto
    render(<App />, document.getElementById('react-root'));
  }
);

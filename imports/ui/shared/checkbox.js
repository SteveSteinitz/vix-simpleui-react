// Created by steinitz on 04 Oct 2017

import React from 'react';
import PropTypes from 'prop-types';
// import { ControlLabel } from 'react-bootstrap';

export const Checkbox = ({name, label, onChange, defaultChecked, className}) => (
  <div>
    <div key={name}>
      <label>
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          onChange={onChange}
          className  = {`${className}`}
        />
      </label>
    </div>
  </div>
);

Checkbox.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  defaultChecked: PropTypes.bool,
  className: PropTypes.string,
};

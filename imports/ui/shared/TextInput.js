// Created by steinitz on 04 Oct 2017

import React from 'react';
import PropTypes from 'prop-types';
import {
  // Row,
  // Col,
  FormGroup,
  ControlLabel,
  // Button
} from 'react-bootstrap';

export const TextInput = (
  {name, id, label, placeholder, onChange, value, className, inputRef}
) => (
  <FormGroup key={name}>
    <ControlLabel>{label}</ControlLabel>
    <input
      type="text"
      name={name}
      id={id || name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`${className} form-control`}
      ref={inputRef}
    />
  </FormGroup>
);

TextInput.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.string,
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  className: PropTypes.string,
};

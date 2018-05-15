import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, FormGroup, ControlLabel } from 'react-bootstrap';
import {DT} from '/imports/modules/utilities';
import { TextInput } from '../../shared/TextInput';

import './Identify.scss';
import {DateOfBirth} from './DateOfBirth';

export class IdentifyPresentation extends React.Component {
  constructor(props) {
    super(props);
    DT.autoBind (this, React.Component.prototype); // make sure 'this' is the instance, for all methods
  }

  render() {
    const {
      givenNames,
      surname,

      flatNumber,
      streetNumber,
      streetName,
      streetType,
      suburb,
      addressState,

      onChange,

      dob,
      onDobChange,
      forceRedrawKey,
    } = this.props;
    // console.log ('IdentifyPresentation - forceRedrawKey =', forceRedrawKey);
    return (
      <div>
        <Row>
          <Col xs={6}>
            <TextInput
              label="First Name"
              name="givenNames"
              value={givenNames}
              onChange={onChange}
            />
          </Col>
          <Col xs={6}>
            <TextInput
              label="Last Name"
              name="surname"
              value={surname}
              onChange={onChange}
            />
          </Col>
        </Row>
        <DateOfBirth
          key={forceRedrawKey}
          dob={dob}
          onDobChange={onDobChange}
        />
        <Row>
          <Col xs={6}>
            <TextInput
              label="Unit Number"
              name="flatNumber"
              value={flatNumber}
              onChange={onChange}
            />
          </Col>
          <Col xs={6}>
            <TextInput
              label="Street Number"
              name="streetNumber"
              value={streetNumber}
              onChange={onChange}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={6}>
            <TextInput
              label="Street Name"
              name="streetName"
              value={streetName}
              onChange={onChange}
            />
          </Col>
          <Col xs={6}>
            <FormGroup>
              <ControlLabel>Street Type</ControlLabel>
              <select
                name="streetType"
                id="streetType"
                className="form-control"
                value={streetType}
                onChange={onChange}
              >
                <option value="">Select your street type...</option>
                <option value="AVE">Avenue</option>
                <option value="CIR">Circle</option>
                <option value="CCT">Circuit</option>
                <option value="CL">Close</option>
                <option value="CT">Court</option>
                <option value="CRES">Crescent</option>
                <option value="DR">Drive</option>
                <option value="ESP">Esplanade</option>
                <option value="EXP">Expressway</option>
                <option value="HWY">Highway</option>
                <option value="LANE">Lane</option>
                <option value="MWY">Motorway</option>
                <option value="PDE">Parade</option>
                <option value="PL">Place</option>
                <option value="RD">Road</option>
                <option value="SQ">Square</option>
                <option value="ST">Street</option>
                <option value="TCE">Terrace</option>
                <option value="WAY">Way</option>
              </select>
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col xs={6}>
            <TextInput
              label="Suburb"
              name="suburb"
              value={suburb}
              onChange={onChange}
            />
          </Col>
          <Col xs={6}>
            <FormGroup>
              <ControlLabel>State</ControlLabel>
              <select
                name="addressState"
                id="addressState"
                className="form-control"
                value={addressState}
                onChange={onChange}
              >
                <option value="">Select your State...</option>
                <option value="NSW">NSW</option>
                <option value="VIC">VIC</option>
                <option value="QLD">QLD</option>
                <option value="SA">SA</option>
                <option value="WA">WA</option>
                <option value="ACT">ACT</option>
                <option value="NT">NT</option>
                <option value="TAS">TAS</option>
              </select>
            </FormGroup>
          </Col>
        </Row>
      </div>
    );
  }
}

IdentifyPresentation.propTypes = {
  givenNames: PropTypes.string.isRequired,
  surname: PropTypes.string.isRequired,

  dob: PropTypes.string.isRequired,

  flatNumber: PropTypes.string.isRequired,
  streetNumber: PropTypes.string.isRequired,
  streetName: PropTypes.string.isRequired,
  streetType: PropTypes.string.isRequired,
  suburb: PropTypes.string.isRequired,
  addressState: PropTypes.string.isRequired,

  onChange: PropTypes.func.isRequired,
  onDobChange: PropTypes.func.isRequired,
  forceRedrawKey: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
};

//                 onSubmit={this.dayChange}

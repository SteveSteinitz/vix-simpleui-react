import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, FormGroup, ControlLabel } from 'react-bootstrap';
import {DT} from '/imports/modules/utilities';

// import './Identify.scss';

export class DateOfBirth extends React.Component {
  constructor(props) {
    super(props);
    DT.autoBind (this, React.Component.prototype); // make sure 'this' is the instance, for all methods
    this.state = {dob: props.dob};
    // console.log ('constructor - props.dob: ', props.dob);
  }

  componentWillMount () {
    let dateAsArray = this.props.dob.split('/');
    let day = dateAsArray[0];
    let month = dateAsArray[1];
    let year = dateAsArray[2];
    if (!month) {
      month = '01'; // init to Jan
      const dob = this.dobFromMonth (month); // also calculate the DD/MM/YYYY dob
      this.props.onDobChange(dob);
      this.setState(
        {
          dob,
        }
      );
      // console.log ('constructor - calculated this.state.dob: ', this.state.dob);
      // recalculate day, year
      dateAsArray = dob.split('/');
      day = dateAsArray[0];
      year = dateAsArray[2];
    }

    this.setState (
      {
        dobDay: Number(day), // remove leading zeros
        dobMonth: month,
        dobYear: year,
      }
    );
  }

  dobFromMonth (value) {
    let dob = this.state.dob;
    if (dob) {
      const dateArray = dob.split('/');
      dob = `${dateArray[0]}/${value}/${dateArray[2]}`;
      // console.log ('dobFromMonth - month = ', value, 'dateArray[0] = ', dateArray[0]);
      // console.log ('dobFromMonth - dob: ', dob);
    }
    else {
      dob = `01/${value}/`;
    }
    return dob;
  }

  monthChange(event) {
    const monthNumber = event.target.value;
    const dob = this.dobFromMonth (monthNumber);
    this.setState(
      {
        dobMonth: monthNumber,
        dob,
      }
    );
    // console.log ('monthChange - dob: ', dob);
    this.props.onDobChange(dob);
  }

  dayChange(event) {
    let dayNumber = event.target.value;
    if (dayNumber.length === 1 && dayNumber !== '0') {
      dayNumber = `0${dayNumber}`;
    }
    const dateArray = this.state.dob ? this.state.dob.split('/') : '//';
    const dob = `${dayNumber}/${dateArray[1]}/${dateArray[2]}`;
    this.setState(
      {
        dobDay: dayNumber,
        dob,
      }
    );
    // console.log ('dayChange - dob: ', dob);
    this.props.onDobChange(dob);
  }

  yearChange(event) {
    const yearNumber = event.target.value;
    if (yearNumber.length === 4) {
      let dob = this.state.dob;
      const dateArray = dob.split('/');
      dob = `${dateArray[0]}/${dateArray[1]}/${yearNumber}`;
      this.setState(
        {
          dobYear: yearNumber,
          dob,
        }
      );
      this.props.onDobChange(dob);
      // console.log ('dayChange - yearChange: ', dob);
    }
    else {
      // console.log ('no year change - too few digits');
    }
  }

  render() {
    return (
      <div>
        <input
          type="hidden"
          name="dob"
          id="dob"
          value={this.state.dob}
        />
        <Row>
          <Col xs={4}>
            <FormGroup>
              <ControlLabel>Day of Birth</ControlLabel>
              <input
                type="number"
                name="dobDay"
                defaultValue={this.state.dobDay}
                onBlur={this.dayChange}
                onChange={this.props.onDobChange}
                onSubmit={this.dayChange}
                min="1"
                max="31"
                className="form-control"
              />
            </FormGroup>
          </Col>
          <Col xs={4}>
            <FormGroup>
              <ControlLabel>Month</ControlLabel>
              <select
                name="dobMonth"
                id="dobMonth"
                className="form-control"
                value={this.state.dobMonth}
                onChange={this.monthChange}
              >
                <option value="01">Jan</option>
                <option value="02">Feb</option>
                <option value="03">Mar</option>
                <option value="04">Apr</option>
                <option value="05">May</option>
                <option value="06">Jun</option>
                <option value="07">Jul</option>
                <option value="08">Aug</option>
                <option value="09">Sep</option>
                <option value="10">Oct</option>
                <option value="11">Nov</option>
                <option value="12">Dec</option>
              </select>
            </FormGroup>
          </Col>
          <Col xs={4}>
            <FormGroup>
              <ControlLabel>Year</ControlLabel>
              <input
                type="number"
                name="dobYear"
                defaultValue={this.state.dobYear}
                placeholder="YYYY"
                onBlur={this.yearChange}
                onChange={this.props.onDobChange}
                className="form-control"
              />
            </FormGroup>
          </Col>
        </Row>
      </div>
    );
  }
}

DateOfBirth.propTypes = {
  dob: PropTypes.string.isRequired,
  onDobChange: PropTypes.func.isRequired,
};

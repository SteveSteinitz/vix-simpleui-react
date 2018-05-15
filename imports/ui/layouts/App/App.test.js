// Created by steinitz on 12 Oct 2017

import React from 'react';
// import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
// import toJson from 'enzyme-to-json';
import { describe, it } from 'enzyme';
import App from './App';

describe('Component: App', () => {
  it('should match its empty snapshot', () => {
    const tree = renderer.create(
      <App />
    ).toJson();

    expect(tree).toMatchSnapshot();
  });
});

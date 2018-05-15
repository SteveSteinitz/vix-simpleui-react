// Created by steinitz on 01 Nov 2017

import test from 'jest';
import sum from './sum';

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});

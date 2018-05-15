import React from 'react';
import { Button } from 'react-bootstrap';

import './Index.scss';

const Index = () => (
  <div className="Index">
    <img
      src="logo.png"
      alt="Logo"
    />
    <h1>Vix SimpleUI React Example</h1>
    <p>Buy Your First Bitcoin</p>
    <footer>
      <p>Bitcoin for Everyone <a href="http://apple.com.au"> More Information</a></p>
    </footer>
  </div>
);

export default Index;

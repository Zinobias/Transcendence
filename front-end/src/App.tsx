import React, { ReactNode } from 'react';
import './App.css';
import InputField from './components/InputField';

/*
  NOTES:

  React.FC functional Component
  Function Type Expressions (similar to arrow functions in javascript)

  The <span> tag is much like the <div> element, but <div> is a block-level 
  element and <span> is an inline element.

  spining element:
  <span className='spin-test'></span>
*/


const App: React.FC = () => {
  return (
    <div className="App"> 
      <span className="heading">Transendence</span>
      <InputField />
    </div>
  );
}

export default App;

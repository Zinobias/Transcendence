import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import './index.css';
import App from './App';
import { CookiesProvider } from "react-cookie";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
//<React.StrictMode>
<CookiesProvider>

  <BrowserRouter>
      <App />
  </BrowserRouter>

</CookiesProvider>
//</React.StrictMode>
);


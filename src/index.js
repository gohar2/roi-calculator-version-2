import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';

// Dynamically detect the base path from where index.html is located
// This works whether deployed to root (/), /ROI, or any subdirectory
const getBasename = () => {
  const pathname = window.location.pathname;
  
  // Known routes that should be removed to find the base
  const knownRoutes = ['/calculator-1', '/calculator-2'];
  
  // Check if pathname ends with a known route
  for (const route of knownRoutes) {
    if (pathname.endsWith(route) || pathname.endsWith(route + '/')) {
      // Remove the route part to get the base
      const base = pathname.replace(route, '').replace(/\/$/, '');
      return base || '/';
    }
  }
  
  // Check if pathname contains a known route (for cases like /ROI/calculator-1)
  for (const route of knownRoutes) {
    const routeIndex = pathname.indexOf(route);
    if (routeIndex > 0) {
      // Extract the base path before the route
      const base = pathname.substring(0, routeIndex).replace(/\/$/, '');
      return base || '/';
    }
  }
  
  // If no known route found, determine base from pathname
  // Remove trailing slash and 'index.html' if present
  let cleanPath = pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
  
  // If pathname is just '/' or empty, we're at root
  if (!cleanPath || cleanPath === '/') {
    return '/';
  }
  
  // Split path and get the first segment (the subdirectory)
  const pathParts = cleanPath.split('/').filter(part => part);
  
  // If we have path parts, the base is the first part
  if (pathParts.length > 0) {
    return '/' + pathParts[0];
  }
  
  return '/';
};

const basename = getBasename();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

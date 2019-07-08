import '@babel/polyfill';
import React from 'react';
import { render } from 'react-dom';
import focusSource from 'ally.js/style/focus-source';
import Router from './router';
import './app.css';

focusSource();

document.addEventListener('DOMContentLoaded', () => {
  render(<Router />, document.getElementById('app'));
});

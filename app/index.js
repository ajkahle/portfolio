import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { makeMainRoutes } from './routes';
import withRoot from './stylesheets/theme'
import './stylesheets/core.scss'

const routes  = makeMainRoutes();

ReactDOM.render(
  routes,
  document.getElementById('root')
);

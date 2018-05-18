import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import logo from './logo.png';
import history from './history';
import { Route, BrowserRouter,Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from './store/store';
import Header from "./components/header/header";
import Home from "./routes/home/home";
import About from "./routes/about/about";
import Contact from "./routes/contact/contact";
import Examples from "./routes/examples/examples";
import Loading from './routes/loading';
import classes from './stylesheets/default.scss';
import Favicon from 'react-favicon';
import Fade from '@material-ui/core/Fade';

const store = configureStore()


export const makeMainRoutes = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
          <Fade in={true} timeout={{enter:5000,exit:3000}}>
          <div>
            <Favicon url={logo}/>
            <Header/>
            <div className={classes.container}>
              <Switch>
                <Route exact path="/" component={Home}/>
                <Route exact path="/about" component={About}/>
                <Route exact path="/contact" component={Contact}/>
                <Route exact path="/examples" component={Examples}/>
              </Switch>
            </div>
          </div>
          </Fade>
      </BrowserRouter>
    </Provider>
  );
}

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';
import {withRoot} from '../../stylesheets/theme'
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withHandlers, lifecycle, withStateHandlers } from 'recompose';
import { withFirestore, withFirebase } from 'react-redux-firebase';
import { withRouter, Link } from 'react-router-dom'
import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import classes from './about.scss';
import Profile from './profile.jpg';

class About extends React.Component {
  constructor(props){
    super(props)
  }
  render(){
    var content = {
      heading1:"",
      heading2:"",
      title:"",
      subheading:"",
    },
    fade = false
    if(this.props.about){
      fade = true
      content = this.props.about.about.content
    }
    return (
      <Fade in={fade} timeout={{enter:5000,exit:3000}}>
        <Grid container>
          <Grid item md={4}>
            <Typography variant="display2" color="primary" gutterBottom>
            {content.heading1}
            </Typography>
            <Avatar src={Profile} className={classes.avatar}/>
          </Grid>
          <Grid item md={8}>
            <Typography variant="subheading" gutterBottom>
            {content.paragraph1}
            </Typography>
            <Typography variant="subheading" gutterBottom>
            {content.paragraph2}
            </Typography>
            <Typography variant="subheading" gutterBottom>
            {content.paragraph3}
            </Typography>
            <Typography variant="subheading" gutterBottom>
            {content.paragraph4}
            </Typography>
          </Grid>
        </Grid>
      </Fade>
    )
  }
}

const enhance = compose(
  withFirestore,
  withFirebase,
  withHandlers({
    loadData: props => err => {
      props.firestore.setListener({
            collection: 'pages',
            doc: 'about',
            storeAs: 'about'
          })
    },
    unloadData: props => err => {
      props.firestore.unsetListener({
            collection: 'pages',
            doc: 'about',
            storeAs: 'about'
          })
    }
  }),
  lifecycle({
    componentWillMount(){
      this.props.loadData()
    },
    componentWillUnmount(){
      this.props.unloadData()
    }
  }),
  connect(({ firestore }) =>{
    return {
    about: firestore.data.about
  }
  })
)

export default (withRoot(enhance(About)))

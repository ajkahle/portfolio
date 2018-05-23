import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Fade from '@material-ui/core/Fade';
import Card, { CardHeader, CardContent, CardActions } from '@material-ui/core/Paper';
import {withRoot} from '../../stylesheets/theme'
import { fadeTime } from '../../constants'
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withHandlers, lifecycle, withStateHandlers } from 'recompose';
import { withFirestore, withFirebase } from 'react-redux-firebase';
import { withRouter, Link } from 'react-router-dom'
import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import * as FontAwesome from 'react-icons/lib/fa'
import classes from './contact.scss';

class Contact extends React.Component {
  constructor(props){
    super(props)
  }
  render(){
    var content = {
      heading1:"",
      subheading:"",
      cards:[{width:false,icon:"FaBeer",link:"/"}]
    },
    fade = false
    if(this.props.contact){
      fade = true
      content = this.props.contact.contact.content
    }
    return (
      <Fade in={fade} timeout={fadeTime}>
      <div>
        <Typography variant="display2" color="primary">
        {content.heading1}
        </Typography>
        <Typography variant="subheading" gutterBottom>
        {content.subheading}
        </Typography>
        <Grid container className={classes.gridContainer}>
          {content.cards.map(function(d,i){
            return <Grid item md={d.width} key={i}>
              <a href={d.link} target="_blank">
              {React.createElement(FontAwesome[d.icon],{size:60,className:classes.icons})}
              </a>
            </Grid>
          })}
        </Grid>
        </div>
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
            doc: 'contact',
            storeAs: 'contact'
          })
    },
    unloadData: props => err => {
      props.firestore.unsetListener({
            collection: 'pages',
            doc: 'contact',
            storeAs: 'contact'
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
    contact: firestore.data.contact
  }
  })
)

export default (withRoot(enhance(Contact)))

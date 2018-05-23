import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';
import {withRoot} from '../../stylesheets/theme'
import { fadeTime } from '../../constants'
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withHandlers, lifecycle, withStateHandlers } from 'recompose';
import { withFirestore, withFirebase } from 'react-redux-firebase';
import { withRouter, Link } from 'react-router-dom'
import classes from './home.scss'


class Home extends React.Component {
  constructor(props){
    super(props)
  }
  render(){
    console.log(this.props)
    var content = {
      heading1:"",
      heading2:"",
      title:"",
      subheading:"",
    }
    if(this.props.home){
      content = this.props.home.home.content
    }
    return (
      <Fade in={true} timeout={fadeTime}>
        <div>
          <Typography variant="display4" color="primary">
          {content.heading1}
          </Typography>
          <Typography variant="display4" color="primary">
          {content.heading2}
          </Typography>
          <Typography variant="title" color="secondary">
          {content.title}
          </Typography>
          <Typography variant="subheading">
          {content.subheading}
          </Typography>
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
            doc: 'home',
            storeAs: 'home'
          })
    },
    unloadData: props => err => {
      props.firestore.unsetListener({
            collection: 'pages',
            doc: 'home',
            storeAs: 'home'
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
    home: firestore.data.home
  }
  })
)

export default (withRoot(enhance(Home)))

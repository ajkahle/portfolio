import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Fade from '@material-ui/core/Fade';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Divider from '@material-ui/core/Divider';
import {withRoot} from '../../stylesheets/theme'
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withHandlers, lifecycle, withStateHandlers } from 'recompose';
import { withFirestore, withFirebase } from 'react-redux-firebase';
import { withRouter, Link } from 'react-router-dom'
import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import * as FontAwesome from 'react-icons/lib/fa'
import {MdWeb} from 'react-icons/lib/md'
import classes from './examples.scss';

const colors = ['#0d47a1','#00c853','#ff4081','#fbc02d','#0d47a1','#00c853','#673ab7']
//const colors = ['#0d47a1','#00c853','#0d47a1','#ff4081','#00c853','#0d47a1','#ff4081']

class Report extends React.Component {
  constructor(props){
    super(props)
  }
  render(){
    var content = {
      heading1:"",
      subheading:"",
      cards:[{width:false,icon:"FaBeer",link:"/",name:"",dek:""}]
    },
    fade = false
    if(this.props.examples){
      fade = true
      content = this.props.examples.examples.content
    }
    return (
      <Fade in={fade} timeout={{enter:5000,exit:3000}}>
      <div>
        <Typography variant="display2" color="primary">
        {content.heading1}
        </Typography>
        <Typography variant="subheading" gutterBottom>
        {content.subheading}
        </Typography>
        <Grid container className={classes.gridContainer} spacing={40}>
          {content.cards.map(function(d,i){
            return <Grid item md={d.width} key={i}>
              <Card className={classes.card}>
                <CardContent className={classes.cardContent} style={{backgroundColor:colors[i]}}>
                  {React.createElement(FontAwesome[d.icon],{size:60,className:classes.icons})}
                  <Typography variant="title" className={classes.cardContentContent}>
                  {d.name}
                  </Typography>
                  <Typography variant="subheading" className={classes.cardContentContent}>
                  {d.dek}
                  </Typography>
                </CardContent>
                <Divider />
                <CardActions>
                  <Grid container>
                    <Grid item md={6}>
                      <a href={d.github} target="_blank" className={classes.cardLinks} style={{color:colors[i]}}>
                        <FontAwesome.FaGithub size={40} className={classes.linkIcon} style={{color:colors[i]}}/>
                        <Typography variant="subheading" style={{color:colors[i]}}>
                        View code
                        </Typography>
                      </a>
                    </Grid>
                    <Grid item md={6}>
                      <a href={d.link} target="_blank" className={classes.cardLinks} style={{color:colors[i]}}>
                        <MdWeb size={40} className={classes.linkIcon} style={{color:colors[i]}}/>
                        <Typography variant="subheading" style={{color:colors[i]}}>
                        View live app
                        </Typography>
                      </a>
                    </Grid>
                  </Grid>
                </CardActions>
              </Card>
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
            doc: 'examples',
            storeAs: 'examples'
          })
    },
    unloadData: props => err => {
      props.firestore.unsetListener({
            collection: 'pages',
            doc: 'examples',
            storeAs: 'examples'
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
    examples: firestore.data.examples
  }
  })
)

export default (withRoot(enhance(Report)))

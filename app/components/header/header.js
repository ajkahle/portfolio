import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Fade from '@material-ui/core/Fade';
import {withRoot} from '../../stylesheets/theme'
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withHandlers, lifecycle, withStateHandlers } from 'recompose';
import { withFirestore, withFirebase } from 'react-redux-firebase';
import { withRouter, Link } from 'react-router-dom'
import classes from './header.scss'


const styles = theme => ({
  root: {
    flexGrow: 1
  },
  flex: {
    flex: 1
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  },
  appBar: {
   zIndex: theme.zIndex.drawer + 1
 }
});

class MenuAppBar extends React.Component {
  constructor(props){
    super(props)
  }

  render() {

    var pages = [];

    if(this.props.pages!=undefined){
      pages = this.props.pages
    }

    return (
      <div className={classes.root}>
        <AppBar position="static" className={classes.appBar}>
        <Fade in={true} timeout={{enter:5000}}>
          <Toolbar>
              {pages.map(function(d,i){
                return <Button component={Link} key={i} to={d.path} className={classes.link}>
                  {d.text}
                </Button>
              })}
          </Toolbar>
          </Fade>
        </AppBar>
      </div>
    );
  }
}

MenuAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

const HeaderHOC = ({ pages }) => {
  return <MenuAppBar classes={classes} pages={pages}/>
}


const enhance = compose(
  withFirestore,
  withFirebase,
  withHandlers({
    loadData: props => err => {
      props.firestore.setListener({
            collection: 'pages',
            orderBy: ['order','asc']
          })
    },
    unloadData: props => err => {
      props.firestore.unsetListener({
            collection: 'pages',
            orderBy: ['order','asc']
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
    pages: firestore.ordered.pages
  }
  })
)

export default withRouter(withStyles(styles)(withRoot(enhance(HeaderHOC))))

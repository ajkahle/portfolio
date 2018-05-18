import React from 'react';
import { CircularProgress } from '@material-ui/core/CircularProgress';
import { Backdrop } from '@material-ui/core/Modal';
import { withStyles } from '@material-ui/core/styles';
import classes from './loading.scss'

class Loading extends React.Component {
  render(){
    return  <div>
            <CircularProgress className={classes.progress} size={100} color="secondary"/>
            <Backdrop className={classes.backdrop} open={true}/>
            </div>
  }
}

export default Loading

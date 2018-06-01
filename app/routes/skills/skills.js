import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Fade from '@material-ui/core/Fade';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import CardHeader from '@material-ui/core/CardHeader';
import Divider from '@material-ui/core/Divider';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import ListItemText from '@material-ui/core/ListItemText';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import Drawer from '@material-ui/core/Drawer';
import {withRoot} from '../../stylesheets/theme';
import { fadeTime } from '../../constants'
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withHandlers, lifecycle, withStateHandlers } from 'recompose';
import { withFirestore, withFirebase } from 'react-redux-firebase';
import { withRouter, Link } from 'react-router-dom'
import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import * as FontAwesome from 'react-icons/lib/fa'
import {MdWeb} from 'react-icons/lib/md'
import classes from './skills.scss';

//const colors = ['#0d47a1','#00c853','#ff4081','#fbc02d','#0d47a1','#00c853','#673ab7'];
const cardWidthXl = 3;
const cardWidthLg = 4;
const cardWidthMd = 6;
const cardWidthSm = 12;
const cardWidthXs = 12;

const colors = ['#0d47a1','#00c853','#0d47a1','#ff4081','#00c853','#0d47a1','#ff4081','#0d47a1']

const intersects = function(a, b) {
    var d = {};
    var results = [];
    for (var i = 0; i < b.length; i++) {
        d[b[i]] = true;
    }
    for (var j = 0; j < a.length; j++) {
        if (d[a[j]])
            results.push(a[j]);
    }
    return results;
}

class Skills extends React.Component {
  constructor(props){
    super(props)
  }
  state = {
    tags: [],
    drawer: false,
    skill:{
      name:"",
      details:[],
      examples:[]
    }
  };
  componentWillReceiveProps(){
    if(this.props.skills){
      this.setState({tags:this.props.skills.skills.content.tags})
    }
  }
  handleChange = event => {
   this.setState({ tags: event.target.value });
  };
  toggleDrawer = (skill,color) => () => {
    this.setState({drawer: !this.state.drawer,skill:skill,color:color});
  };
  render(){
    var content = {
      heading1:"",
      subheading:"",
      cards:[{width:false,icon:"FaBeer",link:"/",name:"",dek:"",tags:[]}],
      tags:[]
    },
    fade = false,
    tags = this.state.tags,
    toggleDrawer = this.toggleDrawer,
    skill = this.state.skill,
    color = this.state.color;

    if(!skill.examples){
      skill.examples = []
    }

    if(this.props.skills){
      fade = true
      content = this.props.skills.skills.content
    }
    return (
      <Fade in={fade} timeout={fadeTime}>
      <div>
      <Drawer className={classes.drawer} anchor="right" open={this.state.drawer} onClose={toggleDrawer(this.state.skill,this.state.color)}>
        <div className={classes.drawerHeader}>
          <Typography variant="display1" style={{color:this.state.color}}>
            {skill.name}
          </Typography>
        </div>
        <Divider style={{backgroundColor:this.state.color}}/>
        <div className={classes.drawerContent}>
          <div className={classes.skillInfo}>
            <Typography variant="body2" gutterBottom><strong>Years of Experience: </strong>{skill.years}</Typography>
            <Typography variant="body2" gutterBottom><strong>Skill Level: </strong>{skill.level}</Typography>
          </div>
          <ul>
          {skill.details.map(function(detail,i){
            return <div key={i}>
              <li className={classes.listItem}>
                <Typography variant="body2" key={i} gutterBottom>
                  {detail}
                </Typography>
              </li>
            </div>
          })}
          </ul>
          {(skill.examples.length>0) &&
            <div className={classes.skillInfo}>
              <Typography variant="title" gutterBottom>Relevant Examples</Typography>
              <ul>
                {skill.examples.map(function(example,i){
                  return <div key={i}>
                    <li className={classes.listItem}>
                      <a href={example.link}>
                        <Typography variant="body2" key={i} gutterBottom style={{color:color}}>
                          <strong>{example.name}</strong>
                        </Typography>
                      </a>
                      <Typography variant="body2" key={i} gutterBottom>
                        {example.text}
                      </Typography>
                    </li>
                  </div>
                })}
              </ul>
            </div>
          }
        </div>
      </Drawer>
      <Grid container>
        <Grid item xs={12} md={12} lg={9}>
          <Typography variant="display2" color="primary">
          {content.heading1}
          </Typography>
        </Grid>
        <Grid item xs={12} md={12} lg={9}>
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="tags">Tags</InputLabel>
            <Select
              multiple
              value={tags}
              onChange={this.handleChange}
              input={<Input id="tags" />}
              renderValue={selected => selected.join(', ')}
            >
              {content.tags.map(name => (
                <MenuItem key={name} value={name}>
                  <Checkbox checked={this.state.tags.indexOf(name) > -1} />
                  <ListItemText primary={name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subheading" gutterBottom>
          {content.subheading}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Grid container className={classes.gridContainer} spacing={40}>
            {content.cards.sort(function(a,b){
              if(a.name < b.name) return -1;
              if(a.name > b.name) return 1;
              return 0;
            }).map(function(d,i){
              var hidden = "none";
              if(intersects(d.tags,tags).length>0){
                hidden = "block"
              }

              return <Fade in={fade} timeout={{enter:2000,exit:2000}} key={i}>
              <Grid item xl={cardWidthXl} lg={cardWidthLg} md={cardWidthMd} sm={cardWidthSm} xs={cardWidthXs} key={i} style={{display:hidden}} onClick={toggleDrawer(d,colors[i % colors.length])}>
                <Card className={classes.card}>
                  <CardContent style={{backgroundColor:colors[i % colors.length]}}>
                    <Typography variant="title" className={classes.cardHeader}>
                    {d.name}
                    </Typography>
                  </CardContent>
                  <CardContent className={classes.cardContent} >
                    <Typography variant="subheading" style={{color:colors[i % colors.length]}}>
                    {d.dek}
                    </Typography>
                  </CardContent>
                  <Divider/>
                  <CardContent className={classes.cardTags} >
                    {d.tags.map(function(tag,i){
                      return <Chip label={tag} key={i} className={classes.chip}/>
                    })}
                  </CardContent>
                </Card>
              </Grid>
              </Fade>
            })}
          </Grid>
        </Grid>
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
            doc: 'skills',
            storeAs: 'skills'
          })
    },
    unloadData: props => err => {
      props.firestore.unsetListener({
            collection: 'pages',
            doc: 'skills',
            storeAs: 'skills'
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
    skills: firestore.data.skills
  }
  })
)

export default (withRoot(enhance(Skills)))

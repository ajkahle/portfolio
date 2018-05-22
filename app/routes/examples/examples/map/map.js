import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Fade from '@material-ui/core/Fade';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Divider from '@material-ui/core/Divider';
import {withRoot} from '../../../../stylesheets/theme'
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withHandlers, lifecycle, withStateHandlers } from 'recompose';
import { withFirestore, withFirebase } from 'react-redux-firebase';
import { withRouter, Link } from 'react-router-dom'
import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import * as FontAwesome from 'react-icons/lib/fa'
import {MdWeb} from 'react-icons/lib/md'
import classes from './map.scss';
import { scaleLinear } from 'd3-scale';
import { min,max } from 'd3-array';
import { select } from 'd3-selection';
import { geoAlbers, geoPath } from 'd3-geo'
import shapefile from '../../../../election_results.json'

const colors = {
  clinton_perc:["#d50000","white","#0d47a1"],
  vep_turnout:["#fafafa","#00c853"],
  ec:["#d50000","#0d47a1"]
}

const domain = {
  clinton_perc:[min(shapefile.features,function(d){return parseFloat(d.properties.clinton_perc)}),
    .5,
  max(shapefile.features,function(d){return parseFloat(d.properties.clinton_perc)})],
  vep_turnout:[min(shapefile.features,function(d){return parseFloat(d.properties.vep_turnout)}),
  max(shapefile.features,function(d){return parseFloat(d.properties.vep_turnout)})],
  ec:[min(shapefile.features,function(d){return parseFloat(d.properties.ec)}),
  max(shapefile.features,function(d){return parseFloat(d.properties.ec)})]
}

class Tooltip extends React.Component {
  constructor(props){
    super(props)
  }
  render(){
    <div className={classes.tooltip}>
      {this.props.content}
    </div>
  }
}

class Map extends React.Component {
  constructor(props){
    super(props)
    this.createMap = this.createMap.bind(this)
  }
  componentDidMount(){
    this.createMap()
  }
  componentDidUpdate(){
    this.updateMap()
  }
  createMap(){
    const node = this.node
    const projection = geoAlbers()
    const pathGenerator = geoPath().projection(projection)
    const mapDisplay = this.props.mapDisplay
    const colorScale = scaleLinear()
      .domain(domain[mapDisplay]).range(colors[mapDisplay])


    select(node)
      .selectAll("path")
        .data(shapefile.features)
        .enter().append("path")
          .attr("d",pathGenerator)
          .attr("class","shape")
          .attr("stroke","black")
          .attr("fill",function(d){
            return colorScale(parseFloat(d.properties[mapDisplay]))
          })
          .on("mousemove",function(d){
            

          })
  }
  updateMap(){
    const node = this.node
    const projection = geoAlbers()
    const pathGenerator = geoPath().projection(projection)
    const mapDisplay = this.props.mapDisplay
    const colorScale = scaleLinear()
      .domain(domain[mapDisplay]).range(colors[mapDisplay])

    select(node).selectAll("path")
    .attr("fill",function(d){
      return colorScale(parseFloat(d.properties[mapDisplay]))
    })
  }

  render() {
        return <svg ref={node => this.node = node}
        width={1000} height={500}>
        </svg>
     }
}

class MapExample extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      mapDisplay:"clinton_perc"
    }
  }
  handleChange = event => {
    this.setState({mapDisplay:event.target.value})
  }
  render(){
    var content = {
      heading1:"",
      subheading:"",
      cards:[{width:false,icon:"FaBeer",link:"/",name:"",dek:""}]
    },
    fade = false,
    state = this.state
    if(this.props.examples){
      fade = true
      content = this.props.examples.examples.content
    }
    return (
      <Fade in={fade} timeout={{enter:5000,exit:3000}}>
      <Grid container>
          <Grid item xs={4}>
            <Typography variant="display2" color="primary">
            {content.heading1}
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Map Display</FormLabel>
              <RadioGroup className={classes.radioRow} name="status" row={true} value={state.mapDisplay} onChange={this.handleChange}>
                <FormControlLabel className={classes.radio} value="clinton_perc" control={<Radio />} label="2016 Popular Vote" />
                <FormControlLabel className={classes.radio} value="vep_turnout" control={<Radio />} label="2016 Turnout" />
                <FormControlLabel className={classes.radio} value="ec" control={<Radio />} label="2016 Electoral College" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subheading" gutterBottom>
            {content.subheading}
            </Typography>
          </Grid>
        <Map mapDisplay={state.mapDisplay}/>
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

export default (withRoot(enhance(MapExample)))

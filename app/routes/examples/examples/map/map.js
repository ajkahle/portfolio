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
import { scaleLinear,scaleOrdinal } from 'd3-scale';
import { min,max } from 'd3-array';
import { select,event } from 'd3-selection';
import { geoAlbersUsa, geoPath } from 'd3-geo'
import { pie,arc } from 'd3-shape';
import Drawer from '@material-ui/core/Drawer';
import shapefile from '../../../../election_results.json'

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function numberToPercent(x) {
  return (x*100).toFixed(1).toString() + '%'
}

const colors = {
  clinton_perc:["#d50000","white","#0d47a1"],
  vep_turnout:["#fafafa","#00c853"],
  ec:["#d50000","#0d47a1"]
}

const pieColors = scaleOrdinal().domain(["trump_perc","clinton_perc","other"]).range(["#d50000","#0d47a1","#00c853"])

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
    return (this.props.display && <div className={classes.tooltip} style={{left:this.props.data.event.clientX+20,top:this.props.data.event.clientY-15}}>
      <Typography variant="title" color="primary">
        {this.props.data.data.name}
      </Typography>
      <Typography variant="body2" style={{color:colors.ec[this.props.data.data.ec]}}>
        {this.props.data.data.winner} Win
      </Typography>
      <Typography variant="body2">
        <strong>Electoral Votes: </strong>
        {this.props.data.data.electoral_votes}
      </Typography>
      <Typography variant="body2">
        <strong>Total 2016 Votes: </strong>
        {numberWithCommas(this.props.data.data.votes)}
      </Typography>
    </div>)
  }
}

class PieChart extends React.Component {
  constructor(props){
    super(props)
    this.createChart = this.createChart.bind(this)
  }
  createChart(){
    const node = this.node
    const arcCalc = arc().outerRadius(80).innerRadius(50)
    const pieCalc = pie().value(function(d){return d.value})
    const data = this.props.data

    const pieArc = select(node)
      .append("g")
      .attr("transform",function(d,i){
        return "translate("+100+","+100+")"
      })
      .selectAll(".arc")
        .data(pieCalc(data))
        .enter().append("g")
          .attr("class","arc")

    pieArc.append("path")
      .style("fill",function(d){
        return pieColors(d.data.name)
      })
      .attr("d",arcCalc)
  }
  componentDidMount(){
    this.createChart()
  }
  componentDidUpdate(){
    this.createChart()
  }
  render() {
        return <svg ref={node => this.node = node}
        width={200} height={200}>
        </svg>
     }
}

class StateDetail extends React.Component {
  constructor(props){
    super(props)
  }
  render(){
    var state = this.props.state
    return (
      <div>
        <div className={classes.drawerHeader}>
          <Typography variant="display1" color="primary">
            {state.name}
          </Typography>
        </div>
        <Divider color="primary"/>
        <div className={classes.drawerContent}>
          <Typography variant="title" gutterBottom>2016 Turnout Data</Typography>
            <Typography variant="body2" gutterBottom><strong>2016 Voting Eligible Population: </strong>{numberWithCommas(state.vep)}</Typography>
            <Typography variant="body2" gutterBottom><strong>2016 Total Votes: </strong>{numberWithCommas(state.votes)}</Typography>
            <Typography variant="body2" gutterBottom><strong>2016 Turnout %: </strong>{numberToPercent(state.vep_turnout)}</Typography>
          <Typography variant="title" gutterBottom>2016 Presidential Election Results</Typography>
            <PieChart data={[{name:"Clinton",value:state.clinton_perc},{name:"Trump",value:state.trump_perc},{name:"Other",value:(1-state.clinton_perc-state.trump_perc)}]}/>
        </div>
    </div>)
  }
}

class Map extends React.Component {
  constructor(props){
    super(props)
    this.createMap = this.createMap.bind(this)
  }
  handleClick = event => {
    this.props.handleClick(event)
  }
  componentDidMount(){
    this.createMap()
  }
  componentDidUpdate(){
    this.updateMap()
  }
  createMap(){
    console.log(this.props.containerWidth)
    const node = this.node
    const containerWidth = this.props.containerWidth
    const projection = geoAlbersUsa().scale(Math.min(containerWidth,1000)).translate([containerWidth / 2, Math.min(this.props.containerWidth*.6,500) / 2]);
    const pathGenerator = geoPath().projection(projection)
    const mapDisplay = this.props.mapDisplay
    const hover = this.props.hover
    const hoverOff = this.props.hoverOff
    const handleClick = this.handleClick
    const colorScale = scaleLinear()
      .domain(domain[mapDisplay]).range(colors[mapDisplay])

    select(node)
      .selectAll("path")
        .data(shapefile.features)
        .enter().append("path")
          .attr("d",pathGenerator)
          .attr("class",classes.path)
          .attr("stroke","black")
          .attr("fill",function(d){
            return colorScale(parseFloat(d.properties[mapDisplay]))
          })
          .on("mousemove",function(d){
            hover({data:d.properties,event:event})
          })
          .on("mouseout",function(d){
            hoverOff()
          })
          .on("click",function(d){
            handleClick(d.properties)
          })
  }
  updateMap(){
    const node = this.node
    const containerWidth = this.props.containerWidth
    const projection = geoAlbersUsa().scale(Math.min(containerWidth,1000)).translate([containerWidth / 2, Math.min(this.props.containerWidth*.6,500) / 2]);
    const pathGenerator = geoPath().projection(projection)
    const mapDisplay = this.props.mapDisplay
    const colorScale = scaleLinear()
      .domain(domain[mapDisplay]).range(colors[mapDisplay])

    select(node).selectAll("path")
      .attr("d",pathGenerator)
    .attr("fill",function(d){
      return colorScale(parseFloat(d.properties[mapDisplay]))
    })
  }

  render() {
        return <svg ref={node => this.node = node}
        width={this.props.containerWidth} height={Math.min(this.props.containerWidth*.6,500)}>
        </svg>
     }
}

class MapExample extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      mapDisplay:"clinton_perc",
      drawer:false,
      state:{},
      hoverShow:false
    }
  }
  handleChange = event => {
    this.setState({mapDisplay:event.target.value})
  }
  handleClick = event => {
    this.setState({state:event,drawer:true})
  }
  toggleDrawer = () => () => {
    this.setState({drawer:!this.state.drawer})
  }
  hover = event => {
    this.setState({hover:event,hoverShow:true})
  }
  hoverOff = () => {
    this.setState({hoverShow:false})
  }
  render(){
    var content = {
      heading1:"",
      subheading:"",
      cards:[{width:false,icon:"FaBeer",link:"/",name:"",dek:""}]
    },
    fade = false,
    state = this.state,
    toggleDrawer = this.toggleDrawer
    if(this.props.examples){
      fade = true
      content = this.props.examples.examples.content
    }
    return (
      <Fade in={fade} timeout={{enter:5000,exit:3000}}>
      <Grid container>
          <Grid item xs={4}>
            <Typography variant="display2" color="primary">
            Map Example
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
            2016 Election Results and Turnout Data
            </Typography>
          </Grid>
          <Tooltip data={this.state.hover} display={this.state.hoverShow}/>
          <Drawer className={classes.drawer} anchor="right" open={this.state.drawer} onClose={toggleDrawer()}>
            <StateDetail containerWidth={this.props.containerWidth} state={this.state.state}/>
          </Drawer>
          <Grid container>
            <Grid item md={8}>
              <Map containerWidth={this.props.containerWidth} mapDisplay={state.mapDisplay} handleClick={this.handleClick} hover={this.hover} hoverOff={this.hoverOff}/>
            </Grid>
            <Grid item md={4}>
              <ul>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Hover over states to see more detail, click on a state to open a new window with details and more visualizations. The radio buttons at the top change the shading of the map.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Data was collected from <a href="https://www.census.gov/geo/maps-data/data/tiger-line.html">the Census</a>, <a href="http://www.electproject.org/">US Elections Project</a>, and <a href="https://en.wikipedia.org/wiki/United_States_presidential_election,_2016#Results_by_state">Wikipedia</a>.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Using the PostGIS package in PostgreSQL, data was joined to the shapefiles from the Census to create the map. The geographies were simplified to reduce the size and optimize for performance and saved as a GeoJSON file.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    This visualization combines React and d3 to create the map. React handles the rendering and updating, d3 handles the map building.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    This same type of visualization can be built for any geography level (county, city, legislative district) to display any data (election results, demographics, economic data, etc).
                  </Typography>
                </li>
              </ul>
            </Grid>
          </Grid>


        </Grid>
      </Fade>
    )
  }
}

class MapHOC extends React.Component {
  constructor(props){
    super(props)
    this.state = {
        containerWidth: null,
      }

      this.fitParentContainer = this.fitParentContainer.bind(this)
  }
  componentDidMount() {
    this.fitParentContainer()
    window.addEventListener('resize', this.fitParentContainer)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.fitParentContainer)
  }

  fitParentContainer() {

      const { containerWidth } = this.state
      const currentContainerWidth = this.node.getBoundingClientRect().width

      const shouldResize = containerWidth !== currentContainerWidth

      if (shouldResize) {
        this.setState({
          containerWidth: currentContainerWidth,
        })
      }
    }

  render(){
    const { containerWidth } = this.state
    const shouldRenderChart = containerWidth !== null

    return <div
      ref={node => this.node = node}
    >
      {(shouldRenderChart && <MapExample {...this.props} containerWidth={containerWidth*.75} />)}
    </div>


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

export default (withRoot(enhance(MapHOC)))

import React from 'react';
import { TimeSeries } from 'react-smoothie';
import { RealTimeGraph } from './RealTimeGraph.js';
import { StatCard } from './StatCard';
import { Button, Grid } from '@material-ui/core';
import { ExposureZero } from '@material-ui/icons';
const { ipcRenderer } = window.require('electron');

export class RealTimeView extends React.Component{
  constructor(props){
    super(props);
    
    this._isMounted = false;

    this.state = {
      data_ch1: new TimeSeries(),
      data_ch2: new TimeSeries(),
      agg_ch1:0,
      agg_ch2:0,
    }

    this.tare = this.tare.bind(this)
    this.convertDistance = this.convertDistance.bind(this)
    this.convertForce = this.convertForce.bind(this)

  }

  componentDidMount() {
  this._isMounted = true

  ipcRenderer.on('rt-data', (event, arg) => {   
    const time = arg.time
    const ch1 = this.convertForce(arg.ch1)
    const ch2 = this.convertDistance(arg.ch2)
   
    const d_ch1 = this.state.data_ch1
    const d_ch2 = this.state.data_ch2
    d_ch1.append(time, ch1)
    d_ch2.append(time, ch2)

    if(this._isMounted){
      this.setState({
        data_ch1: d_ch1,
        data_ch2: d_ch2,
      })
    }
  }) 
  ipcRenderer.on('agg-data', (event, arg) => {   
    
    if(this._isMounted){
      this.setState({
        agg_ch1: arg.ch1,
        agg_ch2: arg.ch2,
      })
    }

  }) 
    
  }

  componentWillUnmount(){
    this._isMounted = false
}

  tare(value){
    ipcRenderer.send('tare', {value: value, ch1: this.state.agg_ch1, ch2: this.state.agg_ch2})
  }
  
  convertDistance(value){
    return (value * 0.005).toFixed(1)
  }

  convertForce(value){
    return (value * 2.74676).toFixed(0)
  }
  
// What the actual component renders
  render(){    

      return(
    
        <div>
        <Grid container spacing={2} justify="center" alignItems="center">
          <Grid item xs={12}>
            <RealTimeGraph data={this.state.data_ch1}/>
          </Grid>
          <Grid item xs={2}>
            <Button variant="contained" onClick={(e) => this.tare(1)}>Tare<ExposureZero/></Button> 
          </Grid>
          <Grid item xs={3}>
            <StatCard name="Force" data={this.convertForce(this.state.agg_ch1)} unit="N" />
          </Grid>

          <Grid item xs={12}>
            <RealTimeGraph data={this.state.data_ch2}/>
          </Grid>
          <Grid item xs={2}>
            <Button variant="contained" onClick={(e) => this.tare(2)}>Tare<ExposureZero/></Button>  
          </Grid>
          <Grid item xs={3}>
            <StatCard name="Distance" data={this.convertDistance(this.state.agg_ch2)} unit="mm"/>
          </Grid> 
            
            
        </Grid>
        </div>
      
      );
    
    
  }
    
}


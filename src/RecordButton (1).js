import React from 'react';
import { Button } from '@material-ui/core';
import { FiberManualRecord, Stop } from '@material-ui/icons';
const { ipcRenderer } = window.require('electron');

export class RecordButton extends React.Component{
    constructor(props){
      super(props);
      this.state = {
        recordingON: false
      }
      this.changeRecording = this.changeRecording.bind(this)
    }
  
    componentDidMount() {
      
    }
  
    componentWillUnmount(){
      
  }
    changeRecording() {
      this.setState(state => ({
        recordingON: !state.recordingON
      }));
  
      ipcRenderer.send('recording', !this.state.recordingON)
    }
  
  //What the actual component renders
    render(){    
    
      if (this.state.recordingON === false){ 
        return(
      
        <Button onClick={this.changeRecording} variant="contained" color="primary">Record <FiberManualRecord/> </Button>
      
    )}
      
      else {
        return(
      
          <Button onClick={this.changeRecording} variant="contained" color="secondary">Recording <Stop/> </Button>
        
      )}
    }
      
  }
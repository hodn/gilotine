import Select from '@material-ui/core/Select';
import React from 'react';
import { Button, MenuItem, FormControl, InputLabel, FormHelperText } from '@material-ui/core';
const { ipcRenderer } = window.require('electron');

export class PortMenu extends React.Component{
    constructor(props){
      super(props);
      this.state = {
        portList: [],
        selectedPort:"",
      }
      this.handleChange = this.handleChange.bind(this);
      this.handleClick = this.handleClick.bind(this);
    }
  
    componentDidMount() {
     ipcRenderer.send("list-ports")
     ipcRenderer.on('ports-listed', (event, arg) => {

      this.setState((state, props) => ({
        portList: [...state.portList, arg]
      }));
      
     })
    }
  
    componentWillUnmount(){
      
  }
  
  handleChange(event) {
    this.setState({ selectedPort: event.target.value});
    ipcRenderer.send('change-com', event.target.value) 
  }

  handleClick() {
    
    ipcRenderer.send('change-dir') 
  }
    
  //What the actual component renders
    render(){    
  
      return(
        <div>
        <FormControl>
          <Select onChange={this.handleChange} value={this.state.selectedPort}>
          <InputLabel>COM</InputLabel>
              {this.state.portList.map((item, index) => (
                <MenuItem key={index} value={item}>{item}</MenuItem>
              ))}
          </Select>
          <FormHelperText>Select COM PORT</FormHelperText>
        </FormControl>
        <Button variant="contained" color="primary" onClick={this.handleClick}>Default directory</Button>
        </div>
      )
    
    }
      
  }
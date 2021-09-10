import Select from '@material-ui/core/Select';
import React from 'react';
import { Button, MenuItem, FormControl, InputLabel, Card, CardContent, Typography, CardActions } from '@material-ui/core';
import { Folder, SettingsInputHdmi} from '@material-ui/icons';
const { ipcRenderer } = window.require('electron');

export class SettingsView extends React.Component{
    constructor(props){
      super(props);
      
      this._isMounted = false
      
      this.state = {
        portList: [],
        selectedPort:"",
        dir:"",
        com:""
      }
      this.handleChange = this.handleChange.bind(this);
      this.handleClick = this.handleClick.bind(this);
    }
  
    componentDidMount() {
      this._isMounted = true
      ipcRenderer.send("list-ports")
      ipcRenderer.send("settings-info")
      ipcRenderer.on('ports-listed', (event, arg) => {

      this._isMounted && this.setState((state, props) => ({
        portList: [...state.portList, arg]
      }))
     })

     ipcRenderer.on('dir-changed', (event, arg) => {

      this._isMounted && this.setState((state, props) => ({
        dir: arg
      }))
     })

     ipcRenderer.on('settings-loaded', (event, arg) => {

      this._isMounted && this.setState((state, props) => ({
        dir: arg.dir,
        com: arg.com
      }))
      
     })
    
    
    }
  
    componentWillUnmount(){
    this._isMounted = false;
  }
  
  handleChange(event) {
    this.setState({ selectedPort: event.target.value});
    ipcRenderer.send('change-com', event.target.value)
    ipcRenderer.send("settings-info")
    ipcRenderer.send('clear-to-send')
  }

  handleClick() {
    ipcRenderer.send('change-dir') 
  }
    
  //What the actual component renders
    render(){    
  
      return(
        <div>
       
        <Card>
                <CardContent>
                    <Typography variant="h5" component="h4">
                      COM PORT
                    </Typography>
                    <Typography color="textSecondary">
                      Current: {this.state.com}
                    </Typography>
  
                </CardContent>
                <CardActions>
                  <SettingsInputHdmi/>
                    <FormControl>
                            <Select onChange={this.handleChange} value={this.state.selectedPort}>
                            <InputLabel>COM PORT</InputLabel>
                                {this.state.portList.map((item, index) => (
                                  <MenuItem key={index} value={item}>{item}</MenuItem>
                                ))}
                            </Select>
                    </FormControl>
                </CardActions>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h5" component="h4">
                      CSV RECORD DIRECTORY
                    </Typography>
                    <Typography color="textSecondary">
                      Current: {this.state.dir}
                    </Typography>
          
                </CardContent>
                <CardActions>
                  <Button variant="contained" onClick={this.handleClick}><Folder/></Button>
                </CardActions>
            </Card>
          
          
            <Typography variant="body" color="textSecondary">
              *the settings are stored and reloaded on next app start
            </Typography>
            
        </div>
      )
    
    }
      
  }
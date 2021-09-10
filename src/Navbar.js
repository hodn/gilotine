import React, { Component } from 'react';
import '../node_modules/react-vis/dist/style.css';
import { RealTimeView } from './RealTimeView.js';
import { SettingsView } from './SettingsView';
import { RecordButton } from './RecordButton';
import {
  Route,
  Link,
  HashRouter
} from "react-router-dom";
import {Tab, Tabs, Paper} from '@material-ui/core';
import {ImportExport, Settings} from '@material-ui/icons';
const { ipcRenderer } = window.require('electron');

  class Navbar extends Component {
    state = {
        value: 0
      };

    handleChange = (event, value) => {
        this.setState({ value });
      };

    componentDidMount() {
      ipcRenderer.send('clear-to-send')
    }
    
    
  render() {
    return (
        <HashRouter>
        <div>
        
          <Paper>
              <Tabs indicatorColor="secondary" centered value={this.state.value} onChange={this.handleChange}>
                <Tab label="Real time" icon={< ImportExport/>} component={Link} to="/" />
                <Tab label="Settings" icon={< Settings/>} component={Link} to="/settings" />
                <RecordButton/> 
              </Tabs>
          </Paper>

          <div className="content">
            <Route exact path="/" component={RealTimeView}/>
            <Route path="/settings" component={SettingsView}/>
          </div>
        
        </div>
      </HashRouter>
    );
  }
}


export default Navbar;

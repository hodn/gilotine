import React, { Component } from 'react';
import '../node_modules/react-vis/dist/style.css';
import Navbar from './Navbar';
import { StylesProvider } from "@material-ui/styles";
import "./App.css";


  class App extends Component {
  
  render() {
    return (
      <StylesProvider injectFirst>
    <Navbar />
  </StylesProvider>
    );
  }
}


export default App;

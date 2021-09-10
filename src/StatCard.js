import React from 'react';
import {Paper, Typography} from '@material-ui/core'

export class StatCard extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      
    }

  }

  componentDidMount() {
  

  }

  componentWillUnmount(){
    
}
  
// What the actual component renders
  render(){    

      return(
    
      <div>
          
          <Paper>
            <Typography variant="body1">
            {this.props.name}
            </Typography>
            
            <Typography variant="h5">
            {this.props.data} {this.props.unit} 
            </Typography>
          </Paper>
        
       
      </div>
      
      );
    
    
  }
    
}


import React from 'react';
import SmoothieComponent from 'react-smoothie';

export class RealTimeGraph extends React.Component{
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
           <SmoothieComponent
        responsive
        millisPerPixel={70}
        scaleSmoothing={0.08}
        interpolation="linear"
        height={250}
        timestampFormatter={date => {
          if(date.getSeconds() % 20 === 0){
            return date.toLocaleTimeString()
          }else{
            return ""
          }
        } }
        grid={{millisPerLine:4000,verticalSections:5}}
        labels={{fontSize:14,precision:1}}
        series={[
          {
            data: this.props.data,
            strokeStyle: { g: 255 },
            fillStyle: { g: 255 },
            lineWidth: 4,
          }
        ]}
      />
          
        </div>
      
      );
    
    
  }
    
}


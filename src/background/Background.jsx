import React from 'react';
import video from './background2.mp4'

class Background extends React.Component{

    constructor(props) {
        super(props);
        this.videoRef = React.createRef();
    }
    componentDidMount() {
        if(this.videoRef.current) {
            this.videoRef.current.playbackRate = 0.5;
        }
    }

    render() {
          return (
              <div className={"video-background"}>

                  <video ref={this.videoRef} autoPlay loop muted id="myVideo">
                      <source src={video} type="video/mp4"/>
                  </video>
              </div>
          );
      }
}

export default Background;
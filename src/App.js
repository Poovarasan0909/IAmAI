import './App.css';
import Gemini_api from './content/Gemini_api'
import Background from "./background/Background";
import './css/background.css'
import './css/contentPage.css'

function App() {
  return (
      <div className={"container"}>
          <Background/>
          <div style={{position: 'absolute', top: 0, right: 0, width: '100%', height: '100%'}}>
              {/* eslint-disable-next-line react/jsx-pascal-case */}
              <Gemini_api/>
          </div>
      </div>
  );
}

export default App;

import './App.css';
import Gemini_api from './content/Gemini_api'
import Background from "./background/Background";
import './css/background.css'
import './css/contentPage.css'
import { Helmet } from 'react-helmet';

function App() {
  return (
      <div className={"container"}>
          <Helmet>
              <meta charSet="utf-8" />
              <title>Your React App</title>
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              {/* Other meta tags */}
          </Helmet>
          <Background/>
          <div style={{position: 'absolute', top: 0, right: 0, width: '100%', height: '100%'}}>
              {/* eslint-disable-next-line react/jsx-pascal-case */}
              <Gemini_api/>
          </div>
      </div>
  );
}

export default App;

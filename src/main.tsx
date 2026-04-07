import 'normalize.css/normalize.css'
import { Amplify, type ResourcesConfig } from 'aws-amplify'
import { amplifyConfig } from '../config/aws/amplify'
import React from 'react'

Amplify.configure(amplifyConfig as ResourcesConfig)
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

// eslint-disable-next-line no-use-before-define
import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Home from './pages/Home'

function App () {
  return (
    <div className="App">
      <header className="App-header">
        <Router>
          <Switch>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </Router>
      </header>
    </div>
  )
}

export default App

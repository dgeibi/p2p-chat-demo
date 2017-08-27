/* eslint-disable */

import { h } from 'preact'
import { Route, Switch } from 'react-router-dom'
import { ConnectedRouter as Router } from 'react-router-redux'

const routes = history =>
  <Router history={history}>
    <Frame>
      <Switch>
        <Route path="/dialog/:type/:key" component={Channel} />
        <Route path="/settings" component={Settings} />
        <Route path="/" component={CreateChannel} />
      </Switch>
    </Frame>
  </Router>

export default routes
import {Router} from './common/router'
import * as restify from 'restify'

class MainRouter extends Router {
  applyRoutes(application: restify.Server) {
    application.get('/', (req, resp, next)=>{
      resp.json({
        users: '/users',
        version: '0.1.1'
      })
    })
  }
}

export const mainRouter = new MainRouter()

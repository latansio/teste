import * as restify from 'restify'
import {NotAuthorizedError, InvalidCredentialsError} from 'restify-errors'
import * as jwt from 'jsonwebtoken'

import {User} from '../users/users.model'
import {environment} from '../common/environment'

export const authenticate: restify.RequestHandler = (req, resp, next)=>{

    const {email, password} = req.body   

    if (email == "" || email == undefined || password == "" || password == undefined ) {
        return next(new InvalidCredentialsError('O usuario e a senha devem ser informados !'))
    } else {
       User.findByEmail(email, '+password').then(user=>{              
            if (user && user.matches(password)) {                        
                const token = jwt.sign({sub: user.email, iss: 'node-api'},                                         
                                        environment.security.apiSecret, {
                                            expiresIn: "1h"
                                        })
                resp.json({name: user.name, email: user.email, accessToken: token, idUser: user._id, profile: user.profiles})
                //resp.json(user)
                return next(false)    
            } else {
                return next(new NotAuthorizedError('Credenciais Inválidas !'))
            }
        }).catch(next)
    }
}
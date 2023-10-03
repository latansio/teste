import {Router} from './router'
import * as mongoose from 'mongoose'
import {NotFoundError, BadRequestError} from 'restify-errors'

export abstract class ModelRouter<D extends mongoose.Document> extends Router {
    
    basePath: string    

    pageSize: number = 2

    constructor(protected model: mongoose.Model<D>) {
        super ()
        this.basePath = `/${model.collection.name}`
    }

    protected prepareOn(query: mongoose.DocumentQuery<D,D>): mongoose.DocumentQuery<D,D>{
        return query
    }

    protected prepareAll(query: mongoose.DocumentQuery<D[],D>): mongoose.DocumentQuery<D[],D>{
        return query
    }

    envelope(document: any): any {
        let resource = Object.assign({_links:{}}, document.toJSON())
        resource._links.self = `${this.basePath}/${resource._id}`
        return resource
    }

    validadeId = (req, resp, next)=> {
        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
           next (new NotFoundError('Document not found')) 
        } else{
            next()
        }
    }

    findAll = (req, resp, next)=> {
       this.prepareAll(this.model.find())
            .then(this.renderAll(resp, next))
            .catch(next)
    }

    findById = (req, resp, next)=> {
       this.prepareOn(this.model.findById(req.params.id))
            .then(this.render(resp, next))
            .catch(next)      
    }

    save = (req, resp, next) => {
        let document = new this.model(req.body)      
        document.save()
            .then(this.render(resp, next))    
            .catch(next)
    }

    replace = (req, resp, next)=>{
        const options  = {runValidators: true, overwrite: true}
        this.model.update({_id:req.params.id}, req.body, options)
            .exec().then(result=>{
              if(result.n){
                return this.model.findById(req.params.id)
              }else{
                throw new NotFoundError('Documento não encontrado')
              }
        }).then(this.render(resp, next))
          .catch(next)
    }
    
    update = (req, resp, next)=>{
        const options = {runValidators: true, new : true}
        this.model.findByIdAndUpdate(req.params.id, req.body, options)
            .then(this.render(resp, next))
            .catch(next)
      }

    delete = (req, resp, next)=>{
        this.model.remove({_id:req.params.id}).exec()
            .then((cmdResult: any)=>{
                console.log(cmdResult.n)
                if(cmdResult.n){
                  resp.send(204)          
                }else{
                  throw new NotFoundError('Documento não encontrado')
                }
                return next()
            })
            .catch(next)
      }
}

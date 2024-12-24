import Joi from "joi"
let listingSchema =Joi.object({
    listing:Joi.object({
        title:Joi.string().required(),
        description:Joi.string().required(),
        location:Joi.string().required(),
        country:Joi.string().required(),
        price:Joi.number().required(),
        imageUrl:Joi.string().allow("",null)
    }).required()
})
let Review=Joi.object({
    review:Joi.object({
        rating:Joi.number().required(),
        comment:Joi.string().required(),
    }).required(),
})


export {Review,listingSchema}
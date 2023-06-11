const mongoose = require("mongoose");
const joi = require("joi");

const toySchema = mongoose.Schema({
    name: String,
    info: String,
    category: String,
    img_url: String,
    price: Number,
    dateCreated: {
        type: Date, default: Date.now()
    },
    user_id: String
})

exports.ToyModel = mongoose.model("toys", toySchema);

exports.validateToy = (reqBody) => {
    let joiSchema = joi.object({
        name: joi.string().min(2).max(70).required(),
        info: joi.string().min(2).max(100).required(),
        category: joi.string().min(2).max(70).required(),
        price: joi.number().min(10).max(1000).required(),
        img_url: joi.string().min(10).max(1000).allow(null, "")
    })
    return joiSchema.validate(reqBody);
}

const mongoose = require("mongoose");
const joi = require("joi");
const jwt = require("jsonwebtoken");
const { config } = require("../config/secret");

const userSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    dateCreated: {
        type: Date, default: Date.now()
    },
    role: {
        type: String, default: "user"
    }
})

exports.UserModel = mongoose.model("users", userSchema);

exports.validateUser = (reqBody) => {
    let joiSchema = joi.object({
        name: joi.string().min(2).max(70).required(),
        email: joi.string().email().min(2).max(70).required(),
        password: joi.string().min(2).max(70).required()
    })
    return joiSchema.validate(reqBody);
}
exports.validateLogin = (reqBody) => {
    let joiSchema = joi.object({
        email: joi.string().email().min(2).max(70).required(),
        password: joi.string().min(2).max(70).required()
    })
    return joiSchema.validate(reqBody);
}

exports.createToken = (userId, role) => {
    let token = jwt.sign({ _id: userId, role }, config.tokenSecret, { expiresIn: "60mins" });
    return token;
}
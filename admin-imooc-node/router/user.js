const express = require('express')
const Result = require('../models/Result')
const router = express.Router()
const {login,findUser} =require('../services/user')
const {md5} =require('../utils')
const {PWD_SALT, PRIVATE_KEY, JWT_EXPIRED} =require('../utils/constant')
const {body,validationResult} =require('express-validator')
const boom = require('boom')
const jwt= require('jsonwebtoken')


router.get('/info', function(req, res, next) {
    console.log("到达info")
    findUser("amdin").then(user=>{
        console.log(user)
        if(user){
            new Result(user,'用户信息查询成功').success(res)
        }else
        {
            new Result("用户信息查询失败").fail(res)
        }
    })
})

router.post('/login',
    [
        body('username').isString().withMessage('username类型不正确'),
        body('password').isString().withMessage('password类型不正确')
    ],
    function (req,res,next){
    const err = validationResult(req)
    if(!err.isEmpty()) {
        const[{msg}] = err.errors
        next(boom.badRequest(msg))
    }else {
        let {username, password} = req.body
        password = md5(`${password}${PWD_SALT}`)
        login(username,password).then(user=>{
            if(!user || user.length ===0)
            {
                new Result("登录失败").fail(res)
            }else{
                const token = jwt.sign(
                    {username},
                    PRIVATE_KEY,
                    {expiresIn : JWT_EXPIRED}
                )
                new Result({token},"登录成功").success(res)
            }
        })
    }
})
module.exports = router
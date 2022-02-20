
const { User , Task } = require("./Database")
const { CustomError } = require('./Errors')

/*
===============================================================================================
    async Wrapper function for error handling
===============================================================================================
*/
const asyncWrapper = (fn) => {
    return async (req , res , next) =>{
        try{
            await fn(req , res , next)
        }catch (error){
            next(error)
        }
    }
}

/*
===============================================================================================
    Authentication Controllers (resister and login)
===============================================================================================
*/

const login = asyncWrapper( async (req , res , next) => {
    const {email , password} = req.body
    if (!password || !email){
        return(
            next( 
                new CustomError(email ? 'Please provide your password' : 'Please provide your email' , 400)
            )
        )
    }

    const user = await User.findOne({email})

    if(!user){
        return next( new CustomError('Invalid Email' , 401))
    }

    const passwordMatched = await user.checkPassword(password)
    
    if(!passwordMatched){
        return next( new CustomError('Wrong Password' , 401))
    }

    const token = user.createJWT()
    
    res.status(200).json({ user : {name : user.name} , token : token})
})

const register = asyncWrapper( async (req , res , next) => {

    const user = await User.create(req.body)
    const token = user.createJWT()
    res.status(201).json({ user : {name : user.name} , token : token})

})

/*
===============================================================================================
    Tasks Controllers (Tasks CRUD Operations)
===============================================================================================
*/

const getAllJobs = asyncWrapper( async (req , res , next) => {

    const userId = req.user.userId
    const tasks = await Task.find({ createdBy : userId})
    res.status(200).json(tasks)
    
})

const getSingleJob = asyncWrapper( async (req , res , next) => {

    const taskId = req.params.id
    const userId = req.user.userId
    const task = await Task.findOne({ _id : taskId , createdBy : userId })
    if (!task){
        return next( new CustomError(`There is no task with id: ${taskId}` , 404))
    }
    res.status(200).json(task)

})

const createJob = asyncWrapper( async (req , res , next) => {

    let taskObj = req.body
    taskObj.createdBy = req.user.userId
    console.log(taskObj)
    const task = await Task.create(taskObj)
    res.status(201).json(task)

})

const updateJob = asyncWrapper( async (req , res , next) => {

    const taskId = req.params.id
    const userId = req.user.userId
    const task = await Task.findByIdAndUpdate({ _id : taskId , createdBy : userId} , req.body , { new : true , runValidators : true})
    if (!task){
        return next( new CustomError(`There is no task with id: ${taskId}` , 404))
    }
    res.status(200).json(task)

})

const deleteJob = asyncWrapper( async (req , res , next) => {

    const taskId = req.params.id
    const userId = req.user.userId
    const task = await Task.findByIdAndRemove({ _id : taskId , createdBy : userId})
    if (!task){
        return next( new CustomError(`There is no task with id: ${taskId}` , 404))
    }
    res.status(200).json(task)

})






module.exports = {
    login,
    register,
    getAllJobs,
    getSingleJob,
    createJob,
    updateJob,
    deleteJob
}
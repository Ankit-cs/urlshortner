import User from "../models/user.model.ts"
import UrlModel from "../models/url.model.ts"

export const findUserByEmail = async (email: string) => {
    return await User.findOne({email})
}
export const findUserByEmailByPassword = async (email: string) => {
    return await User.findOne({email}).select('+password')
}
export const findUserById = async (id: any) => {
    return await User.findById(id)
}
export const createUser = async (name: string, email: string, password: string) => {
    const newUser = new User({name, email, password})
    await newUser.save()
    return newUser
}
export const getAllUserUrlsDao = async (id: any) => {
    return await UrlModel.find({user:id})
}
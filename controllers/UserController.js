import bcrypt from "bcrypt";
import UserModel from "../models/User.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const password = req.body.password
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const doc = new UserModel({
      username: req.body.username,
      email: req.body.email,
      avatarUrl: req.body.avatarUrl,
      passwordHash: hash,
    })

    const user = await doc.save()

    const token = jwt.sign({
        _id: user._id
      }, 'secretkey',
      {
        expiresIn: '30d',
      })

    const {passwordHash, ...userData} = user._doc

    res.json({ ...userData, token })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: "Не удалось зарегистрироваться",
    })
  }
}

export const login = async (req, res) => {
  try {
    const user = await UserModel.findOne({username: req.body.username})

    if(!user) {
      return res.status(404).json({
        message: "Аккаунт не найден"
      })
    }

    const isValidPassword = await bcrypt.compare(req.body.password, user._doc.passwordHash)

    if(!isValidPassword) {
      return res.status(400).json({
        message: "Неверный логин или пароль"
      })
    }

    const token = jwt.sign({
        _id: user._id
      }, 'secretkey',
      {
        expiresIn: '30d',
      })

    const {passwordHash, ...userData} = user._doc

    res.json({ ...userData, token })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: "Не удалось войти",
    })
  }
}

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId)

    if(!user) {
      return res.status(404).json({
        message: "Пользователь не найден"
      })
    }

    const {passwordHash, ...userData} = user._doc
    res.json(userData)
  } catch (e) {
    console.log(e)
    return res.json({
      message: "Нет доступа"
    })
  }
}

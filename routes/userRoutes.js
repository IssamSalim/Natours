const express = require('express'); 
const userController = require('../controller/userController.js')

const router = express.Router();

router
.route('/')
.get(userController.getAllUser)
.post(userController.creatUser)

router
.route('/:id')
.get(userController.getUser)
.patch(userController.updateUser)
.delete(userController.deleteUser)

module.exports = router;
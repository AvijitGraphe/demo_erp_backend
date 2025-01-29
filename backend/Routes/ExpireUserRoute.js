const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');
const User = require("../Models/User");
const ExpireUser = require("../Models/ExpireUser");



//update the expire employee data
router.post("/updateExpireemployee", authenticateToken, async(req, res) =>{
    const {expire_date, user_id } = req.body;
    try {
        const userlog = User.findById(user_id);
        if(!userlog){
            return 'User Not Found!'
        }
        await User.updateOne({ _id: userlog._id, expire_date: expire_date });
        await ExpireUser.insertOne({})
    } catch (error) {
        console.error(error);
        res.status(500).json({ message : "expire update failds"});
    }
})


//get the expire employee data
router.get('/getallEmplooyee', authenticateToken, async(req, res) =>{
    try {
        const expiredEmployees = await User.find();
        if (!expiredEmployees || expiredEmployees.length === 0) {
            return res.status(404).json({ message: "No expired employees found" });
        }
        console.log("Expired employees data:", expiredEmployees);
        res.json(expiredEmployees);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message : "expire update failds"});
    }
})
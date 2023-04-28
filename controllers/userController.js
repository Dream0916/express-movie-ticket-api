const db = require("../models");
const User = db.users;
const OTP = db.otps;
const Op = db.Sequelize.Op;
const where = db.Sequelize.where;
const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt.config');
const request = require('request');
const clickSend = require('clicksend');
var api = require('../node_modules/clicksend/api.js');

async function findUserByUsername(username) {
    try {
        users = await User.findAll({ where: { username: username } })
        return (users instanceof Array) ? users[0] : null;
    }
    catch (ex) {
        throw ex;
    }
}

async function findUserByUserid(userid) {
    try {
        users = await User.findAll({ where: { id: userid } })
        return (users instanceof Array) ? users[0] : null;
    }
    catch (ex) {
        throw ex;
    }
}

async function findUserByEamil(email) {
    try {
        users = await User.findAll({ where: { email: email } })
        return (users instanceof Array) ? users[0] : null;
    }
    catch (ex) {
        throw ex;
    }
}


exports.signup = (req, res, next) => {
    const { username, email, password, phonenumber } = req.body;
    if (!username, !email, !password, !phonenumber) {
        res.status(200).send({
            status: 400,
            message: 'Please provide all the fields.'
        });
        return;
    }

    // Create the User Record
    const newUser = {
        username: username,
        email: email,
        phonenumber: phonenumber,
        password: password
    }

    User.create(newUser)
        .then(data => {
            res.send({
                status: 200,
                message: "Signup Successful!"
            });
        })
        .catch(err => {
            res.status(200).send({
                status: 400,
                message:
                    err.message || "Some error occurred while signing you up.",
                errObj: err
            });
        });
}

exports.signin = async (req, res) => {
    try {
        if ((!req.body.username && !req.body.email) || (!req.body.password)) {
            res.status(200).send({
                status: 400,
                message: 'Please provide username/email and password.'
            });
            return;
        }
        let user = null;
        if (req.body.username) {
            user = await findUserByUsername(req.body.username);
        } else if (req.body.email) {
            user = await findUserByEamil(req.body.email);
        }
        if (user == null || !(user instanceof User)) {
            res.status(200).send({
                status: 400,
                message: "Invalid Credentials!"
            });
            return;
        } else {
            if (user.verifyPassword(req.body.password)) {
                var smsMessage = new api.SmsMessage();
                smsMessage.from = "PJ-Telesoft";
                smsMessage.to = "+0451111111";
                smsMessage.body = "test message";
                smsMessage.source = "PJ-Telesoft";
                var smsApi = new api.SMSApi("nocredit", process.env.OTP_API_KEY);
                var smsCollection = new api.SmsMessageCollection();

                smsCollection.messages = [smsMessage];

                smsApi.smsSendPost(smsCollection).then(function (response) {
                    console.log(response.body);
                }).catch(function (err) {
                    console.error(err.body);
                });

                const newOtp = {
                    userid: user.id,
                    otpcode: '11111'
                }

                OTP.upsert(newOtp).then((result) => {
                    res.status(200).send({
                        status: 200,
                        message: "Login Successful",
                        data: {
                            userid: user.id
                        }
                    })
                })
                return;
            } else {
                res.status(200).send({
                    status: 400,
                    message: "Invalid Credentails!"
                });
                return;
            }
        }
    } catch (error) {
        console.log(error)
        res.status(200).send({
            status: 400,
            message: "Invalid Credentails!"
        });
    }

}

exports.otpverify = async (req, res) => {
    let userid = "";
    let otpcode = 0;
    let user = null;
    console.log(req.body.otpcode)
    if (!req.body.otpcode || !req.body.userid) {
        res.status(200).send({
            status: 400,
            message: 'Please provide otpcode / user info.'
        });
        return;
    } else {
        userid = req.body.userid;
        otpcode = req.body.otpcode;
    }
    user = await findUserByUserid(userid);
    const otpData = await OTP.findAll({ where: { userid: userid, otpcode: otpcode } });

    if (otpData.length == 0) {
        res.status(200).send({
            status: 400,
            message: 'OTP code is wrong.'
        });
        return;
    } else {
        res.status(200).send({
            status: 200,
            message: 'OTP is verified successfully.',
            data: {
                accessToken: jwt.sign({ username: user.username, email: user.email, phone: user.phonenumber }, secret),
                username: user.username,
                email: user.email,
                phonenumber: user.phonenumber
            }
        });
    }
}

exports.changepassword = async (req, res) => {
    console.log(req.body)

    if (!req.body.oldpassword || !req.body.newpassword) {
        res.status(200).send({
            status: 400,
            message: 'Please provide both old and new password.'
        });
    }
    user = await findUserByUsername(req.user.username);
    if (user == null || !(user instanceof User)) {
        res.status(200).send({
            status: 400,
            message: "Invalid Credentials!"
        });
    } else {
        if (user.verifyPassword(req.body.oldpassword)) {
            user.update({ password: req.body.newpassword }, {
                where: { id: user.id }
            });
            res.status(200).send({
                status: 200,
                message: "Password Updated Successfully!"
            })
        } else {
            res.status(403).send({
                status: 400,
                message: "Invalid Old Password! Please recheck."
            });
        }
    }
}

exports.verifypassword = async (req, res) => {
    console.log(req.body)

    if (!req.body.password) {
        res.status(200).send({
            status: 400,
            message: 'Please provide your password to re-authenticate.'
        });
    }
    user = await findUserByUsername(req.user.username);
    if (user == null || !(user instanceof User)) {
        res.status(200).send({
            status: 400,
            message: "Invalid Credentials!"
        });
    } else {
        if (user.verifyPassword(req.body.password)) {
            res.status(200).send({
                status: 200,
                message: "Password Verification Successful!"
            })
        } else {
            res.status(200).send({
                status: 400,
                message: "Invalid Password! Please recheck."
            });
        }
    }
}

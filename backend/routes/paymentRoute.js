const route = require("express").Router();

const {
    makePayment,
    adminPayment,
} = require("../controllers/paymentController");

const {
    isAuthenticatedUser,
    isAuthenticatedAdmin
} = require("../middleware/auth");

route.post('/order/:notificationId', isAuthenticatedUser, makePayment);
route.post('/adminpay/:notificationId', isAuthenticatedAdmin, adminPayment);

module.exports = route;
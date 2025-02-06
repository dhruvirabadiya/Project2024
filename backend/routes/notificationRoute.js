const route = require("express").Router();

const { 
    sendNotification,
    serviceProvider,
    processNotification,
    serviceTaker,
    getNotificationAdmin,
    deleteNotification
} = require("../controllers/notificationController");

const {
    isAuthenticatedUser,
    isAuthenticatedAdmin,
} = require("../middleware/auth");

route.post('/sendNotification', isAuthenticatedUser, sendNotification);
route.get('/serviceProvider', isAuthenticatedUser, serviceProvider);
route.post('/processNotification/:notificationId/:action', isAuthenticatedUser, processNotification);
route.get('/serviceTaker', isAuthenticatedUser, serviceTaker);
route.get('/admin/:adminId', isAuthenticatedAdmin, getNotificationAdmin);
route.delete('/delete/:id', deleteNotification);

module.exports = route;
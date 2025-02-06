const route = require("express").Router();

const { 
    bookDetails,
} = require("../controllers/bookController");

const {
    isAuthenticatedUser
} = require("../middleware/auth");

route.post("/booknow", isAuthenticatedUser, bookDetails);

module.exports = route;
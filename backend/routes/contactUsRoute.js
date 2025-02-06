const route = require("express").Router();

const {
    contact
} = require("../controllers/contactUsController");

route.post("/submit", contact);

module.exports = route;
const route = require("express").Router();

const {
    getAllServiceProviders,
    addDetalis,
    updateAvailability,
} = require("../controllers/serviceproviderController");

const {
    isAuthenticatedUser
} = require("../middleware/auth");


route.get("/providers", getAllServiceProviders);
route.put("/details",isAuthenticatedUser, addDetalis);
route.put("/updateAvailability/:id",isAuthenticatedUser, updateAvailability);


module.exports = route;
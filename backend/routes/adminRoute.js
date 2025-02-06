const route = require("express").Router();

const {
    //register,
    adminLogin,
    getAllUser,
    getSingleUser,
    deleteUser,
    getRegisteredCounts,
    getRegisteredServiceTaker,
    getRegisteredServiceProvider,
    getAllMessage,
    updateMessage,
    logout
} = require ("../controllers/adminController");

const{
    isAuthenticatedAdmin,
} =  require("../middleware/auth");

//route.post("/register", register);
route.post("/login", adminLogin);
route.get("/users", isAuthenticatedAdmin, getAllUser);
route.get("/user/:id", isAuthenticatedAdmin, getSingleUser);
route.delete("/user/:id", isAuthenticatedAdmin, deleteUser);
route.get("/registeredcounts", isAuthenticatedAdmin, getRegisteredCounts);
route.get('/registered-taker', isAuthenticatedAdmin,getRegisteredServiceTaker);
route.get('/registered-provider', isAuthenticatedAdmin,getRegisteredServiceProvider);
route.get("/message", isAuthenticatedAdmin, getAllMessage);
route.put("/message/:id", isAuthenticatedAdmin, updateMessage);
route.get("/logout", logout);

module.exports = route;
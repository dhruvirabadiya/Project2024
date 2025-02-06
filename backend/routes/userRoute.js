const route = require("express").Router();
const upload = require("../utils/multer");

const {
    userRegister,
    userLogin,
    logout,
    forgotPassword,
    resetPassword,
    getUserDetails,
    updatePassword,
    updateProfile,
    updateProfileImage,
    provider,
    booking
} = require("../controllers/userController");

const{
    isAuthenticatedUser,
} =  require("../middleware/auth");

route.post("/register", userRegister);
route.post("/login", userLogin);
route.post("/password/forgot", forgotPassword);
route.put("/password/reset/:token", resetPassword);
route.get("/logout", logout);
route.get("/me/:id",isAuthenticatedUser, getUserDetails);
route.put("/password/update", isAuthenticatedUser, updatePassword);
route.put("/me/update", isAuthenticatedUser, updateProfile);
route.put("/me/updateimage/:id", isAuthenticatedUser, upload.single('profileImage'), updateProfileImage);
route.get("/service-providers/:id", provider);
route.get("/booking/:id", isAuthenticatedUser, booking)

module.exports = route;
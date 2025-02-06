const route = require("express").Router();

const {
     postReview,
     getReviews,
     deleteReview
}= require("../controllers/reviewController");

const{
     isAuthenticatedAdmin,
 } =  require("../middleware/auth");

route.post("/reviews", postReview);
route.get("/allreview", getReviews);
route.delete("/deleteReview/:id",isAuthenticatedAdmin, deleteReview);

module.exports = route;
const route = require("express").Router();
const upload = require("../utils/multer");

const {
    createServiceCategory,
    getAllServiceCategories,
    updateServiceCategory,
    deleteServiceCategories
} = require("../controllers/serviceCategoryController");

route.post("/service-category",upload.array('image'), createServiceCategory);
route.get('/serviceCategories', getAllServiceCategories);
route.put("/serviceCategories/:id", upload.array('image'),updateServiceCategory);
route.delete("/serviceCategories/:id", deleteServiceCategories);

module.exports = route;
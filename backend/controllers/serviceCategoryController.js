const ErrorHandler = require("../utils/errorHandlers");
const catchAsyncError = require("../middleware/catchAsyncError");
const ServiceCategory = require("../models/servicesCategoryModel");
const cloudinary = require("../utils/cloudinary");
const User = require("../models/userModel");

exports.createServiceCategory = catchAsyncError(async (req, res, next) => {
    try {
        const { name, description, description1, description2, description3, description4, description5, description6 } = req.body;

        if (!req.files || req.files.length === 0) {
            throw new ErrorHandler('Please upload an image', 400);
        }

        const cloudinaryImageUploadMethod = async file => {
            try {
                const result = await cloudinary.uploader.upload(file);
                return result.secure_url;
            } catch (error) {
                throw new ErrorHandler('Error uploading image to Cloudinary', 500);
            }
        };

        const urls = await Promise.all(req.files.map(async file => {
            const { path } = file;
            return await cloudinaryImageUploadMethod(path);
        }));

        const serviceCategory = await ServiceCategory.create({
            name,
            description,
            image: urls,
            description1,
            description2,
            description3,
            description4,
            description5,
            description6,
        });

        res.status(201).json({
            success: true,
            serviceCategory: {
                ...serviceCategory.toObject()
            }
        });
    } catch (error) {
        console.log("error", error);
        next(error);
    }
});

//update service categories
exports.updateServiceCategory = catchAsyncError(async (req, res, next) => {
    try {
        const { id } = req.params; // Assuming you are passing the service category ID in the URL
        const { name, description, description1, description2, description3, description4, description5, description6} = req.body;
        
        let serviceCategory = await ServiceCategory.findById(id);

        if (!serviceCategory) {
            throw new ErrorHandler('Service category not found', 404);
        }

        // Update fields if they are provided in the request body
        if (name) serviceCategory.name = name;
        if (description) serviceCategory.description = description;
        if (description1) serviceCategory.description1 = description1;
        if (description2) serviceCategory.description2 = description2;
        if (description3) serviceCategory.description3 = description3;
        if (description4) serviceCategory.description4 = description4;
        if (description5) serviceCategory.description5 = description5;
        if (description6) serviceCategory.description6 = description6;

        await serviceCategory.save();

        res.status(200).json({
            success: true,
            message: 'Service category updated successfully',
            serviceCategory,
        });
    } catch (error) {
        console.error('Error updating service category:', error);
        next(error); 
    }
});

//delete service categories
exports.deleteServiceCategories = catchAsyncError(async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedServiceCategory = await ServiceCategory.findByIdAndDelete(id);

        if (!deletedServiceCategory) {
            return next(new ErrorHandler(`Service category not found with ID: ${id}`, 404));
        }

        res.status(200).json({
            success: true,
            message: `Service category with ID ${id} deleted successfully`,
        });
    } catch (error) {
        console.log("Error deleting service category:", error);
        next(error);
    }
});

// Get all service categories with service provider details
exports.getAllServiceCategories = catchAsyncError(async (req, res, next) => {
    try {
        const serviceCategories = await ServiceCategory.find();
        const serviceCategoriesWithProviders = await Promise.all(serviceCategories.map(async category => {
            // Get service providers for this category
            const serviceProviders = await User.find({ role: 'Service Provider', serviceCategoryId: category._id }).populate('serviceCategoryId');
            return {
                _id: category._id,
                name: category.name,
                description: category.description,
                imageUrl: category.image,
                description1: category.description1,
                description2: category.description2,
                description3: category.description3,
                description4: category.description4,
                description5: category.description5,
                description6: category.description6,
                createdAt: category.createdAt,
                serviceProviders: serviceProviders.map(provider => ({
                    _id: provider._id,
                    name: provider.name,
                }))
            };
        }));
        res.status(200).json({
            success: true,
            serviceCategories: serviceCategoriesWithProviders
        });
    } catch (error) {
        console.log("error", error);
        next(error);
    }
});

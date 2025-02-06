const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./middleware/error");
const multer = require('multer');
const path = require("path");
const cors = require("cors");

const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));


// Enable CORS
app.use(cors());

//Routes imports
const user = require("./routes/userRoute");
const admin = require("./routes/adminRoute");
const serviceCategory = require("./routes/serviceCategoryRoute");
const contact = require("./routes/contactUsRoute");
const serviceprovider = require("./routes/serviceProviderRoute");
const book = require("./routes/bookRoute");
const notification = require("./routes/notificationRoute");
const payment = require("./routes/paymentRoute");
const review = require("./routes/reviewRoute");

app.use("/api/user", user);
app.use("/api/admin", admin);
app.use("/api/serviceCategory", serviceCategory);
app.use("/api/contact", contact);
app.use("/api/serviceProvider", serviceprovider);
app.use("/api/book", book);
app.use("/api/notification", notification);
app.use("/api/payment", payment);
app.use("/api/review", review);


//Middleware for errors
app.use(errorMiddleware);

module.exports = app;
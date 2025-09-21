const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
require(`${__utils}/passport-jwt`);
const express = require("express"),
  app = express(),
  cors = require("cors"),
  cookieParser = require("cookie-parser"),
  router = require("../routes/index");
path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../../swagger.json");

// Set up EJS for rendering views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.get("/", (req, res) => {
  res.send("API is running");
});

// Serve static files like CSS, images, etc.
app.use(express.static(path.join(__dirname, "../public")));
const uploadDir = path.join(__root, "public/uploads");
app.use("/uploads", express.static(uploadDir));
app.use(
  cors({
    // origin: 'http://localhost:3000',
    origin: ["http://localhost:3000", "https://usa-peptides.vercel.app", "http://usapeptide-env.eba-gwmh4bqi.us-east-1.elasticbeanstalk.com"],
    // origin: true,
    credentials: true,
  })
);

app.use(bodyParser.json({ limit: "500mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "500mb",
    extended: true,
    parameterLimit: 50000,
  })
);

app.use(cookieParser());
app.use(
  session({
    secret: "R5bj7ymny5T7nHhCfjRSrHYlbouP2pz4",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      sameSite: "None",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Initialize Passport and Passport Session
app.use(passport.initialize());
app.use(passport.session());

// Setup Swagger API docs route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(bodyParser.json());
const imgDir = require("path").join(`${__root}`, "/public/files");

app.use("/images", express.static(imgDir));

app.use((req, res, next) => {
  if (
    !["POST", "GET", "DELETE", "PUT", "PATCH", "OPTIONS"].includes(req.method)
  )
    res.status(403).json({ message: "Mehtod Not allowed" });
  next();
});

app.use("/api/v1", router);
module.exports = app;

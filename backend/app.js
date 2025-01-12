const express = require("express");
const app = express();
const storyRoutes = require("./routes/story");
const articleRoutes = require("./routes/article");

app.use("/api/stories", storyRoutes);
app.use("/api/articles", articleRoutes);

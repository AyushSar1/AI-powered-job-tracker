const dns = require('dns')

dns.setServers([
  '1.1.1.1',
  '8.8.8.8',
])
require("express-async-errors");
require("dotenv").config({quiet: true});
const express = require('express');
const appRouter = require("./routes/auth");
const jobRouter = require("./routes/jobs");
const resumeRouter = require("./routes/resume");
const chatRouter = require('./routes/chat');
const conversationRouter = require('./routes/conversation');
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");
const connectDB = require("./db/connect");
const auth = require('./middlewares/authenticate');
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/v1/auth', appRouter);
app.use("/api/v1/jobs", auth, jobRouter);
app.use("/api/v1/resume", auth, resumeRouter);
app.use('/api/v1/chat', auth, chatRouter);
app.use('/api/v1/conversations', auth, conversationRouter);
app.use(notFound);
app.use(errorHandler);

const start = async () => {
    try{
        await connectDB(process.env.MONGO_URI);
        app.listen(3000, () => console.log("Server is running"));
    } catch (err) {
        console.log(err);
    }
};

start();

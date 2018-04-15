"use strict";
/**
 * Expressアプリケーション
 */
const AWS = require("aws-sdk");
const cookieParser = require("cookie-parser");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
// tslint:disable-next-line:no-require-imports no-var-requires
const flash = require('express-flash');
// import * as flash from 'express-flash';
const createError = require("http-errors");
const http_status_1 = require("http-status");
const logger = require("morgan");
const path = require("path");
const redis = require("redis");
const session_1 = require("./middlewares/session");
const index_1 = require("./routes/index");
const app = express();
const COGNITO_REGION = process.env.COGNITO_REGION;
if (COGNITO_REGION === undefined) {
    throw new Error('Environment variable `COGNITO_REGION` required.');
}
// Redis Cacheクライアント
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    // tslint:disable-next-line:no-magic-numbers
    port: parseInt(process.env.REDIS_PORT, 10),
    password: process.env.REDIS_KEY,
    tls: { servername: process.env.REDIS_HOST }
});
// Cognitoサービスプロバイダー
const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({
    apiVersion: 'latest',
    region: COGNITO_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
app.use((req, __, next) => {
    req.redisClient = redisClient;
    req.cognitoidentityserviceprovider = cognitoidentityserviceprovider;
    next();
});
app.use(session_1.default);
app.use(flash());
// view engine setup
app.set('views', path.join(__dirname, '/../views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/../public')));
app.use('/', index_1.default);
// catch 404 and forward to error handler
app.use((__1, __2, next) => {
    next(createError(http_status_1.NOT_FOUND));
});
// error handler
app.use((err, req, res, __) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    const status = (err.status !== undefined) ? err.status : http_status_1.INTERNAL_SERVER_ERROR;
    res.status(status);
    res.render('error');
});
module.exports = app;

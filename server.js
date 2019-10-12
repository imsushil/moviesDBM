var express = require("express");
var app = express();

app.use(express.static(__dirname + "/resources")); // myApp will be the same folder name.
app.get("/", function (req, res,next) {
    res.sendFile( __dirname + "/index.html");
});
app.listen(process.env.PORT || 8080);
console.log("MyProject Server is Listening on port 8080");
var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
var fs = require("fs");
var builder = require("xmlbuilder");


router.use(bodyParser.urlencoded({extended: true}));

/* GET home page. */

router.get("/", function(req, res) {
  res.render("index", { title: "XML Conversion Receiver" });
});

router.post("/:template", function(req,res){
  console.log("Got a post at /" + req.params.template);

  var templateFile = "templates/" + req.params.template + ".js";
  if (!fs.existsSync(templateFile)){
    res.status(400).send("Invalid XML template specified.");
    return;
  }

  var xml = "";
  fs.readFile(templateFile,"utf8",function (err,data) {
    if(err) {
      res.status(500).send("Error reading template - " + err);
      return console.log(err);
    }

    xml = keyParser(eval(data), req.body);

    var dir = 'output';
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }

    fs.writeFile(dir + '/hello.txt', xml, function (err,data) {
      if (err) {
        res.status(500).send("Unable to write output xml - " + err);
        return console.log(err);
      }
    });
  });
});

//Parse the xml string and do a replace.
function keyParser(xml, postData) {
  for(var key in postData){
    xml = xml.replace('@'+key+'@', postData[key]);
  }

  xml = xml.replace(/@.+@/, "");
  return xml;
}

module.exports = router;

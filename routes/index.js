var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
var fs = require("fs");
var builder = require("xmlbuilder");
var sanitize = require("sanitize-filename");

router.use(bodyParser.urlencoded({extended: true}));

/* GET home page. */
router.get("/", function(req, res) {
  res.render("index", { title: "XML Conversion Receiver" });
});

/* POST data receiver*/
router.post("/:template", function(req,res){
  console.log("Got a post at /" + req.params.template);

  var templateFile = "templates/" + req.params.template + ".js";

  var xml = "";
  fs.readFile(templateFile,"utf8",function (err,data) {
    if(err) {
      if (err.code == "ENOENT")
      {
        res.status(400).send("Specified template not found.  If you want to use a default template, do not provide " +
          "a template in the URL.");
      }
      else
      {
        res.status(400).send("Error reading template - " + err);
      }
      return console.log(err);
    }

    xml = keyParser(eval(data), req.body);

    var dir = 'output';
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }

    var outputFile = sanitize(req.params.template);

    var fileCounter = 1;
    while(fs.existsSync(dir + "/" + outputFile + "_" + fileCounter + ".xml")){
      fileCounter++;
    }

    fs.writeFile(dir + "/" + outputFile + "_" + fileCounter + ".xml", xml, function (err,data) {
      if (err) {
        res.status(500).send("Unable to write output xml - " + err);
        return console.log(err);
      }
    });

    res.status(200).send("Output file generated.")
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

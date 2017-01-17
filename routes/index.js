var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
var fs = require("fs");
var builder = require("xmlbuilder");
var tmp = require("tmp");

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
      if (err.code == "ENOENT") {
        res.status(400).send("Specified template not found.");
      } else {
        res.status(400).send("Error reading template - " + err);
      }
      return console.log(err);
    }

    xml = keyParser(eval(data), req.body);

    var outputDir = 'output';
    fs.mkdir(outputDir,function(err){
      if(err && err.code != "EEXIST"){
        res.status(500).send("Output folder error - " + err);
        return console.log(err);
      }

      var outputFile = req.params.template;

      tmp.file({ mode: 0644, prefix: outputFile + '_', postfix: '.xml', dir: outputDir }, function _tempFileCreated(err, path, fd) {
        if (err){
          res.status(500).send("Create file error - " + err);
          return console.log(err);
        }

        fs.writeFile(path, xml, function (err,data) {
          if (err) {
            res.status(500).send("Unable to write output xml - " + err);
            return console.log(err);
          }

          res.status(200).send("Output file generated.")
        });
      });
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

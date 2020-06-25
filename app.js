const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let today = date.getDate();

mongoose.connect(
  "mongodb+srv://admin-ansh:Aniket@n0@cluster0-xydpn.mongodb.net/todolistDB?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
});
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "eat",
});
const item2 = new Item({
  name: "sleep",
});
const item3 = new Item({
  name: "repeat",
});
const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: { type: String, required: true },
  items: [itemSchema],
});
const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  

  Item.find({}, function (err, foundItems) {
    if (err) {
      console.log(err);
    } else {
      res.render("list", { listTitle: today, items: foundItems });
    }
  });
});

app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if(listName === today){
      item.save();
      res.redirect("/");
  }
  else{
      List.findOne({name: listName}, function (err, foundList){
          foundList.items.push(item);
          foundList.save();
          res.redirect("/"+listName);
      });
  }

});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;


    if(listName === today){
        Item.findByIdAndRemove(checkedItemId, function (error, item) {
          if (error) {
            console.log(error);
          } else {
            console.log(item.name + " removed successfullly!");
            res.redirect("/");
          }
        });
    }
    else{
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}, function (err, foundList){
            if(!err){
                res.redirect("/"+listName);
            }
        });
    }

  
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }, function (err, found) {
    if (!err) {
      if (!found) {
        //   create new list
        const list = new List({
          name: customListName
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
          res.render("list", { listTitle: customListName, items: found.items });
      }
    }
    else{
        console.log(err);
    }

  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("server up n running at port " + port);
});

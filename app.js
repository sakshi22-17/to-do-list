//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const url = 'mongodb://127.0.0.1:27017/newTodo';

// Connect to the database
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected successfully to database');
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err);
  });

  const itemSchema = new mongoose.Schema({
    name:String
  });
   
  const Item=mongoose.model("item",itemSchema);

  const listSchema = new mongoose.Schema({
    name : String,
    items : [itemSchema]
  });

  const List = mongoose.model("list",listSchema);

  const item1 = new Item({
    name:"welcome to our to do list"
  })

  
  const item2 = new Item({
    name:"hit the + button to add"
  })
  
  const item3 = new Item({
    name:"<-- hit this to delete the item"
  })

  const defaultItems = [item1,item2,item3];


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



app.get("/", function(req, res) {

  

  Item.find({}).then(foundItems=>{

    if(foundItems.length===0)
    {
      Item.insertMany(defaultItems).then(()=>{
        console.log("successfully saved");
      }).catch((err)=>{
        console.log("faild to saved");               // use of insertMany function to save many things
      });

      res.redirect("/");
    }
    else
    res.render("list",{listTitle: "Today",newListItems: foundItems});

  }).catch(err=>{
    console.log(err);
  });

});

app.get("/:customListName",function(req,res){
  

  if(req.params.customListName!="favicon.ico")
  {
    const customListName = _.capitalize(req.params.customListName);

  //console.log(customListName);
  

  List.findOne({ name : customListName}).then((list)=>{
    
    if(!list)
    {
      const list = new List({
        name:customListName,
        items : defaultItems
      });
    
      list.save();
      
      res.redirect("/"+customListName);
    }else{
      res.render("list",{listTitle : list.name , newListItems : list.items});
    }
  }).catch((err)=>{
    console.log(err);
  })
  }
  // const customListName = _.capitalize(req.params.customListName);

  // //console.log(customListName);
  

  // List.findOne({ name : customListName}).then((list)=>{
    
  //   if(!list)
  //   {
  //     const list = new List({
  //       name:customListName,
  //       items : defaultItems
  //     });
    
  //     list.save();
      
  //     res.redirect("/"+customListName);
  //   }else{
  //     res.render("list",{listTitle : list.name , newListItems : list.items});
  //   }
  // }).catch((err)=>{
  //   console.log(err);
  // })

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName==="Today")
  {
    item.save();
    res.redirect("/");
  }
  else
  {
    List.findOne({name:listName}).then(list=>{
      list.items.push(item);
      list.save();
      res.redirect("/"+listName);
    }).catch(err=>{
      console.log(err);
    })
  }

});

app.post("/delete",function(req,res){
  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;

  //console.log(checkItemId);

  console.log(listName);

  if(listName==="Today")
  {
    Item.findByIdAndRemove(checkItemId).then(deleted=>{
      console.log(deleted);                                   // to delete and document by its Id
      res.redirect("/");
    }).catch(err=>{
      console.log(err);
    });
  }
  else
  {
    List.findOneAndUpdate({name : listName}, {$pull : {items : {_id : checkItemId}}}).then(list=>{
      console.log(list);
      res.redirect("/"+listName);
    }).catch(err=>{
      console.log(err);
    })
  }

});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

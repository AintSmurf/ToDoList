const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const date = require(__dirname + "/helpers.js");
const _ = require('lodash');
require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// get request to handle the main
app.get('/', async (req, res) => {
    let day = date.get_date();
    let values = await read_from_database();
    res.render('list', { ListTitle: day, task: values });
});

// get request to handle the new pages
app.get('/:customListName', async (req, res) => {
    const customListName = _.capitalize(req.params.customListName);
    const value = await List.findOne({ name: customListName });
    if (!value) {
        const list = new List({
            name: customListName,
            items: defaultitems
        });
        list.save();
        res.redirect('/' + customListName);
    } else {
        res.render('list', { ListTitle: value.name, task: value.items });
    }

});

// post request to handle the form
app.post('/', async (req, res) => {
    const listname = req.body.list;
    const itemName = req.body.to_do;
    console.log(itemName);
    const Item = new item({
        name: itemName
    });
    if (itemName != '') {
        if (listname === date.get_date()) {
            await insertOne(itemName, item);
            res.redirect('/')
        }
        else {
            const name = await List.findOne({ name: listname });
            name.items.push(Item);
            name.save();
            await insertOne(Item, name.items);
            res.redirect('/' + listname);
        }
    }
    else {
        res.redirect('/');
    }
});

// delete request thats handles items users wanna remove
app.post('/delete', async (req, res) => {
    const listname = req.body.list_delete;
    const item_id = req.body.checkbox;
    if (date.get_date() != listname) {
        await find_and_update(listname, item_id)
        res.redirect('/' + listname);
    }
    else {
        console.log(listname);
        remove_from_database(item_id);
        res.redirect('/');
    }
});

const itemsSchema = new mongoose.Schema({
    name: String
});

// declare items schema for the new pages to be created by the users
const item = mongoose.model("item", itemsSchema);

const item1 = new item({
    name: "Welcome to your todolist"
});
const item2 = new item({
    name: "Hit the + button to add a new item"
});
const item3 = new item({
    name: "<-- hit this to delete an item."
});
const defaultitems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

// create new item
function create_item(value) {
    const new_item = { name: value };
    console.log("created an item for the database");
    return new_item;
}

// remove from the data base
async function remove_from_database(id) {
    try {
        const data = await item.findByIdAndRemove(id);
        console.log("deleted the value from the database");
    } catch (err) {
        console.error(err);
    }
}

// find and update
async function find_and_update(listname, item) {
    try {
        await List.findOneAndUpdate({ name: listname }, { $pull: { items: { _id: item } } });
        console.log("deleted the value from the database");
    } catch (err) {
        console.error(err);
    }
}


// read data from database
async function read_from_database() {
    try {
        const data = await item.find({});
        console.log("retrieved data from database");
        return data;
    } catch (err) {
        console.error(err);
        return [];
    }
}

// insert single item
async function insertOne(value, db) {
    try {
        await db.create(create_item(value));
        console.log("inserted one item successfully!");
    } catch (err) {
        console.error(err);
    }
}


app.on('close', () => {
    mongoose.connection.close();
});


app.listen(3000, () => {
    // Open the database connection at the start of the application
    mongoose.connect(process.env.url, { useNewUrlParser: true });
    console.log("server started .. ");
});

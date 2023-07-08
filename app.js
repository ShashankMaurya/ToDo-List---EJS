const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + '/date.js');
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb://127.0.0.1:27017/todoListDB");

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Why no name?']
    }
});

const HomeItem = mongoose.model('HomeItem', itemSchema);

const item1 = new HomeItem({
    name: 'Welcome to your ToDo List'
});

const item2 = new HomeItem({
    name: 'Hit the + button to add a new item'
});

const item3 = new HomeItem({
    name: '<-- Hit this to delete an item'
});

const defaultListItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Why no name?']
    },
    items: [itemSchema]
});

const List = mongoose.model('List', listSchema);

app.get('/', function (req, res) {

    HomeItem.find()
        .then((items) => {

            if (items.length === 0) {
                HomeItem.insertMany(defaultListItems)
                    .then(() => console.log('Successfully inserted 3 items'))
                    .catch((err) => console.log(err));
            }

            res.render('list', {
                listTitle: date.getDate(),
                newListItems: items
            });

        })
        .catch((err) => console.log(err));

});

app.post('/', function (req, res) {

    const newItem = new HomeItem({
        name: req.body.new_item
    });

    if (req.body.list === date.getDate()) {
        newItem.save()
            .then(() => console.log(req.body.new_item, 'is saved successfully'))
            .catch((err) => console.log(err));

        res.redirect('/');
    }
    else {
        List.findOne({ name: req.body.list })
            .then((foundList) => {
                foundList.items.push(newItem);
                foundList.save()
                    .then(() => console.log(newItem.name, 'is added to', req.body.list, 'List'))
                    .catch((err) => console.log(err));
            })
            .catch((err) => console.log(err));
        res.redirect('/' + req.body.list);
    }


});

app.post('/delete', function (req, res) {

    if (req.body.list === date.getDate()) {
        HomeItem.findByIdAndRemove(req.body.item_id)
            .then(() => {
                console.log('Item removed');
                res.redirect('/');
            })
            .catch((err) => console.log(err));
    }
    else {
        List.findOneAndUpdate({ name: req.body.list }, { $pull: { items: { _id: req.body.item_id } } })
            .then((foundList) => {
                console.log('Item deleted from', req.body.list, 'List');
                res.redirect('/' + req.body.list);
            })
    }

});

app.get('/:customList', function (req, res) {

    const customListName = _.capitalize(req.params.customList);

    List.findOne({ name: customListName })
        .then((foundList) => {
            if (!foundList) {

                new List({
                    name: customListName,
                    items: defaultListItems
                }).save()
                    .then(() => console.log(customListName, 'is saved successfully'))
                    .catch((err) => console.log(err));

                res.redirect('/' + customListName);
            }
            else {
                res.render('list', {
                    listTitle: customListName,
                    newListItems: foundList.items
                })

            }
        })
        .catch((err) => console.log(err));

});


app.listen(3000, function () {
    console.log('server started on port 3000...');
});
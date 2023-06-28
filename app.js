const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + '/date.js');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

const newItems = ['buy food', 'cook food', 'eat food'];
const workItems = [];

app.get('/', function (req, res) {
    // res.send("helo");


    res.render('list', {
        listTitle: date.getDate(),
        newListItems: newItems
    });

});

app.post('/', function (req, res) {

    console.log(req.body);
    if (req.body.list === 'Work List') {
        workItems.push(req.body.new_item);
        res.redirect('/work')
    }
    else {
        newItems.push(req.body.new_item);
        res.redirect('/');
    }

});

app.get('/work', function (req, res) {
    res.render('list', {
        listTitle: "Work List",
        newListItems: workItems
    });
});

app.post('/work', function (req, res) {
    workItems.push(req.body.new_item);
});

app.listen(3000, function () {
    console.log('server started on port 3000...');
});
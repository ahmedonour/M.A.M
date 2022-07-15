var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var sqlite = require("sqlite3");
const port = 8000;

const db = new sqlite.Database('./db/main.db');

const app = express();

//Midellewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.json());
app.use(express.static(path.join(__dirname , 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine' , 'pug');

// Fetch all orders data from the orders table
function fetchOrders(req, res, next) {
	db.all('SELECT rowid AS id, * FROM orders', function(err, rows) {
	  if (err) { return next(err); }
	  
	  var order = rows.map(function(row) {
		return {
			id: row.id,
			names: row.name,
			amount: row.amount,
			quantity: row.quantity,
			date: row.date,
			  url: '/' + row.id,
		}
	  });
		res.locals.order = order;
	  next();
	});
  }

// FETCHING DATA FORM THE DATABASE, AND SAVE IT IN MAP, IN ORDER TO RENDER IT TO index.pug. 
function fetchData(req, res, next) {
  db.all('SELECT rowid AS id, * FROM note', function(err, rows) {
    if (err) { return next(err); }
    
    var todos = rows.map(function(row) {
      return {
          id: row.id,
          title: row.title,
		  count: row.count,
	  	  date: row.date,
	  	  url: '/' + row.id,
      }
    });
	  res.locals.todos = todos;
    next();
  });
}
//HOME ROUTE.
app.get('/', (req,res) => {
	res.render('home');
})
// RENDERING THE INDEX.PUG FILE
app.get('/dept', fetchData, (req ,res) =>{

	res.render('index' , {	data: res.locals.todos})
});


//ADDING A NEW DATA USING POST
app.post('/add', (req,res)=>{
	// FETCHING THE DATA FROM THE FORM.
	const title = req.body.title;
	const count = req.body.count;
	const timeElap = Date.now()
	const dateNow = new Date(timeElap);
	//INSERTING THE DATA TO THE DATABASE.
	db.run('INSERT INTO note VALUES(? ,?, ?)',[
		title,
		count,
		dateNow.toUTCString()
	]);
	res.redirect('/dept')
});
// DELETING A DATA FROM THE DATABASE.
app.post('/:id(\\d+)/delete', function(req, res, next) {
  db.run('DELETE FROM note WHERE rowid = ?', [
    req.params.id,
  ], function(err) {
    if (err) { return next(err); }
    return res.redirect('/dept');
  });
});
// Updating a data in the database.
app.post('/:id(\\d+)/update', function(req, res, next) {
	db.run('UPDATE note SET title = ?, count = ? WHERE rowid = ?', [
	  req.body.title,
	  req.body.count,
	  req.params.id,
	], function(err) {
	  if (err) { return next(err); }
	  return res.redirect('/dept');
	});
	console.log(req.body.title,
		req.body.count,
		req.params.id);
});

//Order Page Route.
app.get('/order', fetchOrders, (req,res)=>{
	res.render('order', {data: res.locals.order})
});

//Adding a new order to the database.
app.post('/addOrder',(req,res)=>{
	const names = req.body.names;
	const amount = req.body.amount;
	const quantity = req.body.quantity;
	const timeElap = Date.now()
	const dateNow = new Date(timeElap);
	//INSERTING THE DATA TO THE DATABASE.
	db.run('INSERT INTO orders VALUES(? ,?, ?, ?)',[
		names,
		amount,
		quantity,
		dateNow.toUTCString()
	]);
	res.redirect('/order')
});

app.post('/:id(\\d+)/deleteOrder', function(req, res, next) {
	db.run('DELETE FROM orders WHERE rowid = ?', [
	  req.params.id,
	], function(err) {
	  if (err) { return next(err); }
	  return res.redirect('/order');
	});
  });
  // Updating a data in the database.
  app.post('/:id(\\d+)/updateOrder', function(req, res, next) {
	  db.run('UPDATE orders SET name = ?, amount = ? , quantity = ? WHERE rowid = ?', [
		req.body.names,
		req.body.amount,
		req.body.quantity,
		req.params.id,
	  ], function(err) {
		if (err) { return next(err); }
		return res.redirect('/order');
	  });
	  console.log(req.body.names,
		  req.body.amount,
		  req.body.quantity,
		  req.params.id);
  });
//FIRE THE SERVER.
app.listen(port, ()=>{
	console.log(`The App is started in http://localhost:${port}`)
});




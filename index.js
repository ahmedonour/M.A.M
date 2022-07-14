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
      }
    });
	  res.locals.todos = todos;
    next();
  });
}
//HOME ROUTE.
app.get('/', fetchData, (req ,res) =>{

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
	res.redirect('/')
});

//FIRE THE SERVER.
app.listen(port, ()=>{
	console.log(`The App is started in http://localhost:${port}`)
});




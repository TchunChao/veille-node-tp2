const express = require('express');
const fs = require('fs');
const util = require("util");
const app = express();
const bodyParser= require('body-parser');
const MongoClient = require('mongodb').MongoClient; // le pilote MongoDB
const ObjectID = require('mongodb').ObjectID;
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(bodyParser.json())
/* on associe le moteur de vue au module «ejs» */
app.use(express.static('public'));

const i18n = require("i18n");
i18n.configure({ 
   locales : ['fr', 'en'],
   cookie : 'langueChoisie', 
   directory : __dirname + '/locales' })
/* Ajoute l'objet i18n à l'objet global «res» */
app.use(i18n.init);

let db // variable qui contiendra le lien sur la BD

MongoClient.connect('mongodb://127.0.0.1:27017', (err, database) => {
 if (err) return console.log(err)
 db = database.db('carnet_adresse')
console.log('connexion à la BD')
// lancement du serveur Express sur le port 8081
 app.listen(8081, (err) => {
 	if (err) console.log(err)
 console.log('connexion à la BD et on écoute sur le port 8081')
 })
})


/*
Les routes
*/

////////////////////////////////////////// Route /
app.set('view engine', 'ejs'); // générateur de template

//////////////////////////////////////////
app.get('/', function (req, res) {
	/* pour extraire l'ensemble des cookies */
	 console.log('Cookies: ', req.cookies)
	/* Pour récupérer la valeur d'un cookie spécifique « langueChoisie » */
	 console.log('Cookies: ', req.cookies.langueChoisie)

	res.render('accueil.ejs')  
  });


app.get('/:locale(en|fr)',  (req, res) => {
  console.log("req.params.local = " + req.params.locale)
  res.cookie('langueChoisie', req.params.locale)
  // on récupère le paramètre de l'url pour enregistrer la langue
  res.setLocale(req.params.locale)
  // on peut maintenant traduire
  res.redirect(req.get('referer'))
})


//////////////////////////////////////////  Route Adresse
app.get('/adresse', function (req, res) {
   var cursor = db.collection('adresse')
                .find().toArray(function(err, resultat){
 if (err) return console.log(err)        
 res.render('adresse.ejs', {adresses: resultat})   
  });
})
//////////////////////////////////////////  Route Rechercher
app.post('/rechercher',  (req, res) => {

})
////////////////////////////////////////// Route /ajouter
app.post('/ajouter', (req, res) => {
console.log('route /ajouter')	
 db.collection('adresse').save(req.body, (err, result) => {
 if (err) return console.log(err)
 // console.log(req.body)	
 console.log('sauvegarder dans la BD')
 //res.redirect('/adresse')
 res.redirect('/adresse');
 })
})

////////////////////////////////////////  Route /modifier
app.post('/modifier', (req, res) => {
console.log('route /modifier')
// console.log('util = ' + util.inspect(req.body));
req.body._id = 	ObjectID(req.body._id)
 db.collection('adresse').save(req.body, (err, result) => {
	 if (err) return console.log(err)
	 console.log('sauvegarder dans la BD')
	 res.redirect('/adresse');
	 })
})


////////////////////////////////////////  Route /detruire
app.get('/detruire/:id', (req, res) => {
 console.log('route /detruire')
 // console.log('util = ' + util.inspect(req.params));	
 var id = req.params.id
 console.log(id)
 db.collection('adresse').findOneAndDelete({"_id": ObjectID(req.params.id)}, (err, resultat) => {
if (err) return console.log(err)
	res.redirect('/adresse')
 })
})


///////////////////////////////////////////////////////////   Route /trier
app.get('/trier/:cle/:ordre', (req, res) => {

 let cle = req.params.cle
 let ordre = (req.params.ordre == 'asc' ? 1 : -1)
 let cursor = db.collection('adresse').find().sort(cle,ordre).toArray(function(err, resultat){

  ordre = (req.params.ordre == 'asc' ? 'desc' : 'asc')  
 res.render('adresse.ejs', {adresses: resultat, cle, ordre })	
})

}) 


/////////////////////////////////////////////////////////  Route /peupler
app.get('/vider', (req, res) => {

	let cursor = db.collection('adresse').drop((err, res)=>{
		if(err) console.error(err)
			console.log('ok')
			
		})
	res.redirect('/adresse')
})


////////////////////////////////////////  Route /ajax_modifier
app.post('/ajax_modifier', (req, res) => {
console.log('route /ajax_modifier')
// console.log('util = ' + util.inspect(req.body));
req.body._id = 	ObjectID(req.body._id)
 db.collection('adresse').save(req.body, (err, result) => {
	 if (err) return console.log(err)
	 console.log('sauvegarder dans la BD')
	 res.send(JSON.stringify(req.body));
	 })
})

////////////////////////////////////////  Route /ajax_detruire
app.get('/ajax_detruire/:id', (req, res) => {
 console.log('route /ajax_detruire')
 // console.log('util = ' + util.inspect(req.params));
 var id = req.params.id
 console.log(id)
 db.collection('adresse').findOneAndDelete({"_id": ObjectID(req.params.id)}, (err, resultat) => {

if (err) return console.log(err)
 res.send(JSON.stringify(ObjectID(req.params.id)));
 })
})

////////////////////////////////////////// Route /ajax_ajouter
app.post('/ajax_ajouter', (req, res) => {
console.log('route /ajax_ajouter')	
 db.collection('adresse').save(req.body, (err, result) => {
 if (err) return console.log(err)
 // console.log(req.body)	
 console.log('sauvegarder dans la BD')
 res.send(JSON.stringify(req.body));
 })
})
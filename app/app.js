// Required modules
const express = require("express");
const hbs = require( 'express-handlebars');
const session = require('express-session');
const bodyParser=require("body-parser");
var mongoClient = require('mongodb').MongoClient;

// Port for server to listen on
const PORT = 8888;

const appDbUrl = 'mongodb://localhost:27017';
var doctordb;
var crowdmeddb;
var patientsColl;
var admissionsColl;
var prescriptionsColl;
var usersColl;

mongoClient.connect(appDbUrl, function(err, client) {
    doctordb = client.db('doctordb');
    patientsColl = doctordb.collection('patients');
    admissionsColl = doctordb.collection('admissions');
    prescriptionsColl = doctordb.collection('prescriptions');

    crowdmeddb = client.db('crowdmed');
    usersColl = crowdmeddb.collection('users');
    tagsColl = crowdmeddb.collection('tags');


    app.listen(PORT);
});

// Create express instance
const app = express();

// Set view engine, static directory, sessions
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json()); 
app.set('view engine', 'hbs');
app.engine( 'hbs', hbs( {
  extname: 'hbs',
  // defaultView: 'default',
  // layoutsDir: __dirname + '/views/pages/',
  // partialsDir: __dirname + '/views/partials/'
}));
app.use(express.static('public'));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Declare routes
// Index route - render index if logged in, redirect to login page otherwise
app.get("/", (req, res) => {
    if (!req.session.loggedin) {
        return res.redirect('/login');
    }
    if (req.session.role == 3) {
        return res.redirect('/register');
    }
    if (req.session.role == 0) {
        return res.render('patient', {username: req.session.username, layout: false});
    }
    if (req.session.role == 2) {
        return res.render('researcher', {username: req.session.username, layout: false});
    }
    return res.render('doctor', {username: req.session.username, layout: false});
});

// Login route
app.get("/login", (req,res) => {
    if (req.session.loggedin) {
        res.redirect('/login');
    }
    res.render('login', {layout: false});
});

// Handle login action
app.post("/login", (req, res) => {
    let username_ = req.body.username_;
    var password_ = req.body.password_;
    usersColl.find({username: username_, password: password_}).toArray(function (err, records) {
        if (records.length == 0) {
            res.send({msg: 1});
        }
        else {
            req.session.loggedin = true;
            req.session.username = username_;
            req.session.role = records[0].role;
            req.session.database = records[0].localdb;
            res.send({msg: 0});
        }
    })
});

// Handle logout action
app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/');
    });
});

// Registration handlers
app.get("/register", (req, res) => {
    if (!req.session.loggedin) {
        return res.redirect('/login');
    }
    if (req.session.username == "admin") {
        var authorized_ = true;
    }
    res.render('register', {authorized: authorized_, currentUser: req.session.username, layout: false});
});
app.post("/register", (req, res) => {
    var username_ = req.body.username_;
    usersColl.find({username: username_}).toArray(function (err, records) {
        if (records.length == 0) {
            var password_ = req.body.password_;
            var localdb_ = req.body.localdb_;
            var profiletype_ = req.body.profiletype_;
            usersColl.insertOne({ username: username_, password: password_, localdb: localdb_, role: profiletype_ }, function (err, user) {
              if (err) console.log(err);
              else res.send({msg: 0});
            });
        }
        else {
            res.send({msg: 1});
        }
    });
});

String.prototype.hashCode = function() {
    var hash = 0;
    if (this.length == 0) {
        return hash;
    }
    for (var i = 0; i < this.length; i++) {
        var char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
};

// Render EMR view as separate page
app.get("/viewEMR", (req, res) => {
    if (req.query.mode == 3) {
        keyList = {};
        keyList.AdmissionInfo = ["SUBJECT_ID","HADM_ID","ADMITTIME","DISCHTIME","DEATHTIME","ADMISSION_TYPE","ADMISSION_LOCATION","DISCHARGE_LOCATION","INSURANCE","LANGUAGE","RELIGION","MARITAL_STATUS","ETHNICITY","EDREGTIME","EDOUTTIME","DIAGNOSIS","HOSPITAL_EXPIRE_FLAG","HAS_CHARTEVENTS_DATA"];
        keyList.PatientInfo = ["SUBJECT_ID","GENDER","DOB","DOD","DOD_HOSP","DOD_SSN","EXPIRE_FLAG"];
        keyList.Prescriptions = ["SUBJECT_ID","HADM_ID","ICUSTAY_ID","STARTDATE","ENDDATE","DRUG_TYPE","DRUG","DRUG_NAME_POE","DRUG_NAME_GENERIC","FORMULARY_DRUG_CD","GSN","NDC","PROD_STRENGTH","DOSE_VAL_RX","DOSE_UNIT_RX","FORM_VAL_DISP","FORM_UNIT_DISP","ROUTE"];
        return res.send(keyList);
    }
    let retObj = {};
    admissionsColl.find({'HADM_ID': parseInt(req.query.query)}, {projection: {_id: 0, ROW_ID: 0}}).toArray(function(err, records) {
        retObj.AdmissionInfo = records[0];
        prescriptionsColl.find({'HADM_ID': parseInt(req.query.query)}, {projection: {_id: 0, ROW_ID: 0}}).toArray(function(err, records) {
            retObj.Prescriptions = records;
            patientsColl.find({'SUBJECT_ID': retObj.AdmissionInfo.SUBJECT_ID}, {projection: {_id: 0, ROW_ID: 0}}).toArray(function(err, records) {
                retObj.PatientInfo = records[0];
                let verified_ = (JSON.stringify(retObj).hashCode().toString() == req.query.hash);
                if (req.query.mode == 1) {
                    retObj.creator = req.query.creator;
                    retObj.verified = verified_;
                    res.render('emr', {emr: [retObj], idx: req.query.idx, layout: false});
                }
                else if (req.query.mode == 2) {
                    keyList = {};
                    keyList.AdmissionInfo = Object.keys(retObj.AdmissionInfo);
                    keyList.PatientInfo = Object.keys(retObj.PatientInfo);
                    if (retObj.Prescriptions.length > 0) {
                        keyList.Prescriptions = Object.keys(retObj.Prescriptions[0]);
                    }
                    res.send(keyList);
                }
                else {res.send({retObj});}
            })
        });
    });
});

let queryPromise = (queryIn) => {
    return new Promise(resolve => {
        let retObj = [];
        let query = [];
        for (let i = 0; i < queryIn.rec.length; i++) {
            query.push({'HADM_ID': parseInt(queryIn.rec[i])});
        }
        let admFields = {_id: 0, SUBJECT_ID: 1};
        let patFields = {_id: 0, SUBJECT_ID: 1};
        let prescripFields = {_id: 0};
        for (let i = 0; i < queryIn.fields.AdmissionInfo.length; i++) {
            admFields[queryIn.fields.AdmissionInfo[i]] = 1;
        }
        for (let i = 0; i < queryIn.fields.PatientInfo.length; i++) {
            patFields[queryIn.fields.PatientInfo[i]] = 1;
        }
        for (let i = 0; i < queryIn.fields.Prescriptions.length; i++) {
            prescripFields[queryIn.fields.Prescriptions[i]] = 1;
        }
        admissionsColl.find({$or: query}, {projection: admFields}).toArray(function(err, records) {
            let admissionRes = records;
            prescriptionsColl.find({$or: query}, {projection: prescripFields}).toArray(function(err, records) {
                let prescriptionRes = records;
                query = [];
                for (let i = 0; i < admissionRes.length; i++) {
                    query.push({'SUBJECT_ID': parseInt(admissionRes[i].SUBJECT_ID)});
                }
                patientsColl.find({$or: query}, {projection: patFields}).toArray(function(err, records) {
                    let patientRes = records;
                    for (let i = 0; i < admissionRes.length; i++) {
                        let temp = {};
                        temp.AdmissionInfo = admissionRes[i];
                        temp.Prescriptions = [];
                        for (let j = 0; j < prescriptionRes.length; j++) {
                            if (prescriptionRes[j].HADM_ID == admissionRes[i].HADM_ID) {
                                temp.Prescriptions.push(prescriptionRes[j]);
                            }
                        }
                        for (let k = 0; k < patientRes.length; k++) {
                            if (patientRes[k].SUBJECT_ID == admissionRes[i].SUBJECT_ID) {
                                temp.PatientInfo = patientRes[k];
                                break;
                            }
                        }
                        retObj.push(temp);
                    }
                    resolve(retObj);
                });
            });
        });
    })
    
}

// Render group of medical records
app.get("/viewEMRGroup", (req, res) => {
    let queryObj = JSON.parse(req.query.query);
    let promises = [];
    for (let i = 0; i < queryObj.groups.length; i++) {
        if (queryObj.groups[i]["rec"].length > 0) {
            promises.push(queryPromise(queryObj.groups[i]));
        }
    }
    Promise.all(promises).then(response => {
        if (req.query.mode == 1) {
            let merged = [].concat.apply([], response);
            res.render('emr', {emr: merged, customFields: queryObj["customFields"], layout: false});
        }
        else {res.send({response})};
    }) 
    
});

// Doctor suggested tags
app.get("/getTags", (req, res) => {
    tagsColl.find({subject: req.session.username}).toArray(function(err, records) {
        res.send(records);
    });
});
app.post("/addTag", (req, res) => {
    let item = {
        tagType: req.body.params.type,
        tagValue: req.body.params.value,
        sender: req.session.username,
        subject: req.body.params.subject
    };
    tagsColl.insertOne(item, (err, record) => {
        if (err) console.log(err);
        else res.send({msg: 0});
    });
});
app.post("/removeTag", (req, res) => {
    tagsColl.deleteOne({
        tagType: req.body.params.type,
        tagValue: req.body.params.value,
        sender: req.body.params.sender,
        subject: req.session.username
    }, (err, record) => {
        console.log("tag deleted");
        res.send({msg: "tag deleted"});
    });
});


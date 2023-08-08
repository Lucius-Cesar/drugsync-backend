var express = require("express");
const { checkBody } = require("../modules/checkBody");
var router = express.Router();
const Patient = require("../models/patients");
const Drug = require("../models/drugs");


router.post("/", (req,res) => {
    if (
        !checkBody(req.body,[
            "name",
            "currentTreatment",
            "pathologies"
        ])
    ){
        res.json({ result : false, error: "Missing , empty or incorrect field"})
        return;
    }
    //Check if patient is already registered

    Patient.find({ name: {$regex: new RegExp(req.body.name , "i")} })
    .then((data) => { 
        let nbr
        if(data){
        nbr = data.length +1
    }
    else{
        nbr = 1
    }


// grâce à req.body.currentTreatment récupérer les id des médocs contenus dans le tab
    const currentTreatment = req.body.currentTreatment
// Drugs.find() doit renvoyer les documents des médocs ,
    Drug.find({
        name: { $in: currentTreatment}
    }).then( drugs => {
// Créer un tableau d'IDs de médicaments à partir des médicaments récupérés
    const drugIds = drugs.map(drug => drug._id)

        const newPatient = new Patient({
            name: req.body.name + nbr,
            currentTreatment : drugIds,
            pathologies: req.body.pathologies
        }) 
        
        newPatient.save().then((newDoc)=>{
            res.json({result : true, newDoc})
        })
        })

    })

    })

    // router qui va permettre d'afficher tous les patients 

    router.get("/allPatients", (req,res)=>{
        Patient.find()
        .then(data=>{
            res.json({patients : data})
        })
    })

    //Récupérer les info relatives à un patient,utiliser un populate pour récupérer toutes les informations relatives au currentTreatment
    router.get("/:name",(req,res)=>{
        Patient.findOne({name : req.params.name})
        .populate("currentTreatment")
        .then(data=>{
            res.json({infoPatients : data})
        })
    })

    //Supprimer un patient
    router.delete("/deletePatient/:name",(req,res)=>{
        Patient.deleteOne({name : req.params.name})
        .then(data=>{
            if(data){
                res.json({delete : true})
            }
            else{
                res.json({delete : false})
            }
        })
    })

    //update patient pour pouvoir mettre a jour les currentTreatment et les pathologies

    router.post("/updatePatient",(req,res)=>{

        const currentTreatment = req.body.currentTreatment

        Drug.find({
            name: { $in: currentTreatment}
        })
        .then(drugs=>{
            const drugIds = drugs.map(drug => drug._id)
         
        Patient.findOneAndUpdate(
            {name : req.body.name},
            { currentTreatment : drugIds,
            pathologies: req.body.pathologies})
        .then(data=>{
            res.json({updatePatient : data})
        })
    })
        })




    module.exports = router;

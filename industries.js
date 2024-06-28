const express=require('express');
const ExpressError=require('../expressError');
const db=require('../db');
const router=new express.Router();

router.get('/', async function(req,res,next){
    try{
        const result=await db.query("SELECT i.code, i.industry, ARRAY_AGG(ic.company_code) AS companies FROM industries AS i LEFT JOIN industries_companies AS ic ON i.code=ic.industry_code GROUP BY i.code,i.industry");
        return res.json({industries:result.rows});
    } catch(err){
        return next(err);
    }
});

router.post("/", async function(req,res,next){
    try{
        const {code, industry}=req.body;
        const result=await db.query("INSERT INTO industries (code,industry) VALUES ($1,$2) RETURNING code,industry",[code,industry]);
        return res.status(201).json({industry:result.rows[0]});
    } catch(err){
        return next(err);
    }
});

router.post("/:code", async function(req,res,next){
    try{
        const {code}=req.params;
        const {company_code}=req.body;
        const result=await db.query("INSERT INTO industries_companies (industry_code,company_code) VALUES ($1,$2) RETURNING industry_code,company_code",[code,company_code]);
        return res.status(201).json({industry_company:result.rows[0]});
    } catch(err){
        return next(err);
    }
});

module.exports=router
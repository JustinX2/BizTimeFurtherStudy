const express=require('express');
const slugify=require('slugify');
const router=new express.Router();
const db=require('../db');
const ExpressError=require('../expressError');

//GET Companies
router.get('/', async function(req,res,next){
    try{
        const result=await client.query("SELECT code, name FROM companies");
        return res.json({companies:result.rows});
    } catch(err){
        return next(err);
    }
});

//GET Company by code
router.get("/:code", async function(req,res,next){
    try{
        const {code}=req.params;
        const companyResult=await db.query("SELECT c.code, c.name, c.description, i.industry FROM companies AS c JOIN industries_companies AS ic ON c.code=ic.company_code JOIN industries AS i ON ic.industry_code=i.code WHERE c.code=$1",[code]);
        if (companyResult.rows.length===0){
            throw new ExpressError(`No such company: ${code}`,404);
        }
        const {name, description}=companyResult.rows[0];
        const industries=companyResult.rows.map(r=>r.industry).filter(i=>i!==null);
        const invoiceResult=await db.query("SELECT id FROM invoices WHERE comp_code=$1",[code]);
        const invoices=invoiceResult.rows.map(inv=>inv.id);
        return res.json({company:{code,name,description,industries,invoices}});
    } catch(err){
        return next(err);
    }
});

//POST Company
router.post('/', async function(req,res,next){
    try{
        const {name, description}=req.body;
        const code=slugify(name,{lower:true, strict:true});
        const result=await db.query("INSERT INTO companies (code,name,description) VALUES ($1,$2,$3) RETURNING code,name,description",[code,name,description]);
        return res.status(201).json({company:result.rows[0]});
    } catch(err){
        return next(err);
    }
});

//PUT Company/:code
router.put("/:code", async function(req,res,next){
    try{
        const {code}=req.params;
        const {name,description}=req.body;
        const result=await db.query("UPDATE companies SET name=$1,description=$2 WHERE code=$3 RETURNING code,name,description",[name,description,code]);
        if(result.rows.length===0){
            throw new ExpressError(`No such company: ${code}`,404);
        }
        return res.json({company:result.rows[0]});
    } catch(err){
        return next(err);
    }
});

//DELETE Company/:code
router.delete("/:code", async function(req,res,next){
    try{
        const {code}=req.params;
        const result=await client.query("DELETE FROM companies WHERE code=$1 RETURNING code",[code]);
        if(result.rows.length===0){
            throw new ExpressError(`No such company: ${code}`,404);
        }
        return res.json({status:"deleted"});
    } catch(err){
        return next(err);
    }
});
//routes/invoices.js
const express=require('express');
const ExpressError=require('../expressError');
const router=new express.Router();
const db=require('../db');

//GET Invoices
router.get('/', async function(req,res,next){
    try{
        const result=await db.query("SELECT id, comp_code FROM invoices");
        return res.json({invoices:result.rows});
    } catch(err){
        return next(err);
    }
});

//GET invoices:id
router.get("/:id", async function(req,res,next){
    try{
        const{id}=req.params;
        const result=await db.query("SELECT i.id, i.comp_code, i.amt, i.paid, i.add_date, i.paid_date, c.name, c.description FROM invoices AS i JOIN companies AS c ON (i.comp_code=c.code) WHERE id=$1",[id]);

        if(result.rows.length===0){
            throw new ExpressError(`No such invoice: ${id}`,404);
        }
        const {amt, paid, add_date, paid_date, code, name, description}=result.rows[0];
        return res.json({invoice:{id,amt,paid,add_date,paid_date,company:{code,name,description}}});
        } catch(err){
            return next(err);
        }
    });

//POST Invoice
router.post('/', async function(req,res,next){
    try{
        const{comp_code,amt}=req.body;
        const result=await db.query("INSERT INTO invoices (comp_code,amt) VALUES ($1,$2) RETURNING id,comp_code,amt,paid,add_date,paid_date",[comp_code,amt]);

        return res.status(201).json({invoice:result.rows[0]});
    } catch(err){
        return next(err);
    }
});

//PUT Invoice/:id
router.put("/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const { amt, paid } = req.body;
      let paidDate = null;
  
      const currentInvoice = await db.query("SELECT paid FROM invoices WHERE id = $1", [id]);
      if (currentInvoice.rows.length === 0) {
        throw new ExpressError(`Invoice with id ${id} not found`, 404);
      }
      const currentPaidStatus = currentInvoice.rows[0].paid;
      
      if (paid && !currentPaidStatus) {
        paidDate = new Date();
      } else if (!paid) {
        paidDate = null;
      } else {
        const result = await db.query("SELECT paid_date FROM invoices WHERE id = $1", [id]);
        paidDate = result.rows[0].paid_date;
      }
  
      const result = await db.query(
        "UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id=$4 RETURNING id, comp_code, amt, paid, add_date, paid_date",
        [amt, paid, paidDate, id]
      );
  
      return res.json({ invoice: result.rows[0] });
    } catch (err) {
      return next(err);
    }
  });

//DELETE Invoice/:id
router.delete("/:id", async function(req,res,next){
    try{
        const{id}=req.params;
        const result=await client.query("DELETE FROM invoices WHERE id=$1 RETURNING id",[id]);

        if(result.rows.length===0){
            throw new ExpressError(`No such invoice: ${id}`,404);
        }

        return res.json({status:"deleted"});
    } catch(err){
        return next(err);
    }
});

module.exports=router;
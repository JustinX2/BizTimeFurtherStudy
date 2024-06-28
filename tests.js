const request= require('supertest');
const app=require('../app');
const db=require('../db');

beforeEach(async function(){
    await db.query("DELETE FROM company_industry");
    await db.query("DELETE FROM invoices");
    await db.query("DELETE FROM companies");
    await db.query("DELETE FROM industries");
    await db.query("INSERT INTO companies (code,name,description) VALUES ('apple','Apple','Maker of OSX.')");
    await db.query("INSERT INTO industries (code,industry) VALUES ('tech','Technology')");
    await db.query("INSERT INTO company_industry (company_code,industry_code) VALUES ('apple','tech')");
    await db.query("INSERT INTO invoices (comp_code,amt) VALUES ('apple',100)");
});

afterAll(async function(){
    await db.end();
});

describe('GET /companies', function(){
    test('Get a list of all companies', async function(){
        const response=await request(app).get('/companies');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({companies:[{code:'apple',name:'Apple'}]});
    });
});

describe('GET /companies/:code', function(){
    test('Get a single company', async function(){
        const response=await request(app).get('/companies/apple');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({company:{code:'apple',name:'Apple',description:'Maker of OSX.',industries:['Technology'],invoices:[100]}});
    });
    test('Respond with 404 for invalid company code', async function(){
        const response=await request(app).get('/companies/invalid');
        expect(response.statusCode).toBe(404);
    });
});

describe('POST /companies', function(){
    test('Create a new company', async function(){
        const response=await request(app).post('/companies').send({name:'Google',description:'Search Engine'});
        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({company:{code:'google',name:'Google',description:'Search Engine'}});
    });
});

describe('PUT /companies/:code', function(){
    test('Update a company', async function(){
        const response=await request(app).put('/companies/apple').send({name:'Apple Inc.',description:'Maker of iPhone.'});
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({company:{code:'apple',name:'Apple Inc.',description:'Maker of iPhone.'}});
    });
    test('Respond with 404 for invalid company code', async function(){
        const response=await request(app).put('/companies/invalid').send({name:'Invalid',description:'Invalid'});
        expect(response.statusCode).toBe(404);
    });
});
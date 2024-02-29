const express = require('express');
const Server = express();
const randomBytes = require('random-bytes');
const path = require('path');
const request = require('request');
const helpers = require('./Helpers');
const cors = require('cors');
const mongoose = require('mongoose');
const TestResult = require('./models/speedtest.model');
require('dotenv').config();

let cache;

Server.use(cors());

Server.get('/empty', function (req, res) {
  res.status(200).send('');
});

Server.post('/empty', function (req, res) {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    res.set("Cache-Control", "post-check=0, pre-check=0");
    res.set("Pragma", "no-cache");
    res.status(200).send('');
});

Server.get('/garbage', function (req, res) {
    res.set('Content-Description', 'File Transfer');
    res.set('Content-Type', 'application/octet-stream');
    res.set('Content-Disposition', 'attachment; filename=random.dat');
    res.set('Content-Transfer-Encoding', 'binary');
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.set('Cache-Control', 'post-check=0, pre-check=0', false);
    res.set('Pragma', 'no-cache');
    const requestedSize = (req.query.ckSize || 100);

    const send = () => {
        for (let i = 0; i < requestedSize; i++)
            res.write(cache);
        res.end();
    }

    if (cache) {
        send();
    } else {
        randomBytes(1048576, (error, bytes) => {
            cache = bytes;
            send();
        });
    }

});

Server.get('/getIP', function (req, res) {
    let requestIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.headers['HTTP_CLIENT_IP'] || req.headers['X-Real-IP'] || req.headers['HTTP_X_FORWARDED_FOR'];
    if (requestIP.substr(0, 7) === "::ffff:") {
        requestIP = requestIP.substr(7)
    }
    request('https://ipinfo.io/' + requestIP + '/json', function (err, body, ipData) {
        ipData = JSON.parse(ipData);
        if (err) res.send(requestIP);
        else {
            request('https://ipinfo.io/json', function (err, body, serverData) {
                serverData = JSON.parse(serverData);
                if (err) res.send(`${requestIP} - ${ipData.org}, ${ipData.country}`);
                else if (ipData.loc && serverData.loc) {
                    const d = helpers.calcDistance(ipData.loc.split(','), serverData.loc.split(','));
                    res.send(`${requestIP} - ${ipData.org}, ${ipData.country} (${d}km)`);
                } else {
                    res.send(`${requestIP} - ${ipData.org}, ${ipData.country}`);
                }
            })
        }
    });
});

Server.use(express.json());

Server.get('/health',(req,res)=>{
    res.status(200).json({'message':"System up and running"});
})

Server.post('/saveResult',async (req,res)=>{
    try {
        const testResult= new TestResult(req.body);
        await testResult.save();
        res.status(200).json({'message':'Test Result saved','data':testResult});
    } catch (error) {
        res.status(500).json({'message':"Test Result save failed","error":error.message});
    }
})

Server.get('/getResult',async (req,res)=>{
    try {
        let testResult;
        if(req.query.id){
            testResult=await TestResult.findById(req.query.id);
            res.status(200).json({'message':`Result of id ${req.query.id}`,'data':testResult});
        }
        else{
            testResult=await TestResult.find();
            res.status(200).json({'message':'List of all results','data':testResult});
        }
    } catch (error) {
        res.status(500).json({'message':"Test Results fetch failed","error":error.message});
    }
})

Server.get('/getResultByTenantid/:id',async (req,res)=>{
    try {
        let id=req.params.id;
        if(id){
            const testResult=await TestResult.find({tenant_id:id});
            res.status(200).json({'message':`List of results with tenant id ${id}`,'data':testResult});
        }
        else{
            res.status(400).json({'message':'tenant id required'});
        }
    } catch (error) {
        res.status(500).json({'message':"Test Results fetch failed","error":error.message});
    }
})

Server.get('/ipInfo',async (req,res)=>{
    try {
        let requestIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.headers['HTTP_CLIENT_IP'] || req.headers['X-Real-IP'] || req.headers['HTTP_X_FORWARDED_FOR'];
        if (requestIP.substr(0, 7) === "::ffff:") {
            requestIP = requestIP.substr(7)
        }   
        request(`https://ipinfo.io/${requestIP}/json`,(error, response, body)=>{
            if(error){
                res.status(500).json({'message':"IP Info fetch failed","error":error.message});
            }
            else{
                body=JSON.parse(body);
                res.status(200).json({'message':"IP Info succesfully fetched",'data':body});
            }
        })
    } catch (error) {
        res.status(500).json({'message':"IP Info fetch failed","error":error.message});
    }
})

const googleMapsURL=`https://maps.googleapis.com/maps/api/geocode/json?latlng=`

Server.get('/getLocation',async(req, res)=>{
    try {
        const lat=req.query.lat;
        const long=req.query.long;
        if(!lat || !long){
            throw new Error("lat long query required as ?lat=&long=");
        }
        request(`${googleMapsURL}${lat},${long}&key=${process.env.GOOGLE_API_KEY}`,(error, response, body)=>{
            if(error){
                res.status(500).json({'message':"Location fetch Failed","error":error.message});
            }
            else{
                const response={};
                body=JSON.parse(body);
                response.plus_code={
                    compound_code:body?.plus_code?.compound_code,
                    global_code:body?.plus_code?.global_code
                }
                const relevant_data=body?.results[0];
                response.address=relevant_data.formatted_address;
                response.pin_code=relevant_data.address_components.filter((e)=>{
                    if(e.types?.includes('postal_code')){
                        return true;
                    }
                    return false;
                })[0].long_name || '';
                response.city=body?.plus_code?.compound_code?.split(',')[0]?.split(' ')?.slice(1)?.join(' ')?.trim();
                response.state=body?.plus_code?.compound_code?.split(',')[1]?.trim();
                res.status(200).json({'message':"Location succesfully fetched",'data':response});
            }
        })
    } catch (error) {
        res.status(500).json({'message':"Location fetch Failed","error":error.message});
    }
})


Server.use(express.static(path.join(__dirname, 'public')));


Server.listen(process.env.PORT, async function () {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
    console.log(`Speedtest Server is up and running! http://127.0.0.1:${process.env.PORT}/`);
}); 

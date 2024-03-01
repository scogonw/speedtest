const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    tenant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant'
    },
    location:{
        user_allowed:Boolean,
        lat: Number,
        long: Number,
        accuracy: Number,
        city: String,
        address:String,
        pin_code:String,
        state:String,
        plus_code:{
            compound_code:String,
            global_code:String
        }
    },
    timestamp: Date,
    download: Number,
    upload: Number,
    ping: Number,
    jitter: Number,
    client_backhaul_ISP:String,
    client_ipv4: String,
    client_ipv6: String,
    server_ip: String,
    device: String
});

const TestResult = mongoose.model('TestResult', testResultSchema);
module.exports=TestResult;
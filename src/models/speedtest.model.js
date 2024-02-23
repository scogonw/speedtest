import mongoose from "mongoose";

const testResultSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    tenant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant'
    },
    location_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
    },
    timestamp: Date,
    download: Number,
    upload: Number,
    ping: Number,
    jitter: Number,
    client_ipv4: String,
    client_ipv6: String,
    server_ip: String,
    device: String
});

export const TestResult = mongoose.model('TestResult', testResultSchema);
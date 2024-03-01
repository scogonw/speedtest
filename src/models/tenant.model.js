const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
    name:{
        required:true,
        type:String,
    },
    type:{
        type:String,
        enum:["ISP","Business","Retail"]
    },
    contact_info:{
        brand_short_name:String,
        brand_full_name:String,
        logo_path:String,
        favicon:String
    },
    speed_test_link:String,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

const Tenant = mongoose.model("Tenant",tenantSchema);
module.exports = Tenant;
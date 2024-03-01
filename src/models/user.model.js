const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    tenant_id:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
    }],
    contact_info:{
        business_name:String,
        poc_name:String,
        email:String,
        phone:String
    },
    speed_test_link:String,
    branding_info:{
        brand_short_name:String,
        brand_full_name:String,
        logo_path:String,
        favicon:String
    },
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

const User = mongoose.model('User',userSchema);
module.exports = User;
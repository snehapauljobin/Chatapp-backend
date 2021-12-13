// Accessing mongoose
const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
//Database connection
//mongoose.connect('mongodb+srv://userone:userone@ictakprojectfiles.z0atk.mongodb.net/LIBRARYAPP?retryWrites=true&w=majority');
mongoose.connect('mongodb://localhost:27017/chatapp');
//Schema creation
const Schema=mongoose.Schema;
const UserSchema = new Schema({
   
    name:String,
    email:String,
    password:String,
    // passwordcheck:String,
    status:String
    
       
    
});
UserSchema.pre("save", function(next) {
    if(!this.isModified("password")) {
        return next();
    }
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});

UserSchema.methods.comparePassword = function(plaintext, callback) {
    return callback(null, bcrypt.compareSync(plaintext, this.password));
};

//Model creation
var Userdata=mongoose.model('Userdata',UserSchema);
module.exports=Userdata;
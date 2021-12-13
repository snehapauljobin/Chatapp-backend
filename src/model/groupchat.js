// Accessing mongoose
const mongoose=require('mongoose');
//Database connection
//mongoose.connect('mongodb+srv://userone:userone@ictakprojectfiles.z0atk.mongodb.net/LIBRARYAPP?retryWrites=true&w=majority');
mongoose.connect('mongodb://localhost:27017/chatapp');
//Schema creation
const Schema=mongoose.Schema;
const GroupchatSchema = new Schema({
   
    user:String,
    message:String,
    room:String,
    created:{type:Date,default:Date.now},
    imgfile:String
    
});

//Model creation
var Groupdata=mongoose.model('Groupchat',GroupchatSchema);
module.exports=Groupdata;
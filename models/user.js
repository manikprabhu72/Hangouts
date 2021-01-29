// User Class
class User{
    //four Instance variables
    constructor (userId, firstName, lastName, uName, emailId, profilePic, saltPass, saltVal){
        this.uId = userId;
        this.fName = firstName;
        this.lName = lastName;
        this.username = uName;
        this.email = emailId;
        this.profPic = profilePic;
        this.password = saltPass;
        this.salt = saltVal;
    }
}

module.exports = User;
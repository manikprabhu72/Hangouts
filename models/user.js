// User Class
class User{
    //four Instance variables
    constructor (uId, fName, lName, username, email, profPic, saltPass, salt){
        this._uId = uId;
        this._fName = fName;
        this._lName = lName;
        this._username = username;
        this._email = email;
        this._profilePic = profPic;
        this._saltPass = saltPass;
        this._salt = salt;
    }
    // setters and getters for the properties
    get username(){
        return this._username;
    }

    set username(value){
        this._username = value;
    }

    get saltPass(){
        return this._saltPass;
    }

    set saltPass(value){
        this._saltPass = value;
    }

    get salt(){
        return this._salt;
    }

    set salt(value){
        this._salt = value;
    }

    get uId(){
        return this._uId;
    }
    
    set uId(value){
        this._uId = value;
    }

    get fName(){
        return this._fName;
    }

    set fName(value){
        this._fName = value;
    }

    get lName(){
        return this._lName;
    }

    set lName(value){
        this._lName = value;
    }

    get email(){
        return this._email;
    }

    set email(value){
        this._email = value;
    }

    get profilePic(){
        return this._profilePic;
    }

    set profilePic(value){
        this._profilePic = value;
    }
}

module.exports = User;
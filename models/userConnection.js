//class UserConnection Mddel
class UserConnection{
    //two instance variables connection and rsvp
    constructor(conn, rsvp){
        this._connection = conn;
        this._rsvp = rsvp;
    }
    
    //getters and setters for the properties
    get connection(){
        return this._connection;
    }

    set connection(value){
        this._connection = value;
    }

    get rsvp(){
        return this._rsvp;
    }
    
    set rsvp(value){
        this._rsvp = value;
    }
}

module.exports = UserConnection;
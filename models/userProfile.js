var userConnection = require('./userConnection');
var ArrayList = require('arraylist');

//class UserProfile Model to associate user with his connections
class UserProfile{
    // two variables - one is userId and other is list of connections.
    constructor(uId, userConnections){
        this._uId = uId;
        this._userConnections = userConnections;
    }
    //getter and setters
    get uId(){
        return this._uId;
    }
    
    set uId(value){
        this._uId = value;
    }

    get userConnections(){
        return this._userConnections;
    }
    
    set userConnections(value){
        this._userConnections = value;
    }

    addConnection(connection, rsvp){
        let connExists = false;
        this._userConnections.forEach(userConnection => {
            if(userConnection._connection.connId === connection.connId){
                userConnection._rsvp = rsvp;
                connExists = true;
            }
        })
        if(!connExists){
            let userConn = new userConnection(connection,rsvp);
            this._userConnections.push(userConn);
        }
        
    }

    removeConnection(connection){
        let removeIndex = this._userConnections.map((userConn) => {return userConn._connection.connId;}).indexOf(connection.connId);
        this._userConnections.splice(removeIndex, 1);
    }

    updateConnection(userConn){
        this._userConnections.forEach(userConnection => {
            if(userConnection.connection.connId === userConn.connection.connId){
                userConnection.rsvp = userConn.rsvp;
            }
        });
    }

    getConnections(){
        let userConnList = new ArrayList;
        userConnList.add(this._userConnections);
        return userConnList;
    }

    emptyProfile(){
        this._uId = null;
        this._userConnections = null;
    }
}

module.exports = UserProfile;
//Defined all the connection properties

var connection = function(id, name, topic, description, d, t, place, uId, no, image) {
    var connModel = {
        connId: id,
        title: name,
        category: topic,
        details:description,
        date: d,
        time: t,
        location: place,
        userId: uId,
        noOfPpl: no,
        connImage: image
    };
    return connModel;
};

module.exports = connection;
const User = require(`${__models}/users`);
const { responseHandler } = require(`${__utils}/responseHandler`);
const { connectToDatabase, disconnectFromDatabase, startIdleTimer } = require(`${__config}/dbConn`)

exports.helloWorld = async (req, res) => {
    try {
        await connectToDatabase();
        return responseHandler.success(res, "Hello From User Route")
    } catch (error) {
        console.log(error)
        return responseHandler.error(res, error);
    }
}
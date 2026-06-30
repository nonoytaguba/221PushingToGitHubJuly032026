class AppError extends Error {
    constructor(message, statusCode){
        super(message); //'Why didn't I set this.message equal to message?'

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

  // const err = new Error(`Can't find ${req.originalUrl} on this server!`)
  // err.status = 'fail';
  // err.statusCode = 404;


// Note to Message
// 'Why didn't I set this.message equal to message?'

// Well, that's just because right here I called
// the parent class, right, and the parent class
// is error, and whatever we pass into it
// is gonna be the message property.
// So just as I told you before.
// And so, basically, in here by doing this parent call
// we already set the message property
// to our incoming message.





module.exports = AppError;
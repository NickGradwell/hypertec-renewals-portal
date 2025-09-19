module.exports = async function (context, req) {
    context.log('Simple test function processed a request.');

    const responseMessage = {
        success: true,
        message: "Simple test function is working!",
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url
    };

    context.res = {
        status: 200,
        body: JSON.stringify(responseMessage)
    };
};

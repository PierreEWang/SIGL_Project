const getTest = (req, res) => {
    res.json({
        message: 'La route de test fonctionne !',
        method: req.method,
        timestamp: new Date().toISOString()
    });
};

const postTest = (req, res) => {
    res.json({
        message: 'La route POST de test fonctionne !',
        receivedData: req.body,
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    getTest,
    postTest
};
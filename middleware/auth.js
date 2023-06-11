const jwt = require("jsonwebtoken");
const { config } = require("../config/secret");

exports.auth = async (req, res, next) => {
    let token = req.header("x-api-key");
    if (!token) {
        return res.json({ msg: "token is required" });
    }
    try {
        let tokenData = jwt.verify(token, config.tokenSecret);
        req.tokenData = tokenData;
        next();
    } catch (err) {
        res.json({ error: "token is not valid or expired" });
    }
}

exports.authAdmin = (req, res, next) => {
    let token = req.header("x-api-key");
    if (!token) {
        return res.status(401).json({ msg: "You need to send token to this end point" })
    }
    try {
        let tokenData = jwt.verify(token, config.tokenSecret);
        if (tokenData.role != "admin") {
            return json.status(401).json({ msg: "Token invalid or expired, code 3" });//מסמנת לעצמי באיזה שגיאה מדובר, סתם מספר שהמצאתי
        }
        req.tokenData = tokenData;
        next();
    } catch (err) {
        return res.status(401).json({ msg: "token not valid or expired" })
    }
}
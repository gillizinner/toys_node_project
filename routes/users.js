const express = require("express");
const router = express.Router();
const { UserModel, validateUser, validateLogin, createToken } = require("../models/userModel");
const bcrypt = require("bcrypt");
const { auth, authAdmin } = require("../middleware/auth");

router.get("/", async (req, res) => {
    let perPage = Math.min(req.params.perPage, 10) || 5;
    let page = req.params.page || 1;
    let sort = req.query.sort || "_id";
    let reverse = req.query.reverse == "yes" ? -1 : 1;

    try {
        let data = await UserModel
            .find({}, { password: 0 }) //returns all the list because ther isnt a filter function sent but an empty object
            .limit(perPage)//defines max items for page, whats the limit
            .skip((page - 1) * perPage)//מגדיר מאיזה מספור של אוביקטים להתחיל להציג, באיזה עמוד לאחוז, שזה בעצם כמה לדלג - מספר העמוד -1 כפול מספר האובייקטים לעמוד, למשל עמוד ראשון זה לדלג 0 אובייקטיםת עמוד שני לדלג עבור מס אוביקטים לעמוד אחד, כי מדלגים רק עמוד וכו
            .sort({ [sort]: reverse })//ממין את הרשימה לפי הפרמטר שנשלח ולפי אם ברוורס או לא
        res.json(data)
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "err", err })
    }
})

router.post("/", auth, async (req, res) => {
    let valiBody = validateUser(req.body);
    if (valiBody.error) {
        return res.json(valiBody.error.details);
    }
    try {
        let user = new UserModel(req.body);
        user.password = await bcrypt.hash(user.password, 10);
        await user.save();
        user.password = "*****"
        res.json(user);
    } catch (err) {
        if (err.code == 11000) {//, מגדירים בקומפס איזה תכונה תהיה ייחודית, טעות 11000 זו טעות מובנית בפוסטמן כאשר יש כפילות
            return res.status(400).json({ msg: "Email already in system try login", code: 11000 })
        }
        console.log(err);
        res.status(500).json({ msg: "err", err })
    }
})

router.post("/login", async (req, res) => {
    let valiBody = validateLogin(req.body);
    if (valiBody.error) {
        return res.json(valiBody.error.details);
    }
    try {
        let user = await UserModel.findOne({ email: req.body.email });
        if (!user) {
            return res.json("email or password don't match 1");
        }
        let validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            return res.json("email or password don't match 2");
        }
        let token = createToken(user._id, user.role);
        res.json({ token: token });
    } catch (err) {
        res.status(500).json({ msg: "err", err })
    }
})

router.get("/myInfo", auth, async (req, res) => {
    let userInfo = await UserModel.findOne({ _id: req.tokenData._id }, { password: 0 });//dont take password of user
    res.json(userInfo);
})

router.put("/:idEdit", auth, async (req, res) => {
    let valiBody = validateUser(req.body);
    if (valiBody.error) {
        return res.json(valiBody.error.details);
    }
    try {
        let user;
        if (req.tokenData.role == "admin" || req.tokenData._id == req.params.idEdit) {
            await UserModel.updateOne({ _id: req.params.idEdit }, req.body);
            user = await UserModel.findOne({ _id: req.params.idEdit });
            user.password = await bcrypt.hash(user.password, 10);
            await user.save();
            user.password = "*****"
        }
        if (!user) {
            return res.json({ msg: "not found or no permission" })
        }
        return res.json(user);
    } catch (err) {
        return res.status(500).json({ msg: "err", err });
    }
})
router.delete("/:idDel", auth, async (req, res) => {
    try {
        let user;
        if (req.tokenData.role == "admin" || req.tokenData._id == req.params.idDel) {
            user = await UserModel.deleteOne({ _id: req.params.idDel })
        }
        if (!user) {
            return res.json({ msg: "not found or no permission" })
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ msg: "err", err });
    }
})

router.get("/usersList", authAdmin, async (req, res) => {
    try {
        let data = await UserModel.find({}, { password: 0 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ msg: "err", err });
    }
})

module.exports = router;
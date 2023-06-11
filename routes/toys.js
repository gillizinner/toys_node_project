const express = require("express");
const router = express.Router();
const { ToyModel, validateToy } = require("../models/toyModel");
const bcrypt = require("bcrypt");
const { auth } = require("../middleware/auth");

router.get("/", async (req, res) => {
    let perPage = Math.min(req.params.perPage, 10) || 10;
    let page = req.params.page || 1;
    let sort = req.query.sort || "_id";
    let reverse = req.query.reverse == "yes" ? -1 : 1;

    try {
        let data = await ToyModel
            .find({}) //returns all the list because ther isnt a filter function sent but an empty object
            .limit(perPage)//defines max items for page, whats the limit
            .skip((page - 1) * perPage)//מגדיר מאיזה מספור של אוביקטים להתחיל להציג, באיזה עמוד לאחוז, שזה בעצם כמה לדלג - מספר העמוד -1 כפול מספר האובייקטים לעמוד, למשל עמוד ראשון זה לדלג 0 אובייקטיםת עמוד שני לדלג עבור מס אוביקטים לעמוד אחד, כי מדלגים רק עמוד וכו
            .sort({ [sort]: reverse })//ממין את הרשימה לפי הפרמטר שנשלח ולפי אם ברוורס או לא
        res.json(data)
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "err", err })
    }
})

router.get("/single/:id", async (req, res) => {
    try {
        let toy = await ToyModel.find({ _id: req.params.id });
        return res.json(toy);
    } catch (err) {
        return res.json({ msg: "coudlnt found toy" });
    }
})

router.post("/", auth, async (req, res) => {
    let valiBody = validateToy(req.body);
    if (valiBody.error) {
        return res.json(valiBody.error.details);
    }
    try {
        let toy = new ToyModel(req.body);
        toy.user_id = req.tokenData._id;
        await toy.save();
        res.json(toy);
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "err", err })
    }
})
router.get("/search", async (req, res) => {
    try {
        let perPage = Math.min(req.query.perPage, 10) || 10;
        let searchReg = new RegExp(req.query.s, "i");
        let toys = await ToyModel.find({
            $or: [
                { name: searchReg },
                { info: searchReg }]
        }).limit(perPage);
        return res.json(toys);
    } catch (err) {
        return res.json({ error: err });
    }

})
router.get("/category/:catname", async (req, res) => {
    try {
        let perPage = Math.min(req.query.perPage, 10) || 10;
        let searchReg = new RegExp(req.params.catname, "i");
        let toys = await ToyModel.find({
            category: searchReg
        }).limit(perPage);
        return res.json(toys);
    } catch (err) {
        return res.json({ error: err });
    }

})


router.put("/:idEdit", auth, async (req, res) => {
    let valiBody = validateToy(req.body);
    if (valiBody.error) {
        return res.json(valiBody.error.details);
    }
    try {
        let toy;
        if (req.tokenData.role == "admin") {
            toy = await ToyModel.updateOne({ _id: req.params.idEdit }, req.body);
        }
        else {
            toy = await ToyModel.updateOne({ _id: req.params.idEdit, user_id: req.tokenData._id }, req.body);
        }
        return res.json(toy);
    } catch (err) {
        res.status(500).json({ msg: "err", err });
    }
})
router.delete("/:idDel", auth, async (req, res) => {
    try {
        let toy;
        if (req.tokenData.role == "admin") {
            toy = await ToyModel.deleteOne({ _id: req.params.idDel });
        }
        else {
            toy = await ToyModel.deleteOne({ _id: req.params.idDel, user_id: req.tokenData._id });
        }
        res.json(toy);
    } catch (err) {
        res.status(500).json({ msg: "err", err });
    }
})

module.exports = router;
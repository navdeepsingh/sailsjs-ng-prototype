/**
 * SenderController
 *
 * @description :: Server-side logic for managing configurations
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


module.exports = {
    show: function (req, res, next) {


        Sender.find().limit(1).exec(function foundSender(err, conf) {
            if (err)
                return next(err);
            if (!conf)
                return next();
            res.json({data: conf[0]});
        });
    },
    update: function (req, res, next) {
        //console.log(req.params.all());
        var id = req.param('id', 0);

        if (id === 0) {
            Sender.create({name: req.param('name'), email: req.param('email')}, function SenderCreated(err, user) {
                if (err) {
                    console.log(err)
                }
                else
                    return res.ok('updated successfuly');
            });
        } else {
            Sender.update(id, {name: req.param('name'), email: req.param('email')}, function Senderupdated(err, user) {
                if (err)
                    return res.negotiate(err);
                else
                    return res.ok('updated successfuly');
            });

        }
    },
};
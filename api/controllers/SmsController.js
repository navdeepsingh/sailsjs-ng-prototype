/**
 * SmsController
 *
 * @description :: Server-side logic for managing configurations
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    show: function (req, res, next) {


        Sms.find().limit(1).exec(function foundSms(err, conf) {
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
            Sms.create({text: req.param('text'), confirm_text : req.param('confirm_text') }, function SenderCreated(err, user) {
                if (err) {
                    console.log(err)
                }
                else
                    return res.ok('updated successfuly');
            });
        } else {
            Sms.update(id, {text: req.param('text'), confirm_text : req.param('confirm_text')}, function Senderupdated(err, user) {
                if (err)
                    return res.negotiate(err);
                else
                    return res.ok('updated successfuly');
            });

        }
    },
};
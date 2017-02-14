/**
 * TemplateController
 *
 * @description :: Server-side logic for managing emails
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var fs = require("fs");
var path = require('path');
var request = require('request');
module.exports = {
    email_template: function (req, res) {
        var templates = Templates.find({ type: "email" });

        templates.exec(function (err, list) {
            if (err)
                return next(err);
            //	console.log(list);
            res.json({ data: list });

        });
    },
    confirm_template: function (req, res) {
        var templates = Templates.find({ type: "confirm" });

        templates.exec(function (err, list) {
            if (err)
                return next(err);
            //	console.log(list);
            res.json({ data: list });

        });
    },
    select: function (req, res, next) {

        Templates.findOne(req.param('id'), function (err, email) {
            Templates.update({ type: req.param('type') }, { active: false }).exec(function (err, updated) {
                email.active = true;

                email.save(function (err) {
                    res.ok('Email template selected.');
                });
            });
        });
    },
    delete: function (req, res, next) {
        Templates.findOne(req.param('id'), function foundtemplate(err, template) {
            if (err)
                return next(err);
            if (!template)
                return next('Template does not exist.');
            Templates.destroy(req.param('id'), function templateDestroyed(err) {
                if (err)
                    return next(err);
                res.ok('record deleted');
            })
            //res.redirect('/user');
        });
    },
    upload: function (req, res, msg) {
        if (req.method === 'GET')
            return res.json({ 'status': 'GET not allowed' });
        //	Call to /upload via GET is error
        var uploadFile = req.file('file');
        var type = req.param('type');
        var upload_path = "";
        //console.log(type);
        if (type == "template") {
            upload_path = ({ dirname: '../../views/templates' });
        }
        else {
            upload_path = ({ dirname: '../../assets/images/thumb' });
        }
        uploadFile.upload(upload_path, function onUploadComplete(err, files) {            //

            if (err)
                return res.serverError(err);
            //console.log(files[0].fd);
            var uploaded_name = path.basename(files[0].fd);
            return res.json({ 'status': 'Uploaded Successfuly', 'uploaded_name': uploaded_name });

        });
    },
    create: function (req, res) {
        // the sign-up form --> signup.ejs
        var thumb_path = req.protocol + '://' + req.get('host') + '/images/thumb/' + req.param('thumb');
        Templates.create({
            name: req.param('name'),
            thumb: thumb_path,
            template: req.param('template'),
            type: req.param('template_type')
        }, function TemplateCreated(err, template) {
            if (err)
                return res.negotiate(err);
            else
                return res.json({ 'status': 'Created Successfuly', 'template': template });
        });
    },
    smsSubmit: function (req, res) {
        // the sign-up form --> signup.ejs
        var mobile = req.param('mobile').replace(/ /g, '');

        Sms.find().limit(1).exec(function foundSms(err, smstext) {
            if (err)
                return next(err);
            if (!smstext)
                return next();
           //     console.log(smstext[0]);
            var confirm_text = smstext[0].confirm_text;
            Participant.update(req.param('id'), { mobile: mobile, registered:true }, function participantUpdated(err, user) {
                if (err)
                    return res.negotiate(err);
                else {
                    request.post({
                        url: "https://secure.hoiio.com/open/sms/send", form: {
                            "app_id": sails.config.hoiio.app_id,
                            "access_token": sails.config.hoiio.token,
                            "dest": mobile,
                            "msg": confirm_text,
                        }
                        //    method:"POST", 
                    }, function (error, response, message) {
                        if (error === null) {
                            var result = JSON.parse(message);
                            console.log(mobile + ' > ' + result.status);
                        } else {
                            var error = JSON.parse(error);
                            console.log('Oops! There was an error.');
                            console.log('Error >> ', output.recipient.name, error.status);
                        }
                    });
                    return res.ok('updated successfuly');
                }
            });
        });

    },
     nosmsSubmit: function (req, res) {
        // the sign-up form --> signup.ejs
      Participant.update(req.param('id'), { registered:true }, function participantUpdated(err, user) {
                if (err)
                    return res.negotiate(err);
                else {
                    return res.ok('updated successfuly');
                }
            });

    },
};
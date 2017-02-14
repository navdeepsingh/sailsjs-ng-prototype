/**
 * ParticipantController
 *
 * @description :: Server-side logic for managing participants
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var randomstring = require("randomstring");
var fs = require("fs");
var Mailgun = require('machinepack-mailgun');
var Promise = require("q");
var capitalize = require('string-capitalize')


module.exports = {
    index: function (req, res) {
        res.view();
    },
    list: function (req, res) {    // http://localhost:1337/user/list?name=a&limit=2
        //console.log(found);
        var name = req.param('name', ''),
            limit = req.param('limit', '10'),
            skip = req.param('skip', '0'),
            field = req.param('field'),
            sort = req.param('sort', ''),
            count = 0;

        Participant.count().exec(function (error, totalUsers) {
            //console.log(found);
            var users = Participant.find();
            if (field !== null)
                users.sort(field + " " + sort);
            //  console.log(field);
            // users.
            users.exec(function (err, list) {
                if (err)
                    return next(err);
                //	console.log(list);
                res.json({ data: list, total: totalUsers });

            });
        });
    },
    create: function (req, res) {
        Participant.create({
            first_name: req.param('first_name'),
            last_name: req.param('last_name'),
            email: req.param('email'),
            token: randomstring.generate({ length: 12 })
        }, function participantCreated(err, participant) {
            if (err)
                return res.negotiate(err);
            else
                return res.json({ 'status': 'Created Successfuly', 'participant': participant });
        });
    },
    show: function (req, res, next) {
        Participant.findOne(req.param('id'), function foundParticipant(err, participant) {
            if (err)
                return next(err);
            if (!participant)
                return next();
            res.json({ data: participant });
        });
    },
    update: function (req, res, next) {
        Participant.update(req.param('id'), req.params.all(), function participantUpdated(err, user) {
            if (err)
                return res.negotiate(err);
            else
                return res.ok('updated successfuly');
        });
    },
    activate: function (req, res, next) {
        Participant.find({ email: req.param('email'), token: req.param('token') })
            .then(function (participants) {
                if (participants === undefined)
                    return res.json({ notFound: true });

                Templates.findOne({ active: true, type: 'confirm' })
                    .then(function (template) {
                        if (participants.length === 0) {
                            return res.view('templates/' + template.template, { msg: 'user not found' , status: 'user not found' });
                        }
                        var participant = participants[0];
                        if (participant.activate()) {
                            return res.view('templates/' + template.template, { msg: capitalize(participant.first_name )  , id: participant.id, status: 'success' });

                        } else {
                            return res.view('templates/' + template.template, { msg: participant.first_name, id: participant.id,status: 'already_registered' });

                        }
                    })
                    .catch(function (err) {
                        console.log(err);
                    });

            })
            .catch(function (err) {
                console.log(err);
            });
        //console.log('success');
        // return res.ok('updated successfuly');
    },
    reset: function (req, res, next) {

        Participant.findOne(req.param('id'), function (err, participant) {
            participant.registered = false;
            participant.sent = false;
            participant.token = randomstring.generate({ length: 12 });

            participant.save(function (err) {
                if (err)
                    return res.negotiate(err);
                else {
                    return res.json({ 'status': 'reset successfuly', 'data': participant });
                }
            });
        });
    },
    destroy: function (req, res, next) {
        Participant.findOne(req.param('id'), function foundQuiz(err, participant) {
            if (err)
                return next(err);
            if (!participant)
                return next('Participant does not exist.');
            Participant.destroy(req.param('id'), function quizDestroyed(err) {
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
        var k = 0;
        var uploadFile = req.file('file');
        var time = new Date().toISOString();
        //   console.log(uploadFile);
        uploadFile.upload({ dirname: '../../excel/' }, function onUploadComplete(err, files) {            //

            if (err)
                return res.serverError(err);

            var fd = files[0].fd;
            fs.readFile(fd, 'utf8', function (err, data) {
                var allTextLines = data.split(/\r\n|\n/);
                var lines = [];
                var header = [];
                var jsonRows = [];
                for (var i = 0; i < allTextLines.length; i++) {
                    var records = {};
                    var column = allTextLines[i].split(',');
                    for (var j = 0; j < column.length; j++) {
                        if (i == 0) {
                            header.push(column[j]);
                        } else {
                            records[header[j]] = column[j];
                            //  console.log(column[j])
                        }
                    }
                    if (i > 0) {
                        if (column.length <= header.length) {
                            var mobile = null;
                            if (records['mobile'] !== undefined) {
                                mobile = records['mobile']
                            }

                            Participant.create({
                                first_name: records['firstname'],
                                last_name: records['lastname'],
                                email: records['email'],
                                mobile: mobile,
                                token: randomstring.generate({ length: 12 })
                            }, function ParticipantCreated(err, user) {
                                if (err) {
                                    console.log(err)
                                }
                                else {
                                    k = k + 1;
                                    // console.log(k);
                                }
                            });
                        }
                    }
                }
                res.ok('records created successfully');
            });
        });
    },
};
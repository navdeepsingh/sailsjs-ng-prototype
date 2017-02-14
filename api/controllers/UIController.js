/**
 * JoinUsController
 *
 * @description :: Server-side logic for managing Joinuses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var messaging = require('./QueueController'),
    path = require('path'),
    Promise = require('bluebird'),
    request = require('request');
var capitalize = require('string-capitalize')

//var https = require('https');

module.exports = {
    emailLog: function (req, res, next) {

        var url = 'https://api:' + sails.config.mailgun.apiKey + '@api.mailgun.net/v3/' + sails.config.mailgun.domain + '/events?limit=300';
        if (req.param('recipient')) {
            url += '&recipient=' + req.param('recipient');
        } else if (req.param('event')) {
            url += '&event=rejected OR failed';
        }
        //recipient
        request.get({ url: url },
            function (error, response, data) {
                if (error !== null) {
                    var error = JSON.parse(error);
                    console.log('Error >> ', error.status);
                } else {
                    var result = [];
                    _.each(JSON.parse(data).items, function (item) {
                        //  console.log(item);
                        var time = new Date(item.timestamp * 1000).toISOString().replace(/T/, ' ').replace(/\..+/, '');
                        var recipient = item.recipient;
                        if (item.event == 'rejected')
                            recipient = item.message.recipients[0];

                        result.push({ id: item.id, email: recipient, time: time, status: item.event });

                    });
                    return res.json({ data: result });
                }
            });
    },

    // Sends Email to All
    sendEmailToAll: function (req, res, next) {
        //console.log('Send Email to All');
        var getParticipants = function () { // fetch participants
            var query = {};
            if (req.param('email')) {
                query = { email: req.param('email') }
            } else {
                query = { registered: false, sent: false }
            }
            return Participant.find(query);

        }
        var getEmailTemplate = function () { // fetch sms text
            return Templates
                .findOne({ active: true, type: 'email' });
        }

        Promise.all([getParticipants(), getEmailTemplate()]).then(function (result) {
            if (result[0].length < 1) {
                throw new Error('No Participants');
            }
            if (result[1] === undefined) {
                throw new Error('No Email Template');
            }
            var participants = result[0];
            var email_template = result[1].template;
            var templatePath = 'templates/' + path.basename(email_template, '.ejs');

            Promise.each(participants, function (participant) {
                var mailOptions = {
                    name: capitalize (participant.first_name) + ' ' + capitalize(participant.last_name),
                    link: req.protocol + '://' + req.get('host') + '/participant/activate?email=' + participant.email + '&token=' + participant.token,
                    layout: false
                }

                sails.renderView(templatePath, mailOptions, function (error, output) {
                    if (!error) {
                        messaging.publish({
                            recipient: {
                                name: capitalize (participant.first_name + ' ' + participant.last_name),
                                email: participant.email
                            },
                            body: output
                        }, 'mailer');
                    } else {
                        console.log(error.message);
                        next(error);
                        return res.negotiate(error.message);
                    }
                });
            }).then(function () {
                messaging.consume('mailer');
                return res.ok('email sent.');
            }).catch(function (error) {
                return next(error);
            });
        }).catch(function (err) {
            return next(err);
        });
    },

    sendSMSToAll: function (req, res, next) {
        var getParticipants = function () { // fetch participants
            var query = {};
            if (req.param('id')) {
                query = { id: req.param('id') }
            } else {
                query = {
                    registered: true,
                    "mobile": {
                        "!": ''
                    }
                }
            }
            return Participant.find(query);

        }
        var getSmsText = function () { // fetch sms text
            return Sms.find().limit(1);
        }

        Promise.all([getParticipants(), getSmsText()]).then(function (result) {
            if (result[0].length < 1) {
                throw new Error('No Participants');
            }
            if (result[1].length < 1) {
                throw new Error('No Sms Text');
            }
            var participants = result[0];
            var sms_text = result[1][0].text;

            Promise.each(participants, function (participant) {
                //  console.log(participant.email);
                messaging.publish({
                    recipient: {
                        name: participant.first_name + ' ' + participant.last_name,
                        mobile: participant.mobile
                    },
                    body: sms_text
                }, 'sms');
            }).then(function () {
                messaging.consume('sms');
                //    console.log('Publishing done');
                return res.ok('All sms sent to queue.');
            }).catch(function (err) {
                console.log('err found');
                return next(err);
            });
        }).catch(function (err) {
            return next(err);
        });
    }
}
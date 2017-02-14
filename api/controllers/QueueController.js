var broker = require('amqplib'),
        mailgun = require('machinepack-mailgun'),
        Q = require('q'),
        request = require('request');
var capitalize = require('string-capitalize')


//var twilio = require('twilio');

var queued = broker.connect(sails.config.rabbitmq.url);

/*
 * Task:
 *  - mailer (Sends Email)
 *  - sms (Sends SMS)
 */
exports.publish = function (input, task) {
    console.log('Publishing.....');
    var dfd = Q.defer();

    queued.then(function (conn) {
        return conn.createChannel();
    }).then(function (channel) {
        var ok = channel.assertQueue(task, {durable: true});
        ok.then(function () {
            channel.sendToQueue(task, new Buffer(JSON.stringify(input)));
            dfd.resolve();
        });
    }).catch(
            function (error) {
                dfd.reject(error);
            }
    );

    return dfd.promise;
};

exports.consume = function (task) {
    var emailQueue = [];
    function flushMailMessages() {
        var send = function (data) {
            // RabbigMQ info
            var msg = data.msg, channel = data.channel,
                    output = JSON.parse(msg.content.toString());

            async.waterfall([
                function getSenderInfo(done) {
                    Sender
                            .find().limit(1)
                            .then(
                                    function (senders) {
                                        return done(null, senders[0]);
                                    },
                                    function (error) {
                                        return done(error);
                                    });
                },
                function completeMailgunOptions(sender, done) {
                    return done(null, {
                        apiKey: sails.config.mailgun.apiKey,
                        domain: sails.config.mailgun.domain,
                        fromEmail: sender.email,
                        fromName: sender.name,
                        toEmail: output.recipient.email,
                        toName: capitalize( output.recipient.name),
                        htmlMessage: output.body,
                        subject: 'Complete your registration'
                    });
                }
            ], function (error, options) {
                if (!error) {
                    //console.log('Sent???');
                    mailgun.sendHtmlEmail(options).exec({
                        error: function () {
                            channel.nack(msg, false, false);
                        },
                        success: function () {
                            console.log('Email Sent: ' + options.toEmail);
                            Participant.findOne(
                                    {email: options.toEmail},
                            function (error, participant) {
                                if (!error) {
                                    participant.sent = true;
                                    participant.save(function (error) {
                                        if (!error) {
                                            channel.ack(msg);
                                        } else {
                                            console.log(error);
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    channel.nack(msg, false, false);
                }
            });
        }

        while (emailQueue.length) {
            send(emailQueue.shift());
        }
    }
    var smsQueue = [];
    function flushSMSMessages() {
        // TODO: SMS Messages to Send!
    //    console.log('Send SMS');

        var send = function (data) {
            // RabbigMQ info
            if (data) {
                var msg = data.msg,
                        channel = data.channel,
                        output = JSON.parse(msg.content.toString());
                //var client = new twilio.RestClient(sails.config.twilio.sid, sails.config.twilio.token);
                request.post({
                    url: "https://secure.hoiio.com/open/sms/send", form: {
                        "app_id": sails.config.hoiio.app_id,
                        "access_token": sails.config.hoiio.token,
                        "dest": output.recipient.mobile,
                        "msg": output.body,
                    }
                    //    method:"POST", 
                }, function (error, response, message) {
                    if (error === null) {
                        var result = JSON.parse(message);
                        channel.ack(msg);
                        console.log(output.recipient.mobile + ' > ' + result.status);
                    } else {
                        var error = JSON.parse(error);
                        console.log('Oops! There was an error.');
                        channel.nack(msg, false, false);
                        //  channel.nack(msg ); // to requeue
                        console.log('Error >> ', output.recipient.name, error.status);
                    }
                });

            } else {
                channel.nack(msg, false, false);
            }

        }

        while (smsQueue.length) {
            send(smsQueue.shift());
        }
    }

    queued.then(function (conn) {
        return conn.createChannel();
    }).then(function (channel) {
        var ok = channel.assertQueue(task, {durable: true});
        ok.then(function () {
            channel.prefetch(10);
        });
        ok.then(function () {
            channel.consume(
                    task,
                    function (msg) {
                        if (msg !== null) {
                            switch (task) {
                                case 'mailer':
                                    emailQueue.push({
                                        msg: msg,
                                        channel: channel
                                    });
                                    flushMailMessages();
                                    break;
                                case 'sms':
                                    smsQueue.push({
                                        msg: msg,
                                        channel: channel
                                    });
                                    flushSMSMessages();
                                    break;
                            }
                        } else {
                            channel.nack(msg);
                        }
                    },
                    {noAck: false});
        });
        return ok;
    }).catch(console.warn);
}

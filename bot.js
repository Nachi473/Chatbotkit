//  __   __  ___        ___
// |__) /  \  |  |__/ |  |  
// |__) \__/  |  |  \ |  |  

// This is the main file for the ApptScheduler bot.

// Import Botkit's core features
const { Botkit } = require('botkit');
const { BotkitConversation } = require('botkit');
const { BotkitCMSHelper } = require('botkit-plugin-cms');

// Import a platform-specific adapter for web.

const { WebAdapter } = require('botbuilder-adapter-web');

const { MongoDbStorage } = require('botbuilder-storage-mongodb');

// Load process.env values from .env file
require('dotenv').config();

let storage = null;
if (process.env.MONGO_URI) {
    storage = mongoStorage = new MongoDbStorage({
        url : process.env.MONGO_URI,
    });
}

const adapter = new WebAdapter({});

const controller = new Botkit({
    webhook_uri: '/api/messages',

    adapter: adapter,

    storage: storage
});


if (process.env.CMS_URI) {
    controller.usePlugin(new BotkitCMSHelper({
        uri: process.env.CMS_URI,
        token: process.env.CMS_TOKEN,
    }));
}

// Once the bot has booted up its internal services, you can use them to do stuff.
controller.ready(() => {

    // load traditional developer-created local custom feature modules
    controller.loadModules(__dirname + '/features');

    /* catch-all that uses the CMS to trigger dialogs */
    if (controller.plugins.cms) {
        controller.on('message,direct_message', async (bot, message) => {
            let results = false;
            results = await controller.plugins.cms.testTrigger(bot, message);

            if (results !== false) {
                // do not continue middleware!
                return false;
            }
        });
    }

    

    //let onboard = 'my_onboard_1';
    let onboard = new BotkitConversation('ONBOARDING', controller);
    onboard.say('Hi, I am Skedula, here to manage your Doctor Appointment. Please give me your details');
    //onboard.say('Please give me your details.');
    controller.addDialog(onboard);
    //onboard.addChildDialog('PROFILE_DIALOG', 'profile');
    //onboard.say('Hello, {{vars.profile.name}}! Onboarding is complete.');


    // launch the dialog in response to a message or event
    controller.hears(['Hello','Hi','Hey','Hi!','Hey!','Hello!'], 'message', async(bot, message) => {
    bot.beginDialog('ONBOARDING');
    });

    controller.hears(['What details do I need to provide?','What details?','Yes, sure.','Okay'],'message',async(bot,message) =>{
        await bot.reply(message, {
            text: 'Please enter',
            quick_replies: [
                {
                    title: "p: If Patient",
                    payload: "p",
                },
                {
                    title: "m: If Medical Representative",
                    payload: "m"
                }
            ]
        });

        
            controller.addDialog(scheduleDialog);
        let profileDialog = new BotkitConversation('PROFILE_DIALOG', controller);
            //profileDialog.ask('What is your name?', async(res, convo, bot) => {}, {key: 'name'});
            //profileDialog.ask('What is your gender?', async(res, convo, bot) => {}, {key: 'gender'});
            //profileDialog.ask('What is your age?', async(res, convo, bot) => {}, {key: 'age'});
            profileDialog.ask('What is your name?', async(response, convo, bot, full_message) => {
                await bot.say('Hi ' + response);
               }, {key: 'name'});
            profileDialog.ask('What is your gender?', async(response, convo, bot, full_message) => {
                await bot.say('So you are ' + response);
               }, {key: 'gender'});
            profileDialog.ask('What is your age?', async(response, convo, bot, full_message) => {
                await bot.say('You are ' + response);
               }, {key: 'age'});
               //let scheduleDialog = new BotkitConversation('SCHEDULE_DIALOG',controller);
            profilleDialog.ask('What service do you require?', async(response,convo,bot,full_message)=> {
                await bot.say(message, {
                    text: 'The services are: ',
                    quick_replies: [
                        {
                            title: "s: Schedule an appointment",
                            payload: "s",
                        },
                        {
                            title: "r: Reschedule appointment",
                            payload: "r",
                        },
                        {
                            title: "c: Cancel scheduled appointment",
                            payload: "c"
                        }
    
                    ]
                });
            });
            //profileDialog.addChildDialog('SCHEDULE_DIALOG','schedulef');
            controller.addDialog(profileDialog);
            
        controller.hears('p', 'message', async(bot, message) => { 
            // do something
            //await bot.reply(message, )

            bot.beginDialog('PROFILE_DIALOG');
            //controller.afterDialog(profileDialog, )
            //bot.beginDialog('SCHEDULE_DIALOG');
            
            //bot.beginDialog('SCHEDULE_DIALOG');
            
        //});

                controller.hears('s','message', async(bot,message) => {
                    await bot.reply(message, {
                        text: 'What type of appointment would you like to book?',
                        quick_replies: [
                            {
                                title: "o: Online video consultation",
                                payload: "o",
                            },
                            {
                                title: "co: Consultation at clinic",
                                payload: "co"
                            }
                        ]
                    });
                    
                    controller.hears(['o','c'],'message',async(bot, message) => {
                        await bot.reply('Please enter date of the month for which you want to schedule your appointment', async(res, convo, bot) => {},{key: 'date'});
                    })

                });

        });
    });


    controller.middleware.receive.use(function(bot, message, next) {

        console.log('RECEIVED: ', message);

        message.logged = true;

        next();

    });

    controller.middleware.send.use(function(bot, message, next) {

        console.log('SENT: ', message);

        message.logged = true;

        next();

    });


});






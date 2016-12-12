/*-----------------------------------------------------------------------------
This Bot uses the Bot Connector Service and is designed to educate on Swachh Bharat Mission. 
The bot presents an interactive menu to user using which the user can get information info
about the mission. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: "074eefcc-9b84-45e1-a4f6-bf1a0a438ebe",//process.env.MICROSOFT_APP_ID,
    appPassword: "nFTmxc96kJmLRs2oXhSAMG0"//process.env.MICROSOFT_APP_PASSWORD
});

var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());


bot.on('contactRelationUpdate', function (message) {
    if (message.action === 'add') {
        var name = message.user ? message.user.name : null;
        var reply = new builder.Message()
                .address(message.address)
                .text("Welcome %s to Swachh Bharat Mission, to know more type 'start'", name || 'User');

        bot.send(reply);
    } else {
        // delete their data
    }
});

//=========================================================
// Bots Middleware
//=========================================================

// Anytime the major version is incremented any existing conversations will be restarted.
bot.use(builder.Middleware.dialogVersion({ version: 1.0, resetCommand: /^reset/i }));

//=========================================================
// Bots Global Actions
//=========================================================

bot.endConversationAction('goodbye', 'Goodbye :)', { matches: /^goodbye/i });
bot.beginDialogAction('help', '/help', { matches: /^help/i });
/*bot.on("UserAddedToConversation", function(data){
    session.send("Added a new bot");
});*/
//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', [
    function (session) {
        //var skypeUserName = "Amit Gupta";
        session.userData.language = "en";
        /*if (session.message && session.message.user && session.message.user.name)
            skypeUserName = session.message.user.name;
        // Send a greeting and show help.
        var card = new builder.HeroCard(session)
            .title("Swachh Bharat Mission")
            .text("Welcome " + skypeUserName + " to Swachh Bharat Mission, to know more choose any of the below options.")
            .images([
                 builder.CardImage.create(session, "http://sbm.gov.in/sbm/images/logo2.png")
            ]);
        var msg = new builder.Message(session).attachments([card]);
        session.send(msg);*/
        // session.send("Hi... I'm the Microsoft Bot Framework demo bot for Skype. I can show you everything you can use our Bot Builder SDK to do on Skype.");
        session.beginDialog('/help');
    },
    function (session, results) {
        // Display menu
        session.beginDialog('/menu');
    },
    function (session, results) {
        // Always say goodbye
        session.send("Ok... See you later!");
    }
]);

bot.dialog('/menu', [
    function (session) {
        if (session.userData.language === "en")
            builder.Prompts.choice(session, "Choose an option?", "Tell me more|Objective|Upload a photo|Switch to Hindi|Quit",{listStyle:builder.ListStyle["button"]});
        else
            builder.Prompts.choice(session, "एक विकल्प चुनें?", "और बताओ|उद्देश्य|फोटो अपलोड|अंग्रेजी|अलविदा",{listStyle:builder.ListStyle["button"]});
        // builder.Prompts.choice(session, "What would you like to run?", "prompts|picture|cards|list|carousel|receipt|actions|(quit)");
    },
    function (session, results) {
        if (results.response && !(/quit|अलविदा/i).test(results.response.entity)) {
            var dialog = "menu";
            if((/tell me more|और बताओ/i).test(results.response.entity))
                dialog = "tellmemore";
            else if ((/Objective|उद्देश्य/i).test(results.response.entity))
                dialog = "objective";
            else if ((/Upload a photo|फोटो अपलोड/i).test(results.response.entity))
                dialog = "photo";
            else if ((/English|Switch to English|अंग्रेजी/i).test(results.response.entity)){
                session.userData.language = "en";
                dialog = "englishOrHindi";
            }
            else if ((/Hindi|Switch to Hindi|हिंदी/i).test(results.response.entity)){
                session.userData.language = "hi";
                dialog = "englishOrHindi";
            }
            // Launch asigned dialog
            session.beginDialog('/' + dialog);
        } else {
            // Exit the menu
            session.endDialog();
        }
    },
    function (session, results) {
        // The menu runs a loop until the user chooses to (quit).
        session.replaceDialog('/menu');
    }
]).reloadAction('reloadMenu', null, { matches: /^menu|show menu/i });

bot.dialog('/help', [
    function (session) {
        session.endDialog("Type 'Menu' any time to visit the options again.");
        // session.endDialog("Global commands that are available anytime:\n\n* menu - Exits a demo and returns to the menu.\n* goodbye - End this conversation.\n* help - Displays these commands.");
    }
]);

bot.dialog("/tellmemore", [
    function(session){
        var msg = "Swachh Bharat Mission or Swachh Bharat Abhiyan (Campaign Clean India) is a national level campaign by the Government of India covering statutory towns to clean the streets, roads and infrastructure of the country. \n\n\nThis campaign was officially launched on 2 October 2014 at Rajghat, New Delhi, where Prime Minister Narendra Modi himself wielded broom and cleaned a road. The campaign is India's biggest ever cleanliness drive and 3 million government employees and schools and colleges students of India participated in this event. The mission was started as a tree with each of the nine personalities nominated by Narendra Modi to in turn nominate nine other people and so on. It has been carried forward since then with famous people from all walks of life joining it.";
        session.endDialog(msg);
    }
]);

bot.dialog("/objective", [
    function(session){
        var msg = "This campaign aims to accomplish the vision of 'Clean India' by 2 October 2019, 150th birthday of Mahatma Gandhi and is expected to cost over INR62000 crore (US$10 billion).[3][9] The campaign was described as 'beyond politics' and 'inspired by patriotism'. \n\n\nMore than 3 million government employees and schools and colleges students of India are going to participate in this event.";
        session.endDialog(msg);
    }
]);

bot.dialog("/englishOrHindi", [
    function(session){
        session.endDialog();
    }
]);

bot.dialog('/photo', [
    function (session, results) {
        // session.send("Please upload a photo");
        builder.Prompts.attachment(session, "Send us a photo of your contribution to Swaach Bharat Mission, we will publish the photo on our facebook page and send you a link");
    },
    function (session, results) {
        var msg = new builder.Message(session)
            .ntext("I got %d photo from you. Thank you for contributing to Swachh Bharat Mission", "I got %d images. Thank you for contributing to Swachh Bharat Mission", results.response.length);
        // Uncomment if you want to return the uploaded image.            
        // results.response.forEach(function (attachment) {
        //     msg.addAttachment(attachment);    
        // });
        session.endDialog(msg);
    }
]);

const Discord = require('discord.js');
const {
    prefix,
    token,
    requestChannelId,
    beforeAfterChannelId
} = require('./config.json')
const client = new Discord.Client();


var idQueue = [];
var urlQueue = [];
var numbersInUseQueue = [];
var numberQueue = [];
for (var i = 1; i < 5; i++) {
    numberQueue.push(i);
}
const isValidUrl = (string) => {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}
console.log(numberQueue)
/* var currentID = 0; */

var beforeAfterChannel,
    requestChannel;


/* function isURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
} */
//(prefix+number, channel.msgs, thismessage.id)
function getMsg(id, msgs, uniqueId) {
    var a;

    msgs.forEach(msg => {

        if (msg.content.split(' ')[0] === id && msg.id != uniqueId) {
            a = msg
            return
        }
    })
    return a;
}

client.on('ready', () => {
    console.log('Ready!');
    beforeAfterChannel = client.channels.get(beforeAfterChannelId)
    requestChannel = client.channels.get(requestChannelId)


    /*    beforeAfterChannel = client.channels.array().find(channel => channel.id === beforeAfterChannelId);
       requestChannel = client.channels.array().find(channel => channel.id === requestChannelId);
       console.log(beforeAfterChannel.name) */

    /* if( ===0) */
    /* requestChannel.fetchMessages().then(msg => {
        // messages is a collection!)
        console.log(msg.first())

    }) */
    /* //clear channel
    async function clear() {
        const fetched = await requestChannel.fetchMessages({
            limit: 99
        });
        requestChannel.bulkDelete(fetched);
    }
    clear(); */

    var str = "**Request:** Post your pic or your link.\n\n**Fulfill request:**\n**1:** (not necessary)Post the Id of the request you are working on, e.g.: " + prefix + "13\n**2:** When done post the pic as attachment and the id + done e.g.: " + prefix + "13done \nPictures will be posted to #before-after automatically\n\nDeleting pics if they have issues: id + del e.g.: " + prefix + "13del\nYou can't send more than 3 pics in one message\n\u200B\u200B\u200B\u200B\u200B"
    requestChannel.send(str)


})

client.on('message', message => {
    if (message.content.includes('discord.gg/' || 'discordapp.com/invite/')) { //if it contains an invite link
        message.delete() //delete the message
            .then(message.author.send('Link Deleted:\n**Invite links are not permitted on this server**')).catch((e) => {
                console.log("Error sending a post #0: " + e)
            });
        return
    } else if (message.author.bot) return

    //request
    if (message.channel.id === requestChannelId) {


        var content = message.content;

        /*  var url;
         url = message.attachments.first().url; */
        var urls = [];
        if (message.attachments) {
            message.attachments.array().forEach(att => {
                var url = att.url;
                if (isValidUrl(url)) urls.push(url)

            })
        }
        if (urls.length === 0) {
            var contentArr = content.split(' ');
            contentArr.forEach(piece => {
                var url = piece.replace(/^\s+|\s+$/g, '')
                if (isValidUrl(url)) urls.push(url)
            })
        }

        //url = message.attachments.first().url;





        var action = content.split(' ')[0];

        //"unnecessary" double check for cleaner code
        if (content.length > 0 || action.indexOf('del') != -1 || action.indexOf('done') != -1) {
            //handle fulfill request




            requestChannel.fetchMessages().then(msgs => {
                var uniqueId = message.id;
                message.delete();

                if (action.indexOf('del') != -1) {
                    //delete post
                    var id = action.replace('del', '');
                    var i = idQueue.indexOf(id);
                    idQueue.splice(i, 1);
                    urlQueue.splice(i, 1);
                    numberQueue.push(numbersInUseQueue[i])
                    numbersInUseQueue.splice(i, 1)
                    var msg = getMsg(id, msgs, uniqueId);
                    if (!msg) return

                    msg.delete();

                } else if (action.indexOf('done') != -1) {
                    //delete post and move it to #before-after
                    var id = action.replace('done', '');
                    var i = idQueue.indexOf(id);
                    idQueue.splice(i, 1);
                    urlQueue.splice(i, 1);
                    numberQueue.push(numbersInUseQueue[i])
                    numbersInUseQueue.splice(i)
                    var msg = getMsg(id, msgs, uniqueId);

                    msg.delete();
                    if (!msg) return
                    var beforeUrl = msg.attachments.first().url;
                    var afterUrl = urls[0];

                    console.log(beforeUrl, afterUrl, numberQueue, numbersInUseQueue, urlQueue, idQueue)

                    if (!beforeUrl || !afterUrl) return


                    beforeAfterChannel.send({
                        files: [beforeUrl]
                    }).catch((e) => {
                        console.log("Error sending a post #2.1: " + e)
                    });
                    beforeAfterChannel.send({
                        files: [afterUrl]
                    }).catch((e) => {
                        console.log("Error sending a post #2.2: " + e)
                    });
                } else {
                    //add person to post "request-fulfiller"
                    var msg = getMsg(action, msgs, uniqueId);
                    if (!msg) return
                    msg.edit(msg.content + " quest accepted by " + message.author)



                }
            }).catch((e) => {
                console.log("Promise Rejected, error #12: " + e);
                return
            });
        } else if (urls.length != 0) {

            //handle request
            message.delete();


            urls = urls.slice(0, 3)
            if (urls.length === 0) urls.push(content);

            urls.forEach(url => {

                var i = Math.floor((Math.random() * numberQueue.length));
                var num = numberQueue[i];
                numberQueue.splice(i, 1);
                var id = prefix + num;
                requestChannel.send(id, {
                    files: [url]
                }).catch((e) => {
                    console.log("Error sending a post #1: " + e)
                });
                idQueue.push(id);
                urlQueue.push(url);
                numbersInUseQueue.push(num);
            })

        }
    }
    /*  } */

});

client.login(token);
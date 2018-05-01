const Discord = require('discord.js')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

db.defaults({ missions: [], xp: []})
    .write()

var bot = new Discord.Client();
var prefix = '!'
var randnum = 0

var storynumber = db.get('missions').size().value();




bot.on('ready', () => {
    bot.user.setPresence({ game : { name : '!help', type : 0}});
    console.log("Bot en marche");
});

bot.login(process.env.BOT_TOKEN)

bot.on("guildMemberAdd", member => {
    let nrole = member.guild.roles.find("name", "Arrivant")
    member.guild.channels.find("name", "bienvenue").send(`:duel: ${member.user.username} vient de rejoindre **The Old Republic** ! Bienvenue !`)
    member.addRole(nrole)
})



bot.on('message', async message => {

    let msg =  message.content.toUpperCase(); 
    let sender = message.author;
    let cont = message.content.slice(prefix.length).split(" ");
    let argss  = cont.slice(1);
    
    

    var msgaut = message.author.id;

    if (message.author.bot)return;

    if(!db.get("xp").find({user: msgaut}).value()){
        db.get("xp").push({user: msgaut, xp: 1}).write();
    }else{
        var userxpdb = db.get("xp").filter({user: msgaut}).find('xp').value();
        console.log(userxpdb);
        var userxp = Object.values(userxpdb)
        console.log(userxp)
        console.log(`XP: ${userxp[1]}`)

        db.get("xp").find({user: msgaut}).assign({user: msgaut, xp: userxp[1] += 1}).write();
    }

    if (message.content === prefix + "ping"){
        message.channel.send("Pong !")
        console.log('Ping ? Pong !');

    }

    if(!message.content.startsWith(prefix)) return;
    var args = message.content.substring(prefix.length).split(" ")

    switch (args[0].toLowerCase()){

        

        case "nmission":
        var value = message.content.substr(10);
        var author = message.author.toString();
        var number = db.get('missions').map('id').value();
        console.log(value);
        message.channel.send("Ajout de la mission à la base de données.")
        

        db.get('missions')
            .push({story_value: value, story_author: author})
            .write();

        break ;

        case "mission" : 

        story_random();
        console.log(randnum);

        var story = db.get(`missions[${randnum}].story_value`).toString().value();
        var author_story = db.get(`missions[${randnum}].story_author`).toString().value();
        console.log(story);

        message.channel.send(`${story} \n *(Ecrit par ${author_story})*`)

        break;

    }


    if (message.content === prefix + "help"){
        var helpe = new Discord.RichEmbed()
            .setColor('#FE7F01')
            .addField("Commandes du bot", "Voici une liste des commandes de R9D3.")
            .addField("Interactions", "!ping : Permet de tester la latence du bot. \n!mission : Vous donne une mission aléatoire. \n!stats : Vous permet de voir le nombre de messages envoyés." )
            .addField("Modération", "!clear : Vous permet de supprimer un certain nombre de messages. \n!say : Faites dire ce que vous voulez au bot." )
            .setFooter("Plus à venir.")
        message.channel.send(helpe);
        console.log("Commande help demandée.")
    }

    if (message.content === "Ca va ?"){
        random();
        if (randnum == 1){
            message.channel.send("Parfait ! Et vous ?");
            console.log("Réponse numéro 1")
        }

        if (randnum == 2){
            message.channel.send("Plutôt bien. Je vous remercie.");
            console.log("Réponse numéro 2")
        }
    }

    if (message.content === prefix + "stats"){
        var xp = db.get("xp").filter({user: msgaut}).find('xp').value()
        var xpfinal = Object.values(xp);
        var xpe = new Discord.RichEmbed()
            .setColor('#FE7F01')
            .setTitle(`XP de ${message.author.username}`)
            .setDescription("Vos messages envoyés !")
            .addField("Messages envoyés :", `${xpfinal[1]}`)
        message.channel.send({embed: xpe});
    }

    

    if (msg.startsWith(prefix + 'CLEAR')) {
        async function purge() {
            message.delete();

            if(!message.member.hasPermissions("MANGE_MESSAGES")) {
                message.channel.send("Permissions insuffisantes. Oof.")
                return;
            }

            if (isNaN(argss[0])) {
                message.channel.send('Invalide. \n' + prefix + 'clear <nombre>');
                return;
            }

            const fetched = await message.channel.fetchMessages({limit: argss[0]});
            console.log(fetched.size + ' messages supprimés.');

            message.channel.bulkDelete(fetched)
                .catch(error => message.channel.send(`Erreur: ${error}`));

        }

        purge();
    }
    

});

function random(min, max) {
    min = Math.ceil(0);
    max = Math.floor(3);
    randnum = Math.floor(Math.random() * (max - min +1) + min);
}

function story_random(min, max) {
    min = Math.ceil(0);
    max = Math.floor(storynumber);
    randnum = Math.floor(Math.random() * (max - min +1) + min);
}

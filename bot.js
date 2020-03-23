Promise = require('bluebird');

childProcess = require('child_process');
Discord = require('discord.js');
fetch = require('node-fetch');
fs = Promise.promisifyAll(require('fs'));
const {google} = require('googleapis');
he = require('he');
ordinal = require('ordinal');
moment = require('moment');
mongo = Promise.promisifyAll(require('mongodb'));
path = require('path');
schedule = require('node-schedule');
const striptags = require('striptags');
const xml2js = require('xml2js');
ytdl = require('ytdl-core');

const botPrefix = "!";

const version = "2.0.3"; // Version

numRequests = 0;
schedule.scheduleJob('/30 * * * * *', () => numRequests = 0);

// Send message stating there are too many API requests
tooManyRequests = msg => {
	let numSeconds = new Date().getSeconds();
	numSeconds = (Math.ceil(numSeconds / 30) * 30) - numSeconds;
	msg.channel.send(`Error: Too many API requests. Please wait ${numSeconds} ${numSeconds === 1 ? "second" : "seconds"} before trying again.`); // "second" if waiting 1 second, else "seconds"
}

rpsDeleteJobs = new Map(); // Map containing jobs to auto-delete RPS messages

MongoClient = mongo.MongoClient;
const mongoURI = process.env.MONGODB_URI;
const mongoUser = process.env.MONGODB_USER;

pronouns = [];
// Initialise MongoDB
MongoClient.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
	if (err) console.err(`Could not connect to MongoDB: ${err}`);
	dbo = db.db(mongoUser);
	userCollections = dbo.collection("userNations"); // Collection for user-nation key-value pairs
	CICollections = dbo.collection("comradeIndex"); // Collection for info about the Comrade Index
	scheduledReminders = dbo.collection("scheduledReminders"); // Collection for Scheduled Reminders
	counter = dbo.collection("counter"); // Collection for counting number of Fs, good bot and bad bot
	(async () => pronouns = (await dbo.collection("pronouns").findOne({"id": "pronouns"})).pronouns)(); // Array of all available pronouns
});

// Initialise Google API
youtube = google.youtube({
	version: 'v3',
	auth: process.env.YOUTUBE_AUTH
});

musicQueue = [] // Queue for playing music
dispatcher = null; // Transmits voice packets from stream

// Used to sign into PRAW
redditClientID = process.env.REDDIT_APP_ID;
redditClientSecret = process.env.REDDIT_APP_SECRET;

client = new Discord.Client();

// Get commands from folder
async function getCommands(normalisedPath) {
	let foundCommands = [];
	files = await fs.readdirAsync(normalisedPath);
	files.forEach(file => {
		foundCommands.push(require(path.join(normalisedPath, file)));
	});
	let commandCollection = new Discord.Collection();
	foundCommands.forEach(command => {
		if (command.aliases) { // If command has aliases
			let validNames = command.aliases;
			validNames.push(command.name);
			commandCollection.set(validNames, command);
		} else {
			commandCollection.set([command.name], command);
		}
	});
	return commandCollection;
}

// Run promises synchronously
const commandsPath = path.join(__dirname, "commands");
(async () => client.commands = await getCommands(commandsPath))();
const specialCommandsPath = path.join(__dirname, "specialCommands");
(async () => client.specialCommands = await getCommands(specialCommandsPath))();

// Return random object in array
getRandomObject = ary => {
	randomIndex = Math.floor(Math.random() * ary.length);
	return ary[randomIndex];
}

// Write file and send it
writeAndSend = async (msg, filename, data) => {
	await fs.writeFileAsync(filename, data);
	await msg.channel.send({files: [filename]});
	fs.unlink(filename, err => console.log(err));
}

// Send HTTP GET request
getRequest = (url, parseXML) => {
	return new Promise(async (resolve, reject) => {
		const options = {
			headers: {
				'User-Agent': `Unity Machine v${version}` // User Agent
			}
		};
		const res = await fetch(url, options); // Response message
		// Client or Server error
		if (! res.ok) reject(`${res.status} ${res.statusText}`); // Reject promise with HTTP status code
		const body = await res.text(); // Message body of response

		if (parseXML) { // Parse XML from body
			const parser = new xml2js.Parser({explicitArray : false, async: true});
			try {
				var content = await parser.parseStringPromise(body); // Parse XML in body
			} catch (err) {
				reject(err);
			}
		} else {
			var content = he.decode(striptags(body)); // Remove tags and convert HTML codes
			content = content.split('\n');
			content = content.filter(x => x != '');
		}
		resolve(content);
	});
}

const counterID = process.env.COUNTER_ID; // ID of counter
function updateCounter() {} // Placeholder function until Unity Machine connects to Discord

// Get nation of sender
getNation = msg => {
	return userCollections.findOne({id: msg.author.id}).then(object => object.nation);
}

// Execute Python file
executePythonFile = async (pythonFile, args) => {
	return new Promise((resolve, reject) => {
		const pythonProcess = childProcess.spawn('python3', [pythonFile].concat(args)); // Run Python File with arguments
		pythonProcess.stderr.on('data', data => reject(data.toString())); // If error occurred reject with error message
		pythonProcess.stdout.on('data', data => resolve(data.toString())); // If no error resolve with returned message
	});
}

// Read file and split by newline
openFile = async filename => {
	let fileContent = await fs.readFileAsync(path.join(__dirname, "data", filename), "utf-8"); // Open file
	fileContent = fileContent.split('\n');
	return fileContent;
}

(async () => {
	trophies = await openFile("trophies.txt");
	trophies[255] = "mostnations"; // Census no. 255 is Number of Nations
})();
(async () => {
	censusNames = await openFile("censusNames.txt");
	censusNames[255] = "Number of Nations";
})();
(async () => {
	censusDescriptions = await openFile("censusDescriptions.txt");
	censusDescriptions[255] = "The World Census tracked the movements of military-grade geo-airlifting helicopters to determine which regions have the most nations.";
})();

NSFavicon = "https://nationstates.net/favicon.ico";

// Reply to user
client.on('message', async msg => {
	// Prevent bot from responding to its own messages
	if (msg.author === client.user) return;

	// Reply to special commands
	if (client.specialCommands.keyArray().find(command => command.includes(msg.content.toLowerCase()))) {
		client.specialCommands.get(client.specialCommands.keyArray().find(command => command.includes(msg.content.toLowerCase()))).execute(msg);
		return;
	}

	// Received message starts with bot prefix
	if (msg.content.startsWith(botPrefix)) {

		const fullCommand = msg.content.substr(botPrefix.length); // Remove the leading bot prefix
		const splitCommand = fullCommand.split(' '); // Split the message up in to pieces for each space
		const primaryCommand = splitCommand[0].toLowerCase(); // The first word directly after the exclamation is the command
		let args = splitCommand.slice(1); // All other words are args/parameters/options for the command
	
		nickname = msg.channel.type === 'dm' ? msg.author.username : TLAServer.member(msg.author).displayName; // Nickname of user, returns username if contacted via DM
	
		helpPrimaryCommand = `Please use \`!help ${primaryCommand}\` to show more information.`; // Directs user to use !help command in error
		
		let foundCommand = client.commands.keyArray().find(command => command.includes(primaryCommand)); // Key in client.commands containing primaryCommand
		// If command does not exist
		if (! foundCommand) {
			msg.channel.send(`Error: \`!${primaryCommand}\` does not exist. Use \`!help\` to find all commands.`);
			return;
		}
		try {
			await client.commands.get(foundCommand).execute(msg, args);
		} catch (err) {
			msg.channel.send(`An unexpected error occurred: \`${err}\``);
		}
	}
});

// Client is connected to Discord
client.on('ready', async () => {
	console.log("Connected as " + client.user.tag);  // Confirm connection
	client.user.setActivity("Type !help to get all commands");


	TLAServer = client.guilds.cache.array()[0];
	unverifiedRole = TLAServer.roles.cache.find(role => role.name === 'Unverified');

	// Update counter
	updateCounter = async () => {
		let rolesCount = { 
			Verified: 0,
			Unverified: 0,
			CTE: 0,
			Assemblian: 0,
			Visitor: 0,
			Online: 0,
			Offline: 0
		};
		pronouns.forEach(role => rolesCount[role] = 0);
		TLAServer.members.cache.forEach(member => {
			for (var role in rolesCount) {
				if (member.roles.cache.find(r => r.name === role)) { // User has role
					rolesCount[role] ++;
				}
			}
			if (member.user.presence.status === "offline") {
				rolesCount.Offline ++;
			} else {
				rolesCount.Online ++;
			}
		});
		message = ["\u{1f4ca}**SERVER STATS**\u{1f4ca}", ''] // Message to send
		message.push(`Total members in server: ${TLAServer.members.cache.keyArray().length}`); // Convert TLAServer.members.cache to array of keys, then find length and append to message
		for (var role in rolesCount) {
			message.push(`${role}: ${rolesCount[role]}`);
		}

		const counterMessage = await TLAServer.channels.cache.find(channel => channel.name === "member-counter").messages.fetch(counterID);

		counterMessage.edit(message.join('\n'));
	}
	await updateCounter();

	numRequests = 11; // 11 requests will be made

	try {
		var nations = await getRequest("https://www.nationstates.net/cgi-bin/api.cgi?q=nations") // All nations in the world
	} catch (err) {
		console.error(`Unable to reach NationStates API. Error code: ${err}`);
		return;
	}
	nations = nations[0].split(',');

	TLANationsLink = "https://www.nationstates.net/cgi-bin/api.cgi?region=the_leftist_assembly&q=nations"; // All TLA nations

	try {
		var TLANations = await getRequest(TLANationsLink);
	} catch (err) {
		console.error(`Unable to reach NationStates API. Error code: ${err}`);
		return;
	}

	TLANations = TLANations[0].split(':');

	TLAServer.members.cache.forEach(async member => {
		item = await userCollections.findOne({id: member.id})
		if (! item) return; // member is bot

		const rawNation = item.nation.toLowerCase().replace(/ /g, '_');
		if ((! nations.some(nation => nation === rawNation)) && member.roles.cache.find(role => role.name === "Verified")) { // User has CTEd but not marked as CTE yet
			const CTEMessage = eval(await fs.readFileAsync(path.join(__dirname, "data", "cteMessage.txt"), "utf-8")); // Add interpolation for text in cteMessage.txt
			member.send(CTEMessage);
	
			if (member.roles.cache.find(role => role.name === "Assemblian")) { // User is marked as Assemblian
				member.roles.remove(TLAServer.roles.cache.find(role => role.name === "Assemblian"));
			} else {
				member.roles.remove(TLAServer.roles.cache.find(role => role.name === "Visitor"));
			}

			member.roles.remove(TLAServer.roles.cache.find(role => role.name === 'Verified'));
			member.roles.add(TLAServer.roles.cache.find(role => role.name === "CTE"));

			userCollections.updateOne({id: member.id}, {'$set': {time: new Date().getTime()}});

		} else if (item.time !== "None") { // Unverified/CTEd
			if (moment().diff(item.time, 'hours') >= 168) {
				member.kick("Sorry, you were unverified or marked as CTE for over 1 week.");
			}

		} else if (member.roles.cache.find(role => role.name === "Assemblian") && ! TLANations.some(nation => nation === rawNation)) { // Is marked Assemblian but not in TLA
			member.roles.remove(TLAServer.roles.cache.find(role => role.name === "Assemblian"));
			member.roles.add(TLAServer.roles.cache.find(role => role.name === "Visitor"));

		} else if (TLANations.some(nation => nation === rawNation) && member.roles.cache.find(role => role.name === "Visitor")) { // Is marked Visitor but nation in TLA
			member.roles.remove(TLAServer.roles.cache.find(role => role.name === "Visitor"));
			member.roles.add(TLAServer.roles.cache.find(role => role.name === "Assemblian"));

		} else if (nations.some(nation => nation === rawNation) && member.roles.cache.find(role => role.name === "CTE")) { // User is marked CTE but nation exists
			member.roles.remove(TLAServer.roles.cache.find(role => role.name === "CTE"));
			member.roles.add(TLAServer.roles.cache.find(role => role.name === "Verified"));
			member.roles.add(TLAServer.roles.cache.find(role => role.name === (TLANations.some(nation => nation === rawNation) ? "Assemblian" : "Visitor"))); // If user is in TLA add Assemblian role else add Visitor role
		}
	});

	links = [
				"https://www.nationstates.net/cgi-bin/api.cgi?region=the_leftist_assembly&q=censusranks;scale=6",
				"https://www.nationstates.net/cgi-bin/api.cgi?region=the_leftist_assembly&q=censusranks;scale=27",
				"https://www.nationstates.net/cgi-bin/api.cgi?region=the_leftist_assembly&q=censusranks;scale=28",
				"https://www.nationstates.net/cgi-bin/api.cgi?region=the_leftist_assembly&q=censusranks;scale=29",
				"https://www.nationstates.net/cgi-bin/api.cgi?region=the_leftist_assembly&q=censusranks;scale=57",
				"https://www.nationstates.net/cgi-bin/api.cgi?region=the_leftist_assembly&q=censusranks;scale=68",
				"https://www.nationstates.net/cgi-bin/api.cgi?region=the_leftist_assembly&q=censusranks;scale=71",
				"https://www.nationstates.net/cgi-bin/api.cgi?region=the_leftist_assembly&q=censusranks;scale=73",
				"https://www.nationstates.net/cgi-bin/api.cgi?region=the_leftist_assembly&q=censusranks;scale=75"
			];
	maxTLA = []
	// Get top score of each census in TLA
	for (let i = 0; i < 9; i ++) {
		try {
			maxTLA.push(Number((await getRequest(links[i]))[2]));
		} catch (err) {
			console.error(`Unable to reach NationStates API. Error code: ${err}`);
			return;
		}
	}

	try {
		var numNations = await getRequest("https://www.nationstates.net/cgi-bin/api.cgi?region=the_leftist_assembly&q=numnations");
	} catch (err) {	
		console.error(`Unable to reach NationStates API. Error code: ${err}`);
		return;
	}
	let place = Number(numNations[0]);
	do {
		const link = `https://www.nationstates.net/cgi-bin/api.cgi?region=the_leftist_assembly&q=censusranks;scale=51;start=${place}`;
		try {
			var corruption = await getRequest(link);
		} catch (err) {
			console.error(`Unable to reach NationStates API. Error code: ${err}`);
			return;
		}
		corruption = Number(corruption[2]);
		place --;
		numRequests ++;
	} while (Number.isNaN(corruption)) // If some nations do not have a corruption score in the API, then corruption = NaN

	corruption **= -0.5
	maxTLA.splice(4, 0, corruption);
	maxTLA[6] **= 2

	CICollections.updateOne({id: "CI"}, {'$set': {"maxTLA": maxTLA}});

	reminders = await scheduledReminders.find().toArrayAsync();
	reminders.forEach(reminder => {
		const user = client.users.cache.find(u => u.id === reminder.id);
		const reminderDate = new Date(reminder.time);

		// Schedule reminder if reminder is due after current date and time
		if (reminderDate > new Date()) {
			schedule.scheduleJob(reminderDate, async () => {
				const object = await scheduledReminders.findOne(reminder);
				user.send(`Reminder: ${reminderMessage}`);
				scheduledReminders.deleteOne(object);
			});

		// Send reminder if reminder is due before current date and time
		} else {
			user.send(`Reminder: ${reminder.message}`);
			scheduledReminders.deleteOne(reminder);
		}
	});
			
	console.log("Ready to take commands!");
});



client.on("shardReconnecting", () => console.log("Trying to reconnect..."));
client.on("shardDisconnected", () => console.log("Disconnected."));



// A user adds reaction to a message
client.on("messageReactionAdd", (reaction, user) => {
	if (user === client.user) return;
	if (rpsDeleteJobs.has(reaction.message.id)) {
		const validMoves = ["\u{1f311}", "\u{1f4f0}", "\u2702"]; // Moves makable in Rock Paper Scissors
		if (! validMoves.includes(reaction.emoji.name)) return; // Reacted emoji not in validMoves
		const userMove = reaction.emoji.name;
		const nickname = reaction.message.channel.type === "dm" ? user.username : TLAServer.member(user).displayName;
		const computerMove = getRandomObject(validMoves); // Represents index of move computer made

		const DiscordEmbed = new Discord.MessageEmbed();
		DiscordEmbed
			.setColor('#ce0001')
			.addField("Unity Machine", computerMove, true)
			.addField(nickname, userMove, true)

		if (userMove === computerMove) { // Both made same move
			DiscordEmbed.setDescription("**Tie!**");
		} else if (userMove === "\u{1f311}" && computerMove === "\u2702" ||
					userMove === "\u{1f4f0}" && computerMove === "\u{1f311}" ||
					userMove === "\u2702" && computerMove === "\u{1f4f0}") { // Win
			DiscordEmbed.setDescription("**You Win!**");
		} else DiscordEmbed.setDescription("**You Lost!**"); // Lose

		reaction.message.edit(DiscordEmbed);

		rpsDeleteJobs.get(reaction.message.id).cancel(); // Cancel delete job for message
		rpsDeleteJobs.delete(reaction.message.id);
	}
});

// A user changes nickname or changes roles
client.on("guildMemberUpdate", member => updateCounter());

// A user's status or activity changes
client.on("presenceUpdate", member => updateCounter());

let unverifiedRole;
// A user joins server
client.on("guildMemberAdd", async newMember => {
	newMember.roles.add(unverifiedRole); // Add unverified role
	const welcomeMessage = eval(await fs.readFileAsync(path.join(__dirname, "data", "welcomeMessage.txt"), "utf-8")); // Add interpolation for text in welcomeMessage.txt
	newMember.user.send(welcomeMessage);
	userCollections.insertOne({id: newMember.id, nation: "None", time: new Date().getTime()});
	updateCounter();
});

// A user leaves/is kicked/is banned from server
client.on("guildMemberRemove", member => {
	userCollections.deleteOne({"id": member.id});
	scheduledReminders.deleteMany({"id": member.id});
	updateCounter();
});

client.login(process.env.BOT_TOKEN);

const childProcess = require("child_process");
const Discord = require('discord.js');
const fs = require('fs');
const he = require('he');
const ordinal = require('ordinal');
const moment = require('moment');
const MongoClient = require('mongodb').MongoClient;
const striptags = require('striptags');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

const mongoUrl = process.env.MONGODB_URI;
const mongoUser = 'heroku_n7xj73rp';

const client = new Discord.Client()

// Return random object in array
function getRandomObject(ary) {
    randomIndex = Math.floor(Math.random() * ary.length);
    return ary[randomIndex];
}

// Read file and split by newline
function openFile(filename) {
    fileContent = fs.readFileSync(filename); // Open file
    fileContent = fileContent.toString(); // Convert bytes to string
    fileContent = fileContent.split("\n");
    return fileContent
}

let TLAServer; // Guild object of TLA Server

// Create GET request
function request(url) {
    let xhr = new XMLHttpRequest();
    
    xhr.open('GET', url, false);
    xhr.responseType = 'text';
    
    xhr.send();

    if (xhr.status === 200) { // OK
        let content = he.decode(striptags(xhr.responseText));
        content = content.split("\n");
        content = content.filter(x => x != "");
        return content
    } else { // Error
        return xhr.status
    }
}

function processCommand(receivedMessage) {
    const fullCommand = receivedMessage.content.substr(1); // Remove the leading exclamation mark
    const splitCommand = fullCommand.split(" "); // Split the message up in to pieces for each space
    const primaryCommand = splitCommand[0]; // The first word directly after the exclamation is the command
    let arguments = splitCommand.slice(1); // All other words are arguments/parameters/options for the command
    const code = "```" // Add this at front and end of string in Discord to turn into code formatting

    let nickname = receivedMessage.channel.type === "dm" ? receivedMessage.author.username : TLAServer.member(receivedMessage.author).displayName; // Nickname of user, returns username if contacted via DM

    const helpPrimaryCommand = `Please use \`!help ${primaryCommand}\` to show more information.`; // Directs user to use !help command in error

    let trophies = openFile("trophies.txt");
    let censusNames = openFile("censusNames.txt");
    let censusDescriptions = openFile("censusDescriptions.txt");
    trophies[255] = "https://www.nationstates.net/images/trophies/mostnations-100.png"; // Census no. 255 is Number of Nations
    censusNames[255] = "Number of Nations";
    censusDescriptions[255] = "The World Census tracked the movements of military-grade geo-airlifting helicopters to determine which regions have the most nations.";
    const NSThumbnail = "https://theredand.black/uploads/monthly_2017_03/nationstates.png.e8aa5b8de1bd5430dc950d0b297952ab.png";
    
    // Roll dice
    if (primaryCommand === "roll") {
        const expression = arguments.join("");

        opRegex = /[-+]/; // Regex to check if string is +, - or *
        diceRegex = /[1-9][0-9]*|([1-9][0-9]*)?d[1-9][0-9]*/; // Regex to check if string is dice notation or positive integer
        diceExp = expression.split(opRegex); // Split by every operation
        operations = expression.split(diceRegex); // Split by every dice notation object / integer
        operations = operations.filter(element => element !== undefined && element !== ''); // '' and undefined can pop up in operations
        if (! (diceExp.every(element => diceRegex.test(element)) && operations.every(element => opRegex.test(element)))) {
            receivedMessage.channel.send("Error: Incorrect dice expression.");
            return
        }

        let numDice = 0;
        let tooManyFaces = false;
        diceExp.forEach(element => {
            element = element.split("d");
            if (element.length === 2) {
                numDice += element[0] === '' ? 1 : Number(element[0]); // If element[0] is blank, then the number of dice rolled is 1.
                if (Number(element[1]) > 1000000000000) { // Do not allow rolling beyond 1 trillion
                    receivedMessage.channel.send("Error: Too many faces.")
                    tooManyFaces = true;
                }
            }
       });
        if (numDice > 10000) {
            console.log("Error: You are rolling too many dice at once.");
            return
        }
        if (tooManyFaces) { // If there are too many faces on one die
            return
        }

        let results = [];
        let resultsEachRoll = [];
        diceExp.forEach(element => {
            element = element.split("d");
            if (element.length > 1) {
                const diceRolled = element[0] === '' ? 1 : Number(element[0]);
                const faces = element[1];
                let diceString = [];
                let sumDice = 0;
                for (let i = 0; i < diceRolled; i ++) {
                    let randomDie = Math.floor(Math.random() * faces) + 1;
                    sumDice += randomDie;
                    diceString.push(randomDie);
                }
                diceString = diceString.join(" + ")
                results.push(sumDice);
                resultsEachRoll.push(diceString);
            } else {
                results.push(element[0]);
            }
        });

        let arithExpress = ''
        for (let i = 0; i < operations.length; i ++) {
            arithExpress += `${results[i]}${operations[i]}`;
        }
        arithExpress += results[results.length - 1];
        const answer = eval(arithExpress);
        resultsEachRoll = resultsEachRoll.join(", ")

        if (numDice < 50 && numDice > 1) {
            receivedMessage.channel.send(`${nickname} rolled **${answer}**. (${resultsEachRoll})`);
        } else {
            receivedMessage.channel.send(`${nickname} rolled **${answer}**.`);
        }
    
    // Pay respects
    } else if (primaryCommand === "rip") {
        arguments = arguments.join(" ");
        if (arguments.length === 0) {
            receivedMessage.channel.send("Rest in Peace.");
        } else {
            receivedMessage.channel.send(`Rest in Peace, ${arguments}.`);
        }

    // Create random 8-ball answer
    } else if (primaryCommand === "8ball") {
        let eightBallResponses = openFile("8ball.txt");
        let randomResponse = getRandomObject(eightBallResponses);
        receivedMessage.channel.send(`\u{1f52e} ${randomResponse}, ${nickname}.`);
    
    // Get random quote
    } else if (primaryCommand === "quote") {
        let quotes = openFile("quotes.txt");
        if (arguments.length >= 1) {
            arguments = arguments.join(" ")
            quotes = quotes.filter(quote => quote.toLowerCase().endsWith(arguments.toLowerCase())); // toLowerCase() allows for case-insensitive matching
            if (quotes.length === 0) { // No quotes
                receivedMessage.channel.send(`Sorry, but there are no quotes from ${arguments}. If you want quotes from them, please contact The Comrade#4859.`);
                return
            }
        }
        let randomQuote = getRandomObject(quotes);
        receivedMessage.channel.send(randomQuote);

    // Nation performance in given census
    } else if (primaryCommand === "ncensus") {
        if (arguments.length < 2) {
            receivedMessage.channel.send(`Error: At least 2 arguments are required with the !ncensus command. ${helpPrimaryCommand}`);
            return
        }
        if (arguments.length > 2) {
            receivedMessage.channel.send(`Error: Too many arguments. Make sure you have replaced spaces with underscrolls. ${helpPrimaryCommand}`);
            return
        }

        let censusID = arguments[0];
        const nation = arguments[1];
        if (! (Number.isInteger(Number(censusID)) && 0 <= censusID && censusID <= 85)) { //Census ID is not integer, below 0 or over 85
            receivedMessage.channel.send(`Error: Invalid Census ID "${censusID}". ${helpPrimaryCommand}`);
            return
        }

        censusID = Number(censusID);
        const link = `https://www.nationstates.net/cgi-bin/api.cgi?nation=${nation}&q=name+region+flag+census;scale=${censusID};mode=score+rank+rrank+prank+prrank` // Link used to find information on nations
        
        const response = request(link)
        if (typeof(response) === 'number') {
            if (response === 404) { // Not found
                receivedMessage.channel.send(`Error: "${nation}" was not found.`)
            } else {
                receivedMessage.channel.send(`An unexpected error occured. Error code: ${response}`)
            }

            return
        }
        const responseObject = {
            nation: response[0],
            region: response[1],
            flag: response[2],
            score: response[3],
            worldRank: response[4],
            worldRankPercentage: response[5],
            regionRank: response[6],
            regionRankPercentage: response[7],
            censusName: censusNames[censusID],
            trophy: trophies[censusID],
            censusDesc: censusDescriptions[censusID]
        };
        const discordEmbed = new Discord.RichEmbed()
            .setColor('#ce0001') // Colour
            .setAuthor(`${responseObject.nation}'s performance in ${responseObject.censusName}`, responseObject.trophy, `https://www.nationstates.net/nation=${nation}/detail=trend/censusid=${censusID}`) // Top line
            .setDescription(responseObject.censusDesc) // Description
            .setThumbnail(responseObject.flag)
            .addField(`Score in ${responseObject.censusName}`, responseObject.score) // Census score
            .addField(`Top ${responseObject.worldRankPercentage}% in the world`, `# ${responseObject.worldRank} in the world`, true) // Rank and percentage in the world
            .addField(`Top ${responseObject.regionRankPercentage}% in ${responseObject.region}`, `# ${responseObject.regionRank} in ${responseObject.region}`, true) // Rank and percentage in region
            .setTimestamp() // Add timestamp

        receivedMessage.channel.send(discordEmbed);
    
    // Compare multiple nations
    } else if (primaryCommand === "ncompare") {
        if (arguments.length < 3) {
            receivedMessage.channel.send(`Error: At least 3 arguments are required with the !ncompare command. ${helpPrimaryCommand}`);
            return
        }
        if (arguments.length > 6) {
            receivedMessage.channel.send(`Error: Over maximum number of 5 nations. Make sure you have replaced spaces with underscrolls. ${helpPrimaryCommand}`);
            return
        }

        let censusID = arguments[0];
        const nations = arguments.slice(1);
        if (! (Number.isInteger(Number(censusID)) && 0 <= censusID && censusID <= 85)) {
            receivedMessage.channel.send(`Error: Invalid Census ID "${censusID}". ${helpPrimaryCommand}`);
            return
        }

        const nationLinks = {};

        nations.forEach(nation => nationLinks[nation] = `https://www.nationstates.net/cgi-bin/api.cgi?nation=${nation};q=name+census;scale=${censusID};mode=score`)
        
        const keys = Object.keys(nationLinks);
        let scores = []; // Array of all scores
        let nationScores = []; // Array containing objects of nation and score
        nationNames = []; // Array of all nation "proper" names
        keys.forEach(key => { // Iterate over all requested nations
            response = request(nationLinks[key]);
            if (typeof(response) === 'number') { // Error
                if (response === 404) {
                receivedMessage.channel.send(`Error: "${key}" was not found.`);
                } else {
                    receivedMessage.channel.send(`An unexpected error occured. Error code: ${response}`);
                }
                return
            }
            nationName = response[0];
            score =  Number(response[1]);
            nationScores.push({nation: nationName, score: score});
            scores.push(score);
            nationNames.push(nationName);
        });
        scores.sort((a, b) => b - a); // Sort by descending order
        nationScores.sort((a, b) => scores.indexOf(a.score) - scores.indexOf(b.score)); // Sort by order of score in scores array
        
        nationsRawString = keys.join("+")
        nationsString = `${nationNames.slice(0, nationNames.length - 1).join(", ")} and ${nationNames[nationNames.length - 1]}`; // Join elements with ", ", then for the last element join with ", and"
        trophy = trophies[censusID];
        censusName = censusNames[censusID];
        const discordEmbed = new Discord.RichEmbed()
            .setColor('#ce0001')
            .setAuthor(`Comparison of ${nationsString} in ${censusName}`, trophy, `https://www.nationstates.net/page=compare/nations=${nationsRawString}/censusid=${censusID}`)
            .setTitle(`${nationScores[0].nation} wins!`)
            .setTimestamp()
        
        nationScores.forEach((element, index) => discordEmbed.addField(`${index + 1}. ${element.nation}`, `Score: ${element.score}`));

        receivedMessage.channel.send(discordEmbed)

    // Information on a given nation
    } else if (primaryCommand === "ninfo") {
        if (arguments.length < 1) {
            receivedMessage.channel.send(`Error: 1 argument is required with the !ninfo command. ${helpPrimaryCommand}`);
            return
        }

        let nation = arguments[0];
        
        let link = `https://www.nationstates.net/cgi-bin/api.cgi?nation=${nation}&q=majorindustry+notable+category+fullname+founded+flag+region+census+population+income+poorest+currency+influence+demonym2plural+motto;scale=66;mode=score`;
        const response = request(link);
        if (typeof(response) === 'number') {
            if (response === 404) {
                receivedMessage.channel.send(`Error: "${nation}" was not found.`)
            } else {
                receivedMessage.channel.send(`An unexpected error occured. Error code: ${response}`)
            }

            return
        }
        const responseObject = {
            fullName: response[0],
            motto: response[1],
            category: response[2],
            region: response[3],
            currency: response[5],
            flag: response[6],
            demonymPlural: response[7],
            income: response[8],
            poorIncome: response[9],
            majorIndustry: response[10],
            notable: response[11],
            influence: response[13],
            endorsements: parseInt(response[14]).toString()
        }
        if (Number(response[4]) < 1000) {
            responseObject.population = `${response[4]} million`;
        } else {
            responseObject.population = `${response[4] / 1000} billion`;
        }
        if (response[12] === "0") { // In antiquity
            responseObject.founded = "Founded in Antiquity";
        } else {
            responseObject.founded = `Founded ${response[12]}`;
        }

        const linkRegion = `https://www.nationstates.net/cgi-bin/api.cgi?region=${responseObject.region}&q=nations`;
        const WALink = "https://www.nationstates.net/cgi-bin/api.cgi?wa=1&q=members";
        let WAResponse = request(WALink) // All region nations
        let regionResponse = request(linkRegion) // All WA nations
        if (typeof(regionResponse) === 'number') {
            receivedMessage.channel.send(`An unexpected error occured. Error code: ${regionResponse}`)
            return
        }
        if (typeof(WAResponse) === 'number') {
            receivedMessage.channel.send(`An unexpected error occured. Error code: ${WAResponse}`)
            return
        }

        WAResponse = WAResponse[0].split(',');
        regionResponse = regionResponse[0].split(':');
        const regionWANations = regionResponse.filter(nation => WAResponse.includes(nation)); // All nations inside list of WA nations
        responseObject.numWA = regionWANations.length; // Number of WA Nations

        const discordEmbed = new Discord.RichEmbed()
            .setColor('#ce0001')
            .setAuthor(responseObject.fullName, NSThumbnail, `https://www.nationstates.net/nation=${nation}`)
            .setTitle(`"${responseObject.motto}"`)
            .setDescription(`${responseObject.fullName}, home to ${responseObject.population} ${responseObject.demonymPlural}, is notable for its ${responseObject.notable}. It currently resides in ${responseObject.region}.`)
            .setThumbnail(responseObject.flag)
            .addField(responseObject.category, '\u200b', true)
            .addField(`Largest Industry: ${responseObject.majorIndustry}`, '\u200b', true)
            .addField(`Influence: ${responseObject.influence}`, `${responseObject.endorsements} endorsements (${(responseObject.endorsements / responseObject.numWA * 100).toFixed(2)}% of ${responseObject.numWA} WA Nations)`)
            .addField(`Average income: ${responseObject.income} ${responseObject.currency}s`, `Average income of Poor: ${responseObject.poorIncome} ${responseObject.currency}s`)
            .setFooter(responseObject.founded)
            .setTimestamp()

        receivedMessage.channel.send(discordEmbed)

    // Return policy information
    } else if (primaryCommand === "npolicy") {
        if (arguments.length < 1) {
            receivedMessage.channel.send(`Error: 1 argument is required with the !ninfo command. ${helpPrimaryCommand}`);
            return
        }

        let nation = arguments[0];
        let link = `https://www.nationstates.net/cgi-bin/api.cgi?nation=${nation}&q=policies`;
        let response = request(link);
        if (typeof(response) === 'number') {
            if (response === 404) {
                receivedMessage.channel.send(`Error: "${nation}" was not found.`);
            } else {
                receivedMessage.channel.send(`An unexpected error occured. Error code: ${response}`);
            }

            return
        }
        
        let dataArray = [];
        for (i = 0, j = response.length; i < j; i += 4) {
            temparray = response.slice(i, i + 4);
            temparray.splice(2, 1); // Remove 3rd element of temparray
            temparray[0] = `policyname: ${temparray[0]}`;
            temparray[1] = `image-url: https://www.nationstates.net/images/banners/samples/${temparray[1]}.jpg`;
            temparray[2] = `description: ${temparray[2]}`;
            dataArray.push(temparray);
        }

        dataArray = dataArray.map(array => array.join("\n"));
        let data = dataArray.join("\n\n");
        let filename = `${nation}_banner.txt`
        
        fs.writeFileSync(filename, data);
        receivedMessage.channel.send({files: [filename]});
        setTimeout(filename => fs.unlinkSync(filename), 10, filename); // Delay 10 ms to allow time for file to upload before deleting

     // Find performance of region in census
    } else if (primaryCommand === "rcensus") {
        if (arguments.length > 2) {
            receivedMessage.channel.send(`Error: Too many arguments. Make sure you have replaced spaces with underscrolls. ${helpPrimaryCommand}`);
            return
        }
        let censusID = arguments[0]
        const region = arguments.length === 1 ? "the_leftist_assembly" : arguments[1];
        
        if (! (Number.isInteger(Number(censusID)) && ((0 <= censusID && censusID <= 85) ||Number(censusID) === 255))) { // Census ID 255 refers to number of nations in a region
            receivedMessage.channel.send(`Error: Invalid Census ID "${censusID}". ${helpPrimaryCommand}`);
            return
        }

        censusID = Number(censusID);
        const link = `https://www.nationstates.net/cgi-bin/api.cgi?region=${region}&q=name+flag+census;scale=${censusID};mode=score+rank+prank` // Link used to find information on nations
        
        const response = request(link)
        if (typeof(response) === 'number') {
            if (response === 404) { // Not found
                receivedMessage.channel.send(`Error: "${region}" was not found.`)
            } else {
                receivedMessage.channel.send(`An unexpected error occured. Error code: ${response}`)
            }

            return
        }

        const responseObject = {
            regionName: response[0],
            flag: response[1],
            score: response[2],
            worldRank: response[3],
            worldRankPercentage: response[4],
            censusName: censusNames[censusID],
            trophy: trophies[censusID],
            censusDesc: censusDescriptions[censusID]
        };

        const discordEmbed = new Discord.RichEmbed()
            .setColor('#ce0001')
            .setAuthor(`${responseObject.regionName}'s performance in ${responseObject.censusName}`, responseObject.trophy)
            .setDescription(responseObject.censusDesc)
            .setThumbnail(responseObject.flag)
            .addField(`Score in ${responseObject.censusName}`, responseObject.score, true)
            .addField(`Top ${responseObject.worldRankPercentage}% in the world`, `# ${responseObject.worldRank} in the world`, true)

        receivedMessage.channel.send(discordEmbed);


    } else if (primaryCommand === "rinfo") {
        if (arguments.length > 1) {
            receivedMessage.channel.send(`Error: Too many arguments. Please make sure you have replaced spaces with underscrolls. ${helpPrimaryCommand}`)
            return
        }
        const region = arguments.length === 0 ? "the_leftist_assembly" : arguments[0];
        const regionLink = `https://www.nationstates.net/cgi-bin/api.cgi?region=${region}&q=delegate+delegatevotes+nations+numnations+founder+founded+name+flag+power`;
        const WALink = "https://www.nationstates.net/cgi-bin/api.cgi?wa=1&q=members";
        let regionResponse = request(regionLink);
        let WAResponse = request(WALink);

        if (typeof(regionResponse) === 'number') {
            receivedMessage.channel.send(`An unexpected error occured. Error code: ${regionResponse}`)
            return
        }
        if (typeof(WAResponse) === 'number') {
            receivedMessage.channel.send(`An unexpected error occured. Error code: ${WAResponse}`)
            return
        }
        responseObject = {
            name: regionResponse[0],
            numnations: regionResponse[1],
            delegateEndos: Number(regionResponse[4]) - 1,
            power: regionResponse[7],
            flag: regionResponse[8]
        };

        WAResponse = WAResponse[0].split(',');
        regionResponse[2] = regionResponse[2].split(":")
        const regionWANations = regionResponse[2].filter(nation => WAResponse.includes(nation)); // All nations inside list of WA nations
        responseObject.numWA = regionWANations.length; // Number of WA Nations

        if (regionResponse[3] === "0"){ // No Delegate
            responseObject.delegate = "None";
            responseObject.delegateEndos = 0;
        } else {
            const delegateLink = `https://www.nationstates.net/cgi-bin/api.cgi?nation=${regionResponse[3]}&q=name`;
            responseObject.delegate = request(delegateLink);
        }

        if (regionResponse[5] === "0") { // No founder
            responseObject.founder = "Game created region";
        } else {
            const founderLink = `https://www.nationstates.net/cgi-bin/api.cgi?nation=${regionResponse[5]}&q=name`;
            responseObject.founder = `Founded by ${request(founderLink)}`;
            if (responseObject.founder === "Founded by 404") { // Founder does not exist anymore
                responseObject.founder = `Founded by ${regionResponse[5]}`;
            }
        }

        responseObject.foundedTime = regionResponse[6] === "0" ? "Founded in Antiquity" : `Founded ${regionResponse[6]}` // Checks if region was founded in Antiquity
        const discordEmbed = new Discord.RichEmbed()
            .setColor('#ce0001')
            .setAuthor(responseObject.name, NSThumbnail, `https://www.nationstates.net/region=${region}`)
            .setThumbnail(responseObject.flag)
            .addField(`Number of nations: ${responseObject.numnations}`, `Number of WA Nations: ${responseObject.numWA}`, true)
            .addField(`Delegate: ${responseObject.delegate}`, `Nations endorsing delegate: ${responseObject.delegateEndos}`, true)
            .addField(responseObject.founder, responseObject.foundedTime)
            .setFooter(`Power: ${responseObject.power}`)
            .setTimestamp()
        
        receivedMessage.channel.send(discordEmbed);

    // Find next holiday
    } else if (primaryCommand === "nextholiday") {
        let holidays = openFile("holidays.txt");
        const today = moment().utc().startOf("day"); // UTC date, with time set to 00:00
        const year = today.year(); // This year
        holidays = holidays.map(holiday => {
            temparray = holiday.split(": ");
            object = {
                name: temparray[0],
                date: moment.utc(`${year}${temparray[1]}`)
            };
            return object
        });
        for (i = 0; i < holidays.length; i ++) {
            if (today.diff(holidays[i].date, 'day') > 0) {
                holidays[i].date.add(1, "year");
            } else {
                break
            }
        }
        holidays.sort((a, b) => a.date.diff(b.date)); // Sort by oldest to newest
        
        nextHoliday = holidays[0];
        difference = nextHoliday.date.diff(today, "day");

        if (difference === 0) {
            receivedMessage.channel.send(`Today is ${nextHoliday.name}! \u{1f389}`)
        } else if (difference === 1) {
            receivedMessage.channel.send(`${nextHoliday.name} is only 1 day away!`)
        } else {
            receivedMessage.channel.send(`${nextHoliday.name} is only ${difference} days away!`)
        }

        // Find census number
    } else if (primaryCommand === "censusnum") {
        arguments = arguments.join(" ");
        const index = censusNames.indexOf(arguments);
        if (index === -1) {
            receivedMessage.channel.send("Error: Census not found.")
        } else {
            receivedMessage.channel.send(`The census number for ${arguments} is ${index}.`);
        }

     // Change pronoun
    } else if (primaryCommand === "pronoun") {
        pronounRoles = TLAServer.roles.filter(role => role.hexColor === "#dddddd");
        arguments.forEach(rolename => {
            if (! pronounRoles.find(role => role.name === rolename)) { // Pronoun Role name does not exist
                receivedMessage.channel.send(`Error: "${rolename}" does not exist.`)
            }
        });
        if (! arguments.every(rolename => pronounRoles.find(role => role.name === rolename))) {
            return
        }
    
        guildMember = TLAServer.member(receivedMessage.author);
        pronounRoles.forEach(prole => {
            if (guildMember.roles.find(role => role === prole)  && ! arguments.includes(prole.name)) { // Member has pronoun role and not 
                guildMember.removeRole(prole);
            }
        });

        arguments.forEach(rolename => {
            if (! guildMember.roles.find(role => role.name === rolename)) { // If user does not already have role
                guildMember.addRole(pronounRoles.find(role => role.name === rolename));
            }
        });
        const argumentsString = arguments.join(" and ");
        if (arguments.length === 0) {
            receivedMessage.channel.send("Removed all pronoun roles!");
        } else if (arguments.length === 1) {
            receivedMessage.channel.send(`Added ${argumentsString} role!`);
        } else {
            receivedMessage.channel.send(`Added ${argumentsString} roles!`);
        }

     // Compare multiple regions
    } else if (primaryCommand === "rcompare") {
        if (arguments.length < 3) {
            receivedMessage.channel.send(`Error: At least 3 arguments are required with the !rcompare command. ${helpPrimaryCommand}`);
            return
        }
        if (arguments.length > 6) {
            receivedMessage.channel.send(`Error: Over maximum number of 5 regions. Make sure you have replaced spaces with underscrolls. ${helpPrimaryCommand}`);
            return
        }

        let censusID = arguments[0];
        const regions = arguments.slice(1);
        if (! (Number.isInteger(Number(censusID)) && ((0 <= censusID && censusID <= 85) ||Number(censusID) === 255))) {
            receivedMessage.channel.send(`Error: Invalid Census ID "${censusID}". ${helpPrimaryCommand}`);
            return
        }

        const regionLinks = {};

        regions.forEach(region => regionLinks[region] = `https://www.nationstates.net/cgi-bin/api.cgi?region=${region};q=name+census;scale=${censusID};mode=score`)
        
        const keys = Object.keys(regionLinks);
        let scores = []; // Array of all scores
        let regionScores = []; // Array containing objects of region and score
        regionNames = []; // Array of all region "proper" names
        keys.forEach(key => { // Iterate over all requested regions
            response = request(regionLinks[key]);
            if (typeof(response) === 'number') { // Error
                if (response === 404) {
                receivedMessage.channel.send(`Error: "${key}" was not found.`);
                } else {
                    receivedMessage.channel.send(`An unexpected error occured. Error code: ${response}`);
                }
                return
            }
            regionName = response[0];
            score =  Number(response[1]);
            regionScores.push({region: regionName, score: score});
            scores.push(score);
            regionNames.push(regionName);
        });
        scores.sort((a, b) => b - a); // Sort by descending order
        regionScores.sort((a, b) => scores.indexOf(a.score) - scores.indexOf(b.score)); // Sort by order of score in scores array
        
        regionsString = `${regionNames.slice(0, regionNames.length - 1).join(", ")} and ${regionNames[regionNames.length - 1]}`; // Join elements with ", ", then for the last element join with "and"
        trophy = trophies[censusID];
        censusName = censusNames[censusID];
        const discordEmbed = new Discord.RichEmbed()
            .setColor('#ce0001')
            .setAuthor(`Comparison of ${regionsString} in ${censusName}`, trophy)
            .setTitle(`${regionScores[0].region} wins!`)
            .setTimestamp()
        
        regionScores.forEach((element, index) => discordEmbed.addField(`${index + 1}. ${element.region}`, `Score: ${element.score}`));

        receivedMessage.channel.send(discordEmbed)

      // Get one of the hottest posts on a subreddit
    } else if (primaryCommand === "hot") {
        if (arguments.length < 3) { // 2 or less arguments
            if (arguments.length < 2) { // 1 or less arguments
                if (arguments.length === 0) { // No arguments
                    receivedMessage.channel.send(`Error: This command requires at least one command. ${helpPrimaryCommand}`);
                    return
                }
                arguments[1] = "5";
            }
            arguments[2] = "False";
        } else if (arguments.length > 3) {
            receivedMessage.channel.send(`Error: Too many arguments. ${helpPrimaryCommand}`);
            return
        }

        if (! (Number.isInteger(Number(arguments[1])) && Number(arguments[1]) > 0 && Number(arguments[1]) <= 20)) { // "Number of posts" argument not an integer or less than 1
            receivedMessage.channel.send(`Error: "Number of Posts" argument is not an integer. ${helpPrimaryCommand}`);
            return
        }
        if (! (arguments[2] === "False" || arguments[2] === "True")) { // 
            receivedMessage.channel.send(`Error: The "Sticky posts included" argument must be either "True" or "False". ${helpPrimaryCommand}`);
            return
        }

        const pythonProcess = childProcess.spawn('python3',["reddit.py", arguments[0], arguments[1], arguments[2]]);
        pythonProcess.stdout.on('data', (data) => { // Received data from reddit.py
            data = data.toString();
            if (data.startsWith("Error Message:")) { // Is error message
                if (data === "Error Message: received 404 HTTP response\n") { // Not found
                    receivedMessage.channel.send("Error: subreddit does not exist.");
                } else if (data === "Error Message: No NSFW subreddits allowed.\n" || data === "Error Message: Subreddit is private.\n") {
                    receivedMessage.channel.send(data);
                } else {
                    receivedMessage.channel.send(`An unexpected error occured. ${data}`);
                }
                return
            }

            submissionInfo = JSON.parse(data);
            aboutJSON = JSON.parse(request(`https://www.reddit.com/r/${arguments[0]}/about.json`)); // about.json of subreddit
            discordEmbed = new Discord.RichEmbed()
                .setColor('#ce0001')
                .setFooter(`Upvotes: ${submissionInfo.score}`)
            
            if (aboutJSON === 403) { // Forbidden (Quarantined) subreddit
                discordEmbed.setAuthor(submissionInfo.title, "", submissionInfo.url)
            } else {
                discordEmbed.setAuthor(submissionInfo.title, aboutJSON.data.icon_img, submissionInfo.url)
            }

            if (submissionInfo.type === "Image") {
                discordEmbed.setImage(submissionInfo.content);
            } else if (submissionInfo.type === "Link") {
                discordEmbed.setDescription(`[Link](${submissionInfo.content})`)
            } else if (submissionInfo.type === "Post") {
                discordEmbed.setDescription(submissionInfo.content)
            }
            receivedMessage.channel.send(discordEmbed);
                
        });

     // Get next anniversary of nation
    } else if  (primaryCommand === "nanniversary") {
        if (arguments.length === 0) {
            receivedMessage.channel.send(`Error: Too little arguments. ${helpPrimaryCommand}`);
            return
        }
        if (arguments.length > 1) {
            receivedMessage.channel.send(`Error: Too many arguments. ${helpPrimaryCommand}`);
            return
        }

        const today = moment().utc().startOf('day');
        let anniversary = request(`https://www.nationstates.net/cgi-bin/api.cgi?nation=${arguments[0]}&q=name+foundedtime`);
        if (typeof(anniversary) === "number") {
            if (anniversary === 404) {
                receivedMessage.channel.send(`Error: "${arguments[0]}" was not found.`);
            } else {
                receivedMessage.channel.send(`An unexpected error occured. Error code: ${anniversary}`);
            }
            return
        }

        if (anniversary[1] === "0") { // Founded in Antiquity
            receivedMessage.channel.send("Sorry, the requested nation was founded in Antiquity.");
            return
        }
        const nation = anniversary[0];
        anniversary = moment.unix(anniversary[1]).utc().startOf('day');
        let years = today.diff(anniversary, 'years');
        anniversary.add(years, 'y');

        if (anniversary.isSame(today)) { // Anniversary is today
            years = ordinal(years); // Conver to ordinal number
            receivedMessage.channel.send(`${nation}'s ${years} anniversary is today! \u{1f389}`);
        } else {
            anniversary.add(1, 'y'); // Add another year (next anniversary must be in the future)
            years = ordinal(years + 1)
            receivedMessage.channel.send(`${nation}'s ${years} anniversary is in ${anniversary.diff(today, 'days')} days!`);
        }

     // Verify nation
    } else if (primaryCommand === "verifyme") {
        if (arguments.length > 2) {
            receivedMessage.channel.send(`Error: Too many arguments. ${helpPrimaryCommand}`);
            return
        }
        if (arguments.length < 2) {
            receivedMessage.channel.send(`Error: Too little arguments. ${helpPrimaryCommand}`);
            return
        }
        if (receivedMessage.channel.type !== "dm") {
            receivedMessage.channel.send(`Error: \`!verifyme\` only works in direct messages. ${helpPrimaryCommand}`);
            return
        }
        const nation = arguments[0];
        const link = `https://www.nationstates.net/cgi-bin/api.cgi?a=verify&nation=${nation}&checksum=${arguments[1]}&q=name+region`; // Return if verification is successful and region of nation
        const response = request(link);
        responseObject = {
            nation: response[0],
            region: response[1],
            verification: response[2]
        };

        if (responseObject.verification === "0") { // Unsuccessful verification
            receivedMessage.channel.send("Error: Unsuccessful verification. Make sure you have not performed any in-game actions after generating the verification code, and entered your verification code and nation properly.");
            return;
        }
        
        const guildMember = TLAServer.member(receivedMessage.author);
        if (guildMember.roles.find(role => role.name === "Verified")) { // Sender has "Verified" role
            receivedMessage.channel.send(`Error: You have already been verified. If you wish to change your nation name, leave and rejoin the server. ${helpPrimaryCommand}`);
            return;
        }

        if (responseObject.region === "The Leftist Assembly") {
            guildMember.addRole(TLAServer.roles.find(role => role.name === "Assemblian")); // Assemblian role
        } else {
            guildMember.addRole(TLAServer.roles.find(role => role.name === "Visitor")); // Visitor role
        }
        guildMember.addRole(TLAServer.roles.find(role => role.name === "Verified"));

        if (guildMember.roles.find(role => role.name === "Unverified")) { // Either user is Unverified or CTE to use this command
            guildMember.removeRole(guildMember.roles.find(role => role.name === "Unverified"));
        } else {
            guildMember.removeRole(guildMember.roles.find(role => role.name === "CTE"));
        }

        MongoClient.connect(mongoUrl, { useNewUrlParser: true }, function(err, db) {
            const dbo = db.db(mongoUser);
            const collections = dbo.collection("userNations");
            collections.updateOne({"id": guildMember.id}, {"$set": {"nation": responseObject.nation, "time": "None"}});
        });

        guildMember.removeRole(guildMember.roles.find(role => role.name === "Unverified"));
        guildMember.setNickname(`${responseObject.nation} \u2713`);
        receivedMessage.channel.send(`Verification as ${responseObject.nation} successful! You should now be able to access The Leftist Assembly server.`);

        const foyer = client.channels.find(channel => channel.name === "foyer");
        foyer.send(`@here Welcome ${receivedMessage.author.toString()} to The Leftist Assembly Discord Server!`);

     // Get registered nation of user
    } else if (primaryCommand === "usernation") {
        tag = arguments.join(" ");
        const user = client.users.find(u => u.tag === tag);
        if (! user) {
            receivedMessage.channel.send(`Error: ${tag} is not part of The Leftitst Assembly Server.`);
            return
        }
        if (! TLAServer.member(user).roles.find(role => role.name === "Verified")) { // Not yet verified
            receivedMessage.channel.send(`Error: ${tag} is not verified yet.`)
        }
        MongoClient.connect(mongoUrl, { useNewUrlParser: true }, function(err, db) {
            const dbo = db.db(mongoUser);
            const collections = dbo.collection("userNations");
            collections.find({"id": user.id}).toArray((err, items) => {
                receivedMessage.channel.send(`${tag} is verified as ${items[0].nation}.`)
            });
        });
     
     // Get number of members
    } else if (primaryCommand === "membercount") {
        rolesCount = { 
            Verified: 0,
            Unverified: 0,
            CTE: 0,
            Assemblian: 0,
            Visitor: 0
        };
        const pronounRoles = TLAServer.roles.filter(role => role.hexColor === "#dddddd");
        pronounRoles.forEach(role => rolesCount[role.name] = 0);
        TLAServer.members.forEach(member => {
            for (var role in rolesCount) {
                if (member.roles.find(r => r.name === role)) { // User has role
                    rolesCount[role] ++
                }
            }
        });
        message = [] // Message to send
        message.push(`Total members in server: ${TLAServer.members.keyArray().length}`) // Convert TLAServer.members to array of keys, the find length and append to message
        for (var role in rolesCount) {
            message.push(`Number of users with ${role} role: ${rolesCount[role]}`);
        }
        receivedMessage.channel.send(message.join("\n"))

     // Get information about commands
    } else if (primaryCommand === "help") {
        if (arguments.length > 1) {
            receivedMessage.channel.send("Error: Too many arguments. Use `!help` to find information on all commands.");
        }
        if (arguments.length === 0) {
            let help = fs.readFileSync("help.txt").toString()
            receivedMessage.channel.send(help);
        } else {
            let commands = fs.readFileSync("commands.txt").toString().split("\n\n\n"); // Read commands.txt, convert to string, split by triple newline
            let command = commands.find(c => c.substr(2).split(" ")[0] === arguments[0]);
            if (!command) {
                receivedMessage.channel.send("Error: Command does not exist. Please use `!help` to find information on all commands.");
                return
            }
            receivedMessage.channel.send(command);
        }
    } else {
        receivedMessage.channel.send("Error: Command does not exist. Please use `!help` to find information on all commands.");
    }
}

client.on('message', receivedMessage => {
    if (receivedMessage.author == client.user) { // Prevent bot from responding to its own messages
        return
    }

    if (receivedMessage.content.toLowerCase() === "f" && receivedMessage.channel.type !== "dm") {
        MongoClient.connect(mongoUrl, { useNewUrlParser: true }, function(err, db) {
            const dbo = db.db(mongoUser);
            const collections = dbo.collection("collection");

            collections.find({'id': 'counter'}).toArray((err, items) => {
                const item = items[0];
                receivedMessage.channel.send(`Respects paid. (${item.respects + 1} respects paid)`);
                collections.updateOne({'id': "counter"}, {'$inc': {'respects': 1}});
            });
        });
    }

    if (receivedMessage.content.toLowerCase() === "good bot" && receivedMessage.channel.type !== "dm") {
        MongoClient.connect(mongoUrl, { useNewUrlParser: true }, function(err, db) {
            const dbo = db.db(mongoUser);
            const collections = dbo.collection("collection");

            collections.find({'id': 'counter'}).toArray((err, items) => {
                const item = items[0];
                receivedMessage.channel.send(`You have voted Unity Machine as being good. (${item.goodbot + 1} votes in total for being good, ${item.badbot} votes in total for being bad)`);
                collections.updateOne({'id': "counter"}, {'$inc': {'goodbot': 1}});
            });
        });
    }

    if (receivedMessage.content.toLowerCase() === "bad bot" && receivedMessage.channel.type !== "dm") {
        MongoClient.connect(mongoUrl, { useNewUrlParser: true }, function(err, db) {
            const dbo = db.db(mongoUser);
            const collections = dbo.collection("collection");

            collections.find({'id': 'counter'}).toArray((err, items) => {
                const item = items[0];
                receivedMessage.channel.send(`You have voted Unity Machine as being bad. (${item.goodbot} votes in total for being good, ${item.badbot + 1} votes in total for being bad)`);
                collections.updateOne({'id': "counter"}, {'$inc': {'badbot': 1}});
            });
        });
    }

    if (receivedMessage.content.startsWith("!")) {
        processCommand(receivedMessage);
    }
});

client.on('ready', () => {
    console.log("Connected as " + client.user.tag);  // Confirm connection
    client.user.setActivity('Type "!help" to get info on all commands');
    TLAServer = client.guilds.array()[0];
    unverifiedRole = TLAServer.roles.find(role => role.name === 'Unverified');

    function reRoleKick() {
        const nations = request("https://www.nationstates.net/cgi-bin/api.cgi?q=nations")[0].split(",");
        if (typeof(nations) === 'number') {
            console.log(`Unable to get all nations in the world. Error code: ${nations}`);
            return
        }

        MongoClient.connect(mongoUrl, { useNewUrlParser: true }, function(err, db) {
            const dbo = db.db(mongoUser);
            const collections = dbo.collection("userNations");

            TLAServer.members.forEach(member => {
                collections.find({id: member.id}).toArray((err, items) => {
                    const item = items[0];
                    if (! item) {
                        return
                    }

                    const rawNation = item.nation.toLowerCase().replace(/ /g, "_");
                    if ((! nations.some(nation => nation === rawNation)) && member.roles.find(role => role.name === "Verified")) { // User is verified but not marked as CTE yet
                        const CTEMessage = eval(fs.readFileSync("cte_message.txt").toString()); // Add interpolation for text in cte_message.txt
                        member.send(CTEMessage);
    
                        if (member.roles.find(role => role.name === "Assemblian")) { // User is marked as Assemblian
                            member.removeRole(member.roles.find(role => role.name === "Assemblian"));
                        } else {
                            member.removeRole(member.roles.find(role => role.name === "Visitor"));
                        }

                        member.removeRole(TLAServer.roles.find(role => role.name === 'Verified'));
                        member.addRole(TLAServer.roles.find(role => role.name === "CTE"));

                        collections.updateOne({"id": member.id}, {'$set': {"nation": "None", "time": new Date().getTime()}});

                    } else if (item.time !== "None") {
                        if (moment().diff(item.time, 'hours') >= 168) {
                            member.kick("Sorry, you were unverified or marked as CTE for over 1 week.");
                        }
                    }
                });
            });
        });
    }

    reRoleKick();
    console.log("Ready to take commands!");
    setInterval(() => {
        console.log("Giving CTE role...")
        reRoleKick()
        console.log("Ready to take commands!")
    }, 43200000);
});

let unverifiedRole;
client.on("guildMemberAdd", newMember => {
    newMember.addRole(unverifiedRole); // Add unverified role
    const welcomeMessage = eval(fs.readFileSync("welcomeMessage.txt").toString()); // Add interpolation for text in welcomeMessage.txt
    newMember.user.send(welcomeMessage);

    MongoClient.connect(mongoUrl, { useNewUrlParser: true }, function(err, db) {
        const dbo = db.db(mongoUser);
        const collections = dbo.collection("userNations");
        collections.insertOne({"id": newMember.id, "nation": "None", "time": new Date().getTime()});
    });
});

client.on("guildMemberRemove", member => {
    if (member.roles.find(role => role.name === "Verified")) {
        const nationRole = member.roles.find(role => role.hexColor === "#546e7a");
        nationRole.delete();
    }
})

const bot_secret_token = "NjA4Mjc3ODU4NzQ1NDUwNDk3.XUmGjA.4OA6wyiw-pl_iQeew9OpFtjVocw";

client.login(bot_secret_token);

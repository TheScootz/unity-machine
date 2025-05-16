module.exports = {
	name: "manual",
	aliases: ['mr', 'recruit'],
	help: `\`!manual [command] [params]\`

**Aliases:** \`!manual, !mr, !recruit\`
**Usage:**  Manual recruitment procedures.
**Details:** This command has several subcommands:
\`authorize [@user] [template]\`
\`deauthorize [@user]\`
\`lb\`
\`now\`
\`recruit\`
\`template\`
\`week\`
**Examples:**
`,
	async execute(msg, args) {
		if (args.length === 0) {
			msg.channel.send(`Error: Too few arguments. ${helpPrimaryCommand}`);
			return;
		}

        if (msg.channel.name !== "manual-recruitment" && args[0] !== "lb" && args[0] !== "week" && args[0] !== "now") {
            msg.channel.send("This command can only be used in the manual recruitment channel.");
            return;
        }

        const guildMember = await TLAServer.members.fetch(msg.author);

        if ((args[0] === "authorize" || args[0] === "deauthorize")
            && !(await guildMember.roles.cache.find(role => role.name === "Manual Recruitment Authorizer"))) {
                msg.channel.send(`Error: You are not a Manual Recruitment Authorizer.`);
                return;
        }
        let nation, userid;

        switch (args[0]) {
            case "authorize":
                if (args.length < 3) {
                    msg.channel.send(`Usage: authorize [@user] [template] -- ${helpPrimaryCommand}`);
                    return;
                }
                
                let templateCode;

                try {
                    userid = /^<@(\d{17,18})>$/.exec(args[1])[1];
                    nation = userCollections.findOne({id: userid}).then(object => object.nation);
                } catch (e) {
                    msg.channel.send(`Error: Could not read user. Make sure you @ ping them, and that they are in the server and verified.`);
                    return;
                }

                try {
                    templateCode = /^%TEMPLATE-\d{8}%$/.exec(args[2])[0];
                } catch (e) {
                    msg.channel.send(`Error: Invalid template code.`);
                    return;
                }

                userCollections.updateOne({"id": userid}, {"$set": {"manualTemplate": templateCode}});
                msg.channel.send(`<@${userid}> is now able to send manual recruitment telegrams for ${IDS.region_proper}. To get started, use \`!mr recruit\``);

                break;
            
            case "deauthorize":
                if (args.length < 2) {
                    msg.channel.send(`Usage: authorize [@user] -- ${helpPrimaryCommand}`);
                    return;
                }

                try {
                    userid = /^<@(\d{17,18})>$/.exec(args[1])[1];
                    nation = await userCollections.findOne({id: userid});
                } catch (e) {
                    msg.channel.send(`Error: Could not read user. Make sure you @ ping them, and that they are in the server and verified.`);
                    return;
                }

                if (nation.manualTemplate) {
                    userCollections.updateOne({"id": userid}, {"$set": {"manualTemplate": null}});
                    msg.channel.send("User has been deauthorized for manual recruiting.");
                } else {
                    msg.channel.send("That user is currently not authorized for manual recruiting.");
                }

                break;
            
            case "lb":
                const lbEmbed = new Discord.MessageEmbed()
                    .setColor('#ce0001')
                    .setTitle('Top recruiters all time')
                    .setTimestamp();
                
                let totalCounts = await userCollections.find({"recruitCount": {$gt: 0}}, {sort: {"recruitCount": -1}});
                let total = 0;
                if (totalCounts.count() == 0) {
                    lbEmbed.setDescription('None!');
                } else {
                    let list = "";
                    for await (member of totalCounts) {
                        list += `<@${member.id}> -- ${member.recruitCount} nations\n`;
                        total += member.recruitCount;
                    }
                    lbEmbed.setDescription(list);
                }

                lbEmbed.addFields({name: "Total", value: `${total} nations`});
                msg.channel.send({ embeds: [lbEmbed] });
                break;
            
            case "now":
                const discordEmbed = new Discord.MessageEmbed()
			        .setColor('#ce0001')
                    .setTitle('Currently recruiting')
                    .setTimestamp();
                    
                let recruiters = Array.from(recruitCounts.keys()).sort((a, b) => recruitCounts.get(b) - recruitCounts.get(a))
                
                if (recruiters.length == 0) {
                    discordEmbed.setDescription('None!');
                } else {
                    let list = "";
                    recruiters.forEach(id => list += `<@${id}> -- ${recruitCounts.get(id)} nations\n`);
                    discordEmbed.setDescription(list);
                }

                discordEmbed.addFields({name: "Queue length", value: `${recruitStack.length} nations`});
                msg.channel.send({ embeds: [discordEmbed] });
                break;
            
            case "recruit":
                nation = await userCollections.findOne({id: guildMember.id});
                if (!nation.manualTemplate) {
                    msg.channel.send("You have not been authorized for manual recruiting.");
                    return;
                }

                // if ();

                console.log(nation.manualTemplate);
                activeRecruiters.push([guildMember, nation.manualTemplate]);
                recruitCounts.set(guildMember.id, 0);
                guildMember.send("You have been added to the queue for manual recruitment. You will be sent premade links to create recruitment telegrams. When you receive them, all you have to do is open the link and click Send. Make sure you are logged in to your verified nation.");// React with ❌ at any time to leave the queue.")
                    // .then(async msg => {
                    //     msg.awaitReactions({filter: (reaction, user) => (reaction.emoji.name === '❌' && user.id === recruiter.id), max: 1})
                    //         .then(() => {
                    //             let rIdx = activeRecruiters.findIndex(r => r[0].id === msg.author.id);
                    //             if (rIdx !== undefined) {
                    //                 activeRecruiters.splice(rIdx, 1);
                    //                 recruiter.send("You have been removed from the manual recruitment queue. You may rejoin at any time.");
                    //             }
                    //         })
                    // });

                break;
            
            // case "stop":
            //     let recruiterIndex = activeRecruiters.findIndex(recruiter => recruiter[0].id === msg.author.id);
            //     if (recruiterIndex >= 0) {
            //         activeRecruiters.splice(recruiterIndex, 1);
            //         msg.channel.send("You have been removed from the manual recruitment queue.");
            //     } else {
            //         msg.channel.send("You are not in the manual recruitment queue.");
            //     }

            //     break;

            case "template":
                nation = await userCollections.findOne({id: guildMember.id});
                // Hardcoding this since python rewrite is in progress
                shortenUrl(`https://www.nationstates.net/page=compose_telegram?is_recruitment_tg=true&tgto=tag:template&message=Greetings+Comrade+%25NATION%25%21+Welcome+to+NationStates%21%0D%0A%0D%0AI%27m+a+Comrade+Citizen+in+%5Bu%5D%5Bb%5D%5Burl%3Dregion%3Dthe_leftist_assembly%5DThe+Leftist+Assembly%5B%2Furl%5D%5B%2Fb%5D%5B%2Fu%5D+and+%5Bb%5DI+would+like+to+personally+invite+you+to+our+region%21%5B%2Fb%5D+%5Bi%5D%28so+much+so+that+I+took+the+time+to+send+%5Bu%5Dyou%5B%2Fu%5D+this+message%21%29+%5B%2Fi%5D%0D%0A%0D%0AThe+Leftist+Assembly+is+one+of+the+largest+pan-leftist+communities+on+the+site%2C+harbouring+leftists+of+all+sorts+from+Democratic+Socialists+to+Marxists+to+Anarchists%21+We%27re+staunchly+progressive%2C+anti-fascist%2C+and+pro-democracy+and+have+strived+over+the+past+seven+years+to+create+an+active+and+vibrant+community+on+NationStates.+%0D%0A%0D%0AOur+region+is+called+home+by+many%2C+and+we+pride+ourselves+on+having+a+community+that+is+accepting+of+people+of+all+types+and+very+welcoming+to+newcomers.+No+matter+what+your+interest+is%3B+from+nation+roleplay+to+real-life+political+discussion%2C+military+gameplay+to+regional+democracy%2C+and+so+much+more%3B+there+is+something+in+%5Bregion%5DThe+Leftist+Assembly%5B%2Fregion%5D+for+you.%0D%0A%0D%0A--------------------------------------------------------------------------------------------------------------%0D%0A%0D%0AA+more+specific+%28but+still+abbreviated%29+list+of+things+you+can+find+in+our+region+is...%0D%0A%0D%0A%5Bb%5D%26%239055%3B+An+active%2C+democratic+government+with+a+regularly+elected+Secretary+%28and+World+Assembly+Delegate%29+and+legislature.%5B%2Fb%5D%0D%0A%0D%0A%5Bb%5D%26%239055%3B+%5B%2Fb%5DVibrant%2C+active%2C+and+diverse+discussion+and+debate+across+our+several+platforms+including+the+Regional+Message+Board+and+regional+Discord+server.%0D%0A%0D%0A%5Bb%5D%26%239055%3B+%5B%2Fb%5DA+welcoming%2C+loving%2C+and+%5Bb%5Ddiverse+%5B%2Fb%5Dcommunity+with+a+high+proportion+of+young+activists%2C+%5Bb%5DLGBTQ%2B%5B%2Fb%5D+folk%2C+and+people+from+across+the+globe.%0D%0A%0D%0A%5Bb%5D%26%239055%3B+%5B%2Fb%5DFrequent+regional+activities+and+events%2C+such+as+the+%5Bb%5DAssembly+of+Nations+roleplay%5B%2Fb%5D%2C+Culture+Competitions%2C+Discord+game+and+music+nights%2C+Charity+Fundraisers%2C+and+so+much+more%21%0D%0A%0D%0A%5Bb%5D%26%239055%3B+%5B%2Fb%5DOpportunities+to+engage+with+the+wider+NationStates+communities+through+our+embassy+regions%2C+affiliations+with+%5Bb%5Danti-fascist+military%5B%2Fb%5D+organisations%2C+and+cultural+exchanges%0D%0A%0D%0A%5Bb%5D%26%239055%3B+%5B%2Fb%5DAnd+finally%2C+%5Bb%5Da+welcoming+community+eager+to+help+new+members%5B%2Fb%5D+in+getting+acquainted+with+the+game+and+region.%0D%0A%0D%0A--------------------------------------------------------------------------------------------------------------%0D%0A%0D%0AJoining+%5Bregion%5DThe+Leftist+Assembly%5B%2Fregion%5D+was+one+of+the+best+things+I%27ve+ever+done%2C+and+I+know+we+would+benefit+from+having+%5Bu%5Dyou%5B%2Fu%5D+in+our+community.+New+nations+are+what+keeps+our+region+going+and+%5Bb%5Dwe+truly+depend+upon+those+who+bring+their+new+ideas%2C+talents%2C+perspectives%2C+ambition%2C+and+heart+to+%5Bregion%5DThe+Leftist+Assembly%5B%2Fregion%5D.%5B%2Fb%5D%0D%0A%0D%0AIf+you+wish+to+be+a+part+of+our+ever+growing+community%2C+then+%5Bb%5Dplease+feel+free+to+join+using+the+button+below%21%5B%2Fb%5D+If+you+have+any+questions+or+concerns+please+feel+free+to+send+a+telegram.+We+look+forward+to+seeing+you.%0D%0A%0D%0ABest+Wishes%2C%0D%0A%5Bnation%5D${nation.nation}%5B%2Fnation%5D%0D%0A%0D%0A%5Bi%5DUnity+in+Diversity%21%5B%2Fi%5D`)
                    .then((url) => msg.channel.send(`[Click to create your template](${url}).\n\nYou will receive a template code (e.g. %TEMPLATE-00000000%). Give this code to a Manual Recruitment Authorizer, and they will authorize you to recruit for The Leftist Assembly and assign your code to you.`),
                    (err) => msg.channel.send(`An unexpected error occurred: \`${err}\``));

                break;
            
            case "week":
                const weeklyEmbed = new Discord.MessageEmbed()
			        .setColor('#ce0001')
                    .setTitle('Top recruiters this week')
                    .setTimestamp();
                
                let weeklyCounts = await userCollections.find({"recruitWeek": {$gt: 0}}, {sort: {"recruitWeek": -1}});
                let totalWeek = 0;
                if (weeklyCounts.count() == 0) {
                    weeklyEmbed.setDescription('None!');
                } else {
                    let list = "";
                    for await (member of weeklyCounts) {
                        list += `<@${member.id}> -- ${member.recruitWeek} nations\n`;
                        totalWeek += member.recruitWeek;
                    }
                    weeklyEmbed.setDescription(list);
                }

                weeklyEmbed.addFields({name: "Total", value: `${totalWeek} nations`});
                msg.channel.send({ embeds: [weeklyEmbed] });
                break;
            
            default:
                msg.channel.send(`Unrecognized subcommand. See \`${helpPrimaryCommand} manual\``);
        }
	}
}
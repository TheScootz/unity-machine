module.exports = {
	name: "ncompareci",
	help: `\`!ncompareci [Nation] [Nation 2] [Nation 3] [Nation 4] [Nation 5]\`
**Usage:** The specified nation names must have the spaces replaced with underscores. The nation names entered are case-insensitive. Between 2 to 5 nations can be entered at once.
**Details:** The command returns the nation that performs the best in the Comrade Index out of all those compared. It also ranks the nations with each other and displays their scores in the Comrade Index.
**Examples:**
\`!ncompareci new_prague_workers_republic tannkrem\`
\`!ncompareci Katosima VegemiteIsGross\``,

	async execute(msg, args) {
		if (args.length < 2) {
			msg.channel.send(`Error: Too little arguments. ${helpPrimaryCommand}`);
			return;
		}
		if (args.length > 5) {
			msg.channel.send(`Error: Too many arguments. ${helpPrimaryCommand}`);
			return;
		}
		if (numRequests + args.length > 50) {
			tooManyRequests(msg);
			return;
		}
		numRequests += args.length;

		let nationInfos = [];
		let nationNames = [];
		for (let i = 0; i < args.length; i ++) {
			const nation = args[i];
			const link = `https://www.nationstates.net/cgi-bin/api.cgi?nation=${nation};q=name+census;scale=6+27+28+29+51+57+68+71+73+75;mode=score`;
			try {
				var nationScores = await getRequest(link)
			} catch (err) {
				msg.channel.send(err === "404 Not Found" ? `Error: Nation does not exist.` : `An unexpected error occured: \`${err}\``);
				return;
			}

			const nationName = nationScores[0];
			nationScores.shift();
			nationScores = nationScores.map(score => Number(score));
			nationScores[4] **= -0.5;
			nationScores[6] **= 2;
			nationInfos.push({nation: nationName, score: nationScores});
			nationNames.push(nationName);
		}
		nationsString = `${nationNames.slice(0, nationNames.length - 1).join(", ")} and ${nationNames[nationNames.length - 1]}`;
		
		const item = await CICollections.findOne({'id': 'CI'});
		let maxTLA = item.maxTLA;
		nationInfos.forEach(object => {
			for (let i = 0; i < 10; i ++) {
				object.score[i] = object.score[i] * 10 / maxTLA[i];
			}
			object.score = object.score.reduce((accumulator, score) => accumulator + score); // Sum of scores
		});
		nationInfos.sort((a, b) => b.score - a.score);
			

		let discordEmbed = new Discord.MessageEmbed()
			.setColor('#ce0001')
			.setAuthor(`Comparison of ${nationsString} by Comrade Index`)
			.setTitle(`${nationInfos[0].nation} wins!`)
			.setTimestamp()

			for (let i = 0; i < nationInfos.length; i ++) {
				discordEmbed.addField(`${i + 1}. ${nationInfos[i].nation}`, `Score: ${nationInfos[i].score}`);
			}

			msg.channel.send(discordEmbed);
	}
}
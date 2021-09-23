module.exports = {
	name: "nanniversary",
	help: `\`!nanniversary [Nation]\`

**Usage:** The nation name entered are case-insensitive. If a nation argument is not given, the argument will be assumed to be the nation of the user who used the command (if there is one).
**Details:** The command returns the number of days until a given nation's next anniversary.
**Examples:**
\`!nanniversary delusija\`
\`!nanniversary USSRs\``,
	
	async execute(msg, args) {
		if (args.length === 0 && !(await TLAServer.members.fetch(msg.author)).roles.cache.find(role => role.name === "Verified")) {
			msg.channel.send(`Error: Too little arguments. ${helpPrimaryCommand}`);
			return;
		}
		if (numRequests + 1 > 50) {
			tooManyRequests(msg);
			return;
		}
		numRequests ++;

		function ordinal(num) {
			last2Digits = num % 100; // Last 2 digits of num
			if (10 <= last2Digits < 20) return `${num}th`;
			lastDigit = num % 10; // Last digit of num
			if (lastDigit === 1) return `${num}st`;
			if (lastDigit === 2) return `${num}nd`;
			if (lastDigit === 3) return `${num}rd`;
			return `${num}th`;
		}

		const nation = args.length === 0 ? await getNation(msg) : args.join(' ');

		const today = moment().utc().startOf('day');
		try {
			var anniversary = await getRequest(`https://www.nationstates.net/cgi-bin/api.cgi?nation=${nation}&q=name+foundedtime`);
		} catch (err) {
			msg.channel.send(err === "404 Not Found" ? `Error: Nation does not exist.` : `An unexpected error occured: \`${err}\``);
		}

		if (anniversary[1] === "0") { // Founded in Antiquity
			msg.channel.send("Sorry, the requested nation was founded in Antiquity.");
			return;
		}
		const nationName = anniversary[0];
		anniversary = moment.unix(anniversary[1]).utc().startOf('day'); // Convert timestamp to moment object, rounded down to the nearest UTC day
		let years = today.diff(anniversary, 'years');
		anniversary.add(years, 'y');

		if (anniversary.isSame(today)) { // Anniversary is today
			years = ordinal(years); // Convert to ordinal number
			msg.channel.send(`${nationName}'s ${years} anniversary is today! 🎉`);
		} else {
			anniversary.add(1, 'y'); // Add another year (next anniversary must be in the future)
			years = ordinal(years + 1)
			msg.channel.send(`${nationName}'s ${years} anniversary is in ${anniversary.diff(today, 'days')} days!`);
		}
	}
}
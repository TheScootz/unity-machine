module.exports = {
	name: "quote",
	help: `\`!quote [Person]\`

**Usage:** Only enter the last name of the leftist leader you want the quote from (exceptions are MLK and Malcolm X). The name is case-insensitive.
**Details:** The command returns a random quote from leftist leaders. There are 99 possible quotes that can be returned. If a leftist leader is specified, then only quotes from that person will be returned.
**Examples:**
\`!quote\`
\`!quote MLK\`
\`!quote marx\``,
	
	async execute(msg, args) {
		let quotes = await openFile("quotes.txt");
		if (args.length >= 1) {
			args = args.join(' ');
			quotes = quotes.filter(quote => quote.toLowerCase().endsWith(args.toLowerCase())); // toLowerCase() allows for case-insensitive matching
			if (quotes.length === 0) { // No quotes
				msg.channel.send(`Sorry, but there are no quotes from ${args}. If you want quotes from them, please contact The Comrade#4859.`);
				return;
			}
		}
		msg.channel.send(getRandomObject(quotes));
	}
}
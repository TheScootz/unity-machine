module.exports = {
	name: "censusnum",
	help: `\`!censusnum [Census Name]\`

**Usage:** The census name entered must be exactly the same as the one found in the Nation Rank page.
**Details:** The command returns the Census ID number of a given Census.
**Examples:**
\`!censusnum Human Development Index\`
	*Returns "The census number for Human Development Index is 68."*
\`!censusnum Industry: Book Publishing\`
	*Returns "The census number for Industry: Book Publishing is 24"*`,
	
	async execute(msg, args) {
		
		args = args.join(' ');
		const index = censusNames.indexOf(args);
		if (index === -1) {
			msg.channel.send("Error: Census not found.")
		} else {
			msg.channel.send(`The census number for ${args} is ${index}.`);
		}
	}
}
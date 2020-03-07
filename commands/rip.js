module.exports = {
	name: "rip",
	help: `\`!rip [Noun]\`

**Usage:** The entered noun can contain spaces. If a noun is not specified, then Unity Machine will send a generic message.
**Details:** The command sends a message, starting with "Rest in Peace, " and ends with the specified noun. If a noun is not specified, then Unity Machine will send "Rest in Peace.".
**Examples:**
\`!rip\`
*Returns "Rest in Peace."*
\`!rip Atealia\`
*Returns "Rest in Peace, Atealia."*`,
	
	execute(msg, args) {
		args = args.join(' ');
		if (args.length === 0) {
			msg.channel.send("Rest in Peace.");
		} else {
			msg.channel.send(`Rest in Peace, ${args}.`);
		}
	}
}
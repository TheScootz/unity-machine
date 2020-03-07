module.exports = {
	name: "insult",
	help: `\`!insult [Noun]\`

**Usage:** The entered noun can contain spaces.
**Details:** The command sends a message insulting something.
**Examples:**
\`!insult Hitler\`
\`!insult fascism\``,
	
	execute(msg, args) {
		msg.channel.send(args.length > 0 ? `Fuck ${args.join(' ')}!` : "What do you want me to insult?");
	}
}
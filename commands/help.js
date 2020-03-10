module.exports = {
	name: "help",
	aliases: ['h'],
	help: `\`!help [Command]\`

**Aliases:** \`!h\`
**Usage:** The specified command must have the starting "!" removed. Without a command, the function will return information on all commands.
**Details:** The command returns how to use, the purpose of, and examples of using a specified command. If a command is not specified, an overview of the purpose of all commands will be displayed.
**Examples:**
\`!help\`
\`!help 8ball\`
\`!help roll\``,

	async execute(msg, args) {
		if (args.length > 1) {
			msg.channel.send("Error: Too many arguments. Use `!help` to find information on all commands.");
		}
		if (args.length === 0) { // Requesting all commands
			let help = await fs.readFileAsync(path.join(__dirname, "..", "data", "help.md"), "utf-8");
			help = help.split('\n');

			// Split help message by newline character into chunks with less than 2000 characters
			while (help[0]) {
				let helpChunk = [];
				// While helpChunk has less than 2000 characters and there is still stuff to send
				while ((helpChunk.reduce((accumulator, currentValue) => accumulator + currentValue.length + 1, 0) <= 2000) && help.length > 0) {
					helpChunk.push(help.shift());
				}
				if (help[0]) help.unshift(helpChunk.pop()); // Remove last line of helpChunk and put it in first line of help (or else helpChunk has more than 2000 characters) if help exists
				await msg.channel.send(helpChunk);
			}
		} else {
			if (! client.commands.keyArray().find(command => command.includes(args[0]))) {
				msg.channel.send("Error: Command does not exist. Please use `!help` to find information on all commands.");
				return;
			}

			console.log(client.commands.get(client.commands.keyArray().find(command => command.includes(args[0]))));
			
			msg.channel.send(client.commands.get(client.commands.keyArray().find(command => command.includes(args[0]))).help);
		}
	}
}
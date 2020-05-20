module.exports = {
	name: "randomselect",
	help: `\`!randomselect [Options to select]\`
**Usage:** The options must be in CSV format.
**Details:** The command takes the given options and selects a random one, then outputs the selected one.
**Examples:**
\`!randomselect Bananas,Strawberries,Apples\`
\`!randomselect The Pacific,The North Pacific,The South Pacific,The West Pacific,The North Pacific\`"`,

	execute(msg, args) {
		let stringsToSelect = Papa.parse(args.join(' ')).data[0]; // Parse CSV
		if (stringsToSelect.length < 2) { // 1 or less strings to select
			msg.channel.send(`Error: Too little arguments. ${helpPrimaryCommand}`);
			return;
		} 
		msg.channel.send(getRandomObject(stringsToSelect));
	}
}
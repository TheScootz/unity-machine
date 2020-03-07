module.exports = {
	name: "randomselect",
	description: `\`!randomselect [Options to select]\`
**Usage:** The options must be in CSV format. The options cannot contain any commas. 
**Details:** The command takes the given options and selects a random one, then outputs the selected one.
**Examples:**
\`!randomselect Bananas,Strawberries,Apples\`
\`!randomselect The Pacific,The North Pacific,The South Pacific,The West Pacific,The North Pacific\`"`,

	execute(msg, args) {
		let objectsToSelect = args.join(' ').split(',');
		if (objectsToSelect.length < 2) { // Nothing to select
			msg.channel.send(`Error: Too little arguments. ${helpPrimaryCommand}`);
			return;
		} 
		msg.channel.send(getRandomObject(objectsToSelect));
	}
}
module.exports = {
	name: "roll",
	aliases: ['dice', 'd'],
	help: `\`!roll [Dice Expression]\`

**Aliases:** \`!dice\`, \`!d\`
**Usage:** The dice expression uses RPG dice notation (e.g. \`3d6\` means "roll 3 six-sided dice). Dice notation where only 1 die is rolled can have the starting "1" removed (e.g. \`1d20\` can be shortened into \`d20\`). Addition (+) and subtraction (-) can be used in the dice expression. Up to 10,000 dice can be rolled at once, with each die having up to 1,000,000,000,000 faces.
**Details:** The command simulates rolling dice and calculates what the user rolled based on the given dice expression.
**Examples:**
\`!roll d20\`
\`!roll 2d8\`
\`!roll d6-d6\``,
	
	execute(msg, args) {
		const expression = args.join("");

		const opRegex = /[-+]/; // Regex to check if string is +, - or *
		const diceRegex = /[1-9][0-9]*|([1-9][0-9]*)?d[1-9][0-9]*/; // Regex to check if string is dice notation or positive integer
		const diceExp = expression.split(opRegex); // Split by every operation
		let operations = expression.split(diceRegex); // Split by every dice notation object / integer
		operations = operations.filter(element => element !== undefined && element !== ''); // '' and undefined can pop up in operations
		if (! (diceExp.every(element => diceRegex.test(element)) && operations.every(element => opRegex.test(element)))) {
			msg.channel.send("Error: Incorrect dice expression.");
			return;
		}

		let numDice = 0;
		let tooManyFaces = false;
		diceExp.forEach(element => {
			element = element.split('d');
			if (element.length === 2) {
				numDice += element[0] === '' ? 1 : Number(element[0]); // If element[0] is blank, then the number of dice rolled is 1.
				if (Number(element[1]) > 1000000000000) { // Do not allow rolling beyond 1 trillion
					msg.channel.send("Error: Too many faces.")
					tooManyFaces = true;
				}
			}
		});
		if (numDice > 10000) {
			msg.channel.send("Error: You are rolling too many dice at once.");
			return;
		}
		if (tooManyFaces) { // If there are too many faces on one die
			return;
		}

		let results = [];
		let resultsEachRoll = [];
		diceExp.forEach(element => {
			element = element.split('d');
			if (element.length > 1) {
				const diceRolled = element[0] === '' ? 1 : Number(element[0]);
				const faces = element[1];
				let diceString = [];
				let sumDice = 0;
				for (let i = 0; i < diceRolled; i ++) {
					let randomDie = Math.floor(Math.random() * faces) + 1;
					sumDice += randomDie;
					diceString.push(randomDie);
				}
				diceString = diceString.join(' + ')
				results.push(sumDice);
				resultsEachRoll.push(diceString);
			} else {
				results.push(element[0]);
			}
		});

		let arithExpress = ''
		for (let i = 0; i < operations.length; i ++) {
			arithExpress += `${results[i]}${operations[i]}`;
		}
		arithExpress += results[results.length - 1];
		const answer = eval(arithExpress);
		resultsEachRoll = resultsEachRoll.join(", ")

		if (numDice < 50 && numDice > 1) {
			msg.channel.send(`${nickname} rolled **${answer}**. (${resultsEachRoll})`);
		} else {
			msg.channel.send(`${nickname} rolled **${answer}**.`);
		}
	}
}
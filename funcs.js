var words = require('./words.json');
const addGuessToKnown = function(guess = '', known = {gr: [], y: [], g: []}) {
	const newKnown = {
		gr: [...known.gr],
		y: [...known.y],
		g: [...known.g]
	};
	for (let i = 0; i < guess.length; i++) {
		const l = guess[i];
		if (typeof l === 'string') {
			if( newKnown.gr.indexOf(l) === -1) {
				newKnown.gr.push(l);
			}
		} else if (l.t === 'g') {
			if (newKnown.g.filter(({l: letter}) => letter === l.l).length == 0) {
				newKnown.g.push({
					index: i,
					l: l.l
				});
			}
		} else {
			if (newKnown.y.indexOf(l.l) === -1) {
				newKnown.y.push({ l: l.l, index: i});
			}
		}
	}
	return newKnown;
}
exports.guess = addGuessToKnown;
const addWordToKnown = function(known, word) {
	const newKnown = {
		gr: [...known.gr],
		y: [...known.y],
		g: [...known.g]
	};
	for (let i = 0; i < word.length; i++) {
		if (newKnown.gr.indexOf(word[i]) === -1 && 
			newKnown.y.every(({l}) => l !== word[i]) &&
			newKnown.g.every(({l}) => l !== word[i])) {
			newKnown.gr.push(word[i]);
		}
	}
	return newKnown;
}
const test = function(known, word, guess = false) {
	const fits = known.gr.every(l => word.indexOf(l) === -1) &&
		known.y.every(l => word.indexOf(l.l) > -1) &&
		known.g.every(g => word[g.index] === g.l);
	if (guess) {
		return fits && known.y.every(l => word.indexOf(l.l) !== l.index);
	} else {
		return fits;
	}
}
const possibleWords = function(known, guesses, dict = words) {
	var possibleWords = dict
		.filter(w => test(known, w));
	return possibleWords;
};
exports.possibleWords = possibleWords;
const knownFromDiff = function(known, guess, answer) {
	const addToKnown = [];
	for (let i =0; i < guess.length; i++) {
		if (guess[i] === answer[i]) {
			addToKnown.push({l: guess[i], t: 'g'});
		} else if (answer.indexOf(guess[i]) > -1) {
			addToKnown.push({l: guess[i]});
		} else {
			addToKnown.push(guess[i]);
		}
	}

	return addGuessToKnown(addToKnown, known);
}
exports.knownFromDiff = knownFromDiff;

exports.nextGuess = function(known, dict = words) {
	let bestIndex = 0;
	let lowestScore = 100000;
	const possibleGuesses = words.filter(w => test(known, w, true));
	for (let i = 0; i < possibleGuesses.length; i++) {
		let score = 0;
		for (let j = 0; j < possibleGuesses.length; j++) {
			const newKnown = knownFromDiff(known, possibleGuesses[i], possibleGuesses[j]);
			score += possibleWords(newKnown).length / possibleGuesses.length;
		}

		console.log(`${i} of ${possibleGuesses.length} words\n`);

	        // var guess = possibleGuesses[i];
		// const newKnown = addWordToKnown(known, guess);
		// var score = possibleWords(newKnown).length;
		if (score < lowestScore) {
			lowestScore = score;
			bestIndex = i;
		}
	}

	return {
		guess: possibleGuesses[bestIndex],
		score: lowestScore
	};
}

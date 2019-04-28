const LineByLineReader = require('line-by-line')
const _ = require('lodash')

const nkjv = require('./nkjv.json').books

lr = new LineByLineReader('text.txt')

lr.on('error', function (err) {
	// 'err' contains error object
	console.log('error', err)
})

lr.on('line', function (line) {
	console.log(getNewLine(line))
})

lr.on('end', function () {
	console.log('ended!')
})

function getNewLine (line) {
	let split = _.split(line, '\t')
	let newEngText = getEngText(line)
	let [ book, chapter, verse, oldEngText, chineseText, malayText ] = split

	let newLine = `${book}\t${chapter}\t${verse}\t${newEngText}\t${chineseText}\t${malayText}`

	return newLine
}

function getEngText (line) {
	let split = _.split(line, '\t')

	let [ book, chapter, verse, oldText, ...rest ] = split

	let newText

	try {
		newText = nkjv[book - 1]
		.chapters[chapter - 1]
		.verses[verse - 1]
		.text
	} catch (e) {
		// Chinese bible has more verses for some places
		// So just return empty string when a text for a verse can't be found
		newText = ''
	}

	return newText
}

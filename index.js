const LineByLineReader = require('line-by-line')
const _ = require('lodash')
const fs = require('fs')

const nkjv = require('./nkjv.json').books

let buffer = ''

readFile('text.txt')

function readFile (filePath) {
	const lr = new LineByLineReader(filePath)

	lr.on('error', function (err) {
		// 'err' contains error object
		console.log('error', err)
	})

	lr.on('line', function (line) {
		buffer = buffer + getNewLine(line) + '\n'
	})

	lr.on('end', function () {
		console.log('ended reading text file.')
		fs.writeFile('output.txt', buffer, (err) => {
		    // throws an error, you could also catch it here
		    if (err) throw err
		    // success case, the file was saved
		    console.log('File saved!')
		})
	})
}

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

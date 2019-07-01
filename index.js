const LineByLineReader = require('line-by-line')
const _ = require('lodash')
const fs = require('fs')

const nkjv = require('./nkjv.json').books
const bookToChapters = require('./bookToChapters')

readFile('text.txt')

function readFile (filePath) {
	// Buffer to store text
	let buffer = ''
	const lr = new LineByLineReader(filePath)

	// Error handler for linereader
	lr.on('error', function (err) {
		// 'err' contains error object
		console.log('error', err)
	})

	let expectedBook = 1
	let expectedChapter = 1
	let expectedVerse = 1
	let totalChaptersForBook = bookToChapters[expectedBook]

	// On each line
	lr.on('line', function (line) {
		let split = _.split(line, '\t')
		let [ book, chapter, verse, oldEngText, chineseText, malayText ] = split
		book = parseInt(book)
		chapter = parseInt(chapter)
		verse = parseInt(verse)

		// If book is different from expectedBook
		if (expectedBook !== book) {
			// If expectedBook is not 1 lesser than book, or
			// chapter is not 1, then it is wrong
			// Else, increase expectedBook by 1 and reset expectedChapter
			// to 1
			if (expectedBook !== book - 1 || chapter !== 1) {
				console.log('wrong book', line)
				lr.close()
				return
			} else {
				++expectedBook
				expectedChapter = 1
			}
		}

		// If chapter is different from expectedChapter
		if (expectedChapter !== chapter) {
			// If expectedChapter is not 1 lesser than chapter, and
			// chapter is not 1, then it is wrong
			// Else, increase expectedBook by 1 and reset expectedChapter
			// to 1
			if (expectedChapter !== chapter - 1 || chapter > totalChaptersForBook) {
				console.log('wrong chapter', line)
				lr.close()
				return
			} else {
				++expectedChapter
				expectedVerse = 1
			}
		}

		if (expectedVerse !== verse) {
			// If expectedVerse is not 1 lesser than verse, and
			// chapter is not 1, then it is wrong
			// Else, increase expectedBook by 1 and reset expectedChapter
			// to 1
			if (expectedVerse !== verse - 1) {
				console.log('wrong verse', line)
				lr.close()
				return
			} else {
				++expectedVerse
			}
		}
		// buffer = buffer + getNewLine(line) + '\n'
	})

	// On end
	lr.on('end', () => {
		console.log('ended reading text file.')
		// writeToFile(buffer)
	})
}

function writeToFile (buffer) {
	const OUTPUT_FILE_NAME = 'output.txt'
	fs.writeFile(OUTPUT_FILE_NAME, buffer, (err) => {
    // throws an error, you could also catch it here
    if (err) throw err
    // success case, the file was saved
    console.log('File saved!')
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

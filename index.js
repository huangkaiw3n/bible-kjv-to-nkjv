const LineByLineReader = require('line-by-line')
const _ = require('lodash')
const fs = require('fs')

const nkjv = require('./nkjv.json').books
const bookToChapters = require('./bookToChapters')

// sanityCheck('reorderedText.txt')
// reorderLines('output.txt')

function sanityCheck (filePath) {
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

		// console.log(`${book} ${chapter} ${verse}`)

		// If book is different from expectedBook
		if (expectedBook !== book) {
			// If expectedBook is not 1 lesser than book, or
			// chapter is not 1, then it is wrong
			// Else, increase expectedBook by 1 and reset expectedChapter
			// to 1
			if (expectedBook !== book - 1 || chapter !== 1) {
				console.log('wrong book', line)
				console.log('expectedBook', expectedBook)
				console.log('expectedChapter', expectedChapter)
				console.log('expectedVerse', expectedVerse)
				lr.close()
				return
			} else {
				++expectedBook
		    totalChaptersForBook = bookToChapters[expectedBook]
				expectedChapter = 1
				expectedVerse = 1
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
				console.log('expectedBook', expectedBook)
				console.log('expectedChapter', expectedChapter)
				console.log('expectedVerse', expectedVerse)
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
				console.log('expectedBook', expectedBook)
				console.log('expectedChapter', expectedChapter)
				console.log('expectedVerse', expectedVerse)
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

function reorderLines (filePath) {
	// Map to store text
	let textMap = {}
	const lr = new LineByLineReader(filePath)

	// Error handler for linereader
	lr.on('error', function (err) {
		// 'err' contains error object
		console.log('error', err)
	})

	// On each line, store line into respective
	lr.on('line', function (line) {
		let split = _.split(line, '\t')
		let [ book, chapter, verse, oldEngText, chineseText, malayText ] = split
		book = parseInt(book)
		chapter = parseInt(chapter)
		verse = parseInt(verse)
		textMap[`${book}.${chapter}.${verse}`] = line
	})

	// On end
	lr.on('end', () => {
		console.log('ended reading text file.')

		// Buffer to store reordered lines
		let buffer = ''
		let bookOrder = 0
		let chapterOrder = 0
		let verseOrder = 0
		_.forEach(nkjv, (book) => {
			bookOrder++
			chapterOrder = 0
			verseOrder = 0
			let chapters = book.chapters
			_.forEach(chapters, (chapter) => {
				chapterOrder++
				verseOrder = 0
				let verses = chapter.verses
				_.forEach(verses, (verse) => {
					verseOrder++
					let key = `${bookOrder}.${chapterOrder}.${verseOrder}`
					if (!textMap[key]) {
						console.log(key)
					}
					buffer = buffer + textMap[key] + '\n'
				})
			})
		})
		writeToFile(buffer, 'reorderedText.txt')
	})
}

function writeToFile (buffer, fileName) {
	if (!fileName) throw Error('No output file name provided')
	const OUTPUT_FILE_NAME = fileName
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

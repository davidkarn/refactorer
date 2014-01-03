var fs = require('fs');
var readline = require('readline');
var _ = require('underscore');

var rd = readline.createInterface({
    input: fs.createReadStream('/Users/david/Dropbox/nodejs/meteor/d3-grapher/d3graphs.js'),
    output: process.stdout,
    terminal: false });

function read_file_lines(callback_line, callback_end, filename, encoding) {
    filename = filename || '/Users/david/Dropbox/nodejs/meteor/d3-grapher/d3graphs.js';
    encoding = encoding || 'utf8';
    var processed_lines = [];
    fs.readFile(filename, encoding,  function(er, data) {
	processed_lines = data.split(/\n/g).map(callback_line);
	callback_end(processed_lines); }); }
	
var line_number = 0;
var lines = [];

function compare_lines(words1, words2, errors, position) {
    errors = errors || 0;
    position = position || 0;
    if (words2.length === 0) { 
	return errors + (words1.length - position + 1); }
    var index = words1.indexOf(words2[0]);
    if (index == position + 1) {
	return compare_lines(words1, words2.slice(1), errors + 1, position + 2); }
    if (index == position - 1) {
	return compare_lines(words1, words2.slice(1), errors + 1, position); }
    if (index == position) {
	return compare_lines(words1, words2.slice(1), errors, position + 1); }
    if (index == -1) {
	return compare_lines(words1, words2.slice(1), errors + 1, position + 1); }
    return compare_lines(words1, words2.slice(1), errors + Math.abs(position - index), position + 1); }
    

function parse_line(string) {
    var words = string.split(/[ \r\t)([\]{}.;]+/g).filter(function(x) {
	return !x.match(/^[ \t\r]*$/); });
    return {words: words, line: string, number: line_number++}; }

function compare_all_lines(lines, threshold) {
    var comparisons = {};
    for (var line in lines) {
	for(var nline in lines) {
	    if (line != nline &&
		compare_lines(lines[line].words, lines[nline].words) <= (threshold || 1)
		&& lines[nline].words.length > 1
		&& lines[line].words.length > 1) {
		comparisons[line] = comparisons[line] || [];
		comparisons[line].push(nline); }}}
    console.log(comparisons); }

read_file_lines(parse_line, compare_all_lines); 


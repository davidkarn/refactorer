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
    var sequences = find_sequences(comparisons, 3); 
    for (var i in sequences) {
	var s = sequences[i];
	sequences[i] = {line_numbers: Object.keys(s),
			code: get_code(lines, s)}; }
    return sequences; }

function get_code(lines, sequence) {
    var code = "";
    var num_lines = 0;
    for (var i in sequence) {
	num_lines = Math.max(num_lines, sequence[i]); }
    var start_line = parseInt(Object.keys(sequence)[0]);
    for (var line = start_line; line < start_line + num_lines; line++) {
	code += lines[line].line + "\n"; }
    return code; }

function find_sequences(lines, threshold) {
    var sequences = [];
    var sequence = {};
    for (var l in lines) {
	if (_.isEqual(sequence, {}) || sequence[(l - 1)]) {
	    sequence[l] = lines[l]; }
	else {
	    if (Object.keys(sequence).length >= threshold) {
		sequences.push(sequence); }
	    sequence = {}; }}
    return unique_sequences(sequences.map(verify_contains_sequence)); }


function verify_contains_sequence(sequence) {
    var found_sequences = {};
    for (var i in sequence) {
	var lines = sequence[i].concat([i]);
	if (_.isEqual(found_sequences, {})) {
	    for (var l in lines) {
		found_sequences[lines[l]] = 1; }}
	else {
	    for (var l in lines) {
		for (var f in found_sequences) {
		    if (found_sequences[f] + parseInt(f) == lines[l]) {
			found_sequences[f] += 1; }}}}}
    var f_s = {};
    for (var f in found_sequences) { 
	if (found_sequences[f] > 2) {
	    f_s[f] = found_sequences[f]; }}
    return f_s; }

function arrays_intersect(a1, a2) {
    for (var i in a1) {
	if (a2.indexOf(a1[i]) >= 0) {
	    return a1[i]; }}
    return false; }

function unique_sequences(sequences) {
    sequences = sequences.filter(function(x) {
	var count = 0;
	for (var i in x) {
	    count++; }
	return count > 1; });
    var new_sequence = [];

    for (var r in sequences) {
	var row = Object.keys(sequences[r]);
	var found = false;
	for (var nr in new_sequence) {
	    if (arrays_intersect(row, Object.keys(new_sequence[nr]))) {
		found = true; 
		new_sequence[nr] = better_row(sequences[r], new_sequence[nr]); }}
	if (!found) {
	    new_sequence.push(sequences[r]); }}
    return new_sequence; }

function better_row(row1, row2) {
    var r1c = 0
    var r2c = 0;
    
    for (var i in row1) { r1c += row1[i]; }
    for (var i in row2) { r2c += row2[i]; }

    return ((r1c >= r2c) ? row1 : row2); }

read_file_lines(parse_line, 
		function(l) {
		    var sequences = compare_all_lines(l); 
		    for (var i in sequences) {
			console.log("line numbers: " + sequences[i].line_numbers.join(", ") + ":\n\n" + sequences[i].code + "\n\n\n"); }});


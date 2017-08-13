$(document).ready(function() {
	createTable();
	
	//Sudoku Class
	function Sudoku(board) {
		this.size = 9;
		this.board = board;
		this.initialBoard = [];
		for (var j = 0; j < 9; j++) {
			var row = [];
			for (var i = 0; i < 9; i++) {
				row.push(this.board[j][i]);
				
			}
			this.initialBoard.push(row);
		}
	}
	
	Sudoku.prototype.validPuzzle = function() {
		for (var j = 0; j < this.size; j++) {
			for (var i = 0; i < this.size; i++) {
				var numbers = this.possibleNumbers(i, j);
				if (!(this.board[j][i] in numbers) && this.board[j][i] != 0) {					
					return false;
				}				
			}
		}
		
		return true;
	}
	
	Sudoku.prototype.clearBoard = function() {
		for (var j = 0; j < this.size; j++) {
			for (var i = 0; i < this.size; i++) {
				this.removeNumber(i, j);
			}
		}
	}		
	
	Sudoku.prototype.placeNumber = function(number, x, y) {
		this.board[y][x] = number;
	}
	
	Sudoku.prototype.removeNumber = function(x, y) {
		this.board[y][x] = 0;
	}
	
	Sudoku.prototype.blankSpace = function(x, y) {
		if (this.board[y][x] == 0) {
			return true;
		}
		else {
			return false;
		}
	}
	
	//Determine the possible numbers at position x, y
	Sudoku.prototype.possibleNumbers = function(x, y) {
		var numberDict = {};
		
		//If the spot on the board is already filled, remove the number and
		//check to see which numbers are valid
		var filled = false;
		if (this.board[y][x] != 0 && this.board[y][x] != null) {			
			filled = true;
			var heldNumber = this.board[y][x];
			this.board[y][x] = 0;			
		}
		
		var boxSize = 3;
		var row = y;
		var column = x;
		
		var box = boxSize*Math.floor(y/boxSize) + Math.floor(x/boxSize);
		var yBoxStart = Math.floor(box/boxSize)*boxSize;
		var xBoxStart = Math.floor(box % boxSize)*boxSize;
		var yBoxEnd = yBoxStart + boxSize;
		var xBoxEnd = xBoxStart + boxSize;
		
		var rowDict = {};
		var columnDict = {};
		var boxDict = {};
		
		var boxList = [];
		for (var j = yBoxStart; j < yBoxEnd; j++) {
			for (var i = xBoxStart; i < xBoxEnd; i++) {
					boxList.push(this.board[j][i]);
				}
		}
		
		for (var i = 0; i < this.size; i++) {
			rowDict[i+1] = i+1;
			columnDict[i+1] = i+1;
			boxDict[i+1] = i+1;
		}
		
		//Delete values in the dictionary that yield a duplicate in a row, column, or box
		for (var i = 0; i < this.size; i++) {
			if (this.board[y][i] in rowDict) {
				delete rowDict[this.board[y][i]];
			}
			
			if (this.board[i][x] in columnDict) {
				delete columnDict[this.board[i][x]];
			}
			
			if (boxList[i] in boxDict) {
				delete boxDict[boxList[i]];
			}
		}
		
		//Fill in an array of valid numbers
		for (var i = 0; i < this.size; i++) {
			number = i + 1;
			if (number in rowDict && number in columnDict && number in boxDict) {
				numberDict[number] = number;
			}
		}
		
		if (filled === true) {
			this.board[y][x] = heldNumber;
		}
		return(numberDict);		
	}
	
	//Solve the puzzle using backtracking
	Sudoku.prototype.solve = function() {
		var x = 0;
		var y = 0;
		var solved = this.backtracking(x, y);
		return solved;
	}
	
	//Backtracing recursion algorithm
	Sudoku.prototype.backtracking = function(x, y) {
		
		//Testing code
		/*
		console.log(this);
		console.log(x);
		console.log(y);
		*/
		
		//Find next position
		var yNew = 0;
		var xNew = x + 1;
		if (xNew < 9) {
			yNew = y;
		}
		else {
			xNew = 0;
			yNew = y + 1;
			if (yNew >= 9) {
				
				//final check to see if puzzle was correctly solved
				var numbers = this.possibleNumbers(x, y);
				for (var key in numbers) {
					this.placeNumber(numbers[key], x, y);
				}
				return true;
			}			
		}
		
		//If there is already a number on the square (x,y), recurse.
		if (this.blankSpace(x, y) === false) {
			var solved = this.backtracking(xNew, yNew);
			return solved;
		}
		
		var numbers = this.possibleNumbers(x, y);
		for (var key in numbers) {
			this.placeNumber(numbers[key], x, y);
			var solved = this.backtracking(xNew, yNew);
			if (solved === true) {
				return solved;
			}
			else {
				this.removeNumber(x, y);
			}
		}
		
		return false;	
	}
	
	//Print the puzzle to the console
	Sudoku.prototype.print = function() {
		for (var j = 0; j < this.size; j++) {
			for (var i = 0; i < this.size; i++) {
				console.log(this.board[j][i]);
			}
		}
	}
	
	/**********************************************/
	/***************Page Functions*****************/
	/**********************************************/
	
	//Page functions	
	$('#solveButton').on('click', function() {
		var array = pullDataFromPuzzle();
		var puzzle = new Sudoku(array);
		var validCheck = puzzle.validPuzzle();
		var error = $('.error');
		if (validCheck === true) {
			error.hide();
			puzzle.solve();			
			putDataInPuzzle(puzzle);
		}
		else {			
			$('#errorMessage').text('Error: Not a valid puzzle');
			error.show();
		}
	});
	
	$('#clearPuzzle').on('click', function() {
		var array = pullDataFromPuzzle();
		var puzzle = new Sudoku(array);
		$('.error').hide();		
		puzzle.clearBoard();
		putDataInPuzzle(puzzle);
	});
	
	//Create HTML table function
	function createTable() {
		var $primaryTable = $('.sudoku');
		$primaryTable.attr('cellspacing', '0px');
		$primaryTable.attr('cellpadding', '0px');
		
		for (var k = 0; k < 3; k++) {
			var $primaryRow = ($('<tr>'));
			$primaryTable.append($primaryRow);
			
			for (var l = 0; l < 3; l++) {
				var $primaryCell = $('<td>');
				$primaryRow.append($primaryCell);
				
				var $table = $('<table>');
				$table.addClass('innerTable');
				$table.attr('cellspacing', '0px');
				$table.attr('cellpadding', '0px');
				
				$primaryCell.append($table);
				
				for (var i = 0; i < 3; i++) {
				var $row = ($('<tr>'));
				$table.append($row)
				
					for (var j = 0; j < 3; j++) {
						var $cell = $('<td>');
						$row.append($cell);
						$cell.addClass('sudokuCell');
						
						var $input = $('<input>');
						$input.addClass('cellInput');
						$input.attr('size', 2);
						$input.attr('maxlength', 1);
						$cell.append($input);
					}
				}	
			}
		}
	}
	
	//Pulls Number Data from the website puzzle
	function pullDataFromPuzzle() {
		
		//Initialize a 2D 9x9 array
		var size = 9;
		var array = new Array(size);
		for (var i = 0; i < size; i++) {
			array[i] = new Array(size);
		}
		
		var $input = $('.cellInput');		
		var tableSize = 3;
		
		//Each of 9 squares in the 9 sub tables
		var x = 0;
		var y = 0;
		for (var j = 0; j < size; j++) {
			for (var i = 0; i < size; i++) {
				
				//Find corresponding array value and update it
				x = i % tableSize;
				x += 3*(j % tableSize);
				
				y = Math.floor(i / tableSize);
				y += 3*(Math.floor(j / tableSize));
				
				array[y][x] = $input.eq(9*j+i).val();
			}
		}

		return array;
	}
	
	//Places data into puzzle
	function putDataInPuzzle(puzzle) {
		var $input = $('.cellInput')
		var tableSize = 3;
		var size = 9;
		
		//Each of 9 squares in the 9 sub tables
		var x = 0;
		var y = 0;
		for (var j = 0; j < size; j++) {
			for (var i = 0; i < size; i++) {
				
				//Find corresponding array value and update it
				x = i % tableSize;
				x += 3*(j % tableSize);
				
				y = Math.floor(i / tableSize);
				y += 3*(Math.floor(j / tableSize));
				
				if (puzzle.board[y][x] != 0){
					if (puzzle.initialBoard[y][x] != 0) {
						$input.eq(9*j+i).val(puzzle.board[y][x]);
					}
					else {
						$input.eq(9*j+i).val(puzzle.board[y][x]);						
						$input.eq(9*j+i).addClass('generatedSolution');
					}
				}
				else {
					$input.eq(9*j+i).val('');
					$input.eq(9*j+i).removeClass('generatedSolution');
				}
			}
		}		
	}
	
});
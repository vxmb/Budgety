var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calculatePercentage = function (totalIncome) {
        if (totalIncome > 0)
            this.percentage = Math.round(this.value / totalIncome * 100);
        else
            this.percentage = -1
    }

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (currentElement) {
            sum += currentElement.value;
        })
        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function (type, description, value) {
            var newItem, ID;

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item
            if (type === 'exp') {
                newItem = new Expense(ID, description, value);
            } else if (type === 'inc') {
                newItem = new Income(ID, description, value);
            }

            // Push it into data structure
            data.allItems[type].push(newItem);
            data.totals[type]++;

            // Return the new element
            return newItem;
        },


        testing: function () {
            console.log(data);
        },

        calculateBudget: function () {

            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc')
            // Calculate the budget
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage of spent income
            if (data.totals.inc > 0)
                data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
            else data.percentage = -1

        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calculatePercentage(data.totals.inc);
            })
        },

        getPercentages: function () {
            return data.allItems.exp.map(function (exp) {
                return exp.getPercentage();
            })
        },

        deleteItem: function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            }
        }
    }


})();


var UIController = (function () {
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
    }

    var formatNumber = function (num, type) {
        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        console.log(int.substr(int.length - 3, 3));
        if (int.length > 3) {
            intA = int.substr(0, int.length - 3);
            intB = int.substr(int.length - 3, 3);
            int = intA + ',' + intB;
        }
        dec = numSplit[1];
        
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' +  dec;

    }
    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },
        addListItem: function (obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            // Replace the placeholder with some actual data
            // Insert the HTML into the DOM
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function (selectorId) {

            var element = document.getElementById(selectorId);
            element.parentNode.removeChild(element);


        },

        clearFields: function () {
            var fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });
            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            var type;
            obj.budget >= 0 ? type = 'inc': type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > -1)
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            else
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';

        },

        displayPercentages: function (percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

            fields.forEach(function (element, index) {
                if (percentages[index] > 0)
                    element.textContent = percentages[index] + '%';
                else
                    element.textContent = '---';
            })
            // Array.prototype.forEach.call(fields, function(element, index) {
            // element.textContent = percentages[index] + '%'; })

        },

        getDOMstrings: function () {
            return DOMstrings;
        },



    };
})();

var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {

        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.code === 'Enter' || event.which === 13)
                ctrlAddItem();
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    };

    var updateBudget = function () {

        // 1. Calculate the budget
        budgetController.calculateBudget();
        // 2. Return the budget
        var budget = budgetController.getBudget();
        // 3. Display the budget in the UI
        UICtrl.displayBudget(budget);

    }

    var updatePercentages = function () {

        // 1. Calculate the percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        var allPercentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(allPercentages);
    }

    var ctrlAddItem = function () {
        var input, newItem;
        // 1. Get input data
        input = UICtrl.getInput();

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            // 2. Add item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value)

            // 3. Add the new item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update the percentages
            updatePercentages();
        } else {
            alert('Invalid parmeters');
        }

    }

    var ctrlDeleteItem = function (event) {
        var itemId, splitId, type, ID;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemId) {

            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);

            // 1. Delete item from data structure
            budgetController.deleteItem(type, ID);

            // 2. Delete item from UI
            UICtrl.deleteListItem(itemId)

            // 3. Update and show the new budget
            updateBudget();

            // 4. Calculate and update the percentages
            updatePercentages();

        }

    }

    return {
        init: function () {
            console.log('Application initialized.');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1,
            });
            setupEventListeners();
        }
    }
})(budgetController, UIController);

controller.init();
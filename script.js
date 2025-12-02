
const defaultConfig = {
    calculator_title: 'Scientific Calculator'
};

let currentMode = 'basic';
let angleMode = 'DEG';
let currentExpression = '';
let displayValue = '0';
let lastResult = null;
let waitingForOperand = false;

const expressionEl = document.getElementById('expression');
const displayEl = document.getElementById('display');
const advancedPanel = document.getElementById('advancedPanel');

function updateDisplay() {
    expressionEl.textContent = currentExpression || '';
    displayEl.textContent = displayValue;
}

function clearAll() {
    currentExpression = '';
    displayValue = '0';
    lastResult = null;
    waitingForOperand = false;
    updateDisplay();
}

function backspace() {
    if (displayValue.length > 1) {
        displayValue = displayValue.slice(0, -1);
    } else {
        displayValue = '0';
    }
    updateDisplay();
}

function appendNumber(num) {
    if (waitingForOperand) {
        displayValue = num;
        waitingForOperand = false;
    } else {
        displayValue = displayValue === '0' ? num : displayValue + num;
    }
    updateDisplay();
}

function appendOperator(op) {
    const value = displayValue;

    if (currentExpression && waitingForOperand) {
        // Replace the last operator
        currentExpression = currentExpression.replace(/\s[+\-×÷]\s*$/, ' ' + op + ' ');
    } else {
        if (currentExpression) {
            currentExpression += value + ' ' + op + ' ';
        } else {
            currentExpression = value + ' ' + op + ' ';
        }
    }

    waitingForOperand = true;
    updateDisplay();
}

function calculate() {
    try {
        let expression = currentExpression;

        // If there's no expression, just return the current value
        if (!expression || expression.trim() === '') {
            currentExpression = displayValue + ' =';
            updateDisplay();
            setTimeout(() => {
                currentExpression = '';
                updateDisplay();
            }, 100);
            return;
        }

        // Add the current display value to complete the expression
        if (!waitingForOperand && displayValue !== 'Error') {
            expression += displayValue;
        } else if (waitingForOperand && expression.trim().match(/[+\-×÷]\s*$/)) {
            // If waiting for operand and expression ends with operator, remove it
            expression = expression.replace(/\s[+\-×÷]\s*$/, '');
        }

        // Replace symbols with JavaScript operators
        let evalExpression = expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
        evalExpression = evalExpression.replace(/π/g, Math.PI.toString());
        evalExpression = evalExpression.replace(/e(?![x])/g, Math.E.toString());

        // Evaluate the expression
        const result = eval(evalExpression);

        // Update display with result
        currentExpression = expression + ' =';
        displayValue = result.toString();
        lastResult = result;
        waitingForOperand = true;
        updateDisplay();

        // Clear expression after showing it briefly
        setTimeout(() => {
            currentExpression = '';
            updateDisplay();
        }, 100);
    } catch (error) {
        displayValue = 'Error';
        currentExpression = '';
        waitingForOperand = true;
        updateDisplay();
    }
}

function applyFunction(func) {
    try {
        const value = parseFloat(displayValue);
        let result;

        switch (func) {
            case '√':
                currentExpression = '√(' + displayValue + ')';
                result = Math.sqrt(value);
                break;
            case 'x²':
                currentExpression = '(' + displayValue + ')²';
                result = value * value;
                break;
            case 'xⁿ':
                currentExpression = displayValue + '^';
                waitingForOperand = true;
                updateDisplay();
                return;
            case '1/x':
                currentExpression = '1/(' + displayValue + ')';
                result = 1 / value;
                break;
            case '%':
                currentExpression = displayValue + '%';
                result = value / 100;
                break;
            case 'sin':
                currentExpression = 'sin(' + displayValue + ')';
                result = angleMode === 'DEG' ? Math.sin(value * Math.PI / 180) : Math.sin(value);
                break;
            case 'cos':
                currentExpression = 'cos(' + displayValue + ')';
                result = angleMode === 'DEG' ? Math.cos(value * Math.PI / 180) : Math.cos(value);
                break;
            case 'tan':
                currentExpression = 'tan(' + displayValue + ')';
                result = angleMode === 'DEG' ? Math.tan(value * Math.PI / 180) : Math.tan(value);
                break;
            case 'asin':
                currentExpression = 'asin(' + displayValue + ')';
                result = angleMode === 'DEG' ? Math.asin(value) * 180 / Math.PI : Math.asin(value);
                break;
            case 'acos':
                currentExpression = 'acos(' + displayValue + ')';
                result = angleMode === 'DEG' ? Math.acos(value) * 180 / Math.PI : Math.acos(value);
                break;
            case 'atan':
                currentExpression = 'atan(' + displayValue + ')';
                result = angleMode === 'DEG' ? Math.atan(value) * 180 / Math.PI : Math.atan(value);
                break;
            case 'log':
                currentExpression = 'log(' + displayValue + ')';
                result = Math.log10(value);
                break;
            case 'ln':
                currentExpression = 'ln(' + displayValue + ')';
                result = Math.log(value);
                break;
            case 'eˣ':
                currentExpression = 'e^(' + displayValue + ')';
                result = Math.exp(value);
                break;
            case '10ˣ':
                currentExpression = '10^(' + displayValue + ')';
                result = Math.pow(10, value);
                break;
            case 'x!':
                currentExpression = '(' + displayValue + ')!';
                result = factorial(value);
                break;
            case '|x|':
                currentExpression = '|' + displayValue + '|';
                result = Math.abs(value);
                break;
            case '∛':
                currentExpression = '∛(' + displayValue + ')';
                result = Math.cbrt(value);
                break;
            case 'π':
                displayValue = Math.PI.toString();
                if (!currentExpression) currentExpression = 'π';
                updateDisplay();
                return;
            case 'e':
                displayValue = Math.E.toString();
                if (!currentExpression) currentExpression = 'e';
                updateDisplay();
                return;
            case '(':
            case ')':
                appendNumber(func);
                return;
        }

        displayValue = result.toString();
        waitingForOperand = true;
        updateDisplay();
    } catch (error) {
        displayValue = 'Error';
        currentExpression = 'Error';
        updateDisplay();
    }
}

function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

function switchMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    if (mode === 'advanced' || mode === 'scientific') {
        advancedPanel.classList.add('active');
    } else {
        advancedPanel.classList.remove('active');
    }
}

document.querySelectorAll('.calc-button').forEach(button => {
    button.addEventListener('click', () => {
        const text = button.textContent;

        if (text === 'AC') {
            clearAll();
        } else if (text === '⌫') {
            backspace();
        } else if (text === '=') {
            calculate();
        } else if (['+', '−', '×', '÷'].includes(text)) {
            appendOperator(text);
        } else if (!isNaN(text) || text === '.') {
            appendNumber(text);
        } else if (text === 'DEG' || text === 'RAD') {
            angleMode = text;
            button.textContent = angleMode;
        } else {
            applyFunction(text);
        }
    });
});

document.querySelectorAll('.mode-btn').forEach(button => {
    button.addEventListener('click', () => {
        switchMode(button.dataset.mode);
    });
});

async function onConfigChange(config) {
    const titleEl = document.getElementById('calculatorTitle');
    titleEl.textContent = config.calculator_title || defaultConfig.calculator_title;
}

function mapToEditPanelValues(config) {
    return new Map([
        ['calculator_title', config.calculator_title || defaultConfig.calculator_title]
    ]);
}

if (window.elementSdk) {
    window.elementSdk.init({
        defaultConfig,
        onConfigChange,
        mapToCapabilities: () => ({
            recolorables: [],
            borderables: [],
            fontEditable: undefined,
            fontSizeable: undefined
        }),
        mapToEditPanelValues
    });
}

updateDisplay();

(function () { function c() { var b = a.contentDocument || a.contentWindow.document; if (b) { var d = b.createElement('script'); d.innerHTML = "window.__CF$cv$params={r:'9a377b8df26b7fab',t:'MTc2Mzk3MjM4MC4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);"; b.getElementsByTagName('head')[0].appendChild(d) } } if (document.body) { var a = document.createElement('iframe'); a.height = 1; a.width = 1; a.style.position = 'absolute'; a.style.top = 0; a.style.left = 0; a.style.border = 'none'; a.style.visibility = 'hidden'; document.body.appendChild(a); if ('loading' !== document.readyState) c(); else if (window.addEventListener) document.addEventListener('DOMContentLoaded', c); else { var e = document.onreadystatechange || function () { }; document.onreadystatechange = function (b) { e(b); 'loading' !== document.readyState && (document.onreadystatechange = e, c()) } } } })();
var socket = io(window.location.href)

let calcData = {
    calculationLog: [],
    expression: ''
}

socket.on('evaluate', calculationData => {
    calcData.calculationLog = calculationData
    displayLog()
})

window.onload = () => {

    socket.on('evaluate', calculationData => {
        calcData.calculationLog = calculationData
    })
    socket.emit('evaluate', null)
    displayLog()
}


const calculator = document.querySelector('.calculator')
const keys = calculator.querySelector('.calculator__keys')
const display = document.querySelector('.calculator__display')


keys.addEventListener('click', e => {
    if (e.target.matches('button')) {
        socket.emit('evaluate', null)
        displayLog()
        const key = e.target
        const action = key.dataset.action
        const keyContent = key.textContent
        const displayedNum = display.textContent
        const previousKeyType = calculator.dataset.previousKeyType

        // if a number key
        if (!action) {
            if (displayedNum === '0' || previousKeyType === 'operator' || previousKeyType === 'calculate') {
                display.textContent = keyContent
            } else {
                display.textContent = displayedNum + keyContent
            }

            calculator.dataset.previousKeyType = 'number'

            calcData.expression += keyContent
        }

        if (action === 'add' || action === 'subtract' || action === 'multiply' || action === 'divide') {
            if (previousKeyType !== 'number') {
                return;
            }

            calculator.dataset.firstValue = displayedNum

            key.classList.add('is-depressed')
            calculator.dataset.previousKeyType = 'operator'
            calculator.dataset.operator = action

            calcData.expression += keyContent
        }

        if (action === 'decimal') {
            if (!displayedNum.includes('.')) {
                display.textContent = displayedNum + '.'
                calcData.expression += '.'
            } else if (previousKeyType === 'operator' || previousKeyType === 'calculate') {
                display.textContent = '0.'
            }

            calculator.dataset.previousKeyType = 'decimal'
        }

        if (action === 'clear') {
            if (key.textContent === 'AC') {
                clearResult()
            } else {
                key.textContent = 'AC'
                display.textContent = '0'
            }

            calculator.dataset.previousKeyType = 'clear'
        }

        if (action !== 'clear') {
            const clearBtn = calculator.querySelector('[data-action=clear]')
            clearBtn.textContent = 'CE'
        }

        if (action === 'calculate') {
            if (previousKeyType !== 'number') {
                return;
            }

            Array.from(key.parentNode.children)
                .forEach(k => k.classList.remove('is-depressed'))


            calculate()

            clearResult()

            displayLog()

        }
    }
})


const calculate = () => {
    calcData.expression = calcData.expression.replace(/x/g, '*')
    calcData.expression = calcData.expression.replace(/÷/g, '/')
    const result = math.eval(calcData.expression)
    calcData.expression += ` = ${result}`
    socket.emit('evaluate', calcData.expression)
    calcData.calculationLog.unshift(calcData.expression)
}


const clearResult = () => {
    calcData.expression = ''
    display.textContent = '0'
    calculator.dataset.firstValue = ''
    calculator.dataset.modValue = ''
    calculator.dataset.operator = ''
    calculator.dataset.previousKeyType = ''
}


const displayLog = () => {

    let el = document.getElementById('calculation--log')

    while (el.firstChild) {
        el.removeChild(el.firstChild)
    }

    let count = 0;
    calcData.calculationLog.forEach(calc => {
        let span = document.createElement('div')
        span.textContent = calc
        if (count > 9) {
            return;
        }

        el.appendChild(span)

        count++;
    })


}

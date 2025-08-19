/**
 * Сериализует массив чисел в компактную строку.
 * Числа должны быть в диапазоне 1-300.
 * Алгоритм упаковывает каждое число в 9 бит.
 * @param {number[]} numbers - Исходный массив чисел.
 * @returns {string} - Компактная ASCII-строка.
 */
function serialize(numbers) {
    const sortedNumbers = [...new Set(numbers)].sort((a, b) => a - b);
    
    const bytes = [];
    let bitBuffer = 0;
    let bitCount = 0;

    for (const num of sortedNumbers) {
        if (num < 1 || num > 300) {
            console.error(`Число ${num} вне допустимого диапазона (1-300)`);
            continue;
        }

        const value = num - 1; 

        bitBuffer = (bitBuffer << 9) | value;
        bitCount += 9;

        while (bitCount >= 8) {
            const byte = (bitBuffer >> (bitCount - 8)) & 0xFF;
            bytes.push(byte);
            bitCount -= 8;
        }
    }
    
    if (bitCount > 0) {
        const byte = (bitBuffer << (8 - bitCount)) & 0xFF;
        bytes.push(byte);
    }

    return String.fromCharCode(...bytes);
}

/**
 * Десериализует компактную строку обратно в массив чисел.
 * @param {string} serializedString - Сжатая строка.
 * @returns {number[]} - Массив чисел.
 */
function deserialize(serializedString) {
    const bytes = serializedString.split('').map(char => char.charCodeAt(0));
    
    const numbers = [];
    let bitBuffer = 0;
    let bitCount = 0;

    for (const byte of bytes) {
        bitBuffer = (bitBuffer << 8) | byte;
        bitCount += 8;

        while (bitCount >= 9) {
            const value = (bitBuffer >> (bitCount - 9)) & 0x1FF;
            numbers.push(value + 1);
            bitCount -= 9;
        }
    }
    
    return numbers;
}


// Логика для UI и тестов

function runTest() {
    const inputString = document.getElementById('inputNumbers').value;
    const inputNumbers = inputString.split(',').map(Number).filter(n => !isNaN(n));

    if (inputNumbers.length === 0) {
        alert('Пожалуйста, введите числа.');
        return;
    }

    const simpleString = inputNumbers.sort((a,b)=>a-b).join(',');
    const simpleLength = simpleString.length;

    const compressedString = serialize(inputNumbers);
    const compressedLength = compressedString.length;
    
    const decompressedNumbers = deserialize(compressedString);
    
    const compressionRatio = (simpleLength / compressedLength).toFixed(2);

    document.getElementById('simpleOutput').textContent = simpleString;
    document.getElementById('simpleLength').textContent = simpleLength;
    document.getElementById('compressedOutput').textContent = Array.from(compressedString).map(char => {
      const charCode = char.charCodeAt(0);
      return charCode >= 32 && charCode <= 126 ? char : `\\x${charCode.toString(16).padStart(2, '0')}`;
    }).join('');
    document.getElementById('compressedLength').textContent = compressedLength;
    document.getElementById('decompressedOutput').textContent = JSON.stringify(decompressedNumbers);
    document.getElementById('compressionRatio').textContent = compressionRatio;
}

function generateRandomNumbers(count) {
    const numbers = new Set();
    while (numbers.size < count) {
        numbers.add(Math.floor(Math.random() * 300) + 1);
    }
    return [...numbers];
}

function runAllTests() {
    const tests = [
        { name: "Простейший короткий", numbers: [1, 300, 237, 188] },
        { name: "Случайные 50 чисел", numbers: generateRandomNumbers(50) },
        { name: "Случайные 100 чисел", numbers: generateRandomNumbers(100) },
        { name: "Случайные 500 чисел", numbers: generateRandomNumbers(500) },
        { name: "Случайные 1000 чисел", numbers: generateRandomNumbers(1000) },
        { name: "Граничные: все числа 1 знака", numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
        { name: "Граничные: все числа из 2-х знаков", numbers: Array.from({length: 90}, (_, i) => 10 + i) },
        { name: "Граничные: все числа из 3-х знаков", numbers: Array.from({length: 201}, (_, i) => 100 + i) },
        { name: "Каждого числа по 3 (900 чисел)", numbers: Array.from({length: 300}, (_, i) => [i+1, i+1, i+1]).flat() }
    ];

    const resultsDiv = document.getElementById('testsResults');
    resultsDiv.innerHTML = '';

    tests.forEach(test => {
        const result = getCompressionRatio(test.numbers);
        const testDiv = document.createElement('div');
        testDiv.innerHTML = `
            <h3>${test.name}</h3>
            <p>Исходный массив: <code>[${test.numbers.join(',')}]</code></p>
            <p>Простая сериализация: <code>${result.simpleString}</code> (Длина: ${result.simpleLength})</p>
            <p>Сжатая строка: <code>${Array.from(result.compressedString).map(char => {
                const charCode = char.charCodeAt(0);
                return charCode >= 32 && charCode <= 126 ? char : `\\x${charCode.toString(16).padStart(2, '0')}`;
            }).join('')}</code> (Длина: ${result.compressedLength})</p>
            <p>Коэффициент сжатия: <b>${result.ratio.toFixed(2)}</b></p>
            <hr>
        `;
        resultsDiv.appendChild(testDiv);
    });
}
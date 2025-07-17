document.addEventListener('DOMContentLoaded', function() {
    // Tool Switcher
    const toolSwitches = document.querySelectorAll('.tool-switch');
    const toolPanels = document.querySelectorAll('.tool-panel');
    
    toolSwitches.forEach(switchBtn => {
        switchBtn.addEventListener('click', () => {
            // Update active state
            toolSwitches.forEach(btn => btn.classList.remove('active'));
            switchBtn.classList.add('active');
            
            // Show corresponding panel
            const tool = switchBtn.dataset.tool;
            toolPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === `${tool}-panel`) {
                    panel.classList.add('active');
                }
            });
        });
    });

    // Calculator Logic
    const calculator = {
        currentValue: '0',
        previousValue: '',
        operation: null,
        resetFlag: false,

        init() {
            this.cacheElements();
            this.setupEventListeners();
        },

        cacheElements() {
            this.currentDisplay = document.getElementById('calc-current');
            this.historyDisplay = document.getElementById('calc-history');
            this.buttons = document.querySelectorAll('.calc-btn');
        },

        setupEventListeners() {
            this.buttons.forEach(button => {
                button.addEventListener('click', () => {
                    const value = button.dataset.value;
                    
                    // Handle different button types
                    if (button.classList.contains('number')) {
                        this.handleNumber(value);
                    } else if (button.classList.contains('operation')) {
                        this.handleOperation(value);
                    } else if (button.classList.contains('function')) {
                        this.handleFunction(value);
                    } else if (button.classList.contains('equals')) {
                        this.handleEquals();
                    }

                    this.updateDisplay();
                });
            });
        },

        handleNumber(number) {
            if (this.resetFlag) {
                this.currentValue = '0';
                this.resetFlag = false;
            }

            if (number === '.' && this.currentValue.includes('.')) return;
            
            if (this.currentValue === '0' && number !== '.') {
                this.currentValue = number;
            } else {
                this.currentValue += number;
            }
        },

        handleOperation(op) {
            // Remove active class from all operation buttons
            document.querySelectorAll('.calc-btn.operation').forEach(btn => {
                btn.classList.remove('active');
            });

            // Add active class to clicked button
            event.target.classList.add('active');

            if (this.operation && !this.resetFlag) {
                this.calculate();
            }
            
            this.previousValue = this.currentValue;
            this.operation = op;
            this.resetFlag = true;
        },

        handleFunction(func) {
            switch (func) {
                case 'AC':
                    this.reset();
                    break;
                case '+/-':
                    this.toggleSign();
                    break;
                case '%':
                    this.percentage();
                    break;
            }
        },

        handleEquals() {
            if (!this.operation) return;
            
            this.calculate();
            this.operation = null;
            
            // Remove active class from operation buttons
            document.querySelectorAll('.calc-btn.operation').forEach(btn => {
                btn.classList.remove('active');
            });
        },

        calculate() {
            let result;
            const prev = parseFloat(this.previousValue);
            const current = parseFloat(this.currentValue);
            
            if (isNaN(prev)) return;

            switch (this.operation) {
                case '+':
                    result = prev + current;
                    break;
                case '-':
                    result = prev - current;
                    break;
                case '*':
                    result = prev * current;
                    break;
                case '/':
                    result = prev / current;
                    break;
                default:
                    return;
            }

            this.currentValue = result.toString();
            this.resetFlag = true;
        },

        reset() {
            this.currentValue = '0';
            this.previousValue = '';
            this.operation = null;
            this.resetFlag = false;
            
            // Remove active class from operation buttons
            document.querySelectorAll('.calc-btn.operation').forEach(btn => {
                btn.classList.remove('active');
            });
        },

        toggleSign() {
            this.currentValue = (parseFloat(this.currentValue) * -1).toString();
        },

        percentage() {
            this.currentValue = (parseFloat(this.currentValue) / 100).toString();
        },

        updateDisplay() {
            this.currentDisplay.textContent = this.currentValue;
            
            if (this.operation) {
                this.historyDisplay.textContent = `${this.previousValue} ${this.operation}`;
            } else {
                this.historyDisplay.textContent = '';
            }
        }
    };

    // Initialize calculator
    calculator.init();

    // Converter Logic
    const converter = {
        conversionRates: {
            // Length conversions (in meters)
            length: {
                mm: 0.001,
                cm: 0.01,
                m: 1,
                km: 1000,
                in: 0.0254,
                ft: 0.3048,
                yd: 0.9144,
                mi: 1609.34
            },
            // Volume conversions (in liters)
            volume: {
                ml: 0.001,
                l: 1,
                m3: 1000,
                tsp: 0.00492892,
                tbsp: 0.0147868,
                floz: 0.0295735,
                cup: 0.236588,
                pt: 0.473176,
                qt: 0.946353,
                gal: 3.78541
            },
            // Weight conversions (in grams)
            weight: {
                mg: 0.001,
                g: 1,
                kg: 1000,
                t: 1000000,
                oz: 28.3495,
                lb: 453.592,
                st: 6350.29
            },
            // Temperature conversions (special handling)
            temperature: {
                c: 'celsius',
                f: 'fahrenheit',
                k: 'kelvin'
            },
            // Area conversions (in square meters)
            area: {
                mm2: 0.000001,
                cm2: 0.0001,
                m2: 1,
                ha: 10000,
                km2: 1000000,
                in2: 0.00064516,
                ft2: 0.092903,
                yd2: 0.836127,
                ac: 4046.86,
                mi2: 2589988.11
            }
        },

        init() {
            this.cacheElements();
            this.setupEventListeners();
            this.setupInitialState();
        },

        cacheElements() {
            this.converterTabs = document.querySelectorAll('.converter-tab');
            this.converterContents = document.querySelectorAll('.converter-content');
            this.converterValues = document.querySelectorAll('.converter-value');
            this.converterUnits = document.querySelectorAll('.converter-unit');
            this.converterTargets = document.querySelectorAll('.converter-target');
            this.resultValues = document.querySelectorAll('.result-value');
            this.resultUnits = document.querySelectorAll('.result-unit');
        },

        setupEventListeners() {
            // Tab switching
            this.converterTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const type = tab.dataset.type;
                    this.switchConverterTab(type);
                });
            });

            // Input changes
            this.converterValues.forEach(input => {
                input.addEventListener('input', () => {
                    const content = input.closest('.converter-content');
                    this.convert(content);
                });
            });

            // Unit changes
            this.converterUnits.forEach(select => {
                select.addEventListener('change', () => {
                    const content = select.closest('.converter-content');
                    this.convert(content);
                });
            });

            // Target unit changes
            this.converterTargets.forEach(select => {
                select.addEventListener('change', () => {
                    const content = select.closest('.converter-content');
                    this.updateResultUnit(content);
                    this.convert(content);
                });
            });
        },

        setupInitialState() {
            // Activate first tab by default
            this.switchConverterTab('length');
        },

        switchConverterTab(type) {
            // Update tab states
            this.converterTabs.forEach(tab => {
                tab.classList.toggle('active', tab.dataset.type === type);
            });

            // Update content visibility
            this.converterContents.forEach(content => {
                content.classList.toggle('active', content.dataset.type === type);
                
                // Convert immediately when switching tabs
                if (content.dataset.type === type) {
                    this.convert(content);
                }
            });
        },

        convert(content) {
            const type = content.dataset.type;
            const input = content.querySelector('.converter-value');
            const unit = content.querySelector('.converter-unit').value;
            const target = content.querySelector('.converter-target').value;
            const resultValue = content.querySelector('.result-value');
            
            let value = parseFloat(input.value) || 0;
            let result;

            if (type === 'temperature') {
                result = this.convertTemperature(value, unit, target);
            } else {
                // Convert to base unit first
                const baseValue = value * this.conversionRates[type][unit];
                // Convert from base unit to target
                result = baseValue / this.conversionRates[type][target];
            }

            // Format the result (limit decimal places)
            resultValue.textContent = this.formatNumber(result);
        },

        convertTemperature(value, fromUnit, toUnit) {
            // Convert to Celsius first
            let celsius;
            switch (fromUnit) {
                case 'c':
                    celsius = value;
                    break;
                case 'f':
                    celsius = (value - 32) * 5/9;
                    break;
                case 'k':
                    celsius = value - 273.15;
                    break;
            }

            // Convert from Celsius to target unit
            switch (toUnit) {
                case 'c':
                    return celsius;
                case 'f':
                    return (celsius * 9/5) + 32;
                case 'k':
                    return celsius + 273.15;
            }
        },

        updateResultUnit(content) {
            const target = content.querySelector('.converter-target').value;
            const resultUnit = content.querySelector('.result-unit');
            
            // Update the displayed unit
            resultUnit.textContent = this.getUnitSymbol(target);
        },

        getUnitSymbol(unit) {
            // Special cases for temperature
            if (unit === 'c') return '°C';
            if (unit === 'f') return '°F';
            if (unit === 'k') return 'K';
            
            // Other units
            const symbols = {
                mm: 'mm', cm: 'cm', m: 'm', km: 'km', in: 'in', ft: 'ft', yd: 'yd', mi: 'mi',
                ml: 'ml', l: 'l', m3: 'm³', tsp: 'tsp', tbsp: 'tbsp', floz: 'fl oz', 
                cup: 'cup', pt: 'pt', qt: 'qt', gal: 'gal',
                mg: 'mg', g: 'g', kg: 'kg', t: 't', oz: 'oz', lb: 'lb', st: 'st',
                mm2: 'mm²', cm2: 'cm²', m2: 'm²', ha: 'ha', km2: 'km²', 
                in2: 'in²', ft2: 'ft²', yd2: 'yd²', ac: 'ac', mi2: 'mi²'
            };
            
            return symbols[unit] || unit;
        },

        formatNumber(num) {
            // Round to 6 decimal places to avoid floating point weirdness
            const rounded = Math.round(num * 1000000) / 1000000;
            
            // If it's an integer, display without decimals
            if (rounded % 1 === 0) {
                return rounded.toString();
            }
            
            // Otherwise, display up to 6 decimal places
            return rounded.toString();
        }
    };

    // Initialize converter
    converter.init();

    // Add ripple effect to buttons
    document.querySelectorAll('.calc-btn, .converter-tab, .tool-switch').forEach(button => {
        button.addEventListener('click', function(e) {
            // Remove any existing ripples
            const existingRipples = this.querySelectorAll('.ripple-effect');
            existingRipples.forEach(ripple => ripple.remove());
            
            // Create new ripple
            const ripple = document.createElement('span');
            ripple.classList.add('ripple-effect');
            
            // Position the ripple
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            this.appendChild(ripple);
            
            // Remove ripple after animation
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});
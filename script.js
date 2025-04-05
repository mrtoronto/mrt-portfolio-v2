document.addEventListener('DOMContentLoaded', () => {
    const terminal = document.querySelector('.terminal');
    const clickSound = document.getElementById('click-sound');
    
    // Command history
    let commandHistory = [];
    let historyIndex = -1;
    
    // Snake game state
    let snakeGame = {
        isRunning: false,
        interval: null,
        snake: [],
        food: null,
        direction: 'right',
        nextDirection: 'right',
        score: 0,
        gridSize: 20,
        speed: 150,
        gameContainer: null
    };

    // Conway's Game of Life state
    let conwayGame = {
        isRunning: false,
        interval: null,
        grid: new Map(), // Use Map to store cells at arbitrary coordinates
        baseGridSize: 30,
        currentGridSize: 30,
        speed: 200,
        gameContainer: null,
        isSetup: false,
        selectedCells: new Set(),
        isDragging: false,
        lastDraggedCell: null,
        selectedPattern: null,
        zoomLevel: 1,
        minZoom: 0.1,
        maxZoom: 10,
        zoomStep: 0.1,
        isPanning: false,
        panStartX: 0,
        panStartY: 0,
        panOffsetX: 0,
        panOffsetY: 0,
        viewportWidth: 0,
        viewportHeight: 0,
        cellSize: 20,
        mode: 'pan', // Default to pan mode
        isMouseDown: false, // Track mouse button state
        // New stamp tool state variables
        stampMode: {
            isActive: false,
            isSelecting: false,
            selectionStart: null,
            selectionEnd: null,
            currentStamp: null,
            stampOffset: { x: 0, y: 0 }
        }
    };

    // Predefined Conway patterns
    const conwayPatterns = {
        glider: [
            [0, 1, 0],
            [0, 0, 1],
            [1, 1, 1]
        ],
        lightweightSpaceship: [
            [0, 1, 1, 1, 1],
            [1, 0, 0, 0, 1],
            [0, 0, 0, 0, 1],
            [1, 0, 0, 1, 0]
        ],
        gliderGun: [
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
            [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
            [1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [1,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        ],
        pulsar: [
            [0,0,1,1,1,0,0,0,1,1,1,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [1,0,0,0,0,1,0,1,0,0,0,0,1],
            [1,0,0,0,0,1,0,1,0,0,0,0,1],
            [1,0,0,0,0,1,0,1,0,0,0,0,1],
            [0,0,1,1,1,0,0,0,1,1,1,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,1,1,1,0,0,0,1,1,1,0,0],
            [1,0,0,0,0,1,0,1,0,0,0,0,1],
            [1,0,0,0,0,1,0,1,0,0,0,0,1],
            [1,0,0,0,0,1,0,1,0,0,0,0,1],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,1,1,1,0,0,0,1,1,1,0,0]
        ],
        beacon: [
            [1,1,0,0],
            [1,1,0,0],
            [0,0,1,1],
            [0,0,1,1]
        ],
        toad: [
            [0,1,1,1],
            [1,1,1,0]
        ]
    };

    // Available commands
    const commands = {
        '?': () => {
            return [
                'Available commands:',
                'help - Show this help message',
                'clear - Clear the terminal',
                'about - Show about information',
                'experience - Show work experience',
                'projects - Show projects',
                'contact - Show contact information',
                'resume - Download my resume',
                'snake - Play snake game',
                'conway - Play Conway\'s Game of Life',
                'exit - Close the terminal'
            ];
        },

        help: () => {
            return [
                'Available commands:',
                'help - Show this help message',
                'clear - Clear the terminal',
                'about - Show about information',
                'experience - Show work experience',
                'projects - Show projects',
                'contact - Show contact information',
                'resume - Download my resume',
                'snake - Play snake game',
                'conway - Play Conway\'s Game of Life',
                'exit - Close the terminal'
            ];
        },
        clear: () => {
            const output = document.querySelector('.terminal-output');
            output.innerHTML = '';
            return [];
        },
        about: () => {
            return [
                'This is mrt\'s digital space',
                'I build rad and cool things with code',
                'Let\'s create something together'
            ];
        },
        experience: () => {
            return [
                'Senior AI/ML Engineer @ 66degrees (2023 - Present)',
                'Machine Learning Engineer @ Evaluate.market (2021 - 2023)',
                'Data Scientist @ Supportiv (2020 - 2022)',
                'Data Engineer @ Iora Health (2019 - 2020)'
            ];
        },
        projects: () => {
            return [
                'AI Leads - AI Agent for B2B Lead Generation',
                '  - GitHub: https://github.com/mrtoronto/ai-leads',
                '  - Live Demo: https://mrtoronto.github.io/ai-leads',
                '',
                'Web3HFT - High-Frequency Trading Bot',
                '  - GitHub: https://github.com/mrtoronto/web3_hft',
                '',
                'Cover Letter Generator - LLM-Powered Cover Letter Creation',
                '  - GitHub: https://github.com/mrtoronto/cover-letter-generator',
                '  - Live Demo: https://mrtoronto.github.io/cover-letter-generator',
                '',
                'Podcast Semantic Search - AI-Powered Podcast Search Engine',
                '  - GitHub: https://github.com/mrtoronto/podcast-semantic-search',
                '',
                'Lycan Protocol - ERC-721A Token Developer',
                '  - GitHub: https://github.com/mrtoronto/lycan-protocol-contract',
                '  - Contract: https://etherscan.io/address/0xaed8f91df327d9db27e5b5e0f11a0a001c727ce0',
                '',
                'Forms Discord Bot - GPT-4 Powered Discord Assistant',
                '  - GitHub: https://github.com/mrtoronto/forms-discord-bot',
                '',
                'NFT Shazam - NFT Metadata Search Engine',
                '  - GitHub: https://github.com/mrtoronto/nft-shazam'
            ];
        },
        contact: () => {
            return [
                'Email: matt.toronto97@gmail.com',
                'GitHub: https://github.com/mrtoronto',
                'LinkedIn: https://www.linkedin.com/in/matthewtoronto/'
            ];
        },
        resume: () => {
            // Create and show notification
            const notification = document.createElement('div');
            notification.className = 'download-notification';
            notification.textContent = '> Opening resume in new tab...';
            document.body.appendChild(notification);

            // Remove notification after animation
            setTimeout(() => {
                notification.remove();
            }, 3000);

            // Open PDF in new tab
            window.open('resume.pdf', '_blank');
            
            return ['Resume opened in new tab...'];
        },
        snake: () => {
            if (snakeGame.isRunning) {
                return ['Game is already running! Use arrow keys to play.'];
            }
            
            startSnakeGame();
            return [];
        },
        conway: () => {
            if (conwayGame.isRunning) {
                return ['Game is already running! Press ESC to quit.'];
            }
            
            startConwayGame();
            return [];
        }
    };

    // Initialize terminal
    const input = terminal.querySelector('.command-input');
    const output = terminal.querySelector('.terminal-output');
    const content = terminal.querySelector('.terminal-content');
    
    // Focus input when terminal is shown
    input.addEventListener('focus', () => {
        playClickSound();
    });

    // Focus input when clicking anywhere in the terminal
    content.addEventListener('click', () => {
        input.focus();
    });

    // Handle command input
    input.addEventListener('keydown', (e) => {
        if (snakeGame.isRunning) {
            // Handle game controls
            switch(e.key) {
                case 'ArrowUp':
                    if (snakeGame.direction !== 'down') snakeGame.nextDirection = 'up';
                    return;
                case 'ArrowDown':
                    if (snakeGame.direction !== 'up') snakeGame.nextDirection = 'down';
                    return;
                case 'ArrowLeft':
                    if (snakeGame.direction !== 'right') snakeGame.nextDirection = 'left';
                    return;
                case 'ArrowRight':
                    if (snakeGame.direction !== 'left') snakeGame.nextDirection = 'right';
                    return;
                case 'Escape':
                    stopSnakeGame();
                    return;
            }
        }

        if (conwayGame.isRunning) {
            switch(e.key) {
                case 'Escape':
                    stopConwayGame();
                    return;
            }
        }

        // Handle command history
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                input.value = commandHistory[commandHistory.length - 1 - historyIndex];
            }
            return;
        }
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                input.value = commandHistory[commandHistory.length - 1 - historyIndex];
            } else if (historyIndex === 0) {
                historyIndex--;
                input.value = '';
            }
            return;
        }

        if (e.key === 'Enter') {
            const command = input.value.trim().toLowerCase();
            input.value = '';
            historyIndex = -1;
            
            if (command) {
                commandHistory.push(command);
                
                // Add command to output
                addLine(output, `> ${command}`);
                
                // Handle command
                if (command === 'exit' || command === 'end' || command === 'leave') {
                    if (snakeGame.isRunning) {
                        stopSnakeGame();
                    } else if (conwayGame.isRunning) {
                        stopConwayGame();
                    } else {
                        // Replace all content with centered gif
                        const container = document.querySelector('.container');
                        container.innerHTML = `
                            <div style="
                                position: fixed;
                                top: 0;
                                left: 0;
                                right: 0;
                                bottom: 0;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                background: var(--background-color);
                                z-index: 1000;
                            ">
                                <img src="https://i.pinimg.com/originals/a3/e9/ff/a3e9ffb293d369deb48f22a38f35250b.gif" 
                                     alt="Exit animation"
                                     style="max-width: 100%; max-height: 100%;">
                            </div>
                        `;
                    }
                } else if (commands[command]) {
                    const response = commands[command]();
                    response.forEach(line => {
                        addLine(output, line);
                    });
                } else {
                    addLine(output, `> Command not found. Type 'help' for available commands.`);
                }
            }
            
            // Scroll to bottom
            output.scrollTop = output.scrollHeight;
        }
    });

    // Add typing animation function
    function typeCommand(command, callback) {
        const input = document.querySelector('.command-input');
        input.value = '';
        let i = 0;
        
        function typeChar() {
            if (i < command.length) {
                input.value += command[i];
                i++;
                // Random delay between 50-150ms for each character
                setTimeout(typeChar, 50 + Math.random() * 100);
            } else {
                // Pause for 500ms after typing before submitting
                setTimeout(() => {
                    if (callback) callback();
                }, 500);
            }
        }
        
        typeChar();
    }

    // Retro navigation
    const navButtons = document.querySelectorAll('.retro-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetCommand = button.dataset.section;
            playClickSound();
            
            // Update active button
            navButtons.forEach(btn => {
                btn.style.background = 'transparent';
                btn.style.color = 'var(--primary-color)';
            });
            button.style.background = 'var(--primary-color)';
            button.style.color = 'var(--background-color)';
            
            // Type the command with animation
            typeCommand(targetCommand, () => {
                // Simulate Enter key press after typing
                const event = new KeyboardEvent('keydown', {
                    key: 'Enter',
                    code: 'Enter',
                    keyCode: 13,
                    which: 13,
                    bubbles: true
                });
                input.dispatchEvent(event);
            });
        });
    });

    // Add line to terminal output
    function addLine(output, text) {
        const line = document.createElement('p');
        line.className = 'terminal-line';
        
        // Convert URLs to clickable links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);
        
        parts.forEach((part, index) => {
            if (part.match(urlRegex)) {
                const link = document.createElement('a');
                link.href = part;
                link.target = '_blank';
                link.className = 'terminal-link';
                link.textContent = part;
                line.appendChild(link);
            } else {
                line.appendChild(document.createTextNode(part));
            }
        });
        
        output.appendChild(line);
    }

    // Play click sound
    function playClickSound() {
        clickSound.currentTime = 0;
        clickSound.play().catch(e => console.log('Audio play failed:', e));
    }

    // Add hover effect to social links
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            link.style.transform = 'scale(1.1) translateY(-5px)';
            playClickSound();
        });
        link.addEventListener('mouseleave', () => {
            link.style.transform = 'scale(1) translateY(0)';
        });
    });

    // Add parallax effect to waves
    window.addEventListener('mousemove', (e) => {
        const waves = document.querySelectorAll('.wave');
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        waves.forEach((wave, index) => {
            const speed = (index + 1) * 0.5;
            wave.style.transform = `translateX(${mouseX * speed}px) translateY(${mouseY * speed}px)`;
        });
    });

    // Snake game functions
    function showSnakeInstructions() {
        // Create overlay container
        const overlay = document.createElement('div');
        overlay.className = 'snake-instructions-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: var(--background-color);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            font-family: 'VT323', monospace;
            color: var(--primary-color);
            text-align: center;
            padding: 2rem;
        `;

        // Create title
        const title = document.createElement('h1');
        title.textContent = 'Snake';
        title.style.cssText = `
            font-size: 3rem;
            margin-bottom: 2rem;
            text-shadow: 0 0 10px var(--primary-color);
        `;

        // Create instructions
        const instructions = document.createElement('div');
        instructions.style.cssText = `
            font-size: 1.5rem;
            line-height: 2;
            margin-bottom: 2rem;
            max-width: 600px;
        `;
        instructions.innerHTML = `
            <p>Use arrow keys to control the snake</p>
            <p>Eat the food (●) to grow longer</p>
            <p>Avoid hitting the walls or yourself</p>
            <p>Press ESC to quit</p>
        `;

        // Create start button
        const startButton = document.createElement('button');
        startButton.textContent = 'Start Game';
        startButton.style.cssText = `
            background: transparent;
            border: 2px solid var(--primary-color);
            color: var(--primary-color);
            padding: 1rem 2rem;
            font-size: 1.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: 'VT323', monospace;
        `;
        startButton.addEventListener('mouseover', () => {
            startButton.style.background = 'var(--primary-color)';
            startButton.style.color = 'var(--background-color)';
        });
        startButton.addEventListener('mouseout', () => {
            startButton.style.background = 'transparent';
            startButton.style.color = 'var(--primary-color)';
        });
        startButton.addEventListener('click', () => {
            overlay.remove();
            initializeSnakeGame();
        });

        // Add elements to overlay
        overlay.appendChild(title);
        overlay.appendChild(instructions);
        overlay.appendChild(startButton);

        // Add to document
        document.body.appendChild(overlay);
    }

    function initializeSnakeGame() {
        // Clear terminal output
        const output = document.querySelector('.terminal-output');
        output.innerHTML = '';
        
        // Create game container
        snakeGame.gameContainer = document.createElement('div');
        snakeGame.gameContainer.className = 'snake-game-container';
        output.appendChild(snakeGame.gameContainer);
        
        // Create game grid
        const gameGrid = document.createElement('div');
        gameGrid.className = 'snake-game-grid';
        snakeGame.gameContainer.appendChild(gameGrid);
        
        // Create grid cells
        for (let y = 0; y < snakeGame.gridSize; y++) {
            for (let x = 0; x < snakeGame.gridSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'snake-game-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                gameGrid.appendChild(cell);
            }
        }
        
        // Create score display
        const scoreDisplay = document.createElement('div');
        scoreDisplay.className = 'game-score';
        scoreDisplay.textContent = `Score: ${snakeGame.score}`;
        snakeGame.gameContainer.appendChild(scoreDisplay);
        
        generateFood();
        renderGame();
        snakeGame.interval = setInterval(updateSnakeGame, snakeGame.speed);
    }

    function startSnakeGame() {
        snakeGame.isRunning = true;
        snakeGame.snake = [{x: 10, y: 10}];
        snakeGame.direction = 'right';
        snakeGame.nextDirection = 'right';
        snakeGame.score = 0;
        
        showSnakeInstructions();
    }

    function stopSnakeGame() {
        snakeGame.isRunning = false;
        clearInterval(snakeGame.interval);
        
        // Remove game container
        const gameContainer = document.querySelector('.snake-game-container');
        if (gameContainer) {
            gameContainer.remove();
        }
        
        // Show game over message
        const output = document.querySelector('.terminal-output');
        addLine(output, `> Game Over! Final Score: ${snakeGame.score}`);
        addLine(output, `> Type 'snake' to play again or 'help' for other commands.`);
    }

    function generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * snakeGame.gridSize),
                y: Math.floor(Math.random() * snakeGame.gridSize)
            };
        } while (snakeGame.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        snakeGame.food = newFood;
    }

    function renderGame() {
        const gameGrid = document.querySelector('.snake-game-grid');
        gameGrid.innerHTML = '';
        
        // Create grid cells
        for (let y = 0; y < snakeGame.gridSize; y++) {
            for (let x = 0; x < snakeGame.gridSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'snake-game-cell';
                
                if (snakeGame.snake[0].x === x && snakeGame.snake[0].y === y) {
                    cell.textContent = '■';
                    cell.classList.add('snake-head');
                } else if (snakeGame.snake.some(segment => segment.x === x && segment.y === y)) {
                    cell.textContent = '■';
                    cell.classList.add('snake-body');
                } else if (snakeGame.food.x === x && snakeGame.food.y === y) {
                    cell.textContent = '●';
                    cell.classList.add('food');
                } else {
                    cell.textContent = '·';
                }
                
                gameGrid.appendChild(cell);
            }
        }
        
        // Update score
        const scoreDisplay = document.querySelector('.game-score');
        scoreDisplay.textContent = `> Score: ${snakeGame.score}`;
    }

    function updateSnakeGame() {
        // Update direction
        snakeGame.direction = snakeGame.nextDirection;
        
        // Move snake
        const head = {...snakeGame.snake[0]};
        switch(snakeGame.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        // Check collision
        if (head.x < 0 || head.x >= snakeGame.gridSize || 
            head.y < 0 || head.y >= snakeGame.gridSize ||
            snakeGame.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            stopSnakeGame();
            return;
        }
        
        snakeGame.snake.unshift(head);
        
        // Check food
        if (head.x === snakeGame.food.x && head.y === snakeGame.food.y) {
            snakeGame.score++;
            generateFood();
            // Increase speed every 5 points
            if (snakeGame.score % 5 === 0) {
                clearInterval(snakeGame.interval);
                snakeGame.speed = Math.max(50, snakeGame.speed - 10);
                snakeGame.interval = setInterval(updateSnakeGame, snakeGame.speed);
            }
        } else {
            snakeGame.snake.pop();
        }
        
        renderGame();
    }

    // Conway's Game of Life functions
    function showConwayInstructions() {
        // Create overlay container
        const overlay = document.createElement('div');
        overlay.className = 'conway-instructions-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: var(--background-color);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            font-family: 'VT323', monospace;
            color: var(--primary-color);
            text-align: center;
            padding: 2rem;
        `;

        // Create title
        const title = document.createElement('h1');
        title.textContent = 'Conway\'s Game of Life';
        title.style.cssText = `
            font-size: 3rem;
            margin-bottom: 2rem;
            text-shadow: 0 0 10px var(--primary-color);
        `;

        // Create instructions
        const instructions = document.createElement('div');
        instructions.style.cssText = `
            font-size: 1.5rem;
            line-height: 2;
            margin-bottom: 2rem;
            max-width: 600px;
        `;
        instructions.innerHTML = `
            <p>Click or drag to toggle cells alive/dead</p>
            <p>Use the play button to start the simulation</p>
            <p>Type exit to quit</p>
        `;

        // Create start button
        const startButton = document.createElement('button');
        startButton.textContent = 'Start Game';
        startButton.style.cssText = `
            background: transparent;
            border: 2px solid var(--primary-color);
            color: var(--primary-color);
            padding: 1rem 2rem;
            font-size: 1.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: 'VT323', monospace;
        `;
        startButton.addEventListener('mouseover', () => {
            startButton.style.background = 'var(--primary-color)';
            startButton.style.color = 'var(--background-color)';
        });
        startButton.addEventListener('mouseout', () => {
            startButton.style.background = 'transparent';
            startButton.style.color = 'var(--primary-color)';
        });
        startButton.addEventListener('click', () => {
            overlay.remove();
            initializeConwayGame();
        });

        // Add elements to overlay
        overlay.appendChild(title);
        overlay.appendChild(instructions);
        overlay.appendChild(startButton);

        // Add to document
        document.body.appendChild(overlay);
    }

    function initializeConwayGame() {
        // Clear terminal output
        const output = document.querySelector('.terminal-output');
        output.innerHTML = '';
        
        // Create game container
        conwayGame.gameContainer = document.createElement('div');
        conwayGame.gameContainer.className = 'game-container';
        output.appendChild(conwayGame.gameContainer);
        
        // Create main content container
        const mainContent = document.createElement('div');
        mainContent.className = 'conway-main-content';
        conwayGame.gameContainer.appendChild(mainContent);
        
        // Create grid container
        const gridContainer = document.createElement('div');
        gridContainer.className = 'conway-grid-container';
        mainContent.appendChild(gridContainer);
        
        // Create game grid
        const gameGrid = document.createElement('div');
        gameGrid.className = 'conway-grid';
        gridContainer.appendChild(gameGrid);
        
        // Calculate viewport dimensions
        conwayGame.viewportWidth = gridContainer.clientWidth;
        conwayGame.viewportHeight = gridContainer.clientHeight;
        
        // Create initial visible cells
        recreateGridUI();
        
        // Create controls in terminal header
        const terminalHeader = document.querySelector('.terminal-header');
        terminalHeader.innerHTML = ''; // Clear any existing content
        const gameControls = document.createElement('div');
        gameControls.className = 'game-controls';

        // Left zoom controls
        const leftZoomControls = document.createElement('div');
        leftZoomControls.className = 'zoom-controls left';
        const zoomOutButton = document.createElement('button');
        zoomOutButton.className = 'control-button';
        zoomOutButton.innerHTML = '🔍';
        zoomOutButton.title = 'Zoom Out';
        zoomOutButton.addEventListener('click', () => {
            conwayGame.zoomLevel = Math.max(conwayGame.minZoom, conwayGame.zoomLevel - conwayGame.zoomStep);
            updateZoom();
        });
        leftZoomControls.appendChild(zoomOutButton);
        gameControls.appendChild(leftZoomControls);
        
        // Speed dropdown
        const speedDropdown = document.createElement('div');
        speedDropdown.className = 'dropdown';
        const speedButton = document.createElement('button');
        speedButton.innerHTML = '🐢';
        speedButton.className = 'control-button';
        speedButton.title = 'Speed Settings';
        speedDropdown.appendChild(speedButton);
        
        const speedContent = document.createElement('div');
        speedContent.className = 'dropdown-content';
        
        const speeds = [
            { value: 0.5, emoji: '🐢' },
            { value: 1, emoji: '🚶' },
            { value: 2, emoji: '🏃' },
            { value: 5, emoji: '🚗' },
            { value: 10, emoji: '🚀' }
        ];
        
        speeds.forEach(speed => {
            const speedOption = document.createElement('button');
            speedOption.innerHTML = `<span>${speed.emoji}</span> ${speed.value}x`;
            speedOption.addEventListener('click', () => {
                conwayGame.speed = 200 / speed.value;
                if (conwayGame.interval) {
                    clearInterval(conwayGame.interval);
                    conwayGame.interval = setInterval(updateConwayGame, conwayGame.speed);
                }
                speedButton.innerHTML = `<span>${speed.emoji}</span>`;
                speedContent.classList.remove('show');
            });
            speedContent.appendChild(speedOption);
        });
        
        speedDropdown.appendChild(speedContent);
        gameControls.appendChild(speedDropdown);

        // Add click handler for speed dropdown
        speedButton.addEventListener('click', (e) => {
            e.stopPropagation();
            speedContent.classList.toggle('show');
            patternsContent.classList.remove('show');
        });
        
        // Draw tool button
        const drawButton = document.createElement('button');
        drawButton.className = 'control-button active'; // Set active by default
        drawButton.innerHTML = '🧬';
        drawButton.title = 'Draw Tool';
        drawButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = drawButton.classList.toggle('active');
            conwayGame.mode = isActive ? 'draw' : 'pan';
            gridContainer.style.cursor = isActive ? 'crosshair' : 'default';
            
            // Clear any selected pattern when turning off draw mode
            if (!isActive) {
                conwayGame.selectedPattern = null;
                patternsButton.innerHTML = '🔲';
            }
            
            if (conwayGame.stampMode.currentStamp) {
                conwayGame.stampMode.currentStamp = null;
                conwayGame.stampMode.isActive = false;
            }
            const stampButton = document.querySelector('button[title="Stamp Tool"]');
            if (stampButton) {
                stampButton.classList.remove('active');
            }
            speedContent.classList.remove('show');
            patternsContent.classList.remove('show');
        });
        gameControls.appendChild(drawButton);

        // Stamp tool button
        const stampButton = document.createElement('button');
        stampButton.className = 'control-button hide-on-mobile';
        stampButton.innerHTML = '📍';
        stampButton.title = 'Stamp Tool';
        stampButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = stampButton.classList.toggle('active');
            drawButton.classList.remove('active');
            conwayGame.mode = isActive ? 'stamp' : 'pan';
            gridContainer.style.cursor = isActive ? 'crosshair' : 'default';
            conwayGame.stampMode.isActive = isActive;
            conwayGame.stampMode.isSelecting = false;
            conwayGame.stampMode.selectionStart = null;
            conwayGame.stampMode.selectionEnd = null;
            conwayGame.stampMode.currentStamp = null;
            document.querySelectorAll('.conway-cell').forEach(cell => {
                cell.classList.remove('selecting');
            });
            speedContent.classList.remove('show');
            patternsContent.classList.remove('show');
        });
        gameControls.appendChild(stampButton);
        
        // Patterns dropdown
        const patternsDropdown = document.createElement('div');
        patternsDropdown.className = 'dropdown';
        const patternsButton = document.createElement('button');
        patternsButton.innerHTML = '🔲';
        patternsButton.title = 'Patterns';
        patternsButton.className = 'control-button';
        patternsDropdown.appendChild(patternsButton);
        
        const patternsContent = document.createElement('div');
        patternsContent.className = 'dropdown-content';
        
        Object.entries(conwayPatterns).forEach(([name, pattern]) => {
            const patternOption = document.createElement('button');
            const emoji = {
                'glider': '🚀',
                'lightweightSpaceship': '🛸',
                'gliderGun': '🔫',
                'pulsar': '✨',
                'beacon': '💡',
                'toad': '🐸'
            }[name] || '🔲';
            patternOption.innerHTML = `<span>${emoji}</span> ${name}`;
            patternOption.addEventListener('click', () => {
                conwayGame.selectedPattern = pattern;
                patternsButton.innerHTML = emoji;
                drawButton.classList.add('active');
                conwayGame.mode = 'draw';
                gridContainer.style.cursor = 'crosshair';
                const stampButton = document.querySelector('button[title="Stamp Tool"]');
                if (stampButton) {
                    stampButton.classList.remove('active');
                }
                conwayGame.stampMode.isActive = false;
                conwayGame.stampMode.currentStamp = null;
                conwayGame.stampMode.isSelecting = false;
                conwayGame.stampMode.selectionStart = null;
                conwayGame.stampMode.selectionEnd = null;
                document.querySelectorAll('.conway-cell').forEach(cell => {
                    cell.classList.remove('selecting');
                });
                patternsContent.classList.remove('show');
            });
            patternsContent.appendChild(patternOption);
        });
        
        patternsDropdown.appendChild(patternsContent);
        gameControls.appendChild(patternsDropdown);

        // Add click handler for patterns dropdown
        patternsButton.addEventListener('click', (e) => {
            e.stopPropagation();
            patternsContent.classList.toggle('show');
            speedContent.classList.remove('show');
        });
        
        // Play/Pause button
        const playPauseButton = document.createElement('button');
        playPauseButton.className = 'control-button';
        playPauseButton.innerHTML = '▶️';
        playPauseButton.title = 'Play/Pause';
        playPauseButton.addEventListener('click', () => {
            if (conwayGame.isSetup) {
                startConwaySimulation();
                playPauseButton.innerHTML = '⏸️';
            } else {
                if (conwayGame.interval) {
                    clearInterval(conwayGame.interval);
                    conwayGame.interval = null;
                    playPauseButton.innerHTML = '▶️';
                    conwayGame.isSetup = true;
                } else {
                    conwayGame.interval = setInterval(updateConwayGame, conwayGame.speed);
                    playPauseButton.innerHTML = '⏸️';
                    conwayGame.isSetup = false;
                }
            }
            speedContent.classList.remove('show');
            patternsContent.classList.remove('show');
        });
        gameControls.appendChild(playPauseButton);

        // Right zoom controls
        const rightZoomControls = document.createElement('div');
        rightZoomControls.className = 'zoom-controls right';
        const zoomInButton = document.createElement('button');
        zoomInButton.className = 'control-button';
        zoomInButton.innerHTML = '🔎';
        zoomInButton.title = 'Zoom In';
        zoomInButton.addEventListener('click', () => {
            conwayGame.zoomLevel = Math.min(conwayGame.maxZoom, conwayGame.zoomLevel + conwayGame.zoomStep);
            updateZoom();
        });
        rightZoomControls.appendChild(zoomInButton);
        gameControls.appendChild(rightZoomControls);

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!speedDropdown.contains(e.target)) {
                speedContent.classList.remove('show');
            }
            if (!patternsDropdown.contains(e.target)) {
                patternsContent.classList.remove('show');
            }
        });

        // Fix draw mode functionality
        gridContainer.addEventListener('mousedown', (e) => {
            if (conwayGame.mode === 'draw' && conwayGame.isSetup) {
                conwayGame.isMouseDown = true;
                const cell = e.target.closest('.conway-cell');
                if (cell) {
                    toggleCell(cell);
                }
            }
        });

        gridContainer.addEventListener('mousemove', (e) => {
            if (conwayGame.mode === 'draw' && conwayGame.isSetup && conwayGame.isMouseDown) {
                const cell = e.target.closest('.conway-cell');
                if (cell) {
                    toggleCell(cell);
                }
            }
        });

        document.addEventListener('mouseup', () => {
            conwayGame.isMouseDown = false;
        });

        // Add touch events for mobile
        gridContainer.addEventListener('touchstart', (e) => {
            if (conwayGame.mode === 'draw' && conwayGame.isSetup) {
                conwayGame.isMouseDown = true;
                const cell = document.elementFromPoint(
                    e.touches[0].clientX,
                    e.touches[0].clientY
                )?.closest('.conway-cell');
                if (cell) {
                    toggleCell(cell);
                }
            }
        });

        gridContainer.addEventListener('touchmove', (e) => {
            if (conwayGame.mode === 'draw' && conwayGame.isSetup && conwayGame.isMouseDown) {
                const cell = document.elementFromPoint(
                    e.touches[0].clientX,
                    e.touches[0].clientY
                )?.closest('.conway-cell');
                if (cell) {
                    toggleCell(cell);
                }
            }
        });

        document.addEventListener('touchend', () => {
            conwayGame.isMouseDown = false;
        });
        
        terminalHeader.appendChild(gameControls);
    }

    function startConwayGame() {
        conwayGame.isRunning = true;
        conwayGame.isSetup = true;
        conwayGame.grid = new Map();
        conwayGame.selectedCells.clear();
        conwayGame.isDragging = false;
        conwayGame.lastDraggedCell = null;
        conwayGame.selectedPattern = null;
        conwayGame.zoomLevel = 1;
        conwayGame.isPanning = false;
        conwayGame.panOffsetX = 0;
        conwayGame.panOffsetY = 0;
        conwayGame.mode = 'draw'; // Set draw mode as default
        conwayGame.isMouseDown = false;
        
        showConwayInstructions();
    }

    function updateZoom() {
        const gameGrid = document.querySelector('.conway-grid');
        if (gameGrid) {
            // Calculate new cell size based on zoom level
            const newCellSize = conwayGame.cellSize / conwayGame.zoomLevel;
            
            // Update CSS variable for cell size
            gameGrid.style.setProperty('--cell-size', `${newCellSize}px`);
            
            // Calculate how many cells should be visible based on the new cell size
            const visibleCols = Math.ceil(conwayGame.viewportWidth / newCellSize);
            const visibleRows = Math.ceil(conwayGame.viewportHeight / newCellSize);
            
            // Update grid template columns
            gameGrid.style.gridTemplateColumns = `repeat(${visibleCols}, 1fr)`;
            
            // Recreate the grid UI with new dimensions
            recreateGridUI();
        }
    }

    function recreateGridUI() {
        const gridContainer = document.querySelector('.conway-grid-container');
        const gameGrid = document.querySelector('.conway-grid');
        
        // Clear existing cells
        gameGrid.innerHTML = '';
        
        // Calculate how many cells should be visible based on the current cell size
        const cellSize = conwayGame.cellSize / conwayGame.zoomLevel;
        const visibleCols = Math.ceil(conwayGame.viewportWidth / cellSize);
        const visibleRows = Math.ceil(conwayGame.viewportHeight / cellSize);
        
        // Calculate the starting grid coordinates based on pan offset
        const startX = Math.floor(-conwayGame.panOffsetX / cellSize);
        const startY = Math.floor(-conwayGame.panOffsetY / cellSize);
        
        // Create cells
        for (let y = 0; y < visibleRows; y++) {
            for (let x = 0; x < visibleCols; x++) {
                const cell = document.createElement('div');
                cell.className = 'conway-cell';
                // Store the actual grid coordinates, not the viewport coordinates
                cell.dataset.x = startX + x;
                cell.dataset.y = startY + y;
                
                // Add event listeners for cell interaction
                cell.addEventListener('mousedown', (e) => {
                    if (conwayGame.isSetup) {
                        e.preventDefault();
                        conwayGame.isMouseDown = true;
                        if (conwayGame.mode === 'draw') {
                            if (conwayGame.selectedPattern) {
                                placePattern(parseInt(cell.dataset.x), parseInt(cell.dataset.y), conwayGame.selectedPattern);
                            } else {
                                toggleCell(cell);
                            }
                        } else if (conwayGame.mode === 'stamp') {
                            if (conwayGame.stampMode.currentStamp) {
                                // Paste the stamp
                                const x = parseInt(cell.dataset.x);
                                const y = parseInt(cell.dataset.y);
                                pasteStamp(x, y);
                            } else {
                                // Start selection
                                conwayGame.stampMode.isSelecting = true;
                                conwayGame.stampMode.selectionStart = {
                                    x: parseInt(cell.dataset.x),
                                    y: parseInt(cell.dataset.y)
                                };
                            }
                        }
                    }
                });

                // Add touch event handlers for mobile
                cell.addEventListener('touchstart', (e) => {
                    if (conwayGame.isSetup) {
                        e.preventDefault();
                        conwayGame.isMouseDown = true;
                        if (conwayGame.mode === 'draw') {
                            if (conwayGame.selectedPattern) {
                                placePattern(parseInt(cell.dataset.x), parseInt(cell.dataset.y), conwayGame.selectedPattern);
                            } else {
                                toggleCell(cell);
                            }
                        } else if (conwayGame.mode === 'stamp') {
                            if (conwayGame.stampMode.currentStamp) {
                                // Paste the stamp
                                const x = parseInt(cell.dataset.x);
                                const y = parseInt(cell.dataset.y);
                                pasteStamp(x, y);
                            } else {
                                // Start selection
                                conwayGame.stampMode.isSelecting = true;
                                conwayGame.stampMode.selectionStart = {
                                    x: parseInt(cell.dataset.x),
                                    y: parseInt(cell.dataset.y)
                                };
                            }
                        }
                    }
                });

                cell.addEventListener('mouseenter', () => {
                    if (conwayGame.isSetup && conwayGame.isMouseDown) {
                        if (conwayGame.mode === 'draw') {
                            if (conwayGame.selectedPattern) {
                                placePattern(parseInt(cell.dataset.x), parseInt(cell.dataset.y), conwayGame.selectedPattern);
                            } else {
                                toggleCell(cell);
                            }
                        } else if (conwayGame.mode === 'stamp' && conwayGame.stampMode.isSelecting) {
                            // Update selection end point
                            conwayGame.stampMode.selectionEnd = {
                                x: parseInt(cell.dataset.x),
                                y: parseInt(cell.dataset.y)
                            };
                            // Update selection visualization
                            updateStampSelection();
                        }
                    }
                });

                cell.addEventListener('touchmove', (e) => {
                    if (conwayGame.isSetup && conwayGame.isMouseDown) {
                        e.preventDefault();
                        const touch = e.touches[0];
                        const targetCell = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.conway-cell');
                        if (targetCell) {
                            if (conwayGame.mode === 'draw') {
                                if (conwayGame.selectedPattern) {
                                    placePattern(parseInt(targetCell.dataset.x), parseInt(targetCell.dataset.y), conwayGame.selectedPattern);
                                } else {
                                    toggleCell(targetCell);
                                }
                            } else if (conwayGame.mode === 'stamp' && conwayGame.stampMode.isSelecting) {
                                // Update selection end point
                                conwayGame.stampMode.selectionEnd = {
                                    x: parseInt(targetCell.dataset.x),
                                    y: parseInt(targetCell.dataset.y)
                                };
                                // Update selection visualization
                                updateStampSelection();
                            }
                        }
                    }
                });
                
                cell.addEventListener('mouseup', () => {
                    if (conwayGame.mode === 'stamp' && conwayGame.stampMode.isSelecting) {
                        // Finalize selection
                        conwayGame.stampMode.isSelecting = false;
                        if (conwayGame.stampMode.selectionStart && conwayGame.stampMode.selectionEnd) {
                            captureStamp();
                        } else {
                            // Clear selection if no valid selection was made
                            document.querySelectorAll('.conway-cell').forEach(cell => {
                                cell.classList.remove('selecting');
                            });
                        }
                    }
                    conwayGame.isMouseDown = false;
                });
                
                gameGrid.appendChild(cell);
            }
        }
        
        // Add mouseup event listener to document to handle mouse release anywhere
        document.addEventListener('mouseup', () => {
            if (conwayGame.mode === 'stamp' && conwayGame.stampMode.isSelecting) {
                // Finalize selection
                conwayGame.stampMode.isSelecting = false;
                if (conwayGame.stampMode.selectionStart && conwayGame.stampMode.selectionEnd) {
                    captureStamp();
                } else {
                    // Clear selection if no valid selection was made
                    document.querySelectorAll('.conway-cell').forEach(cell => {
                        cell.classList.remove('selecting');
                    });
                }
            }
            conwayGame.isMouseDown = false;
        });
        
        // Update grid styles
        gameGrid.style.gridTemplateColumns = `repeat(${visibleCols}, 1fr)`;
        
        // Re-render the game state
        renderConwayGame();
    }

    function renderConwayGame() {
        const cells = document.querySelectorAll('.conway-cell');
        cells.forEach(cell => {
            const x = parseInt(cell.dataset.x);
            const y = parseInt(cell.dataset.y);
            const cellKey = `${x},${y}`;
            
            if (conwayGame.grid.has(cellKey)) {
                cell.classList.add('alive');
            } else {
                cell.classList.remove('alive');
            }
        });
    }

    function toggleCell(cell) {
        if (conwayGame.isSetup && conwayGame.mode === 'draw' && conwayGame.isMouseDown) {
            const x = parseInt(cell.dataset.x);
            const y = parseInt(cell.dataset.y);
            const cellKey = `${x},${y}`;
            
            if (conwayGame.lastDraggedCell !== cellKey) {
                conwayGame.lastDraggedCell = cellKey;
                
                if (conwayGame.grid.has(cellKey)) {
                    conwayGame.grid.delete(cellKey);
                    cell.classList.remove('alive');
                } else {
                    conwayGame.grid.set(cellKey, true);
                    cell.classList.add('alive');
                }
            }
        }
    }

    function placePattern(x, y, pattern) {
        const startX = x - Math.floor(pattern[0].length / 2);
        const startY = y - Math.floor(pattern.length / 2);
        
        for (let py = 0; py < pattern.length; py++) {
            for (let px = 0; px < pattern[py].length; px++) {
                if (pattern[py][px]) {
                    const gridX = startX + px;
                    const gridY = startY + py;
                    const cellKey = `${gridX},${gridY}`;
                    conwayGame.grid.set(cellKey, true);
                    
                    // Update visible cell if it exists
                    const cell = document.querySelector(`.conway-cell[data-x="${gridX}"][data-y="${gridY}"]`);
                    if (cell) {
                        cell.classList.add('alive');
                    }
                }
            }
        }
    }

    function startConwaySimulation() {
        conwayGame.isSetup = false;
        
        // Start simulation
        conwayGame.interval = setInterval(updateConwayGame, conwayGame.speed);
        
        // Update play/pause button
        const playPauseButton = document.querySelector('.control-button[title="Play/Pause"]');
        if (playPauseButton) {
            playPauseButton.innerHTML = '⏸️';
        }
    }

    function updateConwayGame() {
        const newGrid = new Map();
        const cellsToCheck = new Set();
        
        // Collect all cells that need to be checked
        for (const [cellKey] of conwayGame.grid) {
            const [x, y] = cellKey.split(',').map(Number);
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    cellsToCheck.add(`${x + dx},${y + dy}`);
                }
            }
        }
        
        // Check each cell
        for (const cellKey of cellsToCheck) {
            const [x, y] = cellKey.split(',').map(Number);
            const neighbors = countNeighbors(x, y);
            const isAlive = conwayGame.grid.has(cellKey);
            
            if (isAlive && (neighbors === 2 || neighbors === 3)) {
                newGrid.set(cellKey, true);
            } else if (!isAlive && neighbors === 3) {
                newGrid.set(cellKey, true);
            }
        }
        
        conwayGame.grid = newGrid;
        renderConwayGame();
    }

    function countNeighbors(x, y) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const cellKey = `${x + dx},${y + dy}`;
                if (conwayGame.grid.has(cellKey)) {
                    count++;
                }
            }
        }
        return count;
    }

    function stopConwayGame() {
        conwayGame.isRunning = false;
        clearInterval(conwayGame.interval);
        conwayGame.interval = null;
        
        // Remove game container
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.remove();
        }
        
        // Remove game controls from header
        const gameControls = document.querySelector('.game-controls');
        if (gameControls) {
            gameControls.remove();
            const terminalHeader = document.querySelector('.terminal-header');
            if (terminalHeader) {
                terminalHeader.innerHTML = '<span class="terminal-title">🌞 gm</span>';
            }
        }
        
        // Show game over message
        const output = document.querySelector('.terminal-output');
        addLine(output, `> Game Over!`);
        addLine(output, `> Type 'conway' to play again or 'help' for other commands.`);
    }

    // Add these new functions for stamp tool functionality
    function updateStampSelection() {
        // Clear previous selection visual
        document.querySelectorAll('.conway-cell').forEach(cell => {
            cell.classList.remove('selecting');
        });

        if (!conwayGame.stampMode.selectionStart || !conwayGame.stampMode.selectionEnd) return;

        // Calculate selection bounds
        const minX = Math.min(conwayGame.stampMode.selectionStart.x, conwayGame.stampMode.selectionEnd.x);
        const maxX = Math.max(conwayGame.stampMode.selectionStart.x, conwayGame.stampMode.selectionEnd.x);
        const minY = Math.min(conwayGame.stampMode.selectionStart.y, conwayGame.stampMode.selectionEnd.y);
        const maxY = Math.max(conwayGame.stampMode.selectionStart.y, conwayGame.stampMode.selectionEnd.y);

        // Add selection visual to cells within bounds
        document.querySelectorAll('.conway-cell').forEach(cell => {
            const x = parseInt(cell.dataset.x);
            const y = parseInt(cell.dataset.y);
            if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
                cell.classList.add('selecting');
            }
        });
    }

    function captureStamp() {
        if (!conwayGame.stampMode.selectionStart || !conwayGame.stampMode.selectionEnd) return;

        // Calculate selection bounds
        const minX = Math.min(conwayGame.stampMode.selectionStart.x, conwayGame.stampMode.selectionEnd.x);
        const maxX = Math.max(conwayGame.stampMode.selectionStart.x, conwayGame.stampMode.selectionEnd.x);
        const minY = Math.min(conwayGame.stampMode.selectionStart.y, conwayGame.stampMode.selectionEnd.y);
        const maxY = Math.max(conwayGame.stampMode.selectionStart.y, conwayGame.stampMode.selectionEnd.y);

        // Collect live cells within selection
        const selectedCells = new Set();
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const cellKey = `${x},${y}`;
                if (conwayGame.grid.has(cellKey)) {
                    selectedCells.add(cellKey);
                }
            }
        }

        // If no cells selected, abort
        if (selectedCells.size === 0) {
            conwayGame.stampMode.currentStamp = null;
            return;
        }

        // Find the minimal bounds of the selected pattern
        let stampMinX = Infinity, stampMaxX = -Infinity;
        let stampMinY = Infinity, stampMaxY = -Infinity;

        selectedCells.forEach(cellKey => {
            const [x, y] = cellKey.split(',').map(Number);
            stampMinX = Math.min(stampMinX, x);
            stampMaxX = Math.max(stampMaxX, x);
            stampMinY = Math.min(stampMinY, y);
            stampMaxY = Math.max(stampMaxY, y);
        });

        // Create minimized stamp pattern
        const stampPattern = [];
        for (let y = stampMinY; y <= stampMaxY; y++) {
            const row = [];
            for (let x = stampMinX; x <= stampMaxX; x++) {
                row.push(selectedCells.has(`${x},${y}`) ? 1 : 0);
            }
            stampPattern.push(row);
        }

        // Store the stamp
        conwayGame.stampMode.currentStamp = stampPattern;

        // Clear selection visual
        document.querySelectorAll('.conway-cell').forEach(cell => {
            cell.classList.remove('selecting');
        });

        // Change stamp button icon to check mark temporarily
        const stampButton = document.querySelector('button[title="Stamp Tool"]');
        if (stampButton) {
            const originalIcon = stampButton.innerHTML;
            stampButton.innerHTML = '✓';
            // Add a temporary success style
            stampButton.style.backgroundColor = 'var(--primary-color)';
            stampButton.style.color = 'var(--background-color)';
            
            // Revert back after 2 seconds
            setTimeout(() => {
                stampButton.innerHTML = originalIcon;
                stampButton.style.backgroundColor = '';
                stampButton.style.color = '';
            }, 2000);
        }
    }

    function pasteStamp(centerX, centerY) {
        if (!conwayGame.stampMode.currentStamp) return;

        const pattern = conwayGame.stampMode.currentStamp;
        const offsetX = Math.floor(pattern[0].length / 2);
        const offsetY = Math.floor(pattern.length / 2);

        for (let y = 0; y < pattern.length; y++) {
            for (let x = 0; x < pattern[y].length; x++) {
                if (pattern[y][x]) {
                    const gridX = centerX - offsetX + x;
                    const gridY = centerY - offsetY + y;
                    const cellKey = `${gridX},${gridY}`;
                    conwayGame.grid.set(cellKey, true);
                }
            }
        }

        renderConwayGame();
    }

    // Add ESC key handler to cancel stamp mode
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (conwayGame.isRunning) {
                if (conwayGame.mode === 'stamp') {
                    // Clear stamp mode
                    conwayGame.stampMode.isSelecting = false;
                    conwayGame.stampMode.currentStamp = null;
                    conwayGame.stampMode.selectionStart = null;
                    conwayGame.stampMode.selectionEnd = null;
                    // Clear selection visual
                    document.querySelectorAll('.conway-cell').forEach(cell => {
                        cell.classList.remove('selecting');
                    });
                } else {
                    stopConwayGame();
                }
            }
        }
    });
}); 
class WheelOfFortune {
    constructor(classLetter) {
        this.canvas = document.getElementById('wheel-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.spinButton = document.getElementById('spin-button');
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.radius = Math.min(this.centerX, this.centerY) - 20;
        
        this.classData = {
            'А': {
                names: [
                    "Антон", "Мирослава", "Федя", "Маша", "Борис", "Егор", "Софья", "Месси", 
                    "Лиза", "Даник К.", "Сергей", "Иван Золо", "Олимпиадник", "Кирил М.", "Роман", "Санечка", 
                    "Аня", "Матвей С.", "Даник С.", "Кирил С.", "Матвей Ф.", "Паша", "Арина", 
                    "Влад", "Глеб", "Иван Б."
                ],
                colors: ['#BD4932', '#FFFAD5', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
            },
            'Б': {
                names: [
                    "Барановская Дарья", "Силич Елизавета", "Папельская Полина", "Анкудинова Ксения", "Бука Ксения", 
                    "Дятко Эмилия", "Язков Дмитрий", "Гайдук Никита", "Тарбаева Дарья", "Войтехович Глафира",
                    "Домашкевич Елизавета", "Ахремчик Юлиана", "Михницкая Вера", "Пацей Анна", "Колесник Николай",
                    "Курсевич Ян", "Севрюкова Анна", "Кунцевич Ирина", "Макаревич Валерия", "Жилко Анастасия",
                    "Веремейчик Всеволод", "Лозюк Марта", "Пискунович Эвелина"
                ],
                colors: ['#FFA07A', '#20B2AA', '#778899', '#9370DB', '#3CB371', '#FFD700', '#FF69B4', '#1E90FF']
            }
        };
        
        this.currentClass = classLetter || 'А';
        this.names = this.classData[this.currentClass].names;
        this.colors = this.classData[this.currentClass].colors;
        
        this.angle = 0;
        this.spinning = false;
        this.rotationSpeed = 0;
        this.friction = 0.985;
        this.minSpeed = 0.05;
        this.spinDuration = 300;
        this.showWinnerDuration = 3000;
        this.spinStartTime = 0;
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.drawWheel();
    }
    
    setupCanvas() {
        const container = document.getElementById('wheel-wrapper');
        const size = Math.min(container.clientWidth, container.clientHeight) * 0.8;
        
        this.canvas.width = size;
        this.canvas.height = size;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.radius = Math.min(this.centerX, this.centerY) - 20;
        
        this.drawWheel();
    }
    
    setupEventListeners() {
        this.spinButton.addEventListener('click', () => this.spin());
        
        window.addEventListener('resize', () => {
            setTimeout(() => this.setupCanvas(), 100);
        });
    }
    
    updateClass(classLetter) {
        this.currentClass = classLetter;
        this.names = this.classData[this.currentClass].names;
        this.colors = this.classData[this.currentClass].colors;
        this.angle = 0;
        this.drawWheel();
    }
    
    drawWheel() {
        const ctx = this.ctx;
        const segmentAngle = (2 * Math.PI) / this.names.length;
        
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.save();
        ctx.translate(this.centerX, this.centerY);
        ctx.rotate(this.angle);
        
        for (let i = 0; i < this.names.length; i++) {
            const startAngle = i * segmentAngle;
            const endAngle = (i + 1) * segmentAngle;
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, this.radius, startAngle, endAngle);
            ctx.closePath();
            
            ctx.fillStyle = this.colors[i % this.colors.length];
            ctx.fill();
            
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.save();
            ctx.rotate(startAngle + segmentAngle / 2);
            ctx.translate(this.radius * 0.75, 0);
            
            ctx.fillStyle = i % 2 === 0 ? '#FFFAD5' : '#401911';
            const fontSize = Math.max(12, this.radius * 0.07);
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const name = this.names[i];
            const maxWidth = this.radius * 0.4;
            
            if (ctx.measureText(name).width > maxWidth) {
                ctx.font = `bold ${fontSize * 0.7}px Arial`;
            }
            
            ctx.fillText(name, 0, 0);
            
            ctx.restore();
        }
        
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.12, 0, 2 * Math.PI);
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * 0.12);
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(1, '#B8860B');
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < this.names.length; i++) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(i * segmentAngle) * this.radius, 
                      Math.sin(i * segmentAngle) * this.radius);
            ctx.stroke();
        }
        
        ctx.restore();
        
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.radius + 5, 0, 2 * Math.PI);
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    
    spin() {
        if (this.spinning) return;
        
        this.spinning = true;
        this.spinStartTime = Date.now();
        this.rotationSpeed = 100 + Math.random() * 50;
        
        this.spinButton.style.display = 'none';
        
        this.animate();
    }
    
    animate() {
        if (!this.spinning) return;
        
        const currentTime = Date.now();
        const elapsed = currentTime - this.spinStartTime;
        
        if (elapsed < this.spinDuration) {
            this.angle += this.rotationSpeed * 0.05;
            this.rotationSpeed *= this.friction;
            this.drawWheel();
            requestAnimationFrame(() => this.animate());
        } else {
            this.rotationSpeed = 0;
            this.spinning = false;
            this.onSpinComplete();
        }
    }
    
    onSpinComplete() {
        const segmentAngle = (2 * Math.PI) / this.names.length;
        const normalizedAngle = (this.angle % (2 * Math.PI));
        const winningIndex = Math.floor(normalizedAngle / segmentAngle);
        
        const winnerName = this.names[winningIndex];
        const isWinner = winningIndex % 2 === 0;
        
        this.spinButton.style.display = 'block';
        
        this.showWinner(winnerName, isWinner);
    }
    
    showWinner(name, isWinner) {
        const winnerDiv = document.createElement('div');
        winnerDiv.className = 'winner-display';
        winnerDiv.innerHTML = `
            <div class="winner-content ${isWinner ? 'winner' : ''}">
                <div class="winner-crown">${isWinner ? '👑' : '🎯'}</div>
                <div class="winner-title">${isWinner ? 'ПОБЕДИТЕЛЬ!' : 'ВЫБРАНО:'}</div>
                <div class="winner-name">${name}</div>
                <div class="winner-message">${isWinner ? 'Поздравляем с победой! 🎉' : 'Удачи в следующий раз! ✨'}</div>
                <div class="winner-timer">Исчезнет через <span class="timer-count">2</span> сек</div>
            </div>
        `;
        
        document.getElementById('wheel-wrapper').appendChild(winnerDiv);
        
        setTimeout(() => {
            winnerDiv.classList.add('show');
        }, 100);

        let countdown = 2;
        const timerElement = winnerDiv.querySelector('.timer-count');
        
        const countdownInterval = setInterval(() => {
            countdown--;
            timerElement.textContent = countdown;
            if (countdown <= 0) {
                clearInterval(countdownInterval);
            }
        }, 1000);
        
        setTimeout(() => {
            winnerDiv.classList.remove('show');
            setTimeout(() => {
                if (winnerDiv.parentNode) {
                    winnerDiv.remove();
                }
            }, 500);
        }, this.showWinnerDuration);
    }
}

let wheel;

function initWheel(classLetter = 'А') {
    setTimeout(() => {
        if (!wheel) {
            wheel = new WheelOfFortune(classLetter);
        } else {
            wheel.updateClass(classLetter);
        }
    }, 100);
}

document.addEventListener('DOMContentLoaded', function() {
    const wheelModal = document.getElementById('wheel-modal');
    if (wheelModal) {
        wheelModal.addEventListener('click', function(e) {
            if (e.target === this) {
                const selectedClass = document.getElementById('selected-class').textContent;
                setTimeout(() => initWheel(selectedClass), 100);
            }
        });
    }
});

window.addEventListener('resize', function() {
    if (wheel) {
        setTimeout(() => wheel.setupCanvas(), 100);
    }
});

setTimeout(initWheel, 1000);
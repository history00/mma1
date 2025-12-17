
class TextbookViewer {
    constructor() {
        this.pdfDoc = null;
        this.pageNum = 1;
        this.pageRendering = false;
        this.pageNumPending = null;
        this.scale = 1.3;
        this.canvas = document.getElementById('pdf-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.isFullscreen = false;
        this.currentChapter = null;
        this.currentParagraph = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadTextbookContent();
        this.loadPDF();
        this.createFullscreenCloseButton();
    }
    
    setupEventListeners() {
        document.getElementById('prev-page').addEventListener('click', () => {
            this.previousPage();
        });
        
        document.getElementById('next-page').addEventListener('click', () => {
            this.nextPage();
        });
        
        document.getElementById('zoom-in').addEventListener('click', () => {
            this.zoomIn();
        });
        
        document.getElementById('zoom-out').addEventListener('click', () => {
            this.zoomOut();
        });
        
        document.getElementById('fit-width').addEventListener('click', () => {
            this.fitToWidth();
        });
        
        document.getElementById('fullscreen-toggle').addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        document.getElementById('textbook-search').addEventListener('input', (e) => {
            this.searchContent(e.target.value);
        });
        
        document.addEventListener('keydown', (e) => {
            if (this.isFullscreen) {
                if (e.key === 'Escape') {
                    this.toggleFullscreen();
                } else if (e.key === 'ArrowLeft') {
                    this.previousPage();
                } else if (e.key === 'ArrowRight') {
                    this.nextPage();
                }
            }
        });
        
        this.setupMouseWheelNavigation();
    }
    
    setupMouseWheelNavigation() {
        const pdfViewer = document.querySelector('.pdf-viewer');
        
        pdfViewer.addEventListener('wheel', (e) => {
            const isAtBottom = pdfViewer.scrollTop + pdfViewer.clientHeight >= pdfViewer.scrollHeight - 10;
            const isAtTop = pdfViewer.scrollTop <= 10;
            
            if (e.deltaY > 0 && isAtBottom) {
                e.preventDefault();
                this.nextPage();
            } else if (e.deltaY < 0 && isAtTop) {
                e.preventDefault();
                this.previousPage();
            }
        });
    }
    
    createFullscreenCloseButton() {
        const closeButton = document.createElement('button');
        closeButton.className = 'fullscreen-close-btn';
        closeButton.innerHTML = '✕';
        closeButton.addEventListener('click', () => {
            this.toggleFullscreen();
        });
        document.body.appendChild(closeButton);
    }
    
    toggleFullscreen() {
        if (!this.isFullscreen) {
            document.body.classList.add('fullscreen-mode');
            this.isFullscreen = true;
            
            setTimeout(() => {
                this.fitToWidth();
            }, 300);
            
        } else {
            document.body.classList.remove('fullscreen-mode');
            this.isFullscreen = false;
            
            setTimeout(() => {
                this.renderPage(this.pageNum);
            }, 300);
        }
    }
    
    loadTextbookContent() {
        const chapters = [
            {
                id: 'chapter1',
                title: 'Содержание',
                paragraphs: [
                    { 
                        page: 10, 
                        title: 'Как работать с учебным пособием', 
                        description: 'Полезно и познавательно'
                    },
                    { 
                        page: 12, 
                        title: 'Введение', 
                        description: 'окак'
                    }
                ]
            },
            {
                id: 'chapter2',
                title: 'Раздел I. БЕЛАРУСЬ И МИР В XIX — НАЧАЛЕ XX в.',
                paragraphs: [
                    { 
                        page: 24, 
                        title: '§ 1. XIX век в истории мира и Беларуси', 
                        description: 'Исторический контекст XIX века для Беларуси и мира' 
                    },
                    { 
                        page: 36, 
                        title: '§ 2. Промышленная революция', 
                        description: 'Технологический прорыв и его последствия' 
                    },
                    { 
                        page: 47, 
                        title: '§ 3. Революции и национальные движения в мире', 
                        description: 'Освободительные движения и социальные преобразования' 
                    },
                    { 
                        page: 58, 
                        title: '§ 4. Особенности развития стран Запада и Востока во второй половине XIX — начале ХХ в.', 
                        description: 'Сравнительный анализ развития различных регионов' 
                    },
                    { 
                        page: 68, 
                        title: '§ 5. Российская империя в XIX — начале XX в.', 
                        description: 'Развитие Российской империи в указанный период' 
                    },
                    { 
                        page: 81, 
                        title: '§ 6. Беларусь в составе Российской империи в начале ХІХ в.', 
                        description: 'Положение белорусских земель в имперской системе' 
                    },
                    { 
                        page: 90, 
                        title: '§ 7. Развитие сельского хозяйства Беларуси в ХІХ — начале ХХ в.', 
                        description: 'Аграрные преобразования и сельская экономика' 
                    },
                    { 
                        page: 101, 
                        title: '§ 8. Беларусь на пути к индустриальному обществу', 
                        description: 'Индустриализация белорусских земель' 
                    },
                    { 
                        page: 111, 
                        title: '§ 9. Социальные последствия промышленной революции в Беларуси', 
                        description: 'Изменения в социальной структуре общества' 
                    },
                    { 
                        page: 120, 
                        title: '§ 10. Общественно-политические движения в Беларуси в ХІХ в.', 
                        description: 'Политическая активность и общественные движения' 
                    },
                    { 
                        page: 132, 
                        title: '§ 11. Общественно-политическая борьба в Беларуси в начале ХХ в.', 
                        description: 'Политическая борьба в начале нового столетия' 
                    },
                    { 
                        page: 141, 
                        title: '§ 12. От белорусской народности к белорусской нации', 
                        description: 'Формирование национального самосознания' 
                    },
                    { 
                        page: 149, 
                        title: '§ 13. Белорусское общество в начале ХХ в.', 
                        description: 'Социальная структура и общественные отношения' 
                    },
                    { 
                        page: 156, 
                        title: '§ 14. Развитие культуры Беларуси в XIX — начале ХХ в.', 
                        description: 'Культурные достижения и художественная жизнь' 
                    },
                    { 
                        page: 167, 
                        title: '§ 15. Первая мировая война как рубежный период мировой истории', 
                        description: 'Глобальные изменения после мировой войны' 
                    },
                    { 
                        page: 178, 
                        title: '§ 16. Беларусь в годы Первой мировой войны', 
                        description: 'Белорусские земли в период военных действий' 
                    },
                    { 
                        page: 188, 
                        title: 'Практикум по разделу «Беларусь и мир в XIX — начале ХХ в.»', 
                        description: 'Практические задания и упражнения' 
                    },
                    { 
                        page: 194, 
                        title: 'Обобщение по разделу «Беларусь и мир в XIX — начале XX в.»', 
                        description: 'Итоги и выводы по разделу' 
                    },
                    { 
                        page: 199, 
                        title: 'Наш край в XIX — начале XX в.', 
                        description: 'Локальная история региона' 
                    }
                ]
            },
            {
                id: 'chapter3', 
                title: 'Раздел II. БЕЛАРУСЬ И МИР В 1917–1945 гг.',
                paragraphs: [
                    { 
                        page: 202, 
                        title: '§ 17. Тенденции исторического развития в 1917–1945 гг.', 
                        description: 'Основные направления развития в межвоенный период' 
                    },
                    { 
                        page: 214, 
                        title: '§ 18. Беларусь в Февральской и Октябрьской революциях 1917 г.', 
                        description: 'Революционные события и их влияние на Беларусь' 
                    },
                    { 
                        page: 225, 
                        title: '§ 19. Страны Запада в межвоенный период', 
                        description: 'Развитие западных государств между войнами' 
                    },
                    { 
                        page: 237, 
                        title: '§ 20. Страны Азии, Африки и Латинской Америки в межвоенный период', 
                        description: 'Положение стран глобального Юга' 
                    },
                    { 
                        page: 249, 
                        title: '§ 21. Советское государственное строительство в 1917–1939 гг.', 
                        description: 'Формирование советской государственности' 
                    },
                    { 
                        page: 264, 
                        title: '§ 22. Национально-государственное строительство в Беларуси', 
                        description: 'Создание белорусской государственности' 
                    },
                    { 
                        page: 275, 
                        title: '§ 23. Социально-экономическое развитие БССР в 1920–1930-е гг.', 
                        description: 'Экономика и социальная сфера БССР' 
                    },
                    { 
                        page: 284, 
                        title: '§ 24. Западная Беларусь в 1921–1939 гг.', 
                        description: 'Положение западнобелорусских земель' 
                    },
                    { 
                        page: 294, 
                        title: '§ 25. Развитие культуры Советской Беларуси в межвоенный период', 
                        description: 'Культурная жизнь в БССР между войнами' 
                    },
                    { 
                        page: 305, 
                        title: '§ 26. Международное положение накануне Второй мировой войны', 
                        description: 'Геополитическая ситуация перед войной' 
                    }
                ]
            },
            {
                id: 'chapter4',
                title: 'Дополнительные материалы',
                paragraphs: [
                    { 
                        page: 314, 
                        title: 'Указатель терминов и понятий', 
                        description: 'Алфавитный указатель ключевых терминов' 
                    },
                    { 
                        page: 315, 
                        title: 'Хронологическая таблица (конец XVIII в. — 1939 г.)', 
                        description: 'Основные исторические события и даты' 
                    }
                ]
            }
        ];
        
        this.renderChaptersList(chapters);
        this.chaptersData = chapters;
    }
    
    renderChaptersList(chapters) {
        const container = document.getElementById('chapters-list');
        container.innerHTML = '';
        
        chapters.forEach((chapter, chapterIndex) => {
            const chapterElement = document.createElement('div');
            chapterElement.className = 'chapter fade-in';
            chapterElement.style.animationDelay = `${chapterIndex * 0.1}s`;
            
            chapterElement.innerHTML = `
                <div class="chapter-header" onclick="textbookViewer.toggleChapter(this)">
                    ${chapter.title}
                </div>
                <div class="paragraphs-list">
                    ${chapter.paragraphs.map((paragraph, paraIndex) => `
                        <a class="paragraph-item" href="#" data-page="${paragraph.page}" 
                           data-chapter="${chapterIndex}" data-paragraph="${paraIndex}">
                            <div class="paragraph-title">${paragraph.title}</div>
                            <div class="paragraph-description">${paragraph.description}</div>
                            <div class="paragraph-page">стр. ${paragraph.page}</div>
                        </a>
                    `).join('')}
                </div>
            `;
            
            container.appendChild(chapterElement);
        });
        
        document.querySelectorAll('.paragraph-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(item.getAttribute('data-page'));
                const chapterIndex = parseInt(item.getAttribute('data-chapter'));
                const paragraphIndex = parseInt(item.getAttribute('data-paragraph'));
                
                this.goToPage(page);
                this.setActiveParagraph(chapterIndex, paragraphIndex);
            });
        });
        
        const firstChapter = document.querySelector('.chapter');
        if (firstChapter) {
            firstChapter.querySelector('.paragraphs-list').style.display = 'flex';
        }
    }
    
    toggleChapter(header) {
        const chapter = header.parentElement;
        const paragraphs = chapter.querySelector('.paragraphs-list');
        
        header.classList.toggle('collapsed');
        
        if (paragraphs.style.display === 'none') {
            paragraphs.style.display = 'flex';
            paragraphs.classList.add('fade-in');
        } else {
            paragraphs.style.display = 'none';
        }
    }
    
    setActiveParagraph(chapterIndex, paragraphIndex) {
        document.querySelectorAll('.paragraph-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`[data-chapter="${chapterIndex}"][data-paragraph="${paragraphIndex}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
            
            this.currentChapter = chapterIndex;
            this.currentParagraph = paragraphIndex;
        }
    }
    
    async loadPDF() {
        try {
            document.getElementById('pdf-loading').style.display = 'block';
            
            const pdfPath = 'textbook.pdf';
            
            const loadingTask = pdfjsLib.getDocument(pdfPath);
            this.pdfDoc = await loadingTask.promise;
            
            document.getElementById('page-count').textContent = this.pdfDoc.numPages;
            document.getElementById('pdf-loading').style.display = 'none';
            
            this.renderPage(this.pageNum);
            
        } catch (error) {
            console.error('Ошибка загрузки PDF:', error);
            document.getElementById('pdf-loading').innerHTML = `
                <div style="color: var(--error); text-align: center;">
                    <p style="font-size: 1.2rem; margin-bottom: 1rem;">❌ Не удалось загрузить учебник</p>
                    <p style="font-size: 0.9rem; opacity: 0.8;">
                        Убедитесь, что файл <strong>textbook.pdf</strong> находится в папке с сайтом
                    </p>
                    <p style="font-size: 0.8rem; opacity: 0.6; margin-top: 1rem;">
                        Просто переименуйте ваш PDF файл в "textbook.pdf" и положите в ту же папку, где index.html
                    </p>
                </div>
            `;
        }
    }
    
    renderPage(num) {
        this.pageRendering = true;
        
        this.pdfDoc.getPage(num).then((page) => {
            const viewport = page.getViewport({ scale: this.scale });
            
            this.canvas.height = viewport.height;
            this.canvas.width = viewport.width;
            
            const renderContext = {
                canvasContext: this.ctx,
                viewport: viewport
            };
            
            const renderTask = page.render(renderContext);
            
            renderTask.promise.then(() => {
                this.pageRendering = false;
                
                if (this.pageNumPending !== null) {
                    this.renderPage(this.pageNumPending);
                    this.pageNumPending = null;
                }
                
                document.getElementById('page-num').textContent = num;
                this.pageNum = num;
                
                this.updateActiveParagraphByPage(num);
            });
        });
    }
    
    updateActiveParagraphByPage(pageNum) {
        for (let chapterIndex = 0; chapterIndex < this.chaptersData.length; chapterIndex++) {
            const chapter = this.chaptersData[chapterIndex];
            for (let paragraphIndex = 0; paragraphIndex < chapter.paragraphs.length; paragraphIndex++) {
                const paragraph = chapter.paragraphs[paragraphIndex];
                if (paragraph.page === pageNum) {
                    this.setActiveParagraph(chapterIndex, paragraphIndex);
                    return;
                }
            }
        }
    }
    
    queueRenderPage(num) {
        if (this.pageRendering) {
            this.pageNumPending = num;
        } else {
            this.renderPage(num);
        }
    }
    
    previousPage() {
        if (this.pageNum <= 1) return;
        this.pageNum--;
        this.queueRenderPage(this.pageNum);
    }
    
    nextPage() {
        if (this.pageNum >= this.pdfDoc.numPages) return;
        this.pageNum++;
        this.queueRenderPage(this.pageNum);
    }
    
    goToPage(num) {
        if (num < 1 || num > this.pdfDoc.numPages) return;
        this.pageNum = num;
        this.queueRenderPage(this.pageNum);
    }
    
    zoomIn() {
        this.scale += 0.2;
        this.queueRenderPage(this.pageNum);
    }
    
    zoomOut() {
        if (this.scale > 0.5) {
            this.scale -= 0.2;
            this.queueRenderPage(this.pageNum);
        }
    }
    
    fitToWidth() {
        const container = document.querySelector('.pdf-viewer');
        const containerWidth = container.clientWidth - 40;
        this.scale = containerWidth / 612;
        this.queueRenderPage(this.pageNum);
    }
    
    searchContent(query) {
        if (query.length < 2) {
            document.querySelectorAll('.paragraph-item').forEach(item => {
                item.style.backgroundColor = '';
            });
            return;
        }
        
        const items = document.querySelectorAll('.paragraph-item');
        let found = false;
        
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(query.toLowerCase())) {
                item.style.backgroundColor = 'rgba(212, 175, 55, 0.3)';
                found = true;
                
                const chapter = item.closest('.chapter');
                const paragraphsList = chapter.querySelector('.paragraphs-list');
                const chapterHeader = chapter.querySelector('.chapter-header');
                
                paragraphsList.style.display = 'flex';
                chapterHeader.classList.remove('collapsed');
                
            } else {
                item.style.backgroundColor = '';
            }
        });
        
        if (!found) {
            this.showNotification('Ничего не найдено', 'info');
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }
}

let textbookViewer;

document.addEventListener('DOMContentLoaded', function() {
    textbookViewer = new TextbookViewer();
    
    function createParticles() {
        const container = document.getElementById('particles');
        const particleCount = 30;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = Math.random() * 4 + 1;
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            const duration = Math.random() * 20 + 10;
            const delay = Math.random() * 5;
            
            particle.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${posX}%;
                top: ${posY}%;
                animation-duration: ${duration}s;
                animation-delay: ${delay}s;
                opacity: ${Math.random() * 0.3 + 0.1};
            `;
            
            container.appendChild(particle);
        }
    }
    
    createParticles();
    
    window.addEventListener('resize', () => {
        if (textbookViewer && textbookViewer.pdfDoc) {
            setTimeout(() => {
                textbookViewer.renderPage(textbookViewer.pageNum);
            }, 100);
        }
    });
});

function showClassSelector() {
    document.getElementById('class-selector-modal').style.display = 'block';
}

function closeClassSelector() {
    document.getElementById('class-selector-modal').style.display = 'none';
}

function selectClass(className) {
    document.getElementById('selected-class').textContent = className;
    closeClassSelector();
    showWheelModal();
}

function showWheelModal() {
    document.getElementById('wheel-modal').style.display = 'block';
    setTimeout(() => {
        if (typeof initWheel === 'function') {
            initWheel();
        }
    }, 300);
}

function closeWheelModal() {
    document.getElementById('wheel-modal').style.display = 'none';
}

window.onclick = function(event) {
    const classModal = document.getElementById('class-selector-modal');
    const wheelModal = document.getElementById('wheel-modal');
    
    if (event.target === classModal) {
        closeClassSelector();
    }
    if (event.target === wheelModal) {
        closeWheelModal();
    }
}
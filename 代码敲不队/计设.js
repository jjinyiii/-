// ==================== 词云数据 ====================
const hotDestinations = [
    { name: '北京', freq: 1, count: 12580 },
    { name: '上海', freq: 1, count: 11230 },
    { name: '杭州', freq: 2, count: 9860 },
    { name: '西安', freq: 2, count: 8950 },
    { name: '成都', freq: 2, count: 8720 },
    { name: '三亚', freq: 3, count: 7650 },
    { name: '云南', freq: 3, count: 7420 },
    { name: '厦门', freq: 3, count: 6980 },
    { name: '重庆', freq: 3, count: 6540 },
    { name: '青岛', freq: 4, count: 5230 },
    { name: '桂林', freq: 4, count: 4890 },
    { name: '西藏', freq: 4, count: 4560 },
    { name: '新疆', freq: 4, count: 4320 },
    { name: '张家界', freq: 5, count: 3890 },
    { name: '苏州', freq: 5, count: 3650 },
    { name: '丽江', freq: 5, count: 3420 },
    { name: '大理', freq: 5, count: 3180 },
    { name: '长沙', freq: 5, count: 2950 }
];

// 渲染圆形词云（螺旋布局）
function renderWordCloud() {
    const wordCloudContainer = document.getElementById('wordCloud');
    if (!wordCloudContainer) return;
    
    wordCloudContainer.innerHTML = '';
    
    const containerWidth = wordCloudContainer.offsetWidth;
    const containerHeight = wordCloudContainer.offsetHeight;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    
    // 按频率排序，高频词放在中心
    const sortedWords = [...hotDestinations].sort((a, b) => a.freq - b.freq);
    
    // 已放置的词语位置记录
    const placedWords = [];
    
    sortedWords.forEach((dest, index) => {
        const wordItem = document.createElement('span');
        wordItem.className = `word-item freq-${dest.freq}`;
        wordItem.textContent = dest.name;
        wordItem.title = `搜索次数: ${dest.count.toLocaleString()}`;
        
        // 先临时添加到DOM以获取尺寸
        wordItem.style.visibility = 'hidden';
        wordItem.style.position = 'absolute';
        wordCloudContainer.appendChild(wordItem);
        
        const wordWidth = wordItem.offsetWidth;
        const wordHeight = wordItem.offsetHeight;
        
        // 螺旋参数
        let angle = 0;
        let radius = 0;
        const angleStep = 0.5; // 角度增量
        const radiusStep = 8;  // 半径增量
        let x = centerX;
        let y = centerY;
        let maxIterations = 500;
        let placed = false;
        
        // 根据频率调整起始半径
        const startRadius = dest.freq === 1 ? 0 : (dest.freq - 1) * 40;
        radius = startRadius;
        
        while (!placed && maxIterations > 0) {
            // 计算位置（添加随机偏移使布局更自然）
            const randomOffset = (Math.random() - 0.5) * 20;
            x = centerX + radius * Math.cos(angle) + randomOffset;
            y = centerY + radius * Math.sin(angle) * 0.8 + randomOffset; // 0.8使椭圆更美观
            
            // 检查是否与已放置的词语重叠
            let overlap = false;
            for (const placedWord of placedWords) {
                const dx = x - placedWord.x;
                const dy = y - placedWord.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = (wordWidth + placedWord.width) / 2 + 8;
                
                if (distance < minDistance) {
                    overlap = true;
                    break;
                }
            }
            
            // 检查是否在圆形边界内
            const distFromCenter = Math.sqrt(
                Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
            );
            
            if (!overlap && distFromCenter < (containerWidth / 2 - wordWidth / 2 - 10)) {
                placed = true;
            } else {
                angle += angleStep;
                radius += radiusStep * angleStep / (2 * Math.PI);
            }
            
            maxIterations--;
        }
        
        // 如果没找到合适位置，放在随机位置
        if (!placed) {
            const randomAngle = Math.random() * 2 * Math.PI;
            const randomRadius = Math.random() * (containerWidth / 2 - 60);
            x = centerX + randomRadius * Math.cos(randomAngle);
            y = centerY + randomRadius * Math.sin(randomAngle) * 0.8;
        }
        
        // 设置最终位置
        wordItem.style.left = `${x - wordWidth / 2}px`;
        wordItem.style.top = `${y - wordHeight / 2}px`;
        wordItem.style.visibility = 'visible';
        
        // 记录位置
        placedWords.push({
            x: x,
            y: y,
            width: wordWidth,
            height: wordHeight
        });
        
        // 点击词云进行搜索
        wordItem.addEventListener('click', function() {
            const searchInput = document.querySelector('.search-box input');
            if (searchInput) {
                searchInput.value = dest.name;
                searchInput.focus();
                // 添加点击动画
                this.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            }
        });
    });
}

// 窗口大小改变时重新渲染词云
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        if (document.getElementById('home').classList.contains('active')) {
            renderWordCloud();
        }
    }, 250);
});

// ==================== 导航功能 ====================
document.addEventListener('DOMContentLoaded', function() {
    // 初始化词云
    renderWordCloud();
    
    // 初始化登录状态
    checkLoginStatus();
    // 获取所有导航链接和页面部分
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const navItems = document.querySelectorAll('.nav-item');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    // 导航点击事件
    navLinks.forEach((link, index) => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 获取目标部分的ID
            const targetId = this.getAttribute('href').substring(1);
            
            // 切换活动状态
            switchSection(targetId);
            
            // 移动端关闭菜单
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('active');
            }
        });
    });

    // 切换页面部分的函数
    function switchSection(sectionId) {
        // 移除所有活动状态
        navItems.forEach(item => item.classList.remove('active'));
        sections.forEach(section => section.classList.remove('active'));
        
        // 添加新的活动状态
        const targetSection = document.getElementById(sectionId);
        const targetNavItem = document.querySelector(`.nav-menu a[href="#${sectionId}"]`);
        
        if (targetSection) {
            targetSection.classList.add('active');
        }
        if (targetNavItem && targetNavItem.parentElement) {
            targetNavItem.parentElement.classList.add('active');
        }
        
        // 滚动到顶部
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // 暴露到全局
    window.switchSection = switchSection;

    // 移动端菜单切换
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // ==================== 搜索功能 ====================
    const searchInput = document.querySelector('.search-box input');
    const searchBtn = document.querySelector('.search-btn');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', function() {
            const query = searchInput.value.trim();
            if (query) {
                console.log('搜索:', query);
                // TODO: 实现搜索逻辑
                alert(`正在搜索: ${query}`);
            }
        });

        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }

    // ==================== AI 聊天功能 ====================
    const chatInput = document.querySelector('.chat-input');
    const sendBtn = document.querySelector('.send-btn');
    const chatMessages = document.querySelector('.chat-messages');

    if (sendBtn && chatInput) {
        sendBtn.addEventListener('click', function() {
            sendMessage();
        });

        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // 添加用户消息
        addMessage(message, 'user');
        chatInput.value = '';

        // 模拟AI回复
        setTimeout(() => {
            const aiResponse = generateAIResponse(message);
            addMessage(aiResponse, 'ai');
        }, 1000);
    }

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = sender === 'ai' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = `<p>${escapeHtml(text)}</p>`;
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function generateAIResponse(userMessage) {
        // 简单的关键词回复逻辑
        const keywords = {
            '北京': '北京是个绝佳的选择！您可以游览故宫、长城、颐和园等著名景点。建议安排3-4天的行程。',
            '上海': '上海是现代化的国际大都市，外滩、东方明珠、迪士尼乐园都是必去的地方！',
            '云南': '云南风景如画，大理、丽江、香格里拉都是非常受欢迎的目的地。',
            '预算': '我可以帮您规划不同预算的旅行方案。请告诉我您的预算范围和出行天数。',
            '美食': '各地都有特色美食，我可以根据您的目的地推荐当地最好的餐厅和特色小吃。',
            '酒店': '我可以帮您查找性价比高的酒店，或者推荐特色民宿。请告诉我您的偏好。'
        };

        for (const [key, response] of Object.entries(keywords)) {
            if (userMessage.includes(key)) {
                return response;
            }
        }

        const defaultResponses = [
            '这是一个很好的旅行想法！让我为您规划一下。',
            '收到您的需求，我可以帮您制定详细的旅行计划。',
            '我很乐意为您推荐合适的行程路线，请告诉我更多细节。',
            '旅行规划需要考虑很多因素，让我们一步步来。'
        ];

        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ==================== 社区发布功能 ====================
    const postInput = document.querySelector('.post-input');
    const postBtn = document.querySelector('.post-btn');
    const postsList = document.querySelector('.posts-list');

    if (postBtn && postInput) {
        postBtn.addEventListener('click', function() {
            createPost();
        });

        postInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                createPost();
            }
        });
    }

    function createPost() {
        const content = postInput.value.trim();
        if (!content) return;

        const postCard = document.createElement('div');
        postCard.className = 'post-card';
        postCard.innerHTML = `
            <div class="post-header">
                <div class="user-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="user-info">
                    <h4>我</h4>
                    <span>刚刚 · 发布</span>
                </div>
            </div>
            <div class="post-content">
                <p>${escapeHtml(content)}</p>
            </div>
            <div class="post-actions">
                <button class="action-btn"><i class="far fa-heart"></i> 0</button>
                <button class="action-btn"><i class="far fa-comment"></i> 0</button>
                <button class="action-btn"><i class="far fa-share-square"></i> 分享</button>
            </div>
        `;

        postsList.insertBefore(postCard, postsList.firstChild);
        postInput.value = '';
    }

    // ==================== 点赞功能 ====================
    document.addEventListener('click', function(e) {
        const actionBtn = e.target.closest('.action-btn');
        if (actionBtn && actionBtn.querySelector('.fa-heart')) {
            const icon = actionBtn.querySelector('.fa-heart');
            const text = actionBtn.textContent;
            const count = parseInt(text) || 0;
            
            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                icon.style.color = '#ff4757';
                actionBtn.innerHTML = `<i class="fas fa-heart" style="color: #ff4757;"></i> ${count + 1}`;
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                icon.style.color = '';
                actionBtn.innerHTML = `<i class="far fa-heart"></i> ${Math.max(0, count - 1)}`;
            }
        }
    });

    // ==================== 规划卡片点击 ====================
    const planCards = document.querySelectorAll('.plan-card');
    planCards.forEach(card => {
        const detailBtn = card.querySelector('.btn-primary');
        if (detailBtn) {
            detailBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const planData = getPlanData(card);
                openPlanDetail(planData);
            });
        }
    });

    // 获取规划卡片数据
    function getPlanData(card) {
        const title = card.querySelector('h3').textContent;
        const badge = card.querySelector('.plan-badge')?.textContent || '';
        const details = card.querySelector('.plan-details').textContent;
        const desc = card.querySelector('p').textContent;
        const destination = card.dataset.destination;
        
        // 解析天数和价格
        const daysMatch = details.match(/(\d+)天/);
        const priceMatch = details.match(/(\d+)起/);
        
        return {
            title,
            badge,
            destination,
            days: daysMatch ? daysMatch[1] + '天' + (daysMatch[1] - 1) + '晚' : '',
            price: priceMatch ? priceMatch[1] + '起' : '',
            description: desc
        };
    }

    // ==================== 目的地卡片点击 ====================
    const destinationCards = document.querySelectorAll('.destination-card');
    destinationCards.forEach(card => {
        card.addEventListener('click', function() {
            const destName = this.dataset.destination;
            if (destName && window.switchSection) {
                // 跳转到官方规划页面
                window.switchSection('plan');
                // 筛选对应目的地的规划
                setTimeout(() => {
                    filterPlansByDestination(destName);
                }, 100);
            }
        });
    });

    // ==================== 规划筛选功能 ====================
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            
            // 更新按钮状态
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 筛选规划卡片
            filterPlansByDestination(filter);
        });
    });
    
    // 筛选栏目收束功能
    const filterToggle = document.getElementById('filterToggle');
    const filterContent = document.querySelector('.filter-content');
    
    if (filterToggle && filterContent) {
        filterToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            filterContent.classList.toggle('collapsed');
        });
        
        // 默认展开
        filterContent.classList.remove('collapsed');
    }
    
    // 获取位置按钮功能
    const getLocationBtn = document.getElementById('getLocationBtn');
    if (getLocationBtn) {
        getLocationBtn.addEventListener('click', function() {
            if (navigator.geolocation) {
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 定位中...';
                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        const latitude = position.coords.latitude;
                        const longitude = position.coords.longitude;
                        getLocationBtn.innerHTML = '<i class="fas fa-location-dot"></i> 附近';
                        showToast('success', '定位成功', '已为您筛选附近的旅游规划');
                        // 这里可以根据经纬度筛选附近的规划
                        filterPlansByDistance(latitude, longitude);
                    },
                    function(error) {
                        getLocationBtn.innerHTML = '<i class="fas fa-location-dot"></i> 附近';
                        showToast('error', '定位失败', '无法获取您的位置信息');
                    }
                );
            } else {
                showToast('error', '不支持定位', '您的浏览器不支持地理定位功能');
            }
        });
    }
    
    // 根据距离筛选规划
    function filterPlansByDistance(latitude, longitude) {
        const planCards = document.querySelectorAll('.plan-card');
        let visibleCount = 0;
        
        // 模拟距离计算（实际项目中应该使用真实的地理位置数据）
        planCards.forEach(card => {
            // 这里只是模拟，实际应该根据卡片的真实位置计算距离
            const randomDistance = Math.random() * 150; // 模拟0-150km的距离
            
            if (randomDistance <= 50) { // 显示50km内的规划
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });
        
        // 显示/隐藏空提示
        let emptyTip = document.getElementById('plansEmptyTip');
        if (visibleCount === 0) {
            if (!emptyTip) {
                emptyTip = document.createElement('div');
                emptyTip.id = 'plansEmptyTip';
                emptyTip.className = 'plans-empty-tip';
                emptyTip.innerHTML = `
                    <i class="fas fa-search"></i>
                    <p>附近暂无旅游规划</p>
                    <span>试试其他筛选条件...</span>
                `;
                document.getElementById('plansContainer').appendChild(emptyTip);
            } else {
                emptyTip.querySelector('p').textContent = '附近暂无旅游规划';
                emptyTip.style.display = 'block';
            }
        } else if (emptyTip) {
            emptyTip.style.display = 'none';
        }
    }

    // 根据目的地筛选规划
    function filterPlansByDestination(destination) {
        const planCards = document.querySelectorAll('.plan-card');
        let visibleCount = 0;
        
        planCards.forEach(card => {
            if (destination === 'all') {
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                const cardDestination = card.dataset.destination;
                if (cardDestination === destination) {
                    card.classList.remove('hidden');
                    visibleCount++;
                } else {
                    card.classList.add('hidden');
                }
            }
        });
        
        // 同步更新筛选按钮状态
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === destination) {
                btn.classList.add('active');
            }
        });
        
        // 显示/隐藏空提示
        let emptyTip = document.getElementById('plansEmptyTip');
        if (visibleCount === 0) {
            if (!emptyTip) {
                emptyTip = document.createElement('div');
                emptyTip.id = 'plansEmptyTip';
                emptyTip.className = 'plans-empty-tip';
                emptyTip.innerHTML = `
                    <i class="fas fa-search"></i>
                    <p>暂无 "${destination}" 的相关规划</p>
                    <span>敬请期待更多路线...</span>
                `;
                document.getElementById('plansContainer').appendChild(emptyTip);
            } else {
                emptyTip.querySelector('p').textContent = `暂无 "${destination}" 的相关规划`;
                emptyTip.style.display = 'block';
            }
        } else if (emptyTip) {
            emptyTip.style.display = 'none';
        }
    }
    
    // 暴露到全局
    window.filterPlansByDestination = filterPlansByDestination;

    // ==================== 个人中心菜单 ====================
    const menuItems = document.querySelectorAll('.profile-menu .menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetTab = this.dataset.tab;
            switchProfileTab(targetTab);
        });
    });

    // 切换个人中心标签页
    function switchProfileTab(tabName) {
        // 更新菜单激活状态
        menuItems.forEach(mi => {
            mi.classList.remove('active');
            if (mi.dataset.tab === tabName) {
                mi.classList.add('active');
            }
        });
        
        // 切换内容区域
        const sections = document.querySelectorAll('.profile-section');
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.dataset.section === tabName) {
                section.classList.add('active');
            }
        });
    }

    // 暴露到全局，供下拉菜单使用
    window.switchProfileTab = switchProfileTab;
    
    // ==================== 下拉菜单导航 ====================
    const dropdownItems = document.querySelectorAll('.user-dropdown .dropdown-item[href^="#profile"]');
    dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetTab = this.dataset.tab;
            
            // 先切换到目标页面
            if (targetId && window.switchSection) {
                window.switchSection(targetId);
            }
            
            // 如果有指定标签，切换到对应标签；否则默认显示第一个标签
            if (window.switchProfileTab) {
                setTimeout(() => {
                    if (targetTab) {
                        window.switchProfileTab(targetTab);
                    } else {
                        // 个人中心默认显示我的足迹
                        window.switchProfileTab('footprints');
                    }
                }, 50);
            }
            
            // 关闭下拉菜单（通过移除hover状态）
            document.body.click();
        });
    });

    // ==================== 页面滚动效果 ====================
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });

    // ==================== 平滑滚动 ====================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // ==================== 初始化 ====================
    console.log('旅途网站已加载完成！');
});

// ==================== 登录注册功能 ====================
const authModal = document.getElementById('authModal');
const loginBtn = document.getElementById('loginBtn');
const closeModal = document.getElementById('closeModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const switchForms = document.querySelectorAll('.switch-form');
const userMenu = document.getElementById('userMenu');
const logoutBtn = document.getElementById('logoutBtn');

// 打开登录模态框
if (loginBtn) {
    loginBtn.addEventListener('click', function() {
        openModal();
    });
}

// 关闭模态框
if (closeModal) {
    closeModal.addEventListener('click', closeAuthModal);
}

if (authModal) {
    authModal.addEventListener('click', function(e) {
        if (e.target === authModal) {
            closeAuthModal();
        }
    });
}

function openModal() {
    authModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
    authModal.classList.remove('active');
    document.body.style.overflow = '';
    // 重置表单
    setTimeout(() => {
        document.querySelectorAll('.modal-forms form').forEach(form => form.reset());
        document.getElementById('passwordStrength').className = 'password-strength';
    }, 300);
}

// 切换登录/注册表单
switchForms.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const target = this.dataset.target;
        
        if (target === 'register') {
            loginForm.classList.remove('active');
            registerForm.classList.add('active');
        } else {
            registerForm.classList.remove('active');
            loginForm.classList.add('active');
        }
    });
});

// 密码可见性切换
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', function() {
        const input = this.previousElementSibling;
        const icon = this.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
});

// 密码强度检测
const regPassword = document.getElementById('regPassword');
const passwordStrength = document.getElementById('passwordStrength');

if (regPassword) {
    regPassword.addEventListener('input', function() {
        const password = this.value;
        passwordStrength.classList.add('show');
        
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 10) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        
        passwordStrength.className = 'password-strength show';
        if (strength <= 2) {
            passwordStrength.classList.add('weak');
        } else if (strength <= 4) {
            passwordStrength.classList.add('medium');
        } else {
            passwordStrength.classList.add('strong');
        }
    });
}

// 登录表单提交
const loginFormEl = document.querySelector('#loginForm form');
if (loginFormEl) {
    loginFormEl.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // 从localStorage获取用户信息
        const users = JSON.parse(localStorage.getItem('travel_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // 登录成功
            const session = {
                username: user.username,
                email: user.email,
                isLoggedIn: true,
                loginTime: new Date().toISOString()
            };
            
            if (rememberMe) {
                localStorage.setItem('travel_session', JSON.stringify(session));
            } else {
                sessionStorage.setItem('travel_session', JSON.stringify(session));
            }
            
            showToast('success', '登录成功', `欢迎回来，${user.username}！`);
            updateUIForLoggedInUser(user.username, user.email);
            closeAuthModal();
        } else {
            showToast('error', '登录失败', '邮箱或密码错误，请重试');
        }
    });
}

// 注册表单提交
const registerFormEl = document.querySelector('#registerForm form');
if (registerFormEl) {
    registerFormEl.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        // 验证
        if (password.length < 6) {
            showToast('error', '注册失败', '密码长度至少6位');
            return;
        }
        
        if (password !== confirmPassword) {
            showToast('error', '注册失败', '两次输入的密码不一致');
            return;
        }
        
        if (!agreeTerms) {
            showToast('warning', '请同意条款', '请阅读并同意服务条款和隐私政策');
            return;
        }
        
        // 获取已注册用户
        let users = JSON.parse(localStorage.getItem('travel_users') || '[]');
        
        // 检查邮箱是否已注册
        if (users.some(u => u.email === email)) {
            showToast('error', '注册失败', '该邮箱已被注册');
            return;
        }
        
        // 检查用户名是否已存在
        if (users.some(u => u.username === username)) {
            showToast('error', '注册失败', '该用户名已被使用');
            return;
        }
        
        // 添加新用户
        users.push({
            username,
            email,
            password,
            registerTime: new Date().toISOString()
        });
        
        localStorage.setItem('travel_users', JSON.stringify(users));
        
        showToast('success', '注册成功', '请使用新账号登录');
        
        // 切换到登录表单
        registerForm.classList.remove('active');
        loginForm.classList.add('active');
        
        // 填充邮箱
        document.getElementById('loginEmail').value = email;
    });
}

// 退出登录
if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        localStorage.removeItem('travel_session');
        sessionStorage.removeItem('travel_session');
        
        updateUIForLoggedOutUser();
        showToast('success', '已退出', '期待您的再次访问');
    });
}

// 检查登录状态
function checkLoginStatus() {
    const session = JSON.parse(
        localStorage.getItem('travel_session') || 
        sessionStorage.getItem('travel_session') || 
        'null'
    );
    
    if (session && session.isLoggedIn) {
        updateUIForLoggedInUser(session.username, session.email);
        // 加载用户头像
        loadUserAvatar();
    }
}

// 更新UI为登录状态
function updateUIForLoggedInUser(username, email) {
    if (loginBtn) loginBtn.classList.add('hidden');
    if (userMenu) {
        userMenu.classList.remove('hidden');
        document.getElementById('username').textContent = username;
    }
    
    // 同步用户信息到个人中心
    syncUserToProfile(username, email);
    
    // 加载头像
    loadUserAvatar();
}

// 同步用户信息到个人中心
function syncUserToProfile(username, email) {
    // 更新个人中心的用户名
    const profileNameEl = document.querySelector('.profile-details h2');
    if (profileNameEl) {
        profileNameEl.textContent = username;
    }
    
    // 更新设置页面的用户名和邮箱
    const settingUsername = document.getElementById('settingUsername');
    if (settingUsername && username) {
        settingUsername.textContent = username;
    }
    
    const settingEmail = document.getElementById('settingEmail');
    if (settingEmail && email) {
        settingEmail.textContent = email;
    }
    
    // 更新社区发布框的默认样式（在没有头像时显示渐变背景）
    const creatorAvatarImg = document.getElementById('creatorAvatarImg');
    const creatorAvatarIcon = document.getElementById('creatorAvatarIcon');
    if (creatorAvatarImg && !creatorAvatarImg.src) {
        // 如果没有头像图片，显示渐变背景
        const creatorAvatar = document.getElementById('creatorAvatar');
        if (creatorAvatar) {
            creatorAvatar.style.background = 'linear-gradient(135deg, var(--primary-color), #764ba2)';
            creatorAvatar.style.color = 'white';
        }
    }
    
    // 更新个人中心头像区域提示
    const profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar && username) {
        profileAvatar.title = `点击更换${username}的头像`;
    }
}

// 更新UI为未登录状态
function updateUIForLoggedOutUser() {
    if (loginBtn) loginBtn.classList.remove('hidden');
    if (userMenu) userMenu.classList.add('hidden');
    
    // 重置个人中心用户信息
    resetProfileUserInfo();
}

// 重置个人中心用户信息
function resetProfileUserInfo() {
    // 重置个人中心的用户名为默认值
    const profileNameEl = document.querySelector('.profile-details h2');
    if (profileNameEl) {
        profileNameEl.textContent = '旅行者';
    }
    
    // 重置社区发布框样式
    const creatorAvatar = document.getElementById('creatorAvatar');
    if (creatorAvatar) {
        creatorAvatar.style.background = '';
        creatorAvatar.style.color = '';
    }
    
    // 重置个人中心头像提示
    const profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar) {
        profileAvatar.title = '';
    }
    
    // 重置设置页面信息
    const settingUsername = document.getElementById('settingUsername');
    if (settingUsername) {
        settingUsername.textContent = '旅行者';
    }
    
    const settingEmail = document.getElementById('settingEmail');
    if (settingEmail) {
        settingEmail.textContent = 'user@example.com';
    }
    
    // 清除所有头像显示
    clearAllAvatars();
}

// ==================== 头像上传功能 ====================

// 加载用户头像
function loadUserAvatar() {
    const avatarData = localStorage.getItem('travel_user_avatar');
    if (avatarData) {
        updateAllAvatars(avatarData);
    }
}

// 更新所有头像显示
function updateAllAvatars(avatarData) {
    // 个人中心头像
    const profileAvatarImg = document.getElementById('avatarImg');
    const profileAvatarIcon = document.getElementById('avatarIcon');
    if (profileAvatarImg) {
        profileAvatarImg.src = avatarData;
        profileAvatarImg.style.display = 'block';
        if (profileAvatarIcon) profileAvatarIcon.style.display = 'none';
    }
    
    // 导航栏头像
    const navAvatarImg = document.getElementById('navAvatarImg');
    const navAvatarIcon = document.getElementById('navAvatarIcon');
    if (navAvatarImg) {
        navAvatarImg.src = avatarData;
        navAvatarImg.style.display = 'block';
        if (navAvatarIcon) navAvatarIcon.style.display = 'none';
    }
    
    // 社区发布框头像
    const creatorAvatarImg = document.getElementById('creatorAvatarImg');
    const creatorAvatarIcon = document.getElementById('creatorAvatarIcon');
    const creatorAvatar = document.getElementById('creatorAvatar');
    if (creatorAvatarImg) {
        creatorAvatarImg.src = avatarData;
        creatorAvatarImg.style.display = 'block';
        if (creatorAvatarIcon) creatorAvatarIcon.style.display = 'none';
        // 移除渐变背景
        if (creatorAvatar) {
            creatorAvatar.style.background = 'transparent';
        }
    }
}

// 清除所有头像显示
function clearAllAvatars() {
    // 个人中心头像
    const profileAvatarImg = document.getElementById('avatarImg');
    const profileAvatarIcon = document.getElementById('avatarIcon');
    if (profileAvatarImg) {
        profileAvatarImg.src = '';
        profileAvatarImg.style.display = 'none';
        if (profileAvatarIcon) profileAvatarIcon.style.display = 'block';
    }
    
    // 导航栏头像
    const navAvatarImg = document.getElementById('navAvatarImg');
    const navAvatarIcon = document.getElementById('navAvatarIcon');
    if (navAvatarImg) {
        navAvatarImg.src = '';
        navAvatarImg.style.display = 'none';
        if (navAvatarIcon) navAvatarIcon.style.display = 'block';
    }
    
    // 社区发布框头像
    const creatorAvatarImg = document.getElementById('creatorAvatarImg');
    const creatorAvatarIcon = document.getElementById('creatorAvatarIcon');
    const creatorAvatar = document.getElementById('creatorAvatar');
    if (creatorAvatarImg) {
        creatorAvatarImg.src = '';
        creatorAvatarImg.style.display = 'none';
        if (creatorAvatarIcon) creatorAvatarIcon.style.display = 'block';
        // 恢复默认样式
        if (creatorAvatar) {
            creatorAvatar.style.background = '';
            creatorAvatar.style.color = '';
        }
    }
}

// 初始化头像上传功能
document.addEventListener('DOMContentLoaded', function() {
    const profileAvatar = document.getElementById('profileAvatar');
    const avatarInput = document.getElementById('avatarInput');
    
    if (profileAvatar && avatarInput) {
        // 点击头像触发文件选择
        profileAvatar.addEventListener('click', function() {
            // 检查是否已登录
            const session = JSON.parse(
                localStorage.getItem('travel_session') || 
                sessionStorage.getItem('travel_session') || 
                'null'
            );
            
            if (!session || !session.isLoggedIn) {
                showToast('warning', '请先登录', '登录后才能修改头像');
                openModal();
                return;
            }
            
            avatarInput.click();
        });
        
        // 文件选择后处理
        avatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            // 验证文件类型
            if (!file.type.startsWith('image/')) {
                showToast('error', '文件类型错误', '请选择图片文件');
                return;
            }
            
            // 验证文件大小（限制5MB）
            if (file.size > 5 * 1024 * 1024) {
                showToast('error', '文件过大', '图片大小不能超过5MB');
                return;
            }
            
            // 读取文件并转换为DataURL
            const reader = new FileReader();
            reader.onload = function(event) {
                const avatarData = event.target.result;
                
                // 保存到localStorage
                localStorage.setItem('travel_user_avatar', avatarData);
                
                // 更新所有头像显示
                updateAllAvatars(avatarData);
                
                showToast('success', '头像更新成功', '您的头像已更新');
            };
            reader.onerror = function() {
                showToast('error', '上传失败', '图片读取失败，请重试');
            };
            reader.readAsDataURL(file);
        });
    }
});

// Toast 提示函数
function showToast(type, title, message) {
    const container = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;
    
    container.appendChild(toast);
    
    // 点击关闭
    toast.querySelector('.toast-close').addEventListener('click', () => {
        hideToast(toast);
    });
    
    // 自动关闭
    setTimeout(() => {
        hideToast(toast);
    }, 4000);
}

function hideToast(toast) {
    toast.classList.add('hiding');
    setTimeout(() => {
        toast.remove();
    }, 300);
}

// 社交登录按钮（演示）
document.querySelectorAll('.btn-social').forEach(btn => {
    btn.addEventListener('click', function() {
        const platform = this.classList.contains('wechat') ? '微信' :
                        this.classList.contains('qq') ? 'QQ' : '微博';
        showToast('info', '提示', `${platform}登录功能开发中...`);
    });
});

// ==================== 规划详情页功能 ====================

// 路线数据
const planRoutesData = {
    '北京三日精华游': {
        days: [
            {
                day: 1,
                spots: [
                    { time: '08:00', name: '天安门广场', desc: '观看升旗仪式，感受庄严氛围' },
                    { time: '09:30', name: '故宫博物院', desc: '游览紫禁城，探索皇家宫殿的奥秘' },
                    { time: '14:00', name: '景山公园', desc: '登顶俯瞰故宫全景，拍摄经典照片' }
                ]
            },
            {
                day: 2,
                spots: [
                    { time: '07:00', name: '八达岭长城', desc: '登临万里长城，体验"不到长城非好汉"' },
                    { time: '14:00', name: '明十三陵', desc: '参观定陵地宫，了解明朝历史' }
                ]
            },
            {
                day: 3,
                spots: [
                    { time: '09:00', name: '颐和园', desc: '漫步皇家园林，欣赏昆明湖美景' },
                    { time: '14:00', name: '圆明园', desc: '探访万园之园遗址，铭记历史' },
                    { time: '17:00', name: '王府井大街', desc: '购物休闲，品尝北京小吃' }
                ]
            }
        ]
    },
    '上海都市三日游': {
        days: [
            {
                day: 1,
                spots: [
                    { time: '09:00', name: '外滩', desc: '欣赏万国建筑博览群，拍摄经典上海照' },
                    { time: '14:00', name: '南京路步行街', desc: '中华商业第一街，购物天堂' },
                    { time: '19:00', name: '外滩夜景', desc: '观赏浦江两岸璀璨夜景' }
                ]
            },
            {
                day: 2,
                spots: [
                    { time: '09:00', name: '东方明珠塔', desc: '登塔俯瞰上海全景，体验玻璃栈道' },
                    { time: '14:00', name: '上海博物馆', desc: '欣赏中国古代艺术珍品' },
                    { time: '18:00', name: '田子坊', desc: '漫步石库门弄堂，感受海派文化' }
                ]
            },
            {
                day: 3,
                spots: [
                    { time: '09:00', name: '迪士尼乐园', desc: '畅玩迪士尼主题乐园，圆童话梦想' }
                ]
            }
        ]
    },
    '西安古都四日游': {
        days: [
            {
                day: 1,
                spots: [
                    { time: '09:00', name: '兵马俑', desc: '世界第八大奇迹，秦始皇陵陪葬坑' },
                    { time: '14:00', name: '华清池', desc: '贵妃沐浴之地，欣赏长恨歌演出' }
                ]
            },
            {
                day: 2,
                spots: [
                    { time: '09:00', name: '大雁塔', desc: '登塔远眺，感受佛教文化' },
                    { time: '14:00', name: '陕西历史博物馆', desc: '了解中华文明五千年历史' },
                    { time: '18:00', name: '大唐不夜城', desc: '体验盛唐风貌，观赏夜景表演' }
                ]
            },
            {
                day: 3,
                spots: [
                    { time: '09:00', name: '古城墙', desc: '骑行古城墙，俯瞰西安全貌' },
                    { time: '14:00', name: '钟鼓楼', desc: '参观明代建筑，聆听晨钟暮鼓' },
                    { time: '18:00', name: '回民街', desc: '品尝正宗西北美食，感受市井文化' }
                ]
            },
            {
                day: 4,
                spots: [
                    { time: '09:00', name: '小雁塔', desc: '探访唐代佛教建筑' },
                    { time: '14:00', name: '大明宫遗址', desc: '感受盛唐皇宫的恢弘气势' }
                ]
            }
        ]
    },
    '成都美食五日游': {
        days: [
            {
                day: 1,
                spots: [
                    { time: '09:00', name: '大熊猫繁育基地', desc: '近距离观赏国宝大熊猫' },
                    { time: '14:00', name: '文殊院', desc: '品尝素斋，感受禅意' },
                    { time: '18:00', name: '锦里古街', desc: '体验三国文化，品尝成都小吃' }
                ]
            },
            {
                day: 2,
                spots: [
                    { time: '09:00', name: '宽窄巷子', desc: '漫步川西民居，体验慢生活' },
                    { time: '14:00', name: '人民公园', desc: '喝茶掏耳朵，体验成都休闲' },
                    { time: '18:00', name: '春熙路', desc: '购物美食，感受都市繁华' }
                ]
            },
            {
                day: 3,
                spots: [
                    { time: '09:00', name: '都江堰', desc: '参观世界文化遗产，了解水利奇迹' },
                    { time: '14:00', name: '青城山', desc: '登道教名山，享受清凉' }
                ]
            },
            {
                day: 4,
                spots: [
                    { time: '10:00', name: '武侯祠', desc: '祭拜诸葛亮，了解三国历史' },
                    { time: '14:00', name: '杜甫草堂', desc: '寻访诗圣故居，感受诗意' },
                    { time: '18:00', name: '火锅体验', desc: '品尝正宗四川火锅' }
                ]
            },
            {
                day: 5,
                spots: [
                    { time: '09:00', name: '金沙遗址', desc: '探索古蜀文明' },
                    { time: '14:00', name: '东郊记忆', desc: '文创园区打卡拍照' }
                ]
            }
        ]
    }
};

// 酒店数据
const hotelsData = {
    '北京': [
        { name: '北京饭店', stars: 5, score: 4.8, location: '天安门/王府井', price: 899 },
        { name: '故宫景山酒店', stars: 4, score: 4.6, location: '故宫/景山', price: 568 },
        { name: '后海四合院酒店', stars: 4, score: 4.7, location: '什刹海/后海', price: 688 },
        { name: '长城脚下民宿', stars: 3, score: 4.5, location: '八达岭长城', price: 328 }
    ],
    '上海': [
        { name: '和平饭店', stars: 5, score: 4.9, location: '外滩/南京东路', price: 1299 },
        { name: '外滩茂悦大酒店', stars: 5, score: 4.7, location: '外滩', price: 998 },
        { name: '新天地安达仕酒店', stars: 5, score: 4.8, location: '新天地', price: 1199 },
        { name: '田子坊精品民宿', stars: 3, score: 4.6, location: '田子坊', price: 458 }
    ],
    '西安': [
        { name: '西安索菲特传奇酒店', stars: 5, score: 4.8, location: '钟楼/鼓楼', price: 799 },
        { name: '大雁塔假日酒店', stars: 4, score: 4.6, location: '大雁塔', price: 458 },
        { name: '兵马俑主题酒店', stars: 3, score: 4.4, location: '兵马俑景区', price: 288 },
        { name: '回民街客栈', stars: 3, score: 4.5, location: '回民街', price: 238 }
    ],
    '成都': [
        { name: '博舍酒店', stars: 5, score: 4.9, location: '太古里/春熙路', price: 1088 },
        { name: '熊猫主题酒店', stars: 4, score: 4.7, location: '熊猫基地附近', price: 388 },
        { name: '宽窄巷子精品酒店', stars: 4, score: 4.6, location: '宽窄巷子', price: 468 },
        { name: '青城山温泉酒店', stars: 4, score: 4.8, location: '青城山景区', price: 588 }
    ],
    '南京': [
        { name: '金陵饭店', stars: 5, score: 4.8, location: '新街口', price: 699 },
        { name: '中山陵国际青年旅舍', stars: 3, score: 4.5, location: '中山陵景区', price: 188 },
        { name: '夫子庙秦淮河畔酒店', stars: 4, score: 4.6, location: '夫子庙/秦淮河', price: 428 },
        { name: '玄武湖假日酒店', stars: 4, score: 4.5, location: '玄武湖', price: 388 }
    ],
    '金华': [
        { name: '横店影视城酒店', stars: 4, score: 4.6, location: '横店影视城', price: 358 },
        { name: '广州街影视城精品酒店', stars: 4, score: 4.5, location: '广州街景区', price: 328 },
        { name: '清明上河图主题客栈', stars: 3, score: 4.4, location: '清明上河图', price: 268 },
        { name: '金华国贸大酒店', stars: 4, score: 4.5, location: '金华市区', price: 298 }
    ]
};

// 打开规划详情页
function openPlanDetail(planData) {
    const modal = document.getElementById('planDetailModal');
    if (!modal) return;
    
    // 填充基本信息
    document.getElementById('planDetailName').textContent = planData.title;
    document.getElementById('planDetailDesc').textContent = planData.description;
    document.getElementById('planDetailDest').textContent = planData.destination;
    document.getElementById('planDetailDays').textContent = planData.days;
    document.getElementById('planDetailPrice').textContent = planData.price;
    document.getElementById('footerPrice').textContent = '¥' + planData.price.replace('起', '');
    
    // 设置标签
    const badge = document.getElementById('planDetailBadge');
    if (planData.badge) {
        badge.textContent = planData.badge;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
    
    // 生成路线时间轴
    generateRouteTimeline(planData.title);
    
    // 生成酒店列表
    generateHotelList(planData.destination);
    
    // 显示模态框
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 关闭规划详情页
function closePlanDetail() {
    const modal = document.getElementById('planDetailModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// 生成路线时间轴
function generateRouteTimeline(planTitle) {
    const container = document.getElementById('planRouteTimeline');
    if (!container) return;
    
    const routeData = planRoutesData[planTitle];
    
    if (!routeData) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px; margin: 0;">该路线详细行程正在规划中，敬请期待...</p>';
        return;
    }
    
    container.innerHTML = routeData.days.map(dayData => `
        <div class="route-day">
            <div class="route-day-marker">${dayData.day}</div>
            <div class="route-day-title">第${dayData.day}天</div>
            <div class="route-day-content">
                ${dayData.spots.map(spot => `
                    <div class="route-spot">
                        <div class="route-spot-time">${spot.time}</div>
                        <div class="route-spot-info">
                            <h4>${spot.name}</h4>
                            <p>${spot.desc}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// 生成酒店列表
function generateHotelList(destination) {
    const container = document.getElementById('hotelList');
    if (!container) return;
    
    const hotels = hotelsData[destination] || [];
    
    if (hotels.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px; margin: 0;">暂无该目的地酒店推荐</p>';
        return;
    }
    
    container.innerHTML = hotels.map(hotel => `
        <div class="hotel-card">
            <div class="hotel-img">
                <i class="fas fa-hotel"></i>
            </div>
            <div class="hotel-info">
                <div class="hotel-name">${hotel.name}</div>
                <div class="hotel-rating">
                    <span class="hotel-stars">${'★'.repeat(hotel.stars)}</span>
                    <span class="hotel-score">${hotel.score}分</span>
                </div>
                <div class="hotel-location">
                    <i class="fas fa-map-marker-alt"></i> ${hotel.location}
                </div>
                <div class="hotel-price">
                    <span class="hotel-price-value">¥${hotel.price}</span>
                    <span class="hotel-price-unit">起/晚</span>
                </div>
            </div>
        </div>
    `).join('');
}

// 绑定详情页事件
document.addEventListener('DOMContentLoaded', function() {
    // 关闭按钮
    const closeBtn = document.getElementById('closePlanModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closePlanDetail);
    }
    
    // 点击遮罩关闭
    const modal = document.getElementById('planDetailModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closePlanDetail();
            }
        });
    }
    
    // 返回按钮
    const backBtn = document.getElementById('btnBackToPlans');
    if (backBtn) {
        backBtn.addEventListener('click', closePlanDetail);
    }
    
    // 预订按钮
    const bookBtn = document.getElementById('btnBookPlan');
    if (bookBtn) {
        bookBtn.addEventListener('click', function() {
            const planName = document.getElementById('planDetailName').textContent;
            showToast('success', '预订申请已提交', `${planName} 的预订申请已提交，客服将尽快与您联系！`);
            closePlanDetail();
        });
    }
});

// 暴露到全局
window.openPlanDetail = openPlanDetail;
window.closePlanDetail = closePlanDetail;

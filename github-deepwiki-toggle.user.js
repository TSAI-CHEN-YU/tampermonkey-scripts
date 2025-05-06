// ==UserScript==
// @name         GitHub & DeepWiki Navigation Toggle
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  在 GitHub 和 DeepWiki 之間添加快速切換按鈕
// @author       YourName
// @match        *://github.com/*
// @match        *://deepwiki.com/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // 統一樣式
    GM_addStyle(`
        .site-toggle-btn {
            position: fixed;
            right: 24px;
            bottom: 24px;
            z-index: 99999;
            border: none;
            padding: 10px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.18);
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .site-toggle-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .site-toggle-btn:active {
            transform: translateY(0);
        }
        .github-btn {
            background: #24292e;
            color: #fff;
        }
        .deepwiki-btn {
            background: #2ea44f;
            color: #fff;
        }
    `);

    // 配置
    const config = {
        github: {
            domain: 'github.com',
            targetDomain: 'deepwiki.com',
            btnClass: 'deepwiki-btn',
            btnText: '跳轉到 DeepWiki',
            icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 2.5A2.5 2.5 0 014.5 0h7A2.5 2.5 0 0114 2.5v10.5a.5.5 0 01-.5.5H12v-4c0-.5-.5-1-1-1H5c-.5 0-1 .5-1 1v4H2.5a.5.5 0 01-.5-.5V2.5z" fill="currentColor"></path><path d="M6 14v-4h4v4H6z" fill="currentColor"></path></svg>'
        },
        deepwiki: {
            domain: 'deepwiki.com',
            targetDomain: 'github.com',
            btnClass: 'github-btn',
            btnText: '跳回 GitHub',
            icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>'
        }
    };

    // 判斷當前站點
    const currentDomain = window.location.hostname;
    const siteConfig = currentDomain.includes('github.com') ? config.github : config.deepwiki;

    // 創建按鈕
    function createButton() {
        const existingBtn = document.getElementById('site-toggle-btn');
        if (existingBtn) return;

        const btn = document.createElement('button');
        btn.id = 'site-toggle-btn';
        btn.className = `site-toggle-btn ${siteConfig.btnClass}`;
        btn.innerHTML = `${siteConfig.icon} ${siteConfig.btnText}`;

        btn.addEventListener('click', function() {
            const currentUrl = location.href;
            const newUrl = currentUrl.replace(siteConfig.domain, siteConfig.targetDomain);

            // 使用 sessionStorage 保存用戶來源頁面的滾動位置
            sessionStorage.setItem('lastScrollPosition', window.scrollY);

            // 跳轉到對應站點的同一頁面
            window.location.href = newUrl;
        });

        document.body.appendChild(btn);
    }

    // 使用 MutationObserver 確保按鈕持續存在（應對動態頁面）
    function setupButtonObserver() {
        const observer = new MutationObserver(function(mutations) {
            if (!document.getElementById('site-toggle-btn')) {
                createButton();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // 還原滾動位置
    function restoreScrollPosition() {
        const lastPosition = sessionStorage.getItem('lastScrollPosition');
        if (lastPosition) {
            window.scrollTo(0, parseInt(lastPosition));
            sessionStorage.removeItem('lastScrollPosition');
        }
    }

    // 在 DOM 準備好後初始化
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                createButton();
                setupButtonObserver();
                restoreScrollPosition();
            });
        } else {
            createButton();
            setupButtonObserver();
            restoreScrollPosition();
        }
    }

    init();
})();

(function() {
    // Create language switcher
    var switcher = document.createElement('div');
    switcher.className = 'language-switcher';

    var currentPath = window.location.pathname;
    var isEnglish = currentPath.includes('/en/');
    var isChinese = currentPath.includes('/zh/');

    // Get the page path without language prefix
    var pagePath = currentPath.replace(/\/(en|zh)\//, '/');

    // Create language links
    var enLink = document.createElement('a');
    enLink.href = '/trading-academy/en/' + (pagePath.replace('/trading-academy/', '') || 'index.html');
    enLink.textContent = 'English';
    if (isEnglish) enLink.className = 'active';

    var zhLink = document.createElement('a');
    zhLink.href = '/trading-academy/zh/' + (pagePath.replace('/trading-academy/', '') || 'index.html');
    zhLink.textContent = '中文';
    if (isChinese) zhLink.className = 'active';

    switcher.appendChild(enLink);
    switcher.appendChild(zhLink);

    // Add to page
    document.body.appendChild(switcher);
})();

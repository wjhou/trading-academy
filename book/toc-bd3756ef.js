// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="introduction.html">Introduction</a></span></li><li class="chapter-item expanded "><li class="spacer"></li></li><li class="chapter-item expanded "><li class="part-title">Module 1: Trading Fundamentals</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-01/lesson-01-what-is-trading.html"><strong aria-hidden="true">1.</strong> 1.1 What is Trading?</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-01/lesson-02-order-types.html"><strong aria-hidden="true">2.</strong> 1.2 Order Types</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-01/lesson-03-reading-charts.html"><strong aria-hidden="true">3.</strong> 1.3 Reading Stock Prices and Charts</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-01/lesson-04-volume-liquidity.html"><strong aria-hidden="true">4.</strong> 1.4 Understanding Volume and Liquidity</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-01/lesson-05-long-short.html"><strong aria-hidden="true">5.</strong> 1.5 Long vs Short, Bulls vs Bears</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-01/project-first-trade.html"><strong aria-hidden="true">6.</strong> Hands-On Project: First Paper Trade</a></span></li><li class="chapter-item expanded "><li class="part-title">Module 2: Technical Analysis Basics</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-02/lesson-01-candlesticks.html"><strong aria-hidden="true">7.</strong> 2.1 Candlestick Patterns</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-02/lesson-02-support-resistance.html"><strong aria-hidden="true">8.</strong> 2.2 Support and Resistance</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-02/lesson-03-trends.html"><strong aria-hidden="true">9.</strong> 2.3 Trend Identification</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-02/lesson-04-moving-averages.html"><strong aria-hidden="true">10.</strong> 2.4 Moving Averages</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-02/lesson-05-volume-analysis.html"><strong aria-hidden="true">11.</strong> 2.5 Volume Analysis</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-02/project-chart-analysis.html"><strong aria-hidden="true">12.</strong> Hands-On Project: Chart Analysis</a></span></li><li class="chapter-item expanded "><li class="part-title">Module 3: Technical Indicators</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-03/lesson-01-momentum.html"><strong aria-hidden="true">13.</strong> 3.1 Momentum Indicators (RSI)</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-03/lesson-02-trend.html"><strong aria-hidden="true">14.</strong> 3.2 Trend Indicators (MACD)</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-03/lesson-03-volatility.html"><strong aria-hidden="true">15.</strong> 3.3 Volatility Indicators (Bollinger Bands)</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-03/lesson-04-volume-indicators.html"><strong aria-hidden="true">16.</strong> 3.4 Volume Indicators</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-03/lesson-05-combining.html"><strong aria-hidden="true">17.</strong> 3.5 Combining Indicators</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-03/project-indicators.html"><strong aria-hidden="true">18.</strong> Hands-On Project: Implement Indicators</a></span></li><li class="chapter-item expanded "><li class="part-title">Module 4: Trading Strategies</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-04/lesson-01-trend-following.html"><strong aria-hidden="true">19.</strong> 4.1 Trend Following</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-04/lesson-02-mean-reversion.html"><strong aria-hidden="true">20.</strong> 4.2 Mean Reversion</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-04/lesson-03-breakout.html"><strong aria-hidden="true">21.</strong> 4.3 Breakout Strategies</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-04/lesson-04-momentum.html"><strong aria-hidden="true">22.</strong> 4.4 Momentum Strategies</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-04/lesson-05-multi-strategy.html"><strong aria-hidden="true">23.</strong> 4.5 Multi-Strategy Approaches</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-04/lesson-06-design.html"><strong aria-hidden="true">24.</strong> 4.6 Strategy Design Principles</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-04/project-build-strategy.html"><strong aria-hidden="true">25.</strong> Hands-On Project: Build Your Strategy</a></span></li><li class="chapter-item expanded "><li class="part-title">Module 5: Risk Management</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-05/lesson-01-position-sizing.html"><strong aria-hidden="true">26.</strong> 5.1 Position Sizing</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-05/lesson-02-stop-loss.html"><strong aria-hidden="true">27.</strong> 5.2 Stop-Loss Strategies</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-05/lesson-03-risk-reward.html"><strong aria-hidden="true">28.</strong> 5.3 Risk-Reward Ratios</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-05/lesson-04-diversification.html"><strong aria-hidden="true">29.</strong> 5.4 Portfolio Diversification</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-05/lesson-05-drawdown.html"><strong aria-hidden="true">30.</strong> 5.5 Drawdown Management</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-05/lesson-06-kelly.html"><strong aria-hidden="true">31.</strong> 5.6 Kelly Criterion</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-05/project-risk-system.html"><strong aria-hidden="true">32.</strong> Hands-On Project: Risk System</a></span></li><li class="chapter-item expanded "><li class="part-title">Module 6: Backtesting &amp; Optimization</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-06/lesson-01-intro.html"><strong aria-hidden="true">33.</strong> 6.1 Introduction to Backtesting</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-06/lesson-02-pitfalls.html"><strong aria-hidden="true">34.</strong> 6.2 Avoiding Common Pitfalls</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-06/lesson-03-metrics.html"><strong aria-hidden="true">35.</strong> 6.3 Performance Metrics</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-06/lesson-04-optimization.html"><strong aria-hidden="true">36.</strong> 6.4 Parameter Optimization</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-06/lesson-05-walk-forward.html"><strong aria-hidden="true">37.</strong> 6.5 Walk-Forward Analysis</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-06/lesson-06-monte-carlo.html"><strong aria-hidden="true">38.</strong> 6.6 Monte Carlo Simulation</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-06/project-backtest.html"><strong aria-hidden="true">39.</strong> Hands-On Project: Backtest Your Strategy</a></span></li><li class="chapter-item expanded "><li class="part-title">Module 7: Automated Trading Systems</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-07/lesson-01-architecture.html"><strong aria-hidden="true">40.</strong> 7.1 System Architecture</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-07/lesson-02-data.html"><strong aria-hidden="true">41.</strong> 7.2 Data Management</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-07/lesson-03-execution.html"><strong aria-hidden="true">42.</strong> 7.3 Order Execution</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-07/lesson-04-monitoring.html"><strong aria-hidden="true">43.</strong> 7.4 Monitoring and Alerting</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-07/lesson-05-errors.html"><strong aria-hidden="true">44.</strong> 7.5 Error Handling</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-07/lesson-06-tracking.html"><strong aria-hidden="true">45.</strong> 7.6 Performance Tracking</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-07/project-deploy.html"><strong aria-hidden="true">46.</strong> Hands-On Project: Deploy Automated System</a></span></li><li class="chapter-item expanded "><li class="part-title">Module 8: Advanced Topics</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-08/lesson-01-ml.html"><strong aria-hidden="true">47.</strong> 8.1 Machine Learning for Trading</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-08/lesson-02-sentiment.html"><strong aria-hidden="true">48.</strong> 8.2 Sentiment Analysis with LLMs</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-08/lesson-03-multi-asset.html"><strong aria-hidden="true">49.</strong> 8.3 Multi-Asset Strategies</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-08/lesson-04-hft.html"><strong aria-hidden="true">50.</strong> 8.4 High-Frequency Trading</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-08/lesson-05-options.html"><strong aria-hidden="true">51.</strong> 8.5 Options and Derivatives</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-08/lesson-06-business.html"><strong aria-hidden="true">52.</strong> 8.6 Building a Trading Business</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="module-08/capstone.html"><strong aria-hidden="true">53.</strong> Capstone Project: Professional Trading System</a></span></li><li class="chapter-item expanded "><li class="spacer"></li></li><li class="chapter-item expanded "><li class="part-title">Resources</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="resources/glossary.html"><strong aria-hidden="true">54.</strong> Trading Glossary</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="resources/cheatsheets.html"><strong aria-hidden="true">55.</strong> Cheat Sheets</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="resources/books.html"><strong aria-hidden="true">56.</strong> Recommended Books</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="resources/tools.html"><strong aria-hidden="true">57.</strong> Useful Tools</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="resources/faq.html"><strong aria-hidden="true">58.</strong> FAQ</a></span></li><li class="chapter-item expanded "><li class="part-title">Appendix</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="appendix/setup.html"><strong aria-hidden="true">59.</strong> Setting Up Your Environment</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="appendix/stock-agent-guide.html"><strong aria-hidden="true">60.</strong> Using stock-agent-system</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="appendix/python-basics.html"><strong aria-hidden="true">61.</strong> Python for Trading</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="appendix/contributing.html"><strong aria-hidden="true">62.</strong> Contributing to This Book</a></span></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString().split('#')[0].split('?')[0];
        if (current_page.endsWith('/')) {
            current_page += 'index.html';
        }
        const links = Array.prototype.slice.call(this.querySelectorAll('a'));
        const l = links.length;
        for (let i = 0; i < l; ++i) {
            const link = links[i];
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#') && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The 'index' page is supposed to alias the first chapter in the book.
            if (link.href === current_page
                || i === 0
                && path_to_root === ''
                && current_page.endsWith('/index.html')) {
                link.classList.add('active');
                let parent = link.parentElement;
                while (parent) {
                    if (parent.tagName === 'LI' && parent.classList.contains('chapter-item')) {
                        parent.classList.add('expanded');
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', e => {
            if (e.target.tagName === 'A') {
                const clientRect = e.target.getBoundingClientRect();
                const sidebarRect = this.getBoundingClientRect();
                sessionStorage.setItem('sidebar-scroll-offset', clientRect.top - sidebarRect.top);
            }
        }, { passive: true });
        const sidebarScrollOffset = sessionStorage.getItem('sidebar-scroll-offset');
        sessionStorage.removeItem('sidebar-scroll-offset');
        if (sidebarScrollOffset !== null) {
            // preserve sidebar scroll position when navigating via links within sidebar
            const activeSection = this.querySelector('.active');
            if (activeSection) {
                const clientRect = activeSection.getBoundingClientRect();
                const sidebarRect = this.getBoundingClientRect();
                const currentOffset = clientRect.top - sidebarRect.top;
                this.scrollTop += currentOffset - parseFloat(sidebarScrollOffset);
            }
        } else {
            // scroll sidebar to current active section when navigating via
            // 'next/previous chapter' buttons
            const activeSection = document.querySelector('#mdbook-sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        const sidebarAnchorToggles = document.querySelectorAll('.chapter-fold-toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(el => {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define('mdbook-sidebar-scrollbox', MDBookSidebarScrollbox);


// ---------------------------------------------------------------------------
// Support for dynamically adding headers to the sidebar.

(function() {
    // This is used to detect which direction the page has scrolled since the
    // last scroll event.
    let lastKnownScrollPosition = 0;
    // This is the threshold in px from the top of the screen where it will
    // consider a header the "current" header when scrolling down.
    const defaultDownThreshold = 150;
    // Same as defaultDownThreshold, except when scrolling up.
    const defaultUpThreshold = 300;
    // The threshold is a virtual horizontal line on the screen where it
    // considers the "current" header to be above the line. The threshold is
    // modified dynamically to handle headers that are near the bottom of the
    // screen, and to slightly offset the behavior when scrolling up vs down.
    let threshold = defaultDownThreshold;
    // This is used to disable updates while scrolling. This is needed when
    // clicking the header in the sidebar, which triggers a scroll event. It
    // is somewhat finicky to detect when the scroll has finished, so this
    // uses a relatively dumb system of disabling scroll updates for a short
    // time after the click.
    let disableScroll = false;
    // Array of header elements on the page.
    let headers;
    // Array of li elements that are initially collapsed headers in the sidebar.
    // I'm not sure why eslint seems to have a false positive here.
    // eslint-disable-next-line prefer-const
    let headerToggles = [];
    // This is a debugging tool for the threshold which you can enable in the console.
    let thresholdDebug = false;

    // Updates the threshold based on the scroll position.
    function updateThreshold() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // The number of pixels below the viewport, at most documentHeight.
        // This is used to push the threshold down to the bottom of the page
        // as the user scrolls towards the bottom.
        const pixelsBelow = Math.max(0, documentHeight - (scrollTop + windowHeight));
        // The number of pixels above the viewport, at least defaultDownThreshold.
        // Similar to pixelsBelow, this is used to push the threshold back towards
        // the top when reaching the top of the page.
        const pixelsAbove = Math.max(0, defaultDownThreshold - scrollTop);
        // How much the threshold should be offset once it gets close to the
        // bottom of the page.
        const bottomAdd = Math.max(0, windowHeight - pixelsBelow - defaultDownThreshold);
        let adjustedBottomAdd = bottomAdd;

        // Adjusts bottomAdd for a small document. The calculation above
        // assumes the document is at least twice the windowheight in size. If
        // it is less than that, then bottomAdd needs to be shrunk
        // proportional to the difference in size.
        if (documentHeight < windowHeight * 2) {
            const maxPixelsBelow = documentHeight - windowHeight;
            const t = 1 - pixelsBelow / Math.max(1, maxPixelsBelow);
            const clamp = Math.max(0, Math.min(1, t));
            adjustedBottomAdd *= clamp;
        }

        let scrollingDown = true;
        if (scrollTop < lastKnownScrollPosition) {
            scrollingDown = false;
        }

        if (scrollingDown) {
            // When scrolling down, move the threshold up towards the default
            // downwards threshold position. If near the bottom of the page,
            // adjustedBottomAdd will offset the threshold towards the bottom
            // of the page.
            const amountScrolledDown = scrollTop - lastKnownScrollPosition;
            const adjustedDefault = defaultDownThreshold + adjustedBottomAdd;
            threshold = Math.max(adjustedDefault, threshold - amountScrolledDown);
        } else {
            // When scrolling up, move the threshold down towards the default
            // upwards threshold position. If near the bottom of the page,
            // quickly transition the threshold back up where it normally
            // belongs.
            const amountScrolledUp = lastKnownScrollPosition - scrollTop;
            const adjustedDefault = defaultUpThreshold - pixelsAbove
                + Math.max(0, adjustedBottomAdd - defaultDownThreshold);
            threshold = Math.min(adjustedDefault, threshold + amountScrolledUp);
        }

        if (documentHeight <= windowHeight) {
            threshold = 0;
        }

        if (thresholdDebug) {
            const id = 'mdbook-threshold-debug-data';
            let data = document.getElementById(id);
            if (data === null) {
                data = document.createElement('div');
                data.id = id;
                data.style.cssText = `
                    position: fixed;
                    top: 50px;
                    right: 10px;
                    background-color: 0xeeeeee;
                    z-index: 9999;
                    pointer-events: none;
                `;
                document.body.appendChild(data);
            }
            data.innerHTML = `
                <table>
                  <tr><td>documentHeight</td><td>${documentHeight.toFixed(1)}</td></tr>
                  <tr><td>windowHeight</td><td>${windowHeight.toFixed(1)}</td></tr>
                  <tr><td>scrollTop</td><td>${scrollTop.toFixed(1)}</td></tr>
                  <tr><td>pixelsAbove</td><td>${pixelsAbove.toFixed(1)}</td></tr>
                  <tr><td>pixelsBelow</td><td>${pixelsBelow.toFixed(1)}</td></tr>
                  <tr><td>bottomAdd</td><td>${bottomAdd.toFixed(1)}</td></tr>
                  <tr><td>adjustedBottomAdd</td><td>${adjustedBottomAdd.toFixed(1)}</td></tr>
                  <tr><td>scrollingDown</td><td>${scrollingDown}</td></tr>
                  <tr><td>threshold</td><td>${threshold.toFixed(1)}</td></tr>
                </table>
            `;
            drawDebugLine();
        }

        lastKnownScrollPosition = scrollTop;
    }

    function drawDebugLine() {
        if (!document.body) {
            return;
        }
        const id = 'mdbook-threshold-debug-line';
        const existingLine = document.getElementById(id);
        if (existingLine) {
            existingLine.remove();
        }
        const line = document.createElement('div');
        line.id = id;
        line.style.cssText = `
            position: fixed;
            top: ${threshold}px;
            left: 0;
            width: 100vw;
            height: 2px;
            background-color: red;
            z-index: 9999;
            pointer-events: none;
        `;
        document.body.appendChild(line);
    }

    function mdbookEnableThresholdDebug() {
        thresholdDebug = true;
        updateThreshold();
        drawDebugLine();
    }

    window.mdbookEnableThresholdDebug = mdbookEnableThresholdDebug;

    // Updates which headers in the sidebar should be expanded. If the current
    // header is inside a collapsed group, then it, and all its parents should
    // be expanded.
    function updateHeaderExpanded(currentA) {
        // Add expanded to all header-item li ancestors.
        let current = currentA.parentElement;
        while (current) {
            if (current.tagName === 'LI' && current.classList.contains('header-item')) {
                current.classList.add('expanded');
            }
            current = current.parentElement;
        }
    }

    // Updates which header is marked as the "current" header in the sidebar.
    // This is done with a virtual Y threshold, where headers at or below
    // that line will be considered the current one.
    function updateCurrentHeader() {
        if (!headers || !headers.length) {
            return;
        }

        // Reset the classes, which will be rebuilt below.
        const els = document.getElementsByClassName('current-header');
        for (const el of els) {
            el.classList.remove('current-header');
        }
        for (const toggle of headerToggles) {
            toggle.classList.remove('expanded');
        }

        // Find the last header that is above the threshold.
        let lastHeader = null;
        for (const header of headers) {
            const rect = header.getBoundingClientRect();
            if (rect.top <= threshold) {
                lastHeader = header;
            } else {
                break;
            }
        }
        if (lastHeader === null) {
            lastHeader = headers[0];
            const rect = lastHeader.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            if (rect.top >= windowHeight) {
                return;
            }
        }

        // Get the anchor in the summary.
        const href = '#' + lastHeader.id;
        const a = [...document.querySelectorAll('.header-in-summary')]
            .find(element => element.getAttribute('href') === href);
        if (!a) {
            return;
        }

        a.classList.add('current-header');

        updateHeaderExpanded(a);
    }

    // Updates which header is "current" based on the threshold line.
    function reloadCurrentHeader() {
        if (disableScroll) {
            return;
        }
        updateThreshold();
        updateCurrentHeader();
    }


    // When clicking on a header in the sidebar, this adjusts the threshold so
    // that it is located next to the header. This is so that header becomes
    // "current".
    function headerThresholdClick(event) {
        // See disableScroll description why this is done.
        disableScroll = true;
        setTimeout(() => {
            disableScroll = false;
        }, 100);
        // requestAnimationFrame is used to delay the update of the "current"
        // header until after the scroll is done, and the header is in the new
        // position.
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // Closest is needed because if it has child elements like <code>.
                const a = event.target.closest('a');
                const href = a.getAttribute('href');
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    threshold = targetElement.getBoundingClientRect().bottom;
                    updateCurrentHeader();
                }
            });
        });
    }

    // Takes the nodes from the given head and copies them over to the
    // destination, along with some filtering.
    function filterHeader(source, dest) {
        const clone = source.cloneNode(true);
        clone.querySelectorAll('mark').forEach(mark => {
            mark.replaceWith(...mark.childNodes);
        });
        dest.append(...clone.childNodes);
    }

    // Scans page for headers and adds them to the sidebar.
    document.addEventListener('DOMContentLoaded', function() {
        const activeSection = document.querySelector('#mdbook-sidebar .active');
        if (activeSection === null) {
            return;
        }

        const main = document.getElementsByTagName('main')[0];
        headers = Array.from(main.querySelectorAll('h2, h3, h4, h5, h6'))
            .filter(h => h.id !== '' && h.children.length && h.children[0].tagName === 'A');

        if (headers.length === 0) {
            return;
        }

        // Build a tree of headers in the sidebar.

        const stack = [];

        const firstLevel = parseInt(headers[0].tagName.charAt(1));
        for (let i = 1; i < firstLevel; i++) {
            const ol = document.createElement('ol');
            ol.classList.add('section');
            if (stack.length > 0) {
                stack[stack.length - 1].ol.appendChild(ol);
            }
            stack.push({level: i + 1, ol: ol});
        }

        // The level where it will start folding deeply nested headers.
        const foldLevel = 3;

        for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            const level = parseInt(header.tagName.charAt(1));

            const currentLevel = stack[stack.length - 1].level;
            if (level > currentLevel) {
                // Begin nesting to this level.
                for (let nextLevel = currentLevel + 1; nextLevel <= level; nextLevel++) {
                    const ol = document.createElement('ol');
                    ol.classList.add('section');
                    const last = stack[stack.length - 1];
                    const lastChild = last.ol.lastChild;
                    // Handle the case where jumping more than one nesting
                    // level, which doesn't have a list item to place this new
                    // list inside of.
                    if (lastChild) {
                        lastChild.appendChild(ol);
                    } else {
                        last.ol.appendChild(ol);
                    }
                    stack.push({level: nextLevel, ol: ol});
                }
            } else if (level < currentLevel) {
                while (stack.length > 1 && stack[stack.length - 1].level > level) {
                    stack.pop();
                }
            }

            const li = document.createElement('li');
            li.classList.add('header-item');
            li.classList.add('expanded');
            if (level < foldLevel) {
                li.classList.add('expanded');
            }
            const span = document.createElement('span');
            span.classList.add('chapter-link-wrapper');
            const a = document.createElement('a');
            span.appendChild(a);
            a.href = '#' + header.id;
            a.classList.add('header-in-summary');
            filterHeader(header.children[0], a);
            a.addEventListener('click', headerThresholdClick);
            const nextHeader = headers[i + 1];
            if (nextHeader !== undefined) {
                const nextLevel = parseInt(nextHeader.tagName.charAt(1));
                if (nextLevel > level && level >= foldLevel) {
                    const toggle = document.createElement('a');
                    toggle.classList.add('chapter-fold-toggle');
                    toggle.classList.add('header-toggle');
                    toggle.addEventListener('click', () => {
                        li.classList.toggle('expanded');
                    });
                    const toggleDiv = document.createElement('div');
                    toggleDiv.textContent = '❱';
                    toggle.appendChild(toggleDiv);
                    span.appendChild(toggle);
                    headerToggles.push(li);
                }
            }
            li.appendChild(span);

            const currentParent = stack[stack.length - 1];
            currentParent.ol.appendChild(li);
        }

        const onThisPage = document.createElement('div');
        onThisPage.classList.add('on-this-page');
        onThisPage.append(stack[0].ol);
        const activeItemSpan = activeSection.parentElement;
        activeItemSpan.after(onThisPage);
    });

    document.addEventListener('DOMContentLoaded', reloadCurrentHeader);
    document.addEventListener('scroll', reloadCurrentHeader, { passive: true });
})();


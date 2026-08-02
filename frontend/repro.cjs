const puppeteer = require('puppeteer-core');

const EXEC_PATH = '/home/claude/.cache/puppeteer/chrome-headless-shell/linux-131.0.6778.204/chrome-headless-shell-linux64/chrome-headless-shell';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EXEC_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  page.on('console', msg => console.log('[console]', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('[pageerror]', err.message));

  // Inject a mock MetaMask provider before any page script runs
  await page.evaluateOnNewDocument(() => {
    window.ethereum = {
      isMetaMask: true,
      selectedAddress: '0x3975aaBc1234567890fEDcba0987654321f6a67',
      chainId: '0x72', // Coston2
      _handlers: {},
      request: async ({ method }) => {
        if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
          return ['0x3975aaBc1234567890fEDcba0987654321f6a67'];
        }
        if (method === 'eth_chainId') return '0x72';
        if (method === 'eth_getBalance') return '0x0';
        if (method === 'eth_sendTransaction') return '0xdeadbeef';
        if (method === 'wallet_switchEthereumChain') return null;
        return null;
      },
      on: function (event, handler) { this._handlers[event] = handler; },
      removeListener: function () {},
    };
  });

  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));

  // Connect wallet via the navbar button
  const connectClicked = await page.evaluate(() => {
    const btn = document.querySelector('#nav-connect-btn');
    if (btn) { btn.click(); return true; }
    return false;
  });
  console.log('connect button clicked:', connectClicked);
  await new Promise(r => setTimeout(r, 300));

  // The wallet modal should now be open — click its "MetaMask" option if present
  const modalOptionClicked = await page.evaluate(() => {
    const el = document.querySelector('#metamask-option');
    if (el) { el.click(); return true; }
    return false;
  });
  console.log('modal option clicked:', modalOptionClicked);
  await new Promise(r => setTimeout(r, 1500));

  const connectedState = await page.evaluate(() => {
    const btn = document.querySelector('#nav-wallet-btn');
    return btn ? btn.textContent : 'NOT CONNECTED (#nav-wallet-btn not found)';
  });
  console.log('wallet button state:', connectedState);

  // Navigate: Home -> Vault -> Marketplace -> Dashboard, no scrolling
  const clickNavLink = async (label) => {
    const found = await page.evaluate((lbl) => {
      const links = Array.from(document.querySelectorAll('.navbar-link'));
      const el = links.find(l => l.textContent.trim() === lbl);
      if (el) { el.click(); return true; }
      return false;
    }, label);
    await new Promise(r => setTimeout(r, 500));
    return found;
  };

  for (let cycle = 1; cycle <= 4; cycle++) {
    console.log(`--- cycle ${cycle} ---`);
    console.log('Home clicked:', await clickNavLink('Home'));
    console.log('Vault clicked:', await clickNavLink('Vault'));
    console.log('Marketplace clicked:', await clickNavLink('Marketplace'));
    console.log('Dashboard clicked:', await clickNavLink('Dashboard'));
    await new Promise(r => setTimeout(r, 600));

    const check = await page.evaluate(() => {
      const main = document.querySelector('.dashboard-main');
      return main ? { childCount: main.children.length, textLen: main.innerText.length } : 'NO .dashboard-main';
    });
    console.log(`cycle ${cycle} dashboard check:`, JSON.stringify(check));
  }

  await page.screenshot({ path: '/home/claude/repro-dashboard.png' });
  console.log('Screenshot saved.');

  await browser.close();
})().catch(e => { console.error('SCRIPT ERROR:', e); process.exit(1); });

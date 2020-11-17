export const startHashLinksTracking = () => {
  window.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      const { target } = e;
      const isHashLink = target.href.startsWith(`${window.location.origin}`) && target.href.indexOf('#') >= 1;

      if (isHashLink) {
        const hash = target.href.split('#')[1];
        gtag('event', `${hash} click`, { event_category: 'anchor-links', text: target.text, path: target.href });
      }
    }
  });
};

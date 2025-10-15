(function () {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  // Avoid injecting when already inside an iframe
  try {
    if (window.top !== window.self) return;
  } catch (e) {
    return;
  }

  if (document.querySelector('.chat-frame')) return;

  const iframe = document.createElement('iframe');

  const iframeStyles = (styleString) => {
    const style = document.createElement('style');
    style.textContent = styleString;
    document.head.append(style);
  };

  iframeStyles(`
    .chat-frame {
      position: fixed;
      bottom: 24px;
      right: 24px;
      border: none;
      z-index: 2147483647;
    }
  `);

  iframe.src = 'https://www.bookmylead.app/chatbot';
  iframe.classList.add('chat-frame');
  iframe.setAttribute('title', 'BookmyLead Chatbot');
  document.body.appendChild(iframe);

  window.addEventListener('message', (e) => {
    if (e.origin !== 'https://www.bookmylead.app') return;
    let dimensions;
    try {
      dimensions = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
    } catch (error) {
      return;
    }
    if (!dimensions || !dimensions.width || !dimensions.height) return;
    iframe.width = dimensions.width;
    iframe.height = dimensions.height;
    iframe.contentWindow?.postMessage('8fe60b6b-1a2b-42a5-9e4d-e4427ea85a54', 'https://www.bookmylead.app');
  });
})();


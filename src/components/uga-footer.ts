import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('uga-footer')
class UgaFooter extends LitElement {

  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css">
      <footer class="cmp-site-footer">
        <div class="cmp-site-footer__container">
          <div class="cmp-site-footer__logo">
            <a href="https://www.uga.edu/">
              <picture>
                <source srcset="https://design.online.uga.edu/images/uga-logo.png" media="(min-width: 50rem)">
                <img class="cmp-site-footer__logo-img" src="https://design.online.uga.edu/images/uga-logo-vertical.png" alt="University of Georgia">
              </picture>
            </a>
          </div>

          <div class="cmp-site-footer__navigation">
            <nav>
              <ul class="cmp-site-footer__navigation-list">
                <li class="cmp-site-footer__navigation-list-item">
                  <a href="https://www.uga.edu/a-z/schools/" class="cmp-site-footer__navigation-link">Schools and Colleges</a>
                </li>
                <li class="cmp-site-footer__navigation-list-item">
                  <a href="https://peoplesearch.uga.edu/" class="cmp-site-footer__navigation-link">Directory</a>
                </li>
                <li class="cmp-site-footer__navigation-list-item">
                  <a href="https://my.uga.edu/" class="cmp-site-footer__navigation-link">MyUGA</a>
                </li>
                <li class="cmp-site-footer__navigation-list-item">
                  <a href="http://hr.uga.edu/applicants/" class="cmp-site-footer__navigation-link">Employment Opportunities</a>
                </li>
                <li class="cmp-site-footer__navigation-list-item">
                  <a href="https://mc.uga.edu/policy/trademark" class="cmp-site-footer__navigation-link">Copyright and Trademarks</a>
                </li>
                <li class="cmp-site-footer__navigation-list-item">
                  <a href="https://eits.uga.edu/access_and_security/infosec/pols_regs/policies/privacy/" class="cmp-site-footer__navigation-link">Privacy</a>
                </li>
                <li class="cmp-site-footer__navigation-list-item">
                  <a href="https://eits.uga.edu/access_and_security/infosec/pols_regs/policies/privacy/" class="cmp-site-footer__navigation-link">Website Feedback</a>
                </li>
                <li class="cmp-site-footer__navigation-list-item">
                  <a href="https://gbi.georgia.gov/human-trafficking-notice" class="cmp-site-footer__navigation-link">Human Trafficking Notice</a>
                </li>
                <li class="cmp-site-footer__navigation-list-item">
                  <a href="https://legal.uga.edu/guidance/compliance-ethics-reporting-hotline" class="cmp-site-footer__navigation-link">Reporting Hotline</a>
                </li>
              </ul>
            </nav>
          </div>

          <div class="cmp-site-footer__copyright">
            <p class="cmp-site-footer__copyright-info">
              &copy; University of Georgia, Athens, GA 30602
              <br>
              706-542-3000
            </p>
          </div>

          <div class="cmp-site-footer__social">
            <nav class="cmp-site-footer__social-nav">
              <span class="cmp-site-footer__social-label">#UGA on</span>
              <a class="cmp-site-footer__social-link" href="http://facebook.com/universityofga">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="icon-facebook" viewBox="0 0 32 32">
                  <title>Facebook</title>
                  <path fill="currentColor" d="M19 6h5v-6h-5c-3.86 0-7 3.14-7 7v3h-4v6h4v16h6v-16h5l1-6h-6v-3c0-0.542 0.458-1 1-1z"></path>
                </svg>
              </a>
              <a class="cmp-site-footer__social-link" href="https://twitter.com/universityofga">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="icon-twitter" viewBox="0 0 32 32">
                  <title>Twitter</title>
                  <path fill="currentColor" d="M32 7.075c-1.175 0.525-2.444 0.875-3.769 1.031 1.356-0.813 2.394-2.1 2.887-3.631-1.269 0.75-2.675 1.3-4.169 1.594-1.2-1.275-2.906-2.069-4.794-2.069-3.625 0-6.563 2.938-6.563 6.563 0 0.512 0.056 1.012 0.169 1.494-5.456-0.275-10.294-2.888-13.531-6.862-0.563 0.969-0.887 2.1-0.887 3.3 0 2.275 1.156 4.287 2.919 5.463-1.075-0.031-2.087-0.331-2.975-0.819 0 0.025 0 0.056 0 0.081 0 3.181 2.263 5.838 5.269 6.437-0.55 0.15-1.131 0.231-1.731 0.231-0.425 0-0.831-0.044-1.237-0.119 0.838 2.606 3.263 4.506 6.131 4.563-2.25 1.762-5.075 2.813-8.156 2.813-0.531 0-1.050-0.031-1.569-0.094 2.913 1.869 6.362 2.95 10.069 2.95 12.075 0 18.681-10.006 18.681-18.681 0-0.287-0.006-0.569-0.019-0.85 1.281-0.919 2.394-2.075 3.275-3.394z" />
                </svg>
              </a>
              <a class="cmp-site-footer__social-link" href="https://www.instagram.com/universityofga">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="icon-instagram" viewBox="0 0 32 32">
                  <title>Instagram</title>
                  <path fill="currentColor" d="M16 2.881c4.275 0 4.781 0.019 6.462 0.094 1.563 0.069 2.406 0.331 2.969 0.55 0.744 0.288 1.281 0.638 1.837 1.194 0.563 0.563 0.906 1.094 1.2 1.838 0.219 0.563 0.481 1.412 0.55 2.969 0.075 1.688 0.094 2.194 0.094 6.463s-0.019 4.781-0.094 6.463c-0.069 1.563-0.331 2.406-0.55 2.969-0.288 0.744-0.637 1.281-1.194 1.837-0.563 0.563-1.094 0.906-1.837 1.2-0.563 0.219-1.413 0.481-2.969 0.55-1.688 0.075-2.194 0.094-6.463 0.094s-4.781-0.019-6.463-0.094c-1.563-0.069-2.406-0.331-2.969-0.55-0.744-0.288-1.281-0.637-1.838-1.194-0.563-0.563-0.906-1.094-1.2-1.837-0.219-0.563-0.481-1.413-0.55-2.969-0.075-1.688-0.094-2.194-0.094-6.463s0.019-4.781 0.094-6.463c0.069-1.563 0.331-2.406 0.55-2.969 0.288-0.744 0.638-1.281 1.194-1.838 0.563-0.563 1.094-0.906 1.838-1.2 0.563-0.219 1.412-0.481 2.969-0.55 1.681-0.075 2.188-0.094 6.463-0.094zM16 0c-4.344 0-4.887 0.019-6.594 0.094-1.7 0.075-2.869 0.35-3.881 0.744-1.056 0.412-1.95 0.956-2.837 1.85-0.894 0.888-1.438 1.781-1.85 2.831-0.394 1.019-0.669 2.181-0.744 3.881-0.075 1.713-0.094 2.256-0.094 6.6s0.019 4.887 0.094 6.594c0.075 1.7 0.35 2.869 0.744 3.881 0.413 1.056 0.956 1.95 1.85 2.837 0.887 0.887 1.781 1.438 2.831 1.844 1.019 0.394 2.181 0.669 3.881 0.744 1.706 0.075 2.25 0.094 6.594 0.094s4.888-0.019 6.594-0.094c1.7-0.075 2.869-0.35 3.881-0.744 1.050-0.406 1.944-0.956 2.831-1.844s1.438-1.781 1.844-2.831c0.394-1.019 0.669-2.181 0.744-3.881 0.075-1.706 0.094-2.25 0.094-6.594s-0.019-4.887-0.094-6.594c-0.075-1.7-0.35-2.869-0.744-3.881-0.394-1.063-0.938-1.956-1.831-2.844-0.887-0.887-1.781-1.438-2.831-1.844-1.019-0.394-2.181-0.669-3.881-0.744-1.712-0.081-2.256-0.1-6.6-0.1v0z M16 7.781c-4.537 0-8.219 3.681-8.219 8.219s3.681 8.219 8.219 8.219 8.219-3.681 8.219-8.219c0-4.537-3.681-8.219-8.219-8.219zM16 21.331c-2.944 0-5.331-2.387-5.331-5.331s2.387-5.331 5.331-5.331c2.944 0 5.331 2.387 5.331 5.331s-2.387 5.331-5.331 5.331z M26.462 7.456c0 1.060-0.859 1.919-1.919 1.919s-1.919-0.859-1.919-1.919c0-1.060 0.859-1.919 1.919-1.919s1.919 0.859 1.919 1.919z" />
                </svg>
              </a>
              <a class="cmp-site-footer__social-link" href="https://www.snapchat.com/add/university-ga">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="icon-snapchat" viewBox="0 0 512 512">
                  <title>Snapchat</title>
                  <path fill="currentColor" d="M496.9 366.6c-3.373-9.176-9.8-14.09-17.11-18.15a42.714 42.714 0 0 0-3.72-1.947c-2.182-1.128-4.414-2.22-6.634-3.373-22.8-12.09-40.61-27.34-52.96-45.42a102.9 102.9 0 0 1-9.089-16.12c-1.054-3.013-1-4.724-.248-6.287a10.22 10.22 0 0 1 2.914-3.038c3.918-2.591 7.96-5.22 10.7-6.993 4.885-3.162 8.754-5.667 11.25-7.44 9.362-6.547 15.91-13.5 20-21.28a42.37 42.37 0 0 0 2.1-35.19c-6.2-16.32-21.61-26.45-40.29-26.45a55.54 55.54 0 0 0-11.72 1.24 79.072 79.072 0 0 0-3.063.72c.174-11.16-.074-22.94-1.066-34.53-3.522-40.76-17.79-62.12-32.67-79.16A130.2 130.2 0 0 0 332.1 36.44C309.5 23.55 283.9 17 256 17s-53.4 6.55-76 19.44a129.7 129.7 0 0 0-33.28 26.78c-14.88 17.04-29.15 38.44-32.67 79.16-.992 11.59-1.24 23.43-1.079 34.53-1-.26-2.021-.5-3.051-.719a55.46 55.46 0 0 0-11.72-1.24c-18.69 0-34.13 10.13-40.3 26.45a42.42 42.42 0 0 0 2.046 35.23c4.105 7.774 10.65 14.73 20.01 21.28 2.48 1.736 6.361 4.24 11.25 7.44 2.641 1.711 6.5 4.216 10.28 6.72a11.05 11.05 0 0 1 3.3 3.311c.794 1.624.818 3.373-.36 6.6a102 102 0 0 1-8.94 15.78c-12.08 17.67-29.36 32.65-51.43 44.64C32.35 348.6 20.2 352.8 15.07 366.7c-3.868 10.53-1.339 22.51 8.494 32.6a49.14 49.14 0 0 0 12.4 9.387 134.3 134.3 0 0 0 30.34 12.14 20.02 20.02 0 0 1 6.126 2.741c3.583 3.137 3.075 7.861 7.849 14.78a34.47 34.47 0 0 0 8.977 9.127c10.02 6.919 21.28 7.353 33.21 7.811 10.78.41 22.99.881 36.94 5.481 5.778 1.91 11.78 5.605 18.74 9.92C194.8 480.1 217.7 495 255.1 495s61.29-14.12 78.12-24.43c6.907-4.24 12.87-7.9 18.49-9.758 13.95-4.613 26.16-5.072 36.94-5.481 11.93-.459 23.19-.893 33.21-7.812a34.58 34.58 0 0 0 10.22-11.16c3.434-5.84 3.348-9.919 6.572-12.77a18.97 18.97 0 0 1 5.753-2.629A134.9 134.9 0 0 0 476 408.7a48.34 48.34 0 0 0 13.02-10.19l.124-.149C498.4 388.5 500.7 376.9 496.9 366.6zm-34.01 18.28c-20.75 11.46-34.53 10.23-45.26 17.14-9.114 5.865-3.72 18.51-10.34 23.08-8.134 5.617-32.18-.4-63.24 9.858-25.62 8.469-41.96 32.82-88.04 32.82s-62.04-24.3-88.08-32.88c-31-10.26-55.09-4.241-63.24-9.858-6.609-4.563-1.24-17.21-10.34-23.08-10.74-6.907-24.53-5.679-45.26-17.08-13.21-7.291-5.716-11.8-1.314-13.94 75.14-36.38 87.13-92.55 87.67-96.72.645-5.046 1.364-9.014-4.191-14.15-5.369-4.96-29.19-19.7-35.8-24.32-10.94-7.638-15.75-15.26-12.2-24.64 2.48-6.485 8.531-8.928 14.88-8.928a27.64 27.64 0 0 1 5.965.67c12 2.6 23.66 8.617 30.39 10.24a10.75 10.75 0 0 0 2.48.335c3.6 0 4.86-1.811 4.612-5.927-.768-13.13-2.628-38.72-.558-62.64 2.84-32.91 13.44-49.22 26.04-63.64 6.051-6.932 34.48-36.98 88.86-36.98s82.88 29.92 88.93 36.83c12.61 14.42 23.23 30.73 26.04 63.64 2.071 23.92.285 49.53-.558 62.64-.285 4.327 1.017 5.927 4.613 5.927a10.65 10.65 0 0 0 2.48-.335c6.745-1.624 18.4-7.638 30.4-10.24a27.64 27.64 0 0 1 5.964-.67c6.386 0 12.4 2.48 14.88 8.928 3.546 9.374-1.24 17-12.19 24.64-6.609 4.612-30.43 19.34-35.8 24.32-5.568 5.134-4.836 9.1-4.191 14.15.533 4.228 12.51 60.4 87.67 96.72C468.6 373 476.1 377.5 462.9 384.9z"/>
                </svg>
              </a>
              <a class="cmp-site-footer__social-link" href="http://youtube.com/user/UniversityOfGeorgia">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="icon-youtube" viewBox="0 0 32 32">
                  <title>YouTube</title>
                  <path fill="currentColor" d="M31.681 9.6c0 0-0.313-2.206-1.275-3.175-1.219-1.275-2.581-1.281-3.206-1.356-4.475-0.325-11.194-0.325-11.194-0.325h-0.012c0 0-6.719 0-11.194 0.325-0.625 0.075-1.987 0.081-3.206 1.356-0.963 0.969-1.269 3.175-1.269 3.175s-0.319 2.588-0.319 5.181v2.425c0 2.587 0.319 5.181 0.319 5.181s0.313 2.206 1.269 3.175c1.219 1.275 2.819 1.231 3.531 1.369 2.563 0.244 10.881 0.319 10.881 0.319s6.725-0.012 11.2-0.331c0.625-0.075 1.988-0.081 3.206-1.356 0.962-0.969 1.275-3.175 1.275-3.175s0.319-2.587 0.319-5.181v-2.425c-0.006-2.588-0.325-5.181-0.325-5.181zM12.694 20.15v-8.994l8.644 4.513-8.644 4.481z" />
                </svg>
              </a>
              <a class="cmp-site-footer__social-link" href="https://www.linkedin.com/school/university-of-georgia/">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="icon-linkedin" viewBox="0 0 32 32">
                  <title>LinkedIn</title>
                  <path fill="currentColor" d="M12 12h5.535v2.837h0.079c0.77-1.381 2.655-2.837 5.464-2.837 5.842 0 6.922 3.637 6.922 8.367v9.633h-5.769v-8.54c0-2.037-0.042-4.657-3.001-4.657-3.005 0-3.463 2.218-3.463 4.509v8.688h-5.767v-18z M2 12h6v18h-6v-18z M8 7c0 1.657-1.343 3-3 3s-3-1.343-3-3c0-1.657 1.343-3 3-3s3 1.343 3 3z" />
                </svg>
              </a>
            </nav>
          </div>
        </div>
      </footer>
    `;
  }
}
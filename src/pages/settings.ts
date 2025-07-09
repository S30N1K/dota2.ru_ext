import { safeAlert } from '../utils';
safeAlert('settings loaded!');
setTimeout(function () {
    const setting = document.querySelector(".profile-setting")
    const li = document.createElement('li');
    li.classList.add('forum-profile__topblock-item');
    const a = document.createElement('a');
    a.classList.add('forum-profile__topblock-btn');
    a.classList.add('text-clip');
    a.setAttribute('role', 'tab');
    const url = new URL(window.location.href);
    url.searchParams.set('extension', '');
    a.href = url.toString();
    const extensionUrl = url.toString()
    a.setAttribute('href', extensionUrl);
    a.innerText = 'Настройки расширения';
    li.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
    });
    a.addEventListener('mousedown', (event) => {
        event.preventDefault();
        event.stopPropagation();
        window.location.hash = 'extension';
        const links = Array.from(document.querySelectorAll('li a'));
        if (links.length > 0) {
            links.forEach(a => {
                a.classList.remove('forum-profile__topblock-item-active');
            });
        }
        a.classList.add('forum-profile__topblock-item-active');
    });
    setting?.appendChild(li)
    li.appendChild(a)
}, 0)
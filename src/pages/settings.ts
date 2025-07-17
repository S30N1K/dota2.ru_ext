setTimeout(function () {
    const setting = document.querySelector(".profile-setting");

    // Создаём новый элемент списка
    const li = document.createElement('li');
    li.classList.add('forum-profile__topblock-item');

    // Создаём ссылку для настроек расширения
    const a = document.createElement('a');
    a.classList.add('forum-profile__topblock-btn', 'text-clip');
    a.setAttribute('role', 'tab');

    // Формируем URL для настроек расширения
    const url = new URL(window.location.href);
    url.searchParams.set('extension', '');
    const extensionUrl = url.toString();
    a.href = extensionUrl;
    a.setAttribute('href', extensionUrl);
    a.innerText = 'Настройки расширения';

    // Блокируем стандартное поведение при клике на li
    li.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
    });

    // Обработка нажатия на ссылку
    a.addEventListener('mousedown', (event) => {
        event.preventDefault();
        event.stopPropagation();

        // Меняем hash в адресе
        window.location.hash = 'extension';

        // Снимаем активность со всех ссылок
        const links = Array.from(document.querySelectorAll('li a'));
        if (links.length > 0) {
            links.forEach(link => {
                link.classList.remove('forum-profile__topblock-item-active');
            });
        }

        // Делаем текущую ссылку активной
        a.classList.add('forum-profile__topblock-item-active');
    });

    // Вставляем элементы в DOM
    setting?.appendChild(li);
    li.appendChild(a);
}, 0);
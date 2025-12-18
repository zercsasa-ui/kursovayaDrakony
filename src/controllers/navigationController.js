const navigationController = {
    navigateToPage: (req, res) => {
        const { page } = req.params;
        console.log(`Navigation request to page: ${page}`);

        const pages = {
            'main': { route: '/', component: 'MainPage', title: 'Главная' },
            'catalog': { route: '/catalog', component: 'CatalogPage', title: 'Каталог' },
            'gallery': { route: '/gallery', component: 'GalleryPage', title: 'Галерея' },
            'register': { route: '/register', component: 'RegisterPage', title: 'Регистрация' }
        };

        if (pages[page]) {
            res.json({
                success: true,
                page: page,
                route: pages[page].route,
                title: pages[page].title,
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Страница не найдена',
                timestamp: new Date().toISOString()
            });
        }
    },

    getBreadcrumbs: (req, res) => {
        const { path } = req.query;

        const crumbs = [{ label: 'Главная', path: '/' }];

        if (path && path.includes('/catalog')) {
            crumbs.push({ label: 'Каталог', path: '/catalog' });
        } else if (path && path.includes('/gallery')) {
            crumbs.push({ label: 'Галерея', path: '/gallery' });
        } else if (path && path.includes('/register')) {
            crumbs.push({ label: 'Регистрация', path: '/register' });
        } else if (path && path.includes('/login')) {
            crumbs.push({ label: 'Авторизация', path: '/login' });
        }

        res.json({
            success: true,
            breadcrumbs: crumbs,
            timestamp: new Date().toISOString()
        });
    }
};

module.exports = navigationController;

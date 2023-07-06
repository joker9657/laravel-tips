import { defineConfig } from "vitepress";

export default defineConfig({
    title: 'laravel-tips',
    description: 'Awesome Laravel tips and tricks for all artisans.',
    themeConfig: {
        nav: [
            { text: 'Example', link: '/README' },
        ],
        sidebar: [
            {
                // text: 'Guide',
                collapsible: true,
                collapsed: true,
                items: [
                    { text: '数据库模型', link: '/db-models-and-eloquent'},
                    { text: '模型关联', link: '/models-relations'},
                ],
            }
        ],
        socialLinks: [
            { icon: 'github', link: 'https://github.com/joker9657/laravel-tips'}
        ]
    },
    
});
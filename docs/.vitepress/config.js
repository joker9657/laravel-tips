import { defineConfig } from "vitepress";

export default defineConfig({
    title: 'laravel-tips',
    description: 'Awesome Laravel tips and tricks for all artisans.',
    themeConfig: {
        sidebar: [
            {
                // text: 'Guide',
                collapsible: true,
                collapsed: true,
                items: [
                    { text: '数据库模型', link: '/db-models-and-eloquent'},
                    { text: '模型关联', link: '/models-relations'},
                    { text: '数据库迁移', link: '/migrations'},
                    { text: '视图', link: '/views'},
                    { text: '路由', link: '/routing'},
                    { text: '表单验证', link: '/validation'},
                    { text: '集合', link: '/collections'},
                    { text: '用户授权', link: '/auth'},
                    { text: '发送邮件', link: '/mail'},
                    { text: 'Artisan 命令行', link: '/artisan'},
                    { text: '工厂模式', link: '/factories'},
                    { text: '日志和调试', link: '/log-and-debug'},
                    { text: 'API', link: '/api'},
                    { text: '其他', link: '/other'},
                ],
            }
        ],
        socialLinks: [
            { icon: 'github', link: 'https://github.com/joker9657/laravel-tips'}
        ]
    },
    
});
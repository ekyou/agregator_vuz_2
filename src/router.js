import { createRouter, createWebHistory } from 'vue-router'
import MainPage from './components/MainPage.vue'
import EventDetail from './components/EventDetail.vue'
import RegisterUserPage from './components/RegisterUserPage.vue'
import RegisterAdminPage from './components/RegisterAdminPage.vue'
import EditScrollPage from './components/EditScrollPage.vue'

const router = createRouter({
    history: createWebHistory(),

    routes: [
        {
            path: '/',
            name: 'MainPage',
            component: MainPage,
        },
        {
            path: '/events/:id',
            name: 'EventDetail',
            component: EventDetail
        },
        {
            path: '/register',
            name: 'RegisterUserPage',
            component: RegisterUserPage
        },
        {
            path: '/admin',
            name: 'RegisterAdminPage',
            component: RegisterAdminPage
        },
        {
            path: '/edit',
            name: 'EditScrollPage',
            component: EditScrollPage,
            meta: { requiresAdmin: true }
        }
    ]
})

router.beforeEach((to, from, next) => {
    if (to.meta.requiresAdmin) {
        const adminData = localStorage.getItem('adminData');
        
        if (!adminData) {
            next('/admin');
        } else {
            next();
        }
    } else {
        next();
    }
});

export default router;
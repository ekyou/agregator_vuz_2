<script>
import router from '../router';

import { RouterLink } from 'vue-router';

export default {
    name: 'Header',
    data() {
        return {
            user: null,
            admin: null 
        }
    },
    mounted() {
        this.getUser();
        this.getAdmin(); 
        window.addEventListener('storage', this.handleStorageChange);
    },
    beforeDestroy() {
        window.removeEventListener('storage', this.handleStorageChange);
    },
    methods: {
        getUser() {
            const userData = localStorage.getItem('user');
            if (userData) {
                try {
                    this.user = JSON.parse(userData);
                } catch (e) {
                    this.user = null;
                }
            } else {
                this.user = null;
            }
        },

        getAdmin() {
            const adminData = localStorage.getItem('adminData');
            if (adminData) {
                try {
                    this.admin = JSON.parse(adminData);
                } catch (e) {
                    this.admin = null;
                }
            } else {
                this.admin = null;
            }
        },
        
        handleStorageChange(event) {
            if (event.key === 'user') {
                this.getUser();
            }
            if (event.key === 'adminData') {
                this.getAdmin();
            }
        },
        
        logout() {
            if (confirm('Вы уверены, что хотите выйти?')) {
                localStorage.removeItem('user');
                this.user = null;
                location.reload();
                this.$router.push('/');
            }
        },

        adminLogout() {
            if (confirm('Вы уверены, что хотите выйти из панели администратора?')) {
                localStorage.removeItem('adminData');
                this.admin = null;
                location.reload();
                this.$router.push('/');
            }
        },
        
        updateUser() {
            this.getUser();
            this.getAdmin();
        }
    },
    watch: {
        '$route'() {
            this.getUser();
            this.getAdmin();
        }
    }
}
</script>

<template>
    <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>Подтверждение входа</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="css/index.css">
</head>
    <header>
        <nav class="navbar-custom fixed-top d-flex align-items-center">
            <div class="container-fluid px-0 d-flex justify-content-between align-items-center">
                <!-- Логотип -->
                <div class="d-flex align-items-center gap-3">
                    <router-link to="/" class="text-decoration-none">
                        <span class="fs-4 fw-700 text-primary-custom" style="font-size: 24px; line-height: 32px;">
                            BGITU
                        </span>
                    </router-link>
                </div>
                
                <!-- Навигационные ссылки -->
                <div class="d-none d-md-flex align-items-center gap-3">
                    <router-link to="/" class="text-decoration-none text-secondary-custom hover-primary" style="font-size: 16px; line-height: 24px; font-weight: 400; transition: color 0.2s;">
                        Мероприятия
                    </router-link>

                    <template v-if="admin && admin.login">
                        <span class="text-primary-custom fw-600" style="font-size: 14px; line-height: 20px;">
                            <i class="bi bi-shield-lock-fill me-1" style="color: #e67e22;"></i>
                            {{ admin.login }}
                        </span>
                        <button 
                            @click="adminLogout" 
                            class="btn-logout"
                            title="Выйти из панели админа"
                        >
                            <i class="bi bi-box-arrow-right"></i>
                        </button>
                    </template>
                    
                    <!-- ✅ Умная секция: почта или кнопка входа -->
                    <template v-if="user && user.email">
                        <!-- Пользователь авторизован -->
                        <div class="d-flex align-items-center gap-2">
                            <span class="text-primary-custom fw-600" style="font-size: 14px; line-height: 20px;">
                                <i class="bi bi-person-circle me-1"></i>
                                {{ user.email }}
                            </span>
                            <button 
                                @click="logout" 
                                class="btn-logout"
                                title="Выйти"
                            >
                                <i class="bi bi-box-arrow-right"></i>
                            </button>
                        </div>
                    </template>
                    
                    <template v-else>
                        <!-- Пользователь НЕ авторизован -->
                        <router-link 
                            to="/register" 
                            class="text-decoration-none text-primary-custom fw-700" 
                            style="font-size: 16px; line-height: 24px;"
                        >
                            Вход
                        </router-link>
                    </template>
                </div>
                
                <!-- Кнопка уведомлений (опционально) -->
                <div class="d-flex align-items-center gap-2">
                    <button class="btn btn-link p-2 text-secondary-custom rounded-circle hover-bg-primary-light active-scale" style="transition: all 0.2s ease; border: none; text-decoration: none;">
                        <i class="bi bi-bell" style="font-size: 1.25rem;"></i>
                    </button>
                </div>
            </div>
        </nav>
    </header>
</template>

<style>
.navbar-custom {
    background: rgba(248, 249, 251, 0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0px 10px 30px rgba(0, 82, 204, 0.08);
    height: 80px;
    padding: 0 64px;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 1050;
    display: flex;
    align-items: center;
}

@media (max-width: 768px) {
    .navbar-custom {
        padding: 0 16px;
        height: 64px;
    }
}

.btn-logout {
    background: transparent;
    border: none;
    color: #555f6c;
    padding: 4px 8px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 18px;
    display: flex;
    align-items: center;
}

.btn-logout:hover {
    color: #e74c3c;
    background: rgba(231, 76, 60, 0.1);
}

.text-secondary-custom {
    color: #555f6c;
}

.text-primary-custom {
    color: #003d9b;
}

.hover-primary:hover {
    color: #003d9b !important;
}

.user-email {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: #003d9b;
    padding: 4px 12px;
    background: rgba(0, 61, 155, 0.08);
    border-radius: 20px;
    white-space: nowrap;
}

.user-email .bi-person-circle {
    font-size: 18px;
}

.fw-700 {
    font-weight: 700;
}
</style>
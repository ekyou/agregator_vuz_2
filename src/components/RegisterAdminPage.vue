<script>
import axios from 'axios';

export default {
    data(){
        return{
            login: null,
            password: null 
        }
    },

    mounted(){

    },

    methods: {
        async trustAdmin(evt){
            evt.preventDefault();
            try{
                let response = await axios.post('admin', {
                    login: this.login, 
                    password: this.password
                })

                localStorage.setItem('adminData', JSON.stringify({
                    login: this.login,
                    isAdmin: true
                }));

                this.$router.push('/edit');
            } catch (err) {
                console.log(err)
            }
        },
    }
}
</script>

<template>
<main class="flex-grow d-flex align-items-center justify-content-center position-relative" style="padding-top: 128px; padding-bottom: 80px; padding-left: 16px; padding-right: 16px;">
        <!-- Декоративные элементы фона -->
        <div class="bg-blob-1"></div>
        <div class="bg-blob-2"></div>
        <div class="w-100" style="max-width: 440px;">
            <nav class="breadcrumb-custom d-flex align-items-center gap-1 mb-3" style="color: var(--secondary);">
                <a href="#" class="text-decoration-none" style="font-size: 14px; line-height: 20px; font-weight: 500; color: var(--secondary);">
                    Главная
                </a>
                <span style="font-size: 18px; color: var(--secondary);">›</span>
                <span class="text-primary-custom" style="font-size: 14px; line-height: 20px; font-weight: 500;">
                    Вход администратора
                </span>
            </nav>
            <!-- Карточка входа -->
            <div class="login-card animate-in">
                <div class="text-center mb-4" style="margin-bottom: 40px;">
                    <h1 class="fw-700 text-on-surface mb-2" style="font-size: 32px; line-height: 40px; letter-spacing: -0.01em;">
                        Вход для администратора
                    </h1>
                    <p class="text-secondary-custom" style="font-size: 16px; line-height: 24px; font-weight: 400;">
                        Пожалуйста, авторизуйтесь для доступа к панели управления мероприятиями
                    </p>
                </div>
                <form @submit="trustAdmin" id="adminLoginForm">
                    <!-- Поле: Логин -->
                    <div class="mb-3">
                        <label class="form-label fw-600 ms-1" for="login" style="font-size: 14px; line-height: 20px; letter-spacing: 0.01em; color: var(--on-surface);">
                            Логин
                        </label>
                        <div class="position-relative input-group-focus">
                            <i class="bi bi-person input-icon"></i>
                            <input v-model="login" type="text" class="academic-input" id="login" name="login" placeholder="Введите ваш логин" required />
                        </div>
                    </div>
                    <!-- Поле: Пароль -->
                    <div class="mb-3">
                        <label class="form-label fw-600 ms-1" for="password" style="font-size: 14px; line-height: 20px; letter-spacing: 0.01em; color: var(--on-surface);">
                            Пароль
                        </label>
                        <div class="position-relative input-group-focus">
                            <i class="bi bi-lock input-icon"></i>
                            <input v-model="password" type="password" class="academic-input" id="password" name="password" placeholder="Введите пароль" required />
                        </div>
                    </div>
                    <!-- Кнопка входа -->
                    <div class="pt-2">
                        <button type="submit" class="btn-primary-custom">
                            Войти
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </main>
</template>

<style>
/* БАЗОВЫЕ СТИЛИ*/
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8f9fb;
            color: #191c1e;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        /*ЦВЕТОВАЯ СХЕМА*/
        :root {
            --primary: #003d9b;
            --primary-container: #0052cc;
            --primary-light: #dae2ff;
            --primary-dim: #b2c5ff;
            --secondary: #555f6c;
            --secondary-container: #d9e3f2;
            --tertiary: #003e96;
            --tertiary-container: #2356b5;
            --surface: #f8f9fb;
            --surface-container-low: #f3f4f6;
            --surface-container-lowest: #ffffff;
            --surface-container: #edeef0;
            --surface-container-high: #e7e8ea;
            --surface-container-highest: #e1e2e4;
            --surface-variant: #e1e2e4;
            --on-surface: #191c1e;
            --on-surface-variant: #434654;
            --outline: #737685;
            --outline-variant: #c3c6d6;
            --background: #f8f9fb;
            --error: #ba1a1a;
            --error-container: #ffdad6;
            --shadow-color: rgba(0, 82, 204, 0.08);
        }

        /*КОМПОНЕНТЫ*/
        /* Стеклянная панель */
        .glass-effect {
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }

        /* Навигация */
        .navbar-custom {
            background: rgba(248, 249, 251, 0.7);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0px 10px 30px rgba(0, 82, 204, 0.08);
            height: 80px;
            padding: 0 64px;
        }

        @media (max-width: 768px) {
            .navbar-custom {
                padding: 0 16px;
                height: 64px;
            }
        }

        /* Карточка входа */
        .login-card {
            background: var(--surface-container-lowest);
            border-radius: 0.75rem;
            padding: 24px;
            box-shadow: 0px 10px 30px var(--shadow-color);
            border: 1px solid rgba(255, 255, 255, 0.4);
        }

        @media (min-width: 768px) {
            .login-card {
                padding: 48px;
            }
        }

        /* Поля ввода */
        .academic-input {
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
            box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
            background-color: var(--surface-container-low);
            border-color: var(--outline-variant);
            border-radius: 0.5rem;
            padding: 0.75rem 1rem 0.75rem 3rem;
            font-family: 'Inter', sans-serif;
            font-size: 16px;
            line-height: 24px;
            font-weight: 400;
            color: var(--on-surface);
            width: 100%;
        }

        .academic-input:focus {
            outline: none;
            border-color: var(--primary-container);
            box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05), 0 0 0 4px rgba(0, 82, 204, 0.1);
        }

        .academic-input::placeholder {
            color: var(--outline);
        }

        /* Иконки в полях ввода */
        .input-icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: var(--secondary);
            transition: color 0.2s ease;
            font-size: 1.25rem;
            pointer-events: none;
        }

        .input-group-focus .input-icon {
            color: var(--primary);
        }

        /* Кнопка входа */
        .btn-primary-custom {
            background-color: var(--primary-container);
            color: #ffffff;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            font-family: 'Inter', sans-serif;
            font-size: 24px;
            line-height: 32px;
            font-weight: 600;
            border: none;
            box-shadow: 0 4px 14px rgba(0, 82, 204, 0.2);
            transition: all 0.2s ease;
            width: 100%;
        }

        .btn-primary-custom:hover {
            background-color: #0047b3;
            box-shadow: 0 8px 25px rgba(0, 82, 204, 0.3);
            transform: translateY(-2px);
        }

        .btn-primary-custom:active {
            transform: scale(0.98);
        }

        /* Футер */
        .footer-custom {
            background-color: var(--surface-container);
            border-top: 1px solid var(--secondary-container);
            padding: 48px 64px;
        }

        @media (max-width: 768px) {
            .footer-custom {
                padding: 24px 16px;
            }
        }

        /* УТИЛИТЫ*/

        .text-primary-custom {
            color: var(--primary);
        }

        .text-secondary-custom {
            color: var(--secondary);
        }

        .text-on-surface {
            color: var(--on-surface);
        }

        .text-on-surface-variant {
            color: var(--on-surface-variant);
        }

        .bg-surface-container-low {
            background-color: var(--surface-container-low);
        }

        .bg-surface {
            background-color: var(--surface);
        }

        .bg-surface-container-lowest {
            background-color: var(--surface-container-lowest);
        }

        .border-outline-variant {
            border-color: var(--outline-variant);
        }

        .border-secondary-container {
            border-color: var(--secondary-container);
        }

        .fw-600 {
            font-weight: 600;
        }

        .fw-700 {
            font-weight: 700;
        }

        .fw-800 {
            font-weight: 800;
        }

        /* Анимация появления */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .animate-in {
            animation: fadeInUp 0.7s ease forwards;
        }

        /* Текст над окошечкм входа */
        .breadcrumb-custom .breadcrumb-item a {
            color: var(--secondary);
            text-decoration: none;
            font-size: 14px;
            line-height: 20px;
            font-weight: 500;
            transition: color 0.2s ease;
        }

        .breadcrumb-custom .breadcrumb-item a:hover {
            color: var(--primary);
        }

        .breadcrumb-custom .breadcrumb-item.active {
            color: var(--primary);
            font-size: 14px;
            line-height: 20px;
            font-weight: 500;
        }

        .breadcrumb-custom .breadcrumb-item+.breadcrumb-item::before {
            content: "›";
            color: var(--secondary);
            font-size: 18px;
            padding: 0 8px;
        }

        /* Фоновые декоративные элементы */
        .bg-blob-1 {
            position: absolute;
            top: -10%;
            right: 0;
            width: 40%;
            height: 40%;
            border-radius: 50%;
            background: rgba(0, 61, 155, 0.05);
            filter: blur(120px);
            pointer-events: none;
        }

        .bg-blob-2 {
            position: absolute;
            bottom: 10%;
            left: -5%;
            width: 35%;
            height: 35%;
            border-radius: 50%;
            background: rgba(35, 86, 181, 0.05);
            filter: blur(100px);
            pointer-events: none;
        }

        /* Material Icons через Bootstrap Icons */
        .bi-icon {
            font-size: 1.25rem;
            vertical-align: middle;
        }

        .bi-icon-sm {
            font-size: 1rem;
        }

        /*АДАПТИВНОСТЬ*/

        @media (max-width: 768px) {
            .display-lg {
                font-size: 32px;
                line-height: 40px;
            }
        }
</style>

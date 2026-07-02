<script>
import axios from 'axios';

export default {
    data(){
        return{
            email: null
        }
    },

    mounted(){

    },

    methods: {
        async trustMail(evt){
            evt.preventDefault();
            try{
                let response = await axios.post('register', {
                    email: this.email
                })
                if (response.status === 200 || response.status === 201) {
                if (response.data.id || response.data.user) {
                    const userData = {
                        id: response.data.id || response.data.user?.id,
                        email: this.email
                    };
                    localStorage.setItem('user', JSON.stringify(userData));
                } else {
                    localStorage.setItem('user', JSON.stringify({
                        email: this.email
                    }));
                }
                
                this.$router.push('/');
            }
            } catch (err) {
                console.log(err)
            }
        }
    }
}
</script>

<template>
    <body>
<main class="flex-grow d-flex flex-column align-items-center justify-content-center position-relative overflow-hidden" style="padding-top: 128px; padding-bottom: 80px; padding-left: 16px; padding-right: 16px;">
    <!-- Декоративные элементы фона -->
    <div class="bg-blob-1"></div>
    <div class="bg-blob-2"></div>
    <!-- Блок входа -->
    <div class="w-100" style="max-width: 480px; z-index: 10;">
        <!-- Заголовок -->
        <header class="text-center mb-4">
            <h1 class="fw-700 text-primary-custom mb-1" style="font-size: 32px; line-height: 40px; letter-spacing: -0.01em;">
                Подтверждение входа
            </h1>
            <p class="text-secondary-custom" style="font-size: 16px; line-height: 24px; font-weight: 400;">
                Введите адрес электронной почты
            </p>
        </header>
        <!-- Карточка входа -->
        <section class="login-card">
            <form id="loginForm" @submit="trustMail">
                <!-- Поле: Email -->
                <div class="mb-3">
                    <label class="form-label fw-600 ms-1" for="email" style="font-size: 14px; line-height: 20px; letter-spacing: 0.01em; color: var(--on-surface-variant);">
                        Почта
                    </label>
                    <div class="position-relative input-group-focus">
                        <i class="bi bi-envelope input-icon"></i>
                        <input v-model="email" type="email" class="academic-input" id="email" name="email" placeholder="Введите вашу почту" required />
                    </div>
                </div>
                <!-- Кнопка подтверждения -->
                <button type="submit" class="btn-confirm">
                    <span>Подтвердить</span>
                    <i class="bi bi-arrow-right" style="font-size: 20px;"></i>
                </button>
            </form>
        </section>
        <!-- Кнопка "Вход для администратора" -->
            <div to="/admin" class="mt-3 text-center">
                <router-link to="/admin" class="btn-admin" id="adminBtn">
                    Вход для администратора
                </router-link>
            </div>
    </div>
</main>    
</body>
</template>

<style>
/*БАЗОВЫЕ СТИЛИ */
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8f9fb;
            color: #191c1e;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        /* ЦВЕТОВАЯ СХЕМА */
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

        /* КОМПОНЕНТЫ
        /* Стеклянный эффект */
        .glass-effect {
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }

        /* Карточка входа */
        .login-card {
            background: var(--surface-container-lowest);
            border-radius: 0.75rem;
            padding: 24px;
            box-shadow: 0px 10px 30px var(--shadow-color);
            border: 1px solid rgba(225, 226, 228, 0.5);
        }

        @media (min-width: 768px) {
            .login-card {
                padding: 48px;
            }
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

        /* Поле ввода */
        .academic-input {
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
            box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
            background-color: var(--surface-container-low);
            border-color: var(--surface-variant);
            border-radius: 0.5rem;
            padding: 0.75rem 1rem 0.75rem 3rem;
            font-family: 'Inter', sans-serif;
            font-size: 16px;
            line-height: 24px;
            font-weight: 400;
            color: var(--on-surface);
            width: 100%;
            border: 1px solid var(--surface-variant);
        }

        .academic-input:focus {
            outline: none;
            border-color: var(--primary-container);
            box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05), 0 0 0 4px rgba(0, 82, 204, 0.1);
        }

        .academic-input::placeholder {
            color: var(--outline);
        }

        /* Иконка в поле ввода */
        .input-icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: var(--outline);
            transition: color 0.2s ease;
            font-size: 1.25rem;
            pointer-events: none;
        }

        .input-group-focus .input-icon {
            color: var(--primary);
        }

        /* Кнопка подтверждения */
        .btn-confirm {
            background-color: var(--primary-container);
            color: #ffffff;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            line-height: 20px;
            letter-spacing: 0.01em;
            font-weight: 600;
            border: none;
            box-shadow: 0 4px 14px rgba(0, 82, 204, 0.2);
            transition: all 0.2s ease;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }

        .btn-confirm:hover {
            opacity: 0.9;
        }

        .btn-confirm:active {
            transform: scale(0.98);
        }

        .btn-confirm:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }

        /* Кнопка для администратора */
        .btn-admin {
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            line-height: 20px;
            letter-spacing: 0.01em;
            font-weight: 600;
            color: var(--secondary);
            padding: 0.5rem 1rem;
            border-radius: 9999px;
            border: none;
            background: transparent;
            transition: all 0.2s ease;
        }

        .btn-admin:hover {
            color: var(--primary);
            background-color: var(--surface-container-high);
        }

        .btn-admin:active {
            transform: scale(0.95);
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

        /* Утилиты */

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

        .bg-surface-container-lowest {
            background-color: var(--surface-container-lowest);
        }

        .bg-surface-container {
            background-color: var(--surface-container);
        }

        .border-surface-variant {
            border-color: var(--surface-variant);
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

        /* Фоновые декоративные элементы */
        .bg-blob-1 {
            position: absolute;
            top: 25%;
            left: 25%;
            width: 384px;
            height: 384px;
            border-radius: 50%;
            background: rgba(0, 82, 204, 0.05);
            filter: blur(120px);
            pointer-events: none;
        }

        .bg-blob-2 {
            position: absolute;
            bottom: 25%;
            right: 25%;
            width: 320px;
            height: 320px;
            border-radius: 50%;
            background: rgba(35, 86, 181, 0.05);
            filter: blur(100px);
            pointer-events: none;
        }

        /* Частицы */
        .particle {
            position: absolute;
            border-radius: 9999px;
            background: rgba(0, 61, 155, 0.1);
            pointer-events: none;
            z-index: -10;
        }

        /* Анимация */
        @keyframes spin {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }

        .animate-spin {
            animation: spin 1s linear infinite;
        }

        /* Тост (уведомление) */
        .toast-custom {
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%);
            background: var(--on-surface);
            color: var(--surface);
            padding: 0.5rem 1.5rem;
            border-radius: 9999px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            line-height: 20px;
            letter-spacing: 0.01em;
            font-weight: 600;
            transition: all 0.5s ease;
            opacity: 0;
            transform: translateX(-50%) translateY(80px);
            z-index: 100;
        }

        .toast-custom.show {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }

        /* АДАПТИВНОСТЬ*/

        @media (max-width: 768px) {
            .pt-32 {
                padding-top: 128px;
            }
            .pb-xl {
                padding-bottom: 80px;
            }
        }
</style>

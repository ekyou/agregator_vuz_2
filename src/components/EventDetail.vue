<script>
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
dayjs.locale('ru');

export default {
    data(){
        return{
            event: null,
        }
    },

    mounted(){
        const id = this.$route.params.id;
        this.loadEvent(id);
        this.getUser();
    },

    computed: {
        hasUserResponded() {
            if (!this.event || !this.user || !this.user.id) return false;
            if (!this.event.respondents) return false;
            return this.event.respondents.includes(this.user.id);
        },

        buttonText() {
            if (this.isResponding) return 'Отправка...';
            if (this.hasUserResponded) return 'Отписаться';
            return 'Откликнуться';
        },

        buttonClass() {
            return {
                'btn-primary-custom': true,
                'btn-responded': this.hasUserResponded,
                'btn-loading': this.isResponding
            };
        },

        participantsCount() {
            return this.event?.responseCount || 0;
        }
    },

    methods: {
        async loadEvent(id){
            let response = await axios.get('event', {
                params:
                {
                    _id: id
                }
            });
            this.event = response.data;
        },

        getFullDate(item){
			return dayjs(item.eventDate).format('DD MMMM в HH:mm')
		},

        getUser() {
            const userData = localStorage.getItem('user');
            if (userData) {
                try {
                    this.user = JSON.parse(userData);
                } catch (e) {
                    this.user = null;
                }
            }
        },

        async respondToEvent() {
            if (!this.user || !this.user.id) {
                this.$router.push('/register');
                return;
            }

            if (this.hasUserResponded) {
                await this.unsubscribeFromEvent();
                return;
            }

            await this.subscribeToEvent();
        },

        async subscribeToEvent() {
            this.isResponding = true;

            try {
                const response = await axios.post('events/respond', {
                    eventId: this.event._id,
                    userId: this.user.id
                });

                this.event.responseCount = response.data.responseCount;
                if (!this.event.respondents) {
                    this.event.respondents = [];
                }
                this.event.respondents.push(this.user.id);
            } catch (error) {
                console.error('Ошибка:', error);
            } finally {
                this.isResponding = false;
            }
        },

        async unsubscribeFromEvent() {
            this.isResponding = true;

            try {
                const response = await axios.delete('events/respond', {
                    data: {
                        eventId: this.event._id,
                        userId: this.user.id
                    }
                });

                this.event.responseCount = response.data.responseCount;
                if (this.event.respondents) {
                    const index = this.event.respondents.indexOf(this.user.id);
                    if (index !== -1) {
                        this.event.respondents.splice(index, 1);
                    }
                }


            } catch (error) {
                console.error('Ошибка:', error);
            } finally {
                this.isResponding = false;
            }
        }
    }
}
</script>

<template>
    <header v-if="event" class="hero-gradient pt-32 pb-xl px-margin-mobile overflow-hidden position-relative">
        <!-- декоративные круги -->
        <div class="position-absolute top-20 end-0 w-500 h-500 bg-primary-container/5 rounded-circle blur-100" style="right: -10%;"></div>
        <div class="position-absolute bottom-0 start-0 w-400 h-400 bg-tertiary-container/10 rounded-circle blur-80" style="left: -5%; bottom: -10%;"></div>
        <div class="container-fluid mx-auto position-relative z-10">
            <div class="row g-xl align-items-center">
                <!-- Левый блок -->
                <div class="col-lg-6">
                    <div class="d-flex flex-column gap-md">
                        <h1 class="display-lg text-tertiary tracking-tight leading-tight">
                            {{ event.title }}
                        </h1>
                        <p class="body-lg text-secondary max-w-xl">
                            {{ event.description }}
                        </p>
                        <div class="d-flex flex-wrap gap-md pt-1">
                            <div class="d-flex align-items-center gap-sm">
                                <div class="w-12 h-12 rounded-xl bg-white d-flex align-items-center justify-content-center text-tertiary shadow-sm">
                                    <span class="material-symbols-outlined">calendar_today</span>
                                </div>
                                <div>
                                    <p class="label-sm text-secondary text-uppercase tracking-wider mb-0">Дата</p>
                                    <p class="label-md text-on-surface mb-0">{{ getFullDate(event) }}</p>
                                </div>
                            </div>
                            <div class="d-flex align-items-center gap-sm">
                                <div class="w-12 h-12 rounded-xl bg-white d-flex align-items-center justify-content-center text-tertiary shadow-sm">
                                    <span class="material-symbols-outlined">location_on</span>
                                </div>
                                <div>
                                    <p class="label-sm text-secondary text-uppercase tracking-wider mb-0">Локация</p>
                                    <p class="label-md text-on-surface mb-0">{{ event.location }}</p>
                                </div>
                            </div>
                            <div class="d-flex align-items-center gap-sm">
                                <div class="w-12 h-12 rounded-xl bg-white d-flex align-items-center justify-content-center text-tertiary shadow-sm">
                                    <span class="material-symbols-outlined text-tertiary" style="font-variation-settings: 'FILL' 1;">groups</span>
                                </div>
                                <div>
                                    <p class="label-sm text-secondary text-uppercase tracking-wider mb-0">Участники</p>
                                    <p class="label-md text-on-surface mb-0">{{ event.responseCount }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="d-flex flex-wrap align-items-center gap-md pt-3">
                            <button 
                                class="btn-primary-custom"
                                :class="buttonClass"
                                @click="respondToEvent"
                                :disabled="isResponding"
                            >
                                <span v-if="isResponding">
                                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                                    Отправка...
                                </span>
                                <span v-else-if="hasUserResponded">
                                    <i class="bi bi-x-circle-fill me-1"></i>
                                    Отписаться
                                </span>
                                <span v-else>
                                    <i class="bi bi-person-plus me-1"></i>
                                    Откликнуться
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
                <!-- Правый блок: изображение -->
                <div class="col-lg-6 position-relative">
                    <div class="glass-card p-2 rounded-4 overflow-hidden">
                        <img class="w-100 h-100 object-cover rounded-3" style="aspect-ratio: 16/9;" :src="`/uploads/${ event.image }`" >
                    </div>
                    <!-- плавающая карточка -->
                    <div class="position-absolute translate-middle-y start-0 bottom-0 mb-n3 ms-n3 glass-card p-md rounded-4 border border-white d-flex align-items-center gap-md animate-bounce-subtle" style="bottom: -1.5rem; left: -1.5rem; transform: translateY(0);">
                        <p class="label-sm text-on-surface mb-0"> {{ event.responseCount }} студентов уже <br> зарегистрировано</p>
                    </div>
                </div>
            </div>
        </div>
    </header>
</template>

<style>
/*Глобальные переменные*/
        :root {
             --primary: #003d9b;
            --primary-container: #0052cc;
            --primary-fixed: #dae2ff;
            --secondary: #555f6c;
            --secondary-container: #d9e3f2;
            --tertiary: #003e96;
            --tertiary-container: #2356b5;
            --surface: #f8f9fb;
            --surface-container-low: #f3f4f6;
            --surface-container-lowest: #ffffff;
            --surface-container: #edeef0;
            --on-surface: #191c1e;
            --on-surface-variant: #434654;
            --outline: #737685;
            --outline-variant: #c3c6d6;
            --background: #f8f9fb;
            --shadow-color: rgba(0, 82, 204, 0.08);
        }
        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--background);
            color: var(--on-background);
            overflow-x: hidden;
        }
        /* Кастомные утилиты*/
        .bg-surface { background-color: var(--surface); }
        .bg-surface-container-low { background-color: var(--surface-container-low); }
        .bg-primary-container { background-color: var(--primary-container); }
        .bg-primary-container\/10 { background-color: rgba(0, 82, 204, 0.1); }
        .bg-primary-container\/5 { background-color: rgba(0, 82, 204, 0.05); }
        .bg-tertiary-container\/10 { background-color: rgba(35, 86, 181, 0.1); }
        .text-secondary { color: var(--secondary); }
        .text-tertiary { color: var(--tertiary); }
        .text-on-surface { color: var(--on-surface); }
        .text-white { color: #fff; }
        .border-primary-container { border-color: var(--primary-container); }
        .border-primary-container\/20 { border-color: rgba(0, 82, 204, 0.2); }
        .border-secondary-container { border-color: var(--secondary-container); }
        .border-white\/20 { border-color: rgba(255, 255, 255, 0.2); }
        .shadow-primary-container\/20 { box-shadow: 0 4px 14px rgba(0, 82, 204, 0.2); }
        .shadow-primary-container\/8 { box-shadow: 0 10px 30px rgba(0, 82, 204, 0.08); }
        .shadow-primary-container\/20-heavy { box-shadow: 0 8px 32px rgba(0, 82, 204, 0.2); }

        /* Glass‑карточка */
        .glass-card {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0px 10px 30px rgba(0, 82, 204, 0.08);
        }
        .hero-gradient {
            background: radial-gradient(circle at top right, #dae2ff 0%, #f8f9fb 100%);
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }
        .speaker-glow:hover {
            box-shadow: 0 0 25px rgba(0, 82, 204, 0.2);
        }
        /* Анимация для bounce-карточки */
        @keyframes subtleBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
        }
        .animate-bounce-subtle {
            animation: subtleBounce 3s ease-in-out infinite;
        }
        /* Для секций — плавное появление */
        .section-fade {
            transition: opacity 0.7s ease, transform 0.7s ease;
            opacity: 0;
            transform: translateY(20px);
        }
        .section-fade.visible {
            opacity: 1;
            transform: translateY(0);
        }
        /* переопределение для заголовков */
        .headline-lg {
            font-size: 32px;
            font-weight: 700;
            line-height: 40px;
            letter-spacing: -0.01em;
        }
        .headline-md {
            font-size: 24px;
            font-weight: 600;
            line-height: 32px;
        }
        .display-lg {
            font-size: 48px;
            font-weight: 700;
            line-height: 56px;
            letter-spacing: -0.02em;
        }
        .body-lg {
            font-size: 18px;
            font-weight: 400;
            line-height: 28px;
        }
        .body-md {
            font-size: 16px;
            font-weight: 400;
            line-height: 24px;
        }
        .label-md {
            font-size: 14px;
            font-weight: 600;
            line-height: 20px;
            letter-spacing: 0.01em;
        }
        .label-sm {
            font-size: 12px;
            font-weight: 500;
            line-height: 16px;
        }
        .tracking-tight { letter-spacing: -0.02em; }
        .tracking-wider { letter-spacing: 0.05em; }
        .leading-tight { line-height: 1.2; }
        .backdrop-blur-xl { backdrop-filter: blur(20px); }
        .active\:scale-95:active { transform: scale(0.95); }
        .transition-colors { transition: color 0.2s ease; }
        .transition-all { transition: all 0.2s ease; }
        .hover\:brightness-110:hover { filter: brightness(1.1); }
        .hover\:bg-primary-container\/5:hover { background-color: rgba(0, 82, 204, 0.05); }
        .hover\:bg-primary-container\/10:hover { background-color: rgba(0, 82, 204, 0.1); }
        .duration-200 { transition-duration: 200ms; }
        .duration-700 { transition-duration: 700ms; }
        .rounded-xl { border-radius: 0.75rem; }
        .rounded-2xl { border-radius: 1rem; }
        .rounded-3xl { border-radius: 1.5rem; }
        .rounded-full { border-radius: 9999px; }
        .rounded-2xl { border-radius: 1rem; }
        .border-2 { border-width: 2px; }
        .border-b-2 { border-bottom-width: 2px; }
        .border-b { border-bottom-width: 1px; }
        .border-t { border-top-width: 1px; }
        .border { border-width: 1px; }
        .border-white { border-color: #fff; }
        .shadow-sm { box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
        .shadow-lg { box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
        .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }

        /* доп. отступы */

        .px-margin-desktop { padding-left: 64px; padding-right: 64px; }
        @media (min-width: 768px) {
            .px-margin-mobile { padding-left: 64px; padding-right: 64px; }
        }
        .py-xl { padding-top: 80px; padding-bottom: 80px; }
        .pt-xl { padding-top: 80px; }
        .pb-xl { padding-bottom: 80px; }
        .pt-32 { padding-top: 8rem; }
        .py-lg { padding-top: 48px; padding-bottom: 48px; }
        .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
        .px-sm { padding-left: 12px; padding-right: 12px; }
        .px-lg { padding-left: 48px; padding-right: 48px; }
        .px-xl { padding-left: 80px; padding-right: 80px; }
        .p-sm { padding: 12px; }
        .p-md { padding: 24px; }
        .p-lg { padding: 48px; }
        .p-2 { padding: 0.5rem; }
        .gap-xs { gap: 4px; }
        .gap-sm { gap: 12px; }
        .gap-md { gap: 24px; }
        .gap-lg { gap: 48px; }
        .gap-xl { gap: 80px; }
        .gap-gutter { gap: 24px; }
        .space-y-xs > * + * { margin-top: 4px; }
        .space-y-sm > * + * { margin-top: 12px; }
        .space-y-md > * + * { margin-top: 24px; }
        .space-y-xl > * + * { margin-top: 80px; }
        .mt-4 { margin-top: 1rem; }
        .mb-0 { margin-bottom: 0; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .max-w-7xl { max-width: 80rem; }
        .max-w-xl { max-width: 36rem; }
        .w-full { width: 100%; }
        .h-20 { height: 5rem; }
        .h-12 { height: 3rem; }
        .h-10 { height: 2.5rem; }
        .h-\[500px\] { height: 500px; }
        .h-\[400px\] { height: 400px; }
        .w-12 { width: 3rem; }
        .w-10 { width: 2.5rem; }
        .w-\[500px\] { width: 500px; }
        .w-\[400px\] { width: 400px; }
        .min-vh-100 { min-height: 100vh; }
        .object-cover { object-fit: cover; }
        .overflow-hidden { overflow: hidden; }
        .overflow-x-hidden { overflow-x: hidden; }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .fixed { position: fixed; }
        .top-20 { top: 5rem; }
        .top-0 { top: 0; }
        .right-\[-10\%\] { right: -10%; }
        .bottom-\[-10\%\] { bottom: -10%; }
        .left-\[-5\%\] { left: -5%; }
        .-bottom-6 { bottom: -1.5rem; }
        .-left-6 { left: -1.5rem; }
        .z-50 { z-index: 50; }
        .z-10 { z-index: 10; }
        .flex { display: flex; }
        .inline-flex { display: inline-flex; }
        .grid { display: grid; }
        .hidden { display: none; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .justify-between { justify-content: space-between; }
        .flex-col { flex-direction: column; }
        .flex-wrap { flex-wrap: wrap; }
        .text-center { text-align: center; }
        .uppercase { text-transform: uppercase; }
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .font-medium { font-weight: 500; }
        .whitespace-nowrap { white-space: nowrap; }
        .bg-white { background-color: #fff; }
        .bg-slate-200 { background-color: #e2e8f0; }
        .bg-slate-300 { background-color: #cbd5e1; }
        .bg-slate-400 { background-color: #94a3b8; }
        .bg-black\/10 { background-color: rgba(0,0,0,0.1); }
        .bg-surface\/70 { background-color: rgba(248, 249, 251, 0.7); }
        .aspect-video { aspect-ratio: 16 / 9; }
        .-space-x-3 > * + * { margin-left: -0.75rem; }
        .blur-\[100px\] { filter: blur(100px); }
        .blur-\[80px\] { filter: blur(80px); }

        @media (min-width: 768px) {
            .md\:flex { display: flex; }
            .md\:hidden { display: none; }
            .md\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
            .md\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
            .md\:px-margin-desktop { padding-left: 64px; padding-right: 64px; }
            .md\:justify-end { justify-content: flex-end; }
            .md\:gap-md { gap: 24px; }
        }
        @media (min-width: 992px) {
            .lg\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
            .lg\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
            .lg\:col-span-2 { grid-column: span 2; }
        }
        /* для кроссбраузерности */
        .btn-primary-custom {
            background-color: var(--primary-container);
            color: white;
            border: none;
            padding: 12px 48px;
            border-radius: 1rem;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.2s ease;
        }
        .btn-primary-custom:hover {
            filter: brightness(1.1);
            transform: scale(0.98);
            background-color: var(--primary-container);
        }
        .btn-outline-primary-custom {
            background: transparent;
            color: var(--primary);
            border: 2px solid var(--primary-container);
            padding: 12px 32px;
            border-radius: 1rem;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.2s ease;
        }
        .btn-outline-primary-custom:hover {
            background-color: rgba(0, 82, 204, 0.05);
            transform: scale(0.98);
        }
        .badge-primary-light {
            background-color: rgba(0, 82, 204, 0.1);
            color: var(--primary);
            padding: 4px 12px;
            border-radius: 9999px;
            border: 1px solid rgba(0, 82, 204, 0.2);
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }
/* ============================================================
    КНОПКА ОТКЛИКА (ГОТОВЫЙ БЛОК)
    ============================================================ */

/* Базовая кнопка */
.btn-primary-custom {
    background-color: var(--primary-container);
    color: white;
    border: none;
    padding: 12px 48px;
    border-radius: 1rem;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center; /* ✅ Центрируем содержимое */
    gap: 8px;
    text-align: center; /* ✅ Центрируем текст */
}

.btn-primary-custom:hover:not(:disabled):not(.btn-responded) {
    filter: brightness(1.1);
    transform: scale(0.98);
    background-color: var(--primary-container);
}

.btn-primary-custom:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Кнопка "Откликнулся" (белый фон + синяя обводка) */
.btn-primary-custom.btn-responded {
    background: #ffffff;
    color: var(--primary);
    border: 2px solid var(--primary);
    box-shadow: 0 2px 8px rgba(0, 82, 204, 0.1);
}

.btn-primary-custom.btn-responded:hover:not(:disabled) {
    background: #f0f5ff;
    border-color: var(--primary-container);
    box-shadow: 0 4px 12px rgba(0, 82, 204, 0.15);
    transform: scale(0.98);
}

/* Крестик синий */
.btn-primary-custom.btn-responded .bi-x-circle-fill {
    color: var(--primary);
    font-size: 18px;
}

.btn-primary-custom.btn-responded:hover:not(:disabled) .bi-x-circle-fill {
    color: var(--primary-container);
}

/* Иконка "Откликнуться" */
.btn-primary-custom .bi-person-plus {
    font-size: 18px;
}

/* Спиннер загрузки */
.spinner-border-sm {
    width: 16px;
    height: 16px;
    border-width: 2px;
}

/* Кнопка "Назад" */
.btn-outline-primary-custom {
    background: transparent;
    color: var(--primary);
    border: 2px solid var(--primary-container);
    padding: 12px 32px;
    border-radius: 1rem;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.2s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center; /* ✅ Центрируем содержимое */
    gap: 8px;
    text-align: center; /* ✅ Центрируем текст */
}

.btn-outline-primary-custom:hover {
    background-color: rgba(0, 82, 204, 0.05);
    transform: scale(0.98);
}

/* Адаптивность */
@media (max-width: 768px) {
    .btn-primary-custom,
    .btn-outline-primary-custom {
        padding: 10px 24px;
        font-size: 13px;
    }
}
</style>

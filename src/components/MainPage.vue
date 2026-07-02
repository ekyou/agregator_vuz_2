<script>
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import isToday from 'dayjs/plugin/isToday';
import isTomorrow from 'dayjs/plugin/isTomorrow';
import isBetween from 'dayjs/plugin/isBetween';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.locale('ru');
dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.extend(isBetween);
dayjs.extend(isoWeek);

export default {
  data(){
    return{
        selectedCategories: [],
        events: [],
        selectedDate: null,
        dateFilter: 'all',
        categories: [
            { value: 'it', label: 'IT и технологии' },
            { value: 'science', label: 'Наука' },
            { value: 'sport', label: 'Спорт' },
            { value: 'culture', label: 'Культура' },
            { value: 'education', label: 'Образование' },
            { value: 'entertainment', label: 'Развлечения' },
            { value: 'other', label: 'Другое' }
        ],
        isResponding: {},
        user: null
    }
  },

  mounted(){
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.getAllEvents();
    this.getUser();
  },

    computed: {
        filteredByCategory() {
            if (this.selectedCategories.length === 0) {
                return this.events;
            }
            return this.events.filter(event => 
                this.selectedCategories.includes(event.category)
            );
        },

        filteredByDate() {
            let result = this.filteredByCategory;
            
            if (this.dateFilter === 'all') {
                return result;
            }
            
            const now = dayjs();
            
            return result.filter(event => {
                if (!event.eventDate) return false;
                const date = dayjs(event.eventDate);
                
                switch (this.dateFilter) {
                    case 'today':
                        return date.isToday();
                    case 'tomorrow':
                        return date.isTomorrow();
                    case 'week':
                        return date.isBetween(
                            now.startOf('isoWeek'),
                            now.endOf('isoWeek'),
                            'day',
                            '[]'
                        );
                    case 'custom':
                        if (!this.selectedDate) return true;
                        return date.isSame(dayjs(this.selectedDate), 'day');
                    default:
                        return true;
                }
            });
        },

        filteredEvents() {
            return this.filteredByDate;
        },

        activeFilterText() {
            if (this.dateFilter === 'all') return 'Все даты';
            const map = {
                'today': 'Сегодня',
                'tomorrow': 'Завтра',
                'week': 'Эта неделя',
                'custom': this.selectedDate ? this.formatDateForDisplay(this.selectedDate) : 'Выбрана дата'
            };
            return map[this.dateFilter] || 'Все даты';
        },

        eventsCount(){
            let count = this.filteredEvents.length;
            if(count == 0 || (count > 4 && count < 21)){
                return "Найдено " + count + " событий";
            } else if(count-(count-count%10) == 1) {
                return "Найдено " + count + " событие";
            } else if(count-(count-count%10) == 2 || count-(count-count%10) == 3 || count-(count-count%10) == 4){
            return "Найдено " + count + " события";
            } else {
                return "Найдено " + count + " события"
            }
        },

        hasUserResponded() {
            return (event) => {
                if (!this.user || !this.user.id) return false;
                if (!event.respondents) return false;
                return event.respondents.includes(this.user.id);
            };
        },

        getButtonText() {
        return (event) => {
            if (this.isResponding[event._id]) {
                return 'Отправка...';
            }
            if (this.hasUserResponded(event)) {
                return 'Отписаться';
            }
            return 'Откликнуться';
        };
        },

        getButtonClass() {
            return (event) => {
                const isResponded = this.hasUserResponded(event);
                return {
                    'btn-register': true,
                    'btn-responded': isResponded,
                    'btn-active': isResponded,
                    'btn-loading': this.isResponding[event._id]
                };
            };
        },
    },

    methods: {
        async getAllEvents(){
            let response = await axios.get('events');
            this.events = response.data;
        },

        formatDateDay(dateString) {
            if (!dateString) return '??';
            const date = new Date(dateString);
            return date.getDate().toString().padStart(2, '0');
        },

        formatDateMonth(dateString) {
            if (!dateString) return '???';
            const date = new Date(dateString);
            const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
            return months[date.getMonth()];
        },

        categoryLabel(item){
            for(let i = 0; i < this.categories.length; i++){
                if(item.category === this.categories[i].value){
                    return this.categories[i].label
                }
            }
        },

        resetCategories(){
            this.selectedCategories = [];
        },

        setDateFilter(type, date = null) {
            this.dateFilter = type;
            if (type === 'custom' && date) {
                this.selectedDate = date;
            }
        },

        resetDateFilter() {
            this.dateFilter = 'all';
            this.selectedDate = null;
        },

        formatDateForDisplay(date) {
            if (!date) return '';
            return dayjs(date).format('DD MMMM YYYY');
        },
        
        getUser() {
            const userData = localStorage.getItem('user');
            if (userData) {
                this.user = JSON.parse(userData);
            }
        },
        
        async respondToEvent(event) {
            if (!this.user) {
                this.$router.push('/register');
            }

            if (this.hasUserResponded(event)) {
                await this.unsubscribeFromEvent(event);
                return;
            }

            await this.subscribeToEvent(event);
        },

        async subscribeToEvent(event) {
            this.isResponding[event._id] = true;

            try {
                const response = await axios.post('events/respond', {
                    eventId: event._id,
                    userId: this.user.id
                });

                event.responseCount = response.data.responseCount;
                if (!event.respondents) {
                    event.respondents = [];
                }
                event.respondents.push(this.user.id);

            } catch (error) {
                console.error('Ошибка:', error);
            } finally {
                this.isResponding[event._id] = false;
            }
        },

        async unsubscribeFromEvent(event) {
            this.isResponding[event._id] = true;

            try {
                const response = await axios.delete('events/respond', {
                    data: {
                        eventId: event._id,
                        userId: this.user.id
                    }
                });

                event.responseCount = response.data.responseCount;
                if (event.respondents) {
                    const index = event.respondents.indexOf(this.user.id);
                    if (index !== -1) {
                        event.respondents.splice(index, 1);
                    }
                }

            } catch (error) {
                console.error('Ошибка:', error);
                alert((error.response?.data?.message || 'Ошибка отписки'));
            } finally {
                this.isResponding[event._id] = false;
            }
        },
        }
}


</script>

<template>
<main class="pt-32 pb-5 px-3 px-md-5 min-vh-100" style="padding-top: 96px;">
        <div class="container-fluid px-0" style="max-width: 1440px;">
            <div class="row g-4">
                <!--Фильтры-->
                <aside class="col-lg-3">
                    <div class="filter-card">
                        <!-- Заголовок фильтров -->
                        <div class="d-flex align-items-center justify-content-between mb-4">
                            <h2 class="filter-title">Фильтры</h2>
                            <button @click="resetCategories" class="filter-reset">Сбросить</button>
                        </div>
                        <!-- Категория -->
                        <div class="filter-group">
                            <h3 class="filter-label">Категория</h3>
                            <div class="d-flex flex-column gap-2">
                                <label class="filter-check">
                                    <input 
                                        type="checkbox" 
                                        :checked="selectedCategories.length === 0"
                                        @change="filterByCategory('all')"
                                    />
                                    <span class="filter-label-text">Все мероприятия</span>
                                </label>
                                <label 
                                    v-for="cat in categories" 
                                    :key="cat.value"
                                    class="filter-check"
                                >
                                    <input 
                                        type="checkbox" 
                                        :value="cat.value"
                                        v-model="selectedCategories"
                                    />
                                    <span class="filter-label-text">{{ cat.label }}</span>
                                </label>
                            </div>
                        </div>
                        <!-- Дата -->
                        <div class="filter-group">
                            <h3 class="filter-label">Дата</h3>
                            <div class="row g-2">
                                <div class="col-6">
                                    <button @click="setDateFilter('today')" :class="{ 'active': dateFilter === 'today' }" class="filter-btn w-100">Сегодня</button>
                                </div>
                                <div class="col-6">
                                    <button @click="setDateFilter('tomorrow')" :class="{ 'active': dateFilter === 'tomorrow' }" class="filter-btn w-100">Завтра</button>
                                </div>
                                <div class="col-12">
                                    <button @click="setDateFilter('week')" :class="{ 'active': dateFilter === 'week' }" class="filter-btn w-100">На этой неделе</button>
                                </div>
                            </div>
                            <input v-model="selectedDate" @change="setDateFilter('custom', selectedDate)" :class="{ 'active': dateFilter === 'custom' }" type="date" class="filter-date-input" />
                                <button 
                                    v-if="dateFilter !== 'all'" 
                                    class="filter-reset mt-2" 
                                    @click="resetDateFilter"
                                >
                                    Сбросить фильтр даты
                                </button>
                        </div>
                    </div>
                </aside>
                <!--ОСНОВНАЯ СЕКЦИЯ (Список мероприятий) -->
                <section class="col-lg-9">
                    <!-- Заголовок -->
                    <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
                        <div>
                            <h1 class="fs-headline-lg text-on-surface mb-1">
                                Предстоящие мероприятия
                            </h1>
                            <p class="text-secondary-custom" style="font-size: 16px; line-height: 24px; font-weight: 400; margin: 0;">
                                {{ eventsCount }}
                            </p>
                        </div>
                    </div>
                    <!-- СЕТКА КАРТОЧЕК МЕРОПРИЯТИЙ -->
                    <div class="row g-4">
                        <!-- Карточка -->
                        <div v-for="(item, index) in filteredEvents" class="col-md-6 col-xl-4">
                            <div class="event-card card-animate" style="animation-delay: 0.1s;">
                                <router-link :to="`/events/${item._id}`" class="text-decoration-none">
                                    <div class="position-relative overflow-hidden">
                                        <img class="w-100 h-100 object-fit-cover" :src="`uploads/${ item.image }`">
                                        <span class="event-badge event-badge-primary">{{ categoryLabel(item) }}</span>
                                        <div class="event-date-box">
                                            <span class="event-date-day">{{ formatDateDay(item.eventDate) }}</span>
                                            <span class="event-date-month">{{ formatDateMonth(item.eventDate) }}</span>
                                        </div>
                                    </div>
                                    <div class="p-3">
                                        <h3 class="event-title">
                                        <div class="event-title">{{ item.title }}</div>
                                        </h3>
                                        <div class="d-flex flex-column gap-2 mb-3">
                                            <div class="event-info">
                                                <i class="bi bi-geo-alt"></i>
                                                <span>{{ item.location }}</span>
                                            </div>
                                            <div class="event-info">
                                                <i class="bi bi-people"></i>
                                                <span>Откликов: {{ item.responseCount }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </router-link>
                                <div class="p-3 pt-0">
                                    <button 
                                        class="btn-register"
                                        :class="getButtonClass(item)"
                                        @click="respondToEvent(item)"
                                        :disabled="isResponding[item._id]"
                                    >
                                        <span v-if="isResponding[item._id]">
                                            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Отправка...
                                        </span>
                                        
                                        <span v-else-if="hasUserResponded(item)">
                                            <i class="bi bi-x-circle-fill me-1"></i>
                                            Отписаться
                                            <span class="badge bg-white text-primary ms-2">{{ item.responseCount || 0 }}</span>
                                        </span>
                                        
                                        <span v-else>
                                            Откликнуться
                                            <span class="badge bg-white text-primary ms-2">{{ item.responseCount || 0 }}</span>
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </main>
</template>

<style>
router-link {
    text-decoration: none;
}
/* ============================================================
        БАЗОВЫЕ СТИЛИ
    ============================================================ */
body {
    font-family: 'Inter', sans-serif;
    background-color: #f8f9fb;
    color: #191c1e;
}

/* ============================================================
        ЦВЕТОВАЯ СХЕМА
    ============================================================ */
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

/* ============================================================
    НАВИГАЦИЯ
    ============================================================ */
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

/* Строка поиска */
.search-wrapper {
    background-color: var(--surface-container-low);
    border: 1px solid var(--outline-variant);
    border-radius: 9999px;
    padding: 0.25rem 0.75rem;
    display: flex;
    align-items: center;
    transition: border-color 0.2s ease;
}

.search-wrapper:focus-within {
    border-color: var(--primary);
}

.search-wrapper input {
    background: transparent;
    border: none;
    outline: none;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.01em;
    font-weight: 600;
    width: 200px;
    color: var(--on-surface);
}

.search-wrapper input::placeholder {
    color: var(--outline);
}

.search-wrapper .bi-search {
    color: var(--secondary);
    font-size: 1.25rem;
    margin-right: 0.5rem;
}

/* ============================================================
    САЙДБАР (ФИЛЬТРЫ)
    ============================================================ */
.filter-card {
    background: var(--surface-container-lowest);
    border-radius: 0.75rem;
    padding: 24px;
    box-shadow: 0px 10px 30px var(--shadow-color);
    border: 1px solid rgba(195, 198, 214, 0.2);
    position: sticky;
    top: 112px;
}

.filter-title {
    font-family: 'Inter', sans-serif;
    font-size: 24px;
    line-height: 32px;
    font-weight: 600;
    color: var(--on-surface);
    margin-bottom: 0;
}

.filter-reset {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.01em;
    font-weight: 600;
    color: var(--primary);
    background: none;
    border: none;
    padding: 0;
    text-decoration: underline;
}

.filter-reset:hover {
    text-decoration: none;
}

.filter-label {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.01em;
    font-weight: 600;
    color: var(--on-surface-variant);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
}

.filter-group {
    margin-bottom: 24px;
}

.filter-check {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    transition: color 0.2s ease;
}

.filter-check:hover .filter-label-text {
    color: var(--primary);
}

.filter-check input[type="checkbox"] {
    border-color: var(--outline);
    border-radius: 0.25rem;
    width: 1rem;
    height: 1rem;
    accent-color: var(--primary);
}

.filter-check input[type="radio"] {
    accent-color: var(--primary);
}

.filter-label-text {
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    line-height: 24px;
    font-weight: 400;
    color: var(--secondary);
    transition: color 0.2s ease;
}

.filter-btn {
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid var(--outline-variant);
    text-align: center;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.01em;
    font-weight: 600;
    transition: all 0.2s ease;
    background: transparent;
    color: var(--on-surface);
}

.filter-btn:hover {
    background-color: var(--primary);
    color: #ffffff;
    border-color: var(--primary);
}

.filter-date-input {
    margin-top: 0.5rem;
    width: 100%;
    border-radius: 0.5rem;
    border: 1px solid var(--outline-variant);
    padding: 0.5rem 0.75rem;
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    line-height: 24px;
    font-weight: 400;
    transition: border-color 0.2s ease;
}

.filter-date-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(0, 61, 155, 0.1);
}

/* ============================================================
    КАРТОЧКИ МЕРОПРИЯТИЙ
    ============================================================ */
.event-card {
    background: var(--surface-container-lowest);
    border-radius: 0.75rem;
    overflow: hidden;
    box-shadow: 0px 10px 30px var(--shadow-color);
    border: 1px solid rgba(195, 198, 214, 0.1);
    transition: all 0.3s ease;
    height: 100%;
}

.event-card:hover {
    box-shadow: 0px 20px 40px rgba(0, 82, 204, 0.12);
    transform: translateY(-4px);
}

.event-image {
    height: 192px;
    background-size: cover;
    background-position: center;
    transition: transform 0.5s ease;
}

.event-card:hover .event-image {
    transform: scale(1.05);
}

.event-badge {
    position: absolute;
    top: 1rem;
    left: 1rem;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.01em;
    font-weight: 600;
    padding: 0.25rem 1rem;
    border-radius: 9999px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
    z-index: 2;
}

.event-badge-primary {
    background: var(--primary);
    color: #ffffff;
}

.event-badge-sport {
    background: #0747A6;
    color: #ffffff;
}

.event-badge-tertiary {
    background: var(--tertiary);
    color: #ffffff;
}

.event-badge-secondary {
    background: var(--secondary);
    color: #ffffff;
}

.event-date-box {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(8px);
    padding: 0.5rem;
    border-radius: 0.5rem;
    text-align: center;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
    z-index: 2;
}

.event-date-day {
    display: block;
    font-weight: 700;
    color: var(--primary);
    line-height: 1;
    font-size: 1.25rem;
}

.event-date-month {
    display: block;
    font-size: 10px;
    text-transform: uppercase;
    font-weight: 700;
    color: var(--secondary);
}

.event-title {
    font-family: 'Inter', sans-serif;
    font-size: 24px;
    line-height: 32px;
    font-weight: 600;
    color: var(--on-surface);
    margin-bottom: 0.5rem;
    transition: color 0.2s ease;
}

.event-card:hover .event-title {
    color: var(--primary);
}

.event-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--secondary);
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    line-height: 24px;
    font-weight: 400;
}

.event-info .bi {
    font-size: 1.25rem;
}

.btn-register {
    width: 100%;
    background: var(--primary);
    color: #ffffff;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    border: none;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.01em;
    font-weight: 600;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-register:hover {
    background: var(--primary-container);
}

.btn-register:active {
    transform: scale(0.98);
}

.btn-outline-primary-custom {
    width: 100%;
    background: transparent;
    color: var(--primary);
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    border: 2px solid var(--primary);
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.01em;
    font-weight: 600;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.btn-outline-primary-custom:hover {
    background: var(--primary);
    color: #ffffff;
}

.btn-outline-primary-custom:active {
    transform: scale(0.98);
}

/* ============================================================
    ПАГИНАЦИЯ
    ============================================================ */
.pagination-custom .page-link {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    border: 1px solid var(--outline-variant);
    color: var(--on-surface);
    font-weight: 600;
    transition: all 0.2s ease;
}

.pagination-custom .page-link:hover {
    background: rgba(0, 82, 204, 0.1);
    border-color: var(--primary);
}

.pagination-custom .page-item.active .page-link {
    background: var(--primary);
    border-color: var(--primary);
    color: #ffffff;
}

.pagination-custom .page-link .bi {
    font-size: 1.25rem;
}

/* ============================================================
    ФУТЕР
    ============================================================ */
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

/* ============================================================
    ПЛАВАЮЩАЯ КНОПКА (FAB)
    ============================================================ */
.fab-button {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 56px;
    height: 56px;
    background: var(--primary);
    color: #ffffff;
    border-radius: 9999px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0px 10px 30px rgba(0, 82, 204, 0.3);
    transition: all 0.2s ease;
    z-index: 1040;
}

.fab-button:hover {
    transform: scale(1.1);
}

.fab-button:active {
    transform: scale(0.95);
}

.fab-button .bi {
    font-size: 1.75rem;
}

.fab-tooltip {
    position: absolute;
    right: 68px;
    background: var(--on-surface);
    color: #ffffff;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 14px;
    font-weight: 700;
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
    white-space: nowrap;
}

.fab-button:hover .fab-tooltip {
    opacity: 1;
}

/* ============================================================
    УТИЛИТЫ
    ============================================================ */
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

.fw-600 {
    font-weight: 600;
}

.fw-700 {
    font-weight: 700;
}

.fw-800 {
    font-weight: 800;
}

.fs-headline-lg {
    font-size: 32px;
    line-height: 40px;
    letter-spacing: -0.01em;
    font-weight: 700;
}

.fs-headline-md {
    font-size: 24px;
    line-height: 32px;
    font-weight: 600;
}

/* Анимация появления карточек */
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

.card-animate {
    animation: fadeInUp 0.5s ease forwards;
}

/* Тост */
.toast-custom {
    position: fixed;
    bottom: 96px;
    right: 2rem;
    background: var(--on-surface);
    color: #ffffff;
    padding: 0.75rem 1.5rem;
    border-radius: 0.75rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.01em;
    font-weight: 600;
    transition: all 0.5s ease;
    opacity: 0;
    transform: translateY(40px);
    z-index: 9999;
}

.toast-custom.show {
    opacity: 1;
    transform: translateY(0);
}

/* ============================================================
    АДАПТИВНОСТЬ
    ============================================================ */
@media (max-width: 768px) {
    .filter-card {
        position: static;
    }
    .fs-headline-lg {
        font-size: 24px;
        line-height: 32px;
    }
}

/* Активные кнопки фильтра */
.filter-btn.active {
    background-color: var(--primary);
    color: #ffffff;
    border-color: var(--primary);
}

.filter-btn.active:hover {
    background-color: var(--primary-container);
}

/* Активный input date */
.filter-date-input.active {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(0, 61, 155, 0.1);
}


/* ============================================================
    КНОПКА ОТКЛИКА
    ============================================================ */

/* Базовый стиль (не откликнулся) */
.btn-register {
    width: 100%;
    background: var(--primary);
    color: #ffffff;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    border: 2px solid var(--primary);
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.01em;
    font-weight: 600;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    cursor: pointer;
}

.btn-register:hover:not(:disabled):not(.btn-responded) {
    background: var(--primary-container);
    border-color: var(--primary-container);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 82, 204, 0.25);
}

.btn-register:active:not(:disabled):not(.btn-responded) {
    transform: scale(0.98);
}

/* ✅ СТИЛЬ ДЛЯ ОТКЛИКНУВШИХСЯ (белый фон + синяя обводка) */
.btn-register.btn-responded {
    background: #ffffff;
    color: var(--primary);
    border: 2px solid var(--primary);
    box-shadow: 0 2px 8px rgba(0, 82, 204, 0.1);
}

.btn-register.btn-responded:hover {
    background: #f0f5ff;
    border-color: var(--primary-container);
    box-shadow: 0 4px 12px rgba(0, 82, 204, 0.15);
}

.btn-register.btn-responded .badge {
    background: var(--primary) !important;
    color: #ffffff !important;
}

/* ❌ Состояние disabled */
.btn-register:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.btn-register.btn-responded:disabled {
    opacity: 0.8;
    cursor: default;
}

.btn-register.btn-responded:disabled:hover {
    transform: none;
    background: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 82, 204, 0.1);
}

/* 🔄 Состояние загрузки */
.btn-register.btn-loading {
    opacity: 0.7;
    cursor: wait;
}

/* 📊 Бейдж со счетчиком */
.btn-register .badge {
    font-size: 12px;
    padding: 2px 10px;
    border-radius: 20px;
    font-weight: 600;
    transition: all 0.3s ease;
}

.btn-register:not(.btn-responded) .badge {
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
}

.btn-register.btn-responded .badge {
    background: var(--primary);
    color: #ffffff;
}

.btn-register:hover:not(:disabled):not(.btn-responded) .badge {
    background: rgba(255, 255, 255, 0.3);
}

/* 🎯 Иконка галочки */
.btn-register.btn-responded .bi-check-circle-fill {
    color: #2ecc71;
    font-size: 16px;
}

/* 🌟 Анимация при появлении */
.btn-register.btn-responded {
    animation: respondPulse 0.4s ease;
}

@keyframes respondPulse {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(0.97);
    }
    100% {
        transform: scale(1);
    }
}

/* 📱 Адаптивность */
@media (max-width: 576px) {
    .btn-register {
        font-size: 13px;
        padding: 0.6rem 0.8rem;
    }
    
    .btn-register .badge {
        font-size: 11px;
        padding: 1px 8px;
    }
}
</style>

<script>
import axios, { create } from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
dayjs.locale('ru');

export default {
  data(){
    return{
        events: [],
        eventId: '',
        imageFile: null,
        form: {
            title: '',
            description: '',
            eventDate: '',
            eventDateDisplay: '',
            location: '',
            image: '',
            category: '',
            messageForm: 'Создание новой новости'
        },
        categories: [
            { value: 'it', label: 'IT и технологии' },
            { value: 'science', label: 'Наука' },
            { value: 'sport', label: 'Спорт' },
            { value: 'culture', label: 'Культура' },
            { value: 'education', label: 'Образование' },
            { value: 'entertainment', label: 'Развлечения' },
            { value: 'other', label: 'Другое' }
        ]
    }
  },

  mounted(){
    this.checkAdminAuth();
    this.getAllEvents();
  },

  methods: {
    async getAllEvents(){
      let response = await axios.get('events');
      this.events = response.data;
    },

    checkAdminAuth() {
        const adminData = localStorage.getItem('adminData');
        if (!adminData) {
            this.$router.push('/admin');
        }
    },

    adminLogout() {
        if (confirm('Вы уверены, что хотите выйти?')) {
            localStorage.removeItem('adminData');
            this.$router.push('/admin');
        }
    },

    getFullDate(item){
		return dayjs(item.eventDate).format('DD MMMM, YYYY')
	},

    cleanForm(){
        this.form = {
            title: '',
            description: '',
            eventDate: '',
            eventDateDisplay: '',
            location: '',
            image: '',
            category: '',
            messageForm: 'Создание новой новости'
        };
        this.eventId = '';
        this.imageFile = null;
        if (this.$refs.fileInput) {
            this.$refs.fileInput.value = '';
        }
    },

    editEvent(i){
        let currectDate = this.currectDateMethod(this.events[i].eventDate);
        this.form = {
            title: this.events[i].title,
            description: this.events[i].description,
            eventDate: this.events[i].eventDate,
            eventDateDisplay: currectDate,
            location: this.events[i].location,
            category: this.events[i].category,
            messageForm: 'Редактирование новости'
        }
        this.eventId = this.events[i]._id;
        this.imageFile = null;
        if (this.$refs.fileInput) {
            this.$refs.fileInput.value = '';
        }
    },

    currectDateMethod(date) {
        if(!date){
            return '';
        }
        return dayjs(date).format('YYYY-MM-DDTHH:mm');
    },

    convertToISO(eventDateDisplay) {
        if (!eventDateDisplay) return null;
        
        let parsed = dayjs(eventDateDisplay, 'DD.MM.YYYY HH:mm');
        
        return parsed.toISOString();
    },

    async createOrEditEvent(evt){
        evt.preventDefault();
        try{
            this.form.eventDate = this.convertToISO(this.form.eventDateDisplay); 
            console.log(this.form.category)
            const formData = new FormData();
            formData.append('title', this.form.title);
            formData.append('description', this.form.description);
            formData.append('eventDate', this.form.eventDate);
            formData.append('location', this.form.location || '');
            formData.append('category', this.form.category || '');
            if (this.eventId) {
                formData.append('_id', this.eventId);
            }
            if (this.imageFile) {
                formData.append('image', this.imageFile);
                console.log('Отправка файла:', this.imageFile.name);
            }
            let response = await axios.post('create',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            )
            await this.getAllEvents();
            this.cleanForm();
        } catch(err){
            console.log(err);
        }
    },

    async removeEvent(i){
        try{
            let response = await axios.post('remove', {
                _id: this.events[i]._id
            })
            await this.getAllEvents();
        } catch(err){
            console.log(err)
        }
    },

    fileUpload(event){
        const file = event.target.files[0];

        if (!file) {
            this.removeImage();
            return;
        }

        if (!file.type.startsWith('image/')) {
                alert('Пожалуйста, выберите изображение');
                this.$refs.fileInput.value = '';
                return;
        }

        if (file.size > 5 * 1024 * 1024) {
                alert('Файл слишком большой. Максимум 5MB');
                this.$refs.fileInput.value = '';
                return;
        }

        this.imageFile = file;
        this.form.image = file.name;
    }
  }
}


</script>

<template>
<main class="flex-grow" style="margin-top: 80px; padding: 48px 64px; max-width: 1280px; width: 100%; margin-left: auto; margin-right: auto;">
        <!-- СЕКЦИЯ 1: УПРАВЛЕНИЕ НОВОСТЯМИ -->
        <section class="mb-5">
            <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4" style="gap: 24px;">
                <h1 class="font-headline-lg text-primary-custom">Управление новостями</h1>
                <div class="d-flex" style="gap: 12px;">
                    <button @click="cleanForm" class="bg-primary-container text-white px-4 py-2 rounded-3 font-label-md d-flex align-items-center" style="gap: 4px; border: none; transition: all 0.2s ease; box-shadow: 0 4px 14px rgba(0, 82, 204, 0.2);">
                        <i class="bi bi-plus-lg" style="font-size: 18px;"></i>
                        Добавить
                    </button>
                </div>
            </div>
            <!-- Таблица -->
            <div class="glass-panel custom-shadow rounded-4 overflow-hidden border border-secondary-container">
                <div class="table-responsive">
                    <table class="table table-custom mb-0">
                        <thead>
                            <tr class="bg-surface-container-low border-bottom border-secondary-container">
                                <th>Заголовок новости</th>
                                <th>Статистика</th>
                                <th>Дата мероприятия</th>
                                <th class="text-end">Действия</th>
                            </tr>
                        </thead>
                        <tbody class="border-0">
                            <!-- Новость -->
                            <tr v-for="(item, index) in events">
                                <td>
                                    <div class="d-flex align-items-center" style="gap: 12px;">
                                        <div class="rounded-3 bg-surface-container-low overflow-hidden flex-shrink-0" style="width: 48px; height: 48px;">
                                            <img class="w-100 h-100 object-fit-cover" :src="`uploads/${ item.image }`">
                                        </div>
                                        <span class="font-body-md text-on-surface" style="transition: color 0.2s ease;">{{ item.title }}</span>
                                    </div>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center" style="gap: 12px; color: #555f6c;">
                                        <span class="d-flex align-items-center" style="gap: 4px; font-size: 12px; line-height: 16px; font-weight: 500;">
                                            <i class="bi bi-heart" style="font-size: 16px;"></i>
                                            {{ item.responseCount }}
                                        </span>
                                    </div>
                                </td>
                                <td class="font-body-md text-on-surface">{{ getFullDate(item) }}</td>
                                <td class="text-end">
                                    <div class="d-flex justify-content-end" style="gap: 12px;">
                                        <button @click="editEvent(index)" class="btn btn-link p-1 text-primary-custom rounded-3" style="border: none; text-decoration: none; transition: all 0.2s ease;" title="Редактировать">
                                            <i class="bi bi-pencil" style="font-size: 1.25rem;"></i>
                                        </button>
                                        <button @click="removeEvent(index)" class="btn btn-link p-1 text-error-custom rounded-3" style="border: none; text-decoration: none; transition: all 0.2s ease;" title="Удалить">
                                            <i class="bi bi-trash3" style="font-size: 1.25rem;"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
        <!--СЕКЦИЯ 2: ФОРМА РЕДАКТИРОВАНИЯ-->
        <section id="edit-form">
            <div class="d-flex align-items-center" style="gap: 12px; margin-bottom: 24px;">
                <i class="bi bi-pencil-square text-primary-custom" style="font-size: 1.5rem; font-weight: 700;"></i>
                <h2 class="font-headline-md text-primary-custom" style="margin: 0;">{{ form.messageForm }}</h2>
            </div>
            <div class="glass-panel custom-shadow rounded-4 p-4 p-md-5 border border-secondary-container">
                <form @submit="createOrEditEvent" class="d-flex flex-column" style="gap: 24px;">
                    <input type="text" v-model="eventId" hidden>
                    <!-- Название -->
                    <div class="d-flex flex-column" style="gap: 4px;">
                        <label class="form-label-custom">Название мероприятия</label>
                        <input v-model="form.title" class="form-input" placeholder="Введите название..." type="text" required/>
                    </div>
                    <!-- Описание -->
                    <div class="d-flex flex-column" style="gap: 4px;">
                        <label class="form-label-custom">Описание мероприятия</label>
                        <textarea v-model="form.description" class="form-textarea" placeholder="Расскажите о деталях мероприятия..." rows="6" required></textarea>
                    </div>
                    <div class="row g-3 align-items-end">
                        <!-- Дата -->
                        <div class="col-md-6">
                            <div class="d-flex flex-column" style="gap: 4px;">
                                <label class="form-label-custom">Дата проведения</label>
                                <div class="position-relative">
                                    <input v-model="form.eventDateDisplay" class="form-input" style="padding-left: 3rem;" type="datetime-local" placeholder="Напишите дату мероприятия..." required/>
                                    <i class="bi bi-calendar3 position-absolute text-secondary-custom" style="left: 1rem; top: 50%; transform: translateY(-50%);"></i>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="d-flex flex-column" style="gap: 7px;">
                                <label class="form-label-custom">Место проведения</label>
                                <div class="position-relative">
                                    <input v-model="form.location" class="form-input" style="padding-left: 3rem;" type="text" placeholder="Напишите место мероприятия..." />
                                    <i class="text-secondary-custom position-absolute material-symbols-outlined" style="left: 1rem; top: 50%; transform: translateY(-50%);">location_on</i>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="d-flex flex-column" style="gap: 7px;">
                                <label class="form-label-custom">Картинка</label>
                                <div class="position-relative">
                                    <input @change="fileUpload" class="form-input" style="padding-left: 3rem;" type="file" accept="image/*" ref="fileInput" placeholder="Загрузить картинку..." />
                                    <i class="text-secondary-custom position-absolute material-symbols-outlined" style="left: 1rem; top: 50%; transform: translateY(-50%);">photo</i>
                                </div>
                            </div>
                        </div>
                        <!-- Категория (выпадающий список) -->
                        <div class="col-md-6">
                            <div class="d-flex flex-column" style="gap: 7px;">
                                <label class="form-label-custom">Категория</label>
                                <div class="position-relative">
                                    <select v-model="form.category" class="form-input" style="padding-left: 3rem; appearance: none; -webkit-appearance: none;" required>
                                        <option value="">Выберите категорию...</option>
                                        <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                                            {{ cat.label }}
                                        </option>
                                    </select>
                                    <i class="text-secondary-custom position-absolute material-symbols-outlined" 
                                    style="left: 1rem; top: 50%; transform: translateY(-50%);">
                                        category
                                    </i>
                                    <i class="bi bi-chevron-down position-absolute text-secondary-custom" 
                                    style="right: 1rem; top: 50%; transform: translateY(-50%); pointer-events: none;">
                                    </i>
                                </div>
                            </div>
                        </div>
                        <!-- Кнопки -->
                        <div class="col-md-6">
                            <div class="d-flex" style="gap: 12px;">
                                <button @click="cleanForm" class="btn border-2 border-error-custom text-error-custom px-4 py-2 rounded-3 font-label-md d-flex align-items-center" style="gap: 4px; transition: all 0.2s ease;" type="button">
                                    <i class="bi bi-trash3" style="font-size: 18px;"></i>
                                    Очистить
                                </button>
                                <button class="bg-primary-container text-white px-4 py-2 rounded-3 font-label-md d-flex align-items-center" style="gap: 4px; border: none; transition: all 0.2s ease; box-shadow: 0 4px 14px rgba(0, 82, 204, 0.2);" type="submit">
                                    <i class="bi bi-floppy" style="font-size: 18px;"></i>
                                    Сохранить
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </section>
    </main>
</template>

<style>
 /* БАЗОВЫЕ СТИЛИ */
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8f9fb;
            color: #191c1e;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        /* ЦВЕТА */
        :root {
            --primary: #003d9b;
            --primary-container: #0052cc;
            --secondary: #555f6c;
            --error: #ba1a1a;
            --surface-container-low: #f3f4f6;
            --surface-container-lowest: #ffffff;
            --on-surface: #191c1e;
            --outline-variant: #c3c6d6;
            --secondary-container: #d9e3f2;
            --shadow-color: rgba(0, 82, 204, 0.08);
        }

        /* НАВИГАЦИЯ */
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
            .navbar-custom { padding: 0 16px; height: 64px; }
        }

        /* КОМПОНЕНТЫ */
        .glass-panel {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0px 10px 30px rgba(0, 82, 204, 0.08);
        }

        .custom-shadow {
            box-shadow: 0px 10px 30px rgba(0, 82, 204, 0.08);
        }

        /* УТИЛИТЫ*/
        .text-primary-custom { color: #003d9b !important; }
        .text-secondary-custom { color: #555f6c !important; }
        .text-on-surface { color: #191c1e !important; }
        .text-error-custom { color: #ba1a1a !important; }
        .bg-primary-container { background-color: #0052cc !important; }
        .bg-surface-container-low { background-color: #f3f4f6 !important; }
        .bg-surface-container-lowest { background-color: #ffffff !important; }
        .border-secondary-container { border-color: #d9e3f2 !important; }
        .border-outline-variant { border-color: #c3c6d6 !important; }
        .border-error-custom { border-color: #ba1a1a !important; }

        .font-headline-lg {
            font-family: 'Inter', sans-serif;
            font-size: 32px;
            line-height: 40px;
            letter-spacing: -0.01em;
            font-weight: 700;
        }

        .font-headline-md {
            font-family: 'Inter', sans-serif;
            font-size: 24px;
            line-height: 32px;
            font-weight: 600;
        }

        .font-body-md {
            font-family: 'Inter', sans-serif;
            font-size: 16px;
            line-height: 24px;
            font-weight: 400;
        }

        .font-label-md {
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            line-height: 20px;
            letter-spacing: 0.01em;
            font-weight: 600;
        }

        .font-label-sm {
            font-family: 'Inter', sans-serif;
            font-size: 12px;
            line-height: 16px;
            font-weight: 500;
        }

        /* ТАБЛИЦА*/
        .table-custom th {
            padding: 24px;
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            line-height: 20px;
            letter-spacing: 0.01em;
            font-weight: 600;
            color: #555f6c;
        }

        .table-custom td {
            padding: 24px;
            vertical-align: middle;
        }

        .table-custom tbody tr {
            transition: background-color 0.2s ease;
        }

        .table-custom tbody tr:hover {
            background-color: rgba(0, 82, 204, 0.05);
        }

        /* ФОРМА */
        .form-input {
            width: 100%;
            background-color: #f3f4f6;
            border: 1px solid #c3c6d6;
            border-radius: 0.5rem;
            padding: 0.5rem 1rem;
            font-family: 'Inter', sans-serif;
            font-size: 16px;
            line-height: 24px;
            font-weight: 400;
            color: #191c1e;
            transition: all 0.2s ease;
        }

        .form-input:focus {
            outline: none;
            border-color: #0052cc;
            box-shadow: 0 0 0 3px rgba(0, 82, 204, 0.1);
        }

        .form-textarea {
            width: 100%;
            background-color: #f3f4f6;
            border: 1px solid #c3c6d6;
            border-radius: 0.5rem;
            padding: 0.5rem 1rem;
            font-family: 'Inter', sans-serif;
            font-size: 16px;
            line-height: 24px;
            font-weight: 400;
            color: #191c1e;
            transition: all 0.2s ease;
            resize: vertical;
            min-height: 120px;
        }

        .form-textarea:focus {
            outline: none;
            border-color: #0052cc;
            box-shadow: 0 0 0 3px rgba(0, 82, 204, 0.1);
        }

        .form-label-custom {
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            line-height: 20px;
            letter-spacing: 0.01em;
            font-weight: 600;
            color: #191c1e;
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }

        /* АДАПТИВНОСТЬ*/
        @media (max-width: 768px) {
            .font-headline-lg { font-size: 24px; line-height: 32px; }
            .navbar-custom { padding: 0 16px; height: 64px; }
        }
</style>

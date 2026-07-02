import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

let app = express();
let port = 3005;

app.listen(port, function () {
    console.log(`http://localhost:${port}`);
});

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Только изображения!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
});

app.use(cors({ origin: 'http://localhost:5173' }));

app.use(express.json());

app.use('/uploads', express.static('uploads'));

mongoose.connect('mongodb://127.0.0.1:27017/practica-app');

let userSchema = new mongoose.Schema({
    email:{
        type: String,
        unique: true
    }
});

let adminSchema = new mongoose.Schema({
    email: String,
    login: String,
    password: String
});

let eventSchema = new mongoose.Schema({
    title: String,
    description: String,
    eventDate: Date,
    responseCount: Number,
    image: String,
    location: String,
    category: String,
    respondents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

let User = mongoose.model('User', userSchema);
let Admin = mongoose.model('Admin', adminSchema);
let Event = mongoose.model('Event', eventSchema);

app.get('/events', async function (req, res) {
    let events = await Event.find({});
    res.send(events);
})

app.get('/event', async function (req, res) {
    let id = req.query._id;
    let data = await Event.findById(id);
    res.send(data);
})

app.post('/register', async function (req, res) {
    let email = req.body.email;

    try {
        let user = await User.findOne({ email });
        
        if (!user) {
            user = new User({ email });
            await user.save();
        }
        
        return res.status(200).json({
            message: "Добро пожаловать!",
            id: user._id,
            email: user.email
        });
        
    } catch(err) {
        if (err.code === 11000) {
            return res.status(200).json({
                message: "С возвращением!"
            });
        } else {
            console.log(err);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
});

app.post('/admin', async function (req, res) {
    let login = req.body.login;
    let password = req.body.password;

    try{
        let admin = await Admin.findOne({login: login});
        if(!admin){
            return res.status(401).json({
                message: "Неверный логин или пароль"
            })
        }
        if(admin.password !== password){
            return res.status(401).json({
                message: "Неверный логин или пароль"
            })
        }
        return res.status(200).send();

    } catch(err) {
        console.log(err)
    }
})

app.post('/create', upload.single("image"), async function (req, res) {
    let id = req.body._id;
    let title = req.body.title;
    let description = req.body.description;
    let eventDate = req.body.eventDate;
    let location = req.body.location;
    let category = req.body.category;
    let image;

    console.log(req.file);

    if(!location){
        location = "Следите за обновлениями!"
    }
    if(req.file){
        image = req.file.filename;
    } else {
        image = "i.png"
    }

    let event;
    try{
        if(!id){
            event = new Event({
                title: title,
                description: description,
                eventDate: eventDate,
                location: location,
                image: image,
                category: category,
                responseCount: 0
            })

            await event.save();

            res.status(201).json({
                id: event._id
            })
        } else {
            let currentEvent = await Event.findById(id);

            if(req.file){
                if(currentEvent.image && currentEvent.image !== 'i.png'){
                    const fs = await import('fs');
                    const path = await import('path');
                    const oldPath = path.join('uploads', currentEvent.image);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                }
                image = req.file.filename;
            } else {
                if (currentEvent.image) {
                    image = currentEvent.image;
                } else {
                    image = 'i.png';
                }
            }

            event = await Event.findByIdAndUpdate(id, {
                title: title,
                description: description,
                eventDate: eventDate,
                location: location,
                image: image,
                category: category
            })

            res.status(200).json({
                id: event._id
            })
        }
    } catch(err) {
        console.log(err)
    } 
})

app.post('/remove', async function (req, res) {
    let id = req.body._id;
    try{
        let event = await Event.findById(id);

        if (event.image && event.image !== 'i.png') {
            const imagePath = path.join('uploads', event.image);
            
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Event.findByIdAndDelete(id);
        res.status(200).json({
            message: "Событие удалено"
        })
    } catch(err) {
        console.log(err)
    }
})

app.get('/user/:id', async function (req, res) {
    try {
        let user = await User.findById(req.params.id);
        
        res.json({
            id: user._id,
            email: user.email
        });
        
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

app.post('/events/respond', async function (req, res) {
    let eventId = req.body.eventId;
    let userId = req.body.userId;
    try {
        if (!eventId || !userId) {
            return res.status(400).json({ 
                message: 'Необходимы eventId и userId' 
            });
        }
        
        let user = await User.findById(userId);
        let event = await Event.findById(eventId);
        
        if (event.respondents && event.respondents.includes(userId)) {
            return res.status(400).json({ 
                message: 'Вы уже откликнулись на это событие' 
            });
        }
        
        if (!event.respondents) {
            event.respondents = [];
        }
        event.respondents.push(userId);
        event.responseCount = event.respondents.length;
        await event.save();
        
        console.log(`✅ ${user.email} откликнулся на событие: ${event.title}`);
        
        res.json({
            message: 'Вы успешно откликнулись!',
            responseCount: event.responseCount
        });
        
    } catch (error) {
        console.error('Ошибка отклика:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

app.get('/user/:id/events', async function (req, res) {
    try {
        let user = await User.findById(req.params.id).populate('respondents');
        
        const events = await Event.find({
            respondents: user._id
        });
        
        res.json(events);
        
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

app.delete('/events/respond', async function (req, res) {
    let eventId = req.body.eventId;
    let userId = req.body.userId;

    try {
        
        if (!eventId || !userId) {
            return res.status(400).json({ 
                message: 'Необходимы eventId и userId' 
            });
        }
        
        let event = await Event.findById(eventId);
        
        const index = event.respondents.indexOf(userId);
        if (index === -1) {
            return res.status(400).json({ 
                message: 'Вы не откликались на это событие' 
            });
        }
        
        event.respondents.splice(index, 1);
        event.responseCount = event.respondents.length;
        await event.save();
        
        res.json({
            message: 'Вы отписались от события',
            responseCount: event.responseCount
        });
        
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

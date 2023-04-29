import express from "express";
import {data} from './data.js';
import { users } from './users.js'
import jwt from 'jsonwebtoken'
import { verifyToken } from "./middleware/auth.js";
const app = express()
app.use(express.json())


app.get('/book/all',async(req,res)=>{
    return res.json(data)
})

app.get('/book/ISBN',async(req,res)=>{
    const {id} = req.query
    return res.json(data[Number(id)])
})

app.get('/book/by-author/:name',async(req,res)=>{
    const {name} = req.params
    const bookByAuthor = []
    
    const BookFind = new Promise((resolve,reject)=>{
            data.forEach(elm=>{
                if (elm.author == name){
                    bookByAuthor.push(elm)
                }
            })
            resolve('done')
            reject('no name found !')
    })

    BookFind.then((res)=>{
        return res.json({ bookByAuthor})
    }).catch((err)=>{
        return res.json({err})
    })

})

app.get('/book/by-title/:name',async(req,res)=>{
    const {name} = req.params
    const bookByTitle = []
    data.forEach(elm=>{
        if (elm.title == name){
            bookByTitle.push(elm)
        }
    })
    return res.json(bookByTitle)
})

app.get('/book-reviews/:name',async(req,res)=>{
    const {name} = req.params
    let book = data.filter(elm=> elm.title == name)
    return res.json(book[0]?.reviews)
})


app.post('/user/register',async(req,res)=>{
    const {username , password} = req.body
    const user = users.filter(elm=>elm.username == username)[0]

    if (user) {
        return res.json('user exists')
    }
    else {
        users.push({username,password})
        return res.json(`user ${username} registered and you can login now`)
    }
})


app.post('/user/login',async(req,res)=>{
    const {username , password} = req.body
    const user = users.filter(elm=>elm.username == username && elm.password == password)[0]

    if (user) {
        const token = jwt.sign(
            { username },
            'expressjsapp',
        );
        return res.json({msg : 'loged in :)' , token})
    }
    else {
        return res.json(`username or password is wrong`)
    }
})



app.post('/book-reviews/add',verifyToken,async(req,res)=>{
    const { book_name , msg } = req.body
    const user = req.user.username

    data.forEach(elm=>{
        if (elm.title == book_name){
            elm.reviews.push({user,msg})
        }
    })

    return res.json('review added/modified')
})

app.listen(5000,()=>{
    console.log('start at 5000');
})
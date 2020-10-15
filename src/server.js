import express from 'express';
import bodyParser from 'body-parser';
import {MongoClient} from 'mongodb';
import path from 'path';
const app = express();
app.use(express.static(path.join(__dirname,'./build')));
app.use(bodyParser.json());
const withDB = async (operations,res)=>{
    try{
        
        const client = await MongoClient.connect("mongodb+srv://blogUser:Dines123456@@cluster0.4sfyn.azure.mongodb.net/my-blog?retryWrites=true&w=majority",{ useNewUrlParser: true })
        const db = client.db('my-blog');

        await operations(db);
        client.close();}
        catch(error){
            res.status(500).json({message:'Error connecting to db',error});
        }
    }    
app.get('/api/articles/:name', async (req,res)=>{
    withDB(async (db)=>{
        const articleName = req.params.name;
        const articleInfo = await db.collection('articles').findOne({name:articleName});
    res.status(200).json(articleInfo);
    
    },res);
   
    
    
    
})

app.post('/api/articles/:name/upvote',async (req,res)=>{
    
    withDB(async (db)=>{
        const articleName = req.params.name;
        
        const articleInfo = await db.collection('articles').findOne({name:articleName});
        await db.collection('articles').updateOne({name:articleName},{
            '$set':{
                upvotes:articleInfo.upvotes+1,
            },
        });
        const updatedArticleInfo = await db.collection('articles').findOne({name:articleName});
        res.status(200).json(updatedArticleInfo);
    },res)
        

   
    });
app.post('/api/articles/:name/add-comment',async(req,res)=>{
    const articleName = req.params.name;
    const {userName,comment} = req.body;
    withDB(async (db)=>{
        
    const articleInfo = await db.collection('articles').findOne({name:articleName});
    await db.collection('articles').updateOne({name:articleName},{
        '$set':{
            comments:articleInfo.comments.concat({userName,comment})
        },
    });
    const updatedArticleInfo = await db.collection('articles').findOne({name:articleName});
    res.status(200).json(updatedArticleInfo);
   },res)
    
    
    
})
app.get('*',(req,res)=>{
    res.sendFile(path.join(__dirname+'/build/index.html'));

});
app.listen(8000,()=>console.log("Listening on port 8000"));

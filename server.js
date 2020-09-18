require('dotenv').config();
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');

app.use(express.json());

const POSTS = [
  {
    userId: '1',
    title: 'Post #1',
    autherName: 'Ali'
  },
  {
    userId: '2',
    title: 'Post #2',
    autherName: 'Reza'
  }
]

app.get('/posts', authenticateToken, (req, res) => {
  const { userId } = req.body;
  return res.json(POSTS.filter(x => x.userId === userId));
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.sendStatus(401);
  }
  const [_, accessToken] = authHeader.split(' ')

  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
    if (err) {
      return res.sendStatus(401);
    }
    req.body.userId = data.userId;
    next();
  })

}

app.listen(3000);
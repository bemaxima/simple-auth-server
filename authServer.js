require('dotenv').config();
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');

app.use(express.json());

const USERS = [
  {
    id: '1',
    username: 'user1',
    password: '12345'
  },
  {
    id: '2',
    username: 'user2',
    password: '12345'
  }
]


const REFRESH_TOKENS = [];

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(x => x.username === username && x.password === password);
  if (!user) {
    return res.sendStatus(404);
  }

  console.log(process.env.ACCESS_TOKEN_SECRET);
  const accessToken = generateAccessToken(user.id);
  const refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET)
  REFRESH_TOKENS.push(refreshToken);
  res.json({ accessToken, refreshToken })
})

app.post('/token', (req, res) => {
  const { token: refreshToken } = req.body;
  if (!REFRESH_TOKENS.some(x => x === refreshToken)) {
    return res.sendStatus(401);
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
    if (err) {
      return res.sendStatus(401);
    }
    const accessToken = generateAccessToken(data.userId);
    res.json({ accessToken });
  });
})

app.delete('/token', (req, res) => {
  const { token: refreshToken } = req.body;
  const index = REFRESH_TOKENS.indexOf(refreshToken);
  if (index !== -1) {
    REFRESH_TOKENS.splice(index, 1);
  }
  res.sendStatus(206);
})


function generateAccessToken(userId) {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20s' })
}



app.listen(4000);
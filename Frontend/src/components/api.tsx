import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/', // Your Django API root
  headers: {
    'Content-Type': 'application/json',
  },
});


// Correct way to call this endpoint
axios.post('http://127.0.0.1:8000/api/voting/login/', {
    username: 'admin@example.com',
    password: 'vote'
})
.then(response => console.log(response))
.catch(error => console.log(error));

export default api;
window.ENV = {
  API_BASE_URL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/api'
};